import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS, INCIDENT_TYPE_LABELS } from '@/lib/constants';
import { Plus, ShieldCheck, AlertTriangle, Activity, Users, ArrowRight, Clock } from 'lucide-react';
import type { IncidentType, IncidentState } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';

interface IncidentItem {
  id: string;
  type: IncidentType;
  state: IncidentState;
  details: string;
  location: { freeText: string };
  createdAt: { toDate?: () => Date };
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.propertyId) { setLoading(false); return; }
    const q = query(
      collection(db, COLLECTIONS.INCIDENTS),
      where('propertyId', '==', user.propertyId),
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as IncidentItem));
      // Sort: active first, then draft, then resolved
      const order: Record<string, number> = { active: 0, draft: 1, resolved: 2 };
      items.sort((a, b) => (order[a.state] ?? 9) - (order[b.state] ?? 9));
      setIncidents(items);
      setLoading(false);
    });
    return unsub;
  }, [user?.propertyId]);

  const active = incidents.filter((i) => i.state === 'active');
  const drafts = incidents.filter((i) => i.state === 'draft');

  const stateVariant = (s: IncidentState) =>
    s === 'active' ? 'active' : s === 'draft' ? 'draft' : 'resolved';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Monitor and manage incidents for your property</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/manager/incidents/new')}>
          New Incident
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active.length > 0 ? 'bg-red-900/30 border border-red-700' : 'bg-emerald-900/30 border border-emerald-700'}`}>
                {active.length > 0 ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{active.length}</p>
                <p className="text-xs text-slate-400">Active Incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-900/30 border border-amber-700 flex items-center justify-center">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{drafts.length}</p>
                <p className="text-xs text-slate-400">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/30 border border-blue-700 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">—</p>
                <p className="text-xs text-slate-400">Guests Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incident list */}
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">All Incidents</h2>
        {loading ? (
          <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
        ) : incidents.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-7 h-7 text-emerald-400" />}
            title="No incidents"
            description="Your property is safe. Create a drill or report a new incident."
            action={<Button onClick={() => navigate('/manager/incidents/new')} icon={<Plus className="w-4 h-4" />}>New Incident</Button>}
          />
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => (
              <Card key={inc.id} interactive onClick={() => navigate(`/manager/incidents/${inc.id}/review`)} className="group">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={stateVariant(inc.state)} dot>{inc.state.toUpperCase()}</Badge>
                        <Badge variant="default">{INCIDENT_TYPE_LABELS[inc.type] || inc.type}</Badge>
                      </div>
                      <p className="text-sm text-slate-300">{inc.details?.slice(0, 150)}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{inc.location?.freeText}</span>
                        {inc.createdAt?.toDate && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTimeAgo(inc.createdAt.toDate())}</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
