import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getIncident } from '@/services/incident.service';
import { doc, setDoc, collection, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';
import type { IncidentDoc } from '@/services/incident.service';
import type { ChecklistItem } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { CheckSquare, Square, MessageSquarePlus, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [incident, setIncident]   = useState<IncidentDoc | null>(null);
  const [items, setItems]         = useState<ChecklistItem[]>([]);
  const [completing, setCompleting] = useState<string | null>(null);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(true);

  // Load incident
  useEffect(() => {
    if (!id) return;
    getIncident(id)
      .then((inc) => { setIncident(inc); setLoading(false); })
      .catch(() => { setError('Failed to load incident.'); setLoading(false); });
  }, [id]);

  // Realtime checklist subscription — filtered server-side to avoid full-collection scans
  useEffect(() => {
    if (!id) return;
    const q = query(
      collection(db, COLLECTIONS.CHECKLISTS),
      where('incidentId', '==', id),
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data();
        return {
          id:           d.id,
          incidentId:   data.incidentId,
          assignedTo:   data.assignedTo,
          task:         data.task,
          isComplete:   data.isComplete,
          isBlocked:    data.isBlocked,
          completedAt:  data.completedAt ? (data.completedAt as Timestamp).toDate() : undefined,
        } as ChecklistItem;
      });
      setItems(items);
    });
    return unsub;
  }, [id]);

  // Create checklist items from AI output when component mounts
  useEffect(() => {
    if (!incident?.aiOutput || items.length > 0 || !user) return;
    const createItems = async () => {
      for (const [i, task] of incident.aiOutput!.staffChecklist.entries()) {
        const itemId = `${incident.id}_staff_${i}`;
        await setDoc(doc(db, COLLECTIONS.CHECKLISTS, itemId), {
          id:          itemId,
          incidentId:  incident.id,
          assignedTo:  user.uid,
          task,
          isComplete:  false,
          isBlocked:   false,
          createdAt:   serverTimestamp(),
        }, { merge: true });
      }
    };
    createItems().catch(console.error);
  }, [incident, items.length, user]);

  const handleToggle = async (item: ChecklistItem) => {
    if (completing) return;
    setCompleting(item.id);
    try {
      await setDoc(
        doc(db, COLLECTIONS.CHECKLISTS, item.id),
        {
          isComplete:  !item.isComplete,
          completedAt: !item.isComplete ? serverTimestamp() : null,
        },
        { merge: true },
      );
      toast.success(item.isComplete ? 'Marked incomplete' : 'Task complete ✓');
    } catch {
      toast.error('Failed to update task.');
    } finally {
      setCompleting(null);
    }
  };

  const completed  = items.filter((i) => i.isComplete).length;
  const total      = items.length;
  const pct        = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return (
      <div className="page-container py-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="page-container py-6 space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate('/staff/home')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Home
      </button>

      {error && <AlertBanner type="danger">{error}</AlertBanner>}

      {/* Header */}
      <div className="glass-card p-5">
        <h1 className="text-xl font-bold text-white mb-1">Staff Checklist</h1>
        {incident && <p className="text-sm text-slate-400">{incident.location.freeText}</p>}

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>{completed} of {total} tasks complete</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleToggle(item)}
            disabled={completing === item.id}
            className={`w-full glass-card p-4 flex items-center gap-3 text-left transition-all hover:bg-slate-800/50
              ${item.isComplete ? 'opacity-60' : ''}`}
          >
            {item.isComplete
              ? <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              : <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
            }
            <span className={`text-sm ${item.isComplete ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {item.task}
            </span>
          </button>
        ))}

        {items.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-slate-400">AI checklist is being generated…</p>
          </div>
        )}
      </div>

      {/* Report Update CTA */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate(`/staff/incidents/${id}/update`)}
        icon={<MessageSquarePlus className="w-4 h-4" />}
      >
        Report a Status Update
      </Button>
    </div>
  );
}
