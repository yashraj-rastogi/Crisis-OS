import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getIncident, resolveIncident } from '@/services/incident.service';
import { subscribeToResponseAggregates } from '@/services/guestResponse.service';
import type { IncidentDoc } from '@/services/incident.service';
import type { GuestResponse } from '@/lib/types';
import { GUEST_STATUS_LABELS, GUEST_STATUS_COLORS, INCIDENT_TYPE_LABELS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { formatTimeAgo } from '@/lib/utils';
import {
  ShieldCheck, AlertCircle, MoveRight, Clock, Users, Radio, ArrowRight, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface KPICardProps {
  label: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  colorClass: string;
  urgent?: boolean;
}

function KPICard({ label, count, total, icon, colorClass, urgent }: KPICardProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`glass-card p-4 border ${urgent && count > 0 ? 'border-red-700 bg-red-900/10 animate-pulse-slow' : 'border-slate-800'}`}>
      <div className={`flex items-center gap-2 mb-2 ${colorClass}`}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${colorClass}`}>{count}</p>
      <div className="mt-2">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              colorClass.includes('green') ? 'bg-green-500' :
              colorClass.includes('amber') ? 'bg-amber-500' :
              colorClass.includes('red')   ? 'bg-red-500' : 'bg-slate-600'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">{pct}% of {total} guests</p>
      </div>
    </div>
  );
}

export default function LiveResponseBoard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user } = useAuth();

  const [incident, setIncident]     = useState<IncidentDoc | null>(null);
  const [responses, setResponses]   = useState<GuestResponse[]>([]);
  const [agg, setAgg]               = useState({ safe: 0, needHelp: 0, unableToMove: 0, pending: 0, total: 0 });
  const [fetching, setFetching]     = useState(true);
  const [resolving, setResolving]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]           = useState('');

  const handleResolve = async () => {
    if (!id || !incident || !user) return;
    setResolving(true);
    setError('');
    try {
      await resolveIncident(id, incident.propertyId, user.uid, user.role);
      toast.success('Incident resolved and All Clear broadcast sent.');
      navigate('/manager/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve incident.');
      setResolving(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    getIncident(id)
      .then((inc) => { setIncident(inc); setFetching(false); })
      .catch(() => { setError('Failed to load incident.'); setFetching(false); });
  }, [id]);

  // Realtime subscription to guest responses
  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToResponseAggregates(id, (data) => {
      setAgg({ safe: data.safe, needHelp: data.needHelp, unableToMove: data.unableToMove, pending: data.pending, total: data.total });
      setResponses(data.responses);
    });
    return unsub;
  }, [id]);

  if (fetching) {
    return (
      <div className="page-container py-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="glass-card p-4 h-28 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!incident) {
    return <div className="page-container py-6"><AlertBanner type="danger">{error || 'Incident not found.'}</AlertBanner></div>;
  }

  return (
    <div className="page-container py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {incident.state === 'resolved' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Resolved</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Live Response</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{INCIDENT_TYPE_LABELS[incident.type]}</h1>
          <p className="text-sm text-slate-400">{incident.location.freeText}</p>
        </div>
        <div className="flex items-center gap-2">
          {incident.state !== 'resolved' && !showConfirm && (
            <Button
              size="sm"
              variant="outline"
              className="border-green-800 text-green-400 hover:bg-green-900/30 hover:text-green-300"
              onClick={() => setShowConfirm(true)}
            >
              Resolve Incident
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/manager/incidents/${id}/handoff`)}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Handoff
          </Button>
        </div>
      </div>

      {showConfirm && (
        <div className="glass-card p-5 border border-green-900/50 bg-green-900/10">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">Are you sure you want to resolve this incident?</p>
              <p className="text-xs text-slate-300 mt-1">This will send an "All Clear" message to all guests and staff, and close the incident.</p>
              <div className="flex gap-3 mt-4">
                <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)} disabled={resolving}>Cancel</Button>
                <Button size="sm" onClick={handleResolve} loading={resolving} className="bg-green-600 hover:bg-green-500 text-white border-green-500">Confirm & Send All Clear</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Safe"         count={agg.safe}         total={agg.total} icon={<ShieldCheck className="w-4 h-4" />} colorClass="text-green-400" />
        <KPICard label="Need Help"    count={agg.needHelp}     total={agg.total} icon={<AlertCircle className="w-4 h-4" />} colorClass="text-amber-400" urgent />
        <KPICard label="Can't Move"   count={agg.unableToMove} total={agg.total} icon={<MoveRight className="w-4 h-4" />}   colorClass="text-red-400"   urgent />
        <KPICard label="Pending"      count={agg.pending}      total={agg.total} icon={<Clock className="w-4 h-4" />}       colorClass="text-slate-400" />
      </div>

      {/* Total badge */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Users className="w-4 h-4" />
        {agg.total} guest{agg.total !== 1 ? 's' : ''} responded · updates in real time
      </div>

      {/* Critical guests (need help or can't move) — always visible */}
      {(agg.needHelp > 0 || agg.unableToMove > 0) && (
        <div className="glass-card p-5 border border-red-900/50">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">
            ⚠ Guests Requiring Immediate Attention
          </p>
          <div className="space-y-2">
            {responses
              .filter((r) => r.status === 'need_help' || r.status === 'unable_to_move')
              .map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-white">{r.guestName}</p>
                    <p className="text-xs text-slate-400">{r.roomLabel} · {r.floorLabel}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${GUEST_STATUS_COLORS[r.status]}`}>
                    {GUEST_STATUS_LABELS[r.status]}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Full Response Table */}
      {responses.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <p className="text-sm font-semibold text-slate-300">All Responses</p>
          </div>
          <div className="divide-y divide-slate-800">
            {responses.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.guestName}</p>
                  <p className="text-xs text-slate-400">{r.roomLabel} · {r.floorLabel}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${GUEST_STATUS_COLORS[r.status]}`}>
                  {GUEST_STATUS_LABELS[r.status]}
                </span>
                <span className="text-xs text-slate-500 hidden sm:block whitespace-nowrap">
                  {formatTimeAgo(r.updatedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {responses.length === 0 && (
        <div className="glass-card p-10 text-center">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Waiting for guest responses…</p>
          <p className="text-xs text-slate-500 mt-1">Guests who open the alert will appear here in real time</p>
        </div>
      )}
    </div>
  );
}
