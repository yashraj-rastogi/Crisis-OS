import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS, INCIDENT_TYPE_LABELS } from '@/lib/constants';
import { ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import type { IncidentType, IncidentState } from '@/lib/types';

interface ActiveIncident {
  id: string;
  type: IncidentType;
  state: IncidentState;
  details: string;
  location: { freeText: string };
}

export default function GuestHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<ActiveIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.propertyId) { setLoading(false); return; }
    const q = query(
      collection(db, COLLECTIONS.INCIDENTS),
      where('propertyId', '==', user.propertyId),
      where('state', '==', 'active'),
    );
    const unsub = onSnapshot(q, (snap) => {
      setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActiveIncident)));
      setLoading(false);
    });
    return unsub;
  }, [user?.propertyId]);

  const hasActive = incidents.length > 0;

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {hasActive ? (
        <div className="p-4 rounded-2xl bg-red-900/20 border border-red-700/50 animate-pulse-slow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-900/40 border border-red-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-300">Active Emergency</h2>
              <p className="text-sm text-red-400/80">{incidents.length} active incident{incidents.length > 1 ? 's' : ''} at your property</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-emerald-900/20 border border-emerald-700/50 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-900/40 border border-emerald-700 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-emerald-300">All Clear</h2>
          <p className="text-sm text-emerald-400/70 mt-1">No active emergencies at your property. Stay safe!</p>
        </div>
      )}

      {/* Active incident cards */}
      {incidents.map((inc) => (
        <Card key={inc.id} interactive onClick={() => navigate(`/guest/incidents/${inc.id}/alert`)}>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="high" dot className="mb-2">
                  {INCIDENT_TYPE_LABELS[inc.type] || inc.type}
                </Badge>
                <p className="text-sm text-slate-300 mt-1">{inc.details?.slice(0, 120)}</p>
                <p className="text-xs text-slate-500 mt-1">{inc.location?.freeText}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
            </div>
            <div className="mt-3">
              <Button size="sm" variant="danger" className="w-full" onClick={(e) => { e.stopPropagation(); navigate(`/guest/incidents/${inc.id}/check-in`); }}>
                Check In Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">Checking property status...</p>
        </div>
      )}
    </div>
  );
}
