import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS, INCIDENT_TYPE_LABELS, SEVERITY_COLORS, SEVERITY_LABELS, INCIDENT_STATE_COLORS } from '@/lib/constants';
import type { IncidentDoc } from '@/services/incident.service';
import { Timestamp } from 'firebase/firestore';
import { formatTimeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, ClipboardList, Plus } from 'lucide-react';

export default function StaffHomePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [incidents, setIncidents] = useState<IncidentDoc[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user?.propertyId) { setLoading(false); return; }

    const q = query(
      collection(db, COLLECTIONS.INCIDENTS),
      where('propertyId', '==', user.propertyId),
      where('state', 'in', ['draft', 'active']),
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => {
        const data = d.data();
        return {
          id:            d.id,
          propertyId:    data.propertyId,
          orgId:         data.orgId,
          type:          data.type,
          location:      data.location,
          details:       data.details,
          state:         data.state,
          aiOutput:      data.aiOutput,
          createdBy:     data.createdBy,
          createdByRole: data.createdByRole,
          createdAt:     (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        } as IncidentDoc;
      });
      // Sort active first, then by time
      docs.sort((a, b) => {
        if (a.state === 'active' && b.state !== 'active') return -1;
        if (b.state === 'active' && a.state !== 'active') return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      setIncidents(docs);
      setLoading(false);
    });

    return unsub;
  }, [user?.propertyId]);

  return (
    <div className="page-container py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Active and pending incidents</p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate('/staff/report')}
          icon={<Plus className="w-4 h-4" />}
        >
          Report
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-1/3 mb-2" />
              <div className="h-3 bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Incident list */}
      {!loading && incidents.length === 0 && (
        <div className="glass-card p-12 text-center">
          <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-white font-semibold text-lg">All Clear</p>
          <p className="text-sm text-slate-400 mt-1">No active incidents at your property</p>
        </div>
      )}

      {!loading && incidents.map((inc) => (
        <div
          key={inc.id}
          className={`glass-card p-5 border-l-4 cursor-pointer hover:bg-slate-800/50 transition-colors
            ${inc.state === 'active' ? 'border-l-red-500' : 'border-l-slate-600'}`}
          onClick={() => navigate(`/staff/incidents/${inc.id}/checklist`)}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${INCIDENT_STATE_COLORS[inc.state]}`}>
                  {inc.state.toUpperCase()}
                </span>
                {inc.aiOutput && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[inc.aiOutput.severity]}`}>
                    {SEVERITY_LABELS[inc.aiOutput.severity]}
                  </span>
                )}
              </div>
              <p className="text-white font-semibold">{INCIDENT_TYPE_LABELS[inc.type]}</p>
              <p className="text-xs text-slate-400">{inc.location.freeText}</p>
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">{formatTimeAgo(inc.createdAt)}</span>
          </div>

          {inc.aiOutput && (
            <div className="bg-slate-800/60 rounded-lg p-3 mb-3">
              <p className="text-xs text-slate-400 mb-1">Next Action</p>
              <p className="text-sm text-slate-200">{inc.aiOutput.staffChecklist[0]}</p>
            </div>
          )}

          <Button size="sm" variant="outline" className="w-full" icon={<ClipboardList className="w-3.5 h-3.5" />}>
            View Checklist
          </Button>
        </div>
      ))}
    </div>
  );
}
