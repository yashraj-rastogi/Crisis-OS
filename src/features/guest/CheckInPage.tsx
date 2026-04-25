import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS, GUEST_STATUS_COLORS, GUEST_STATUS_LABELS } from '@/lib/constants';
import type { GuestResponse } from '@/lib/types';
import { submitGuestResponse } from '@/services/guestResponse.service';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, Clock, ChevronLeft } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CheckInPage() {
  const { id } = useParams<{ id: string }>();
  const { user, firebaseUser } = useAuth();
  const navigate = useNavigate();

  const [response, setResponse]   = useState<Partial<GuestResponse> | null>(null);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(false);

  useEffect(() => {
    if (!id || !firebaseUser) return;
    const docId = `${id}_${firebaseUser.uid}`;
    getDoc(doc(db, COLLECTIONS.GUEST_RESPONSES, docId))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setResponse({
            status:      data.status,
            respondedAt: data.respondedAt?.toDate?.() ?? new Date(),
            updatedAt:   data.updatedAt?.toDate?.() ?? new Date(),
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, firebaseUser]);

  const handleUpdateStatus = async (newStatus: 'safe' | 'need_help' | 'unable_to_move') => {
    if (!id || !firebaseUser) return;
    setUpdating(true);
    try {
      await submitGuestResponse({
        incidentId:  id,
        propertyId:  user?.propertyId ?? '',
        guestUid:    firebaseUser.uid,
        guestName:   firebaseUser.displayName ?? user?.displayName ?? 'Guest',
        roomLabel:   'Unknown',
        floorLabel:  'Unknown',
        status:      newStatus,
      });
      setResponse({ status: newStatus, updatedAt: new Date() });
      toast.success('Status updated!');
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const status = response?.status ?? 'pending';
  const colorClass = GUEST_STATUS_COLORS[status] ?? 'text-slate-400';

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 flex flex-col items-center max-w-sm mx-auto">
      <button
        onClick={() => navigate(`/guest/incidents/${id}/alert`)}
        className="self-start flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Alert
      </button>

      {/* Status confirmation */}
      <div className="text-center mb-8">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 border-2 ${colorClass.includes('green') ? 'bg-green-900/30 border-green-600' : colorClass.includes('amber') ? 'bg-amber-900/30 border-amber-600' : colorClass.includes('red') ? 'bg-red-900/30 border-red-600' : 'bg-slate-800 border-slate-700'}`}>
          <ShieldCheck className={`w-8 h-8 ${colorClass.split(' ')[0]}`} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Status Logged</h1>
        <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full border ${colorClass}`}>
          {GUEST_STATUS_LABELS[status]}
        </span>
        {response?.updatedAt && (
          <p className="text-xs text-slate-500 mt-3 flex items-center justify-center gap-1.5">
            <Clock className="w-3 h-3" />
            Updated {formatTimeAgo(response.updatedAt)}
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="glass-card p-5 w-full mb-6 text-center">
        <p className="text-sm text-slate-300">
          {status === 'safe'
            ? 'Stay at your current location unless instructed by staff to move.'
            : status === 'need_help'
            ? 'Staff have been notified. Stay where you are and remain calm. Help is on the way.'
            : 'Emergency services have been alerted to your location. Do not try to move. Help is coming.'}
        </p>
      </div>

      {/* Update status options */}
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Update your status</p>
      <div className="w-full space-y-2">
        {[
          { status: 'safe' as const,           label: "I'm Safe",      color: 'border-green-700 text-green-400' },
          { status: 'need_help' as const,      label: 'I Need Help',   color: 'border-amber-700 text-amber-400' },
          { status: 'unable_to_move' as const, label: "I Can't Move",  color: 'border-red-700 text-red-400' },
        ].filter((opt) => opt.status !== status).map((opt) => (
          <button
            key={opt.status}
            onClick={() => handleUpdateStatus(opt.status)}
            disabled={updating}
            className={`w-full py-3.5 rounded-xl border-2 text-sm font-semibold transition-all active:scale-95 ${opt.color} bg-slate-900/50 hover:bg-slate-800/50`}
          >
            {updating ? '…' : opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
