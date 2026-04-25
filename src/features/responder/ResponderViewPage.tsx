import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getHandoffSummary } from '@/services/incident.service';
import { subscribeToResponseAggregates } from '@/services/guestResponse.service';
import { Shield, AlertTriangle, Info, Clock, Loader2, HeartPulse, UserX, Activity } from 'lucide-react';
import type { HandoffSummary, ResponseAggregates } from '@/lib/types';

export default function ResponderViewPage() {
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<HandoffSummary | null>(null);
  const [liveAggregates, setLiveAggregates] = useState<ResponseAggregates | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    
    getHandoffSummary(id)
      .then(s => {
        if (!s) throw new Error('Handoff not found');
        setSummary(s);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setError('Unable to load incident handoff. Link may be invalid or expired.');
        setLoading(false);
      });

    const unsubscribe = subscribeToResponseAggregates(id, (agg) => {
      setLiveAggregates(agg);
    });

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
        <p className="text-slate-400">Loading secure handoff payload...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 max-w-sm">{error || 'Handoff summary not found.'}</p>
      </div>
    );
  }

  // Use live aggregates if available, otherwise fallback to snapshot
  const safeCount = liveAggregates ? liveAggregates.safe : summary.safeCount;
  const helpCount = liveAggregates ? liveAggregates.needHelp : summary.helpCount;
  const unableCount = liveAggregates ? liveAggregates.unableToMove : summary.unableCount;
  const totalGuests = liveAggregates ? liveAggregates.total : summary.totalGuests;
  
  const criticalGuests = liveAggregates 
    ? liveAggregates.responses.filter(r => r.status === 'need_help' || r.status === 'unable_to_move')
    : summary.unresolvedCritical;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-900/30 border border-primary-700/50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Responder Command View</h1>
              <p className="text-xs text-slate-400">Read-only live feed • Incident #{id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-green-400">LIVE</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Situation Overview */}
        <section className="glass-card p-6 border-l-4 border-l-primary-500">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Situation Overview
          </h2>
          <p className="text-lg text-slate-200 leading-relaxed mb-4">
            {summary.summary}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Severity: <span className="text-white capitalize">{summary.severity}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Generated: <span className="text-white">{summary.generatedAt.toLocaleTimeString()}</span>
            </div>
          </div>
        </section>

        {/* Live Aggregates */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
            <Activity className="w-6 h-6 text-slate-500 mb-2" />
            <div className="text-2xl font-bold text-white">{totalGuests}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Total Logged</div>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center text-center border-b-2 border-b-green-500">
            <Shield className="w-6 h-6 text-green-500 mb-2" />
            <div className="text-2xl font-bold text-green-400">{safeCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Safe</div>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center text-center border-b-2 border-b-amber-500">
            <HeartPulse className="w-6 h-6 text-amber-500 mb-2" />
            <div className="text-2xl font-bold text-amber-400">{helpCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Need Help</div>
          </div>
          <div className="glass-card p-4 flex flex-col items-center justify-center text-center border-b-2 border-b-red-500">
            <UserX className="w-6 h-6 text-red-500 mb-2" />
            <div className="text-2xl font-bold text-red-400">{unableCount}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Cannot Move</div>
          </div>
        </section>

        {/* Critical Intervention List */}
        <section className="glass-card overflow-hidden">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Critical Intervention Required
            </h2>
            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs font-bold">
              {criticalGuests.length} Guests
            </span>
          </div>
          
          <div className="divide-y divide-slate-800/50 max-h-[500px] overflow-y-auto">
            {criticalGuests.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No guests currently reporting need for critical intervention.
              </div>
            ) : (
              criticalGuests.map(g => (
                <div key={g.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div>
                    <div className="font-medium text-slate-200 flex items-center gap-2">
                      {g.roomLabel}
                      <span className="text-xs text-slate-500 font-normal">({g.guestName})</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{g.floorLabel}</span>
                      {g.zone && <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{g.zone}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full inline-block ${
                      g.status === 'unable_to_move' ? 'bg-red-900/30 text-red-400' : 'bg-amber-900/30 text-amber-400'
                    }`}>
                      {g.status.replace('_', ' ')}
                    </div>
                    {g.note && (
                      <div className="text-xs text-slate-400 mt-2 max-w-[200px] truncate" title={g.note}>
                        "{g.note}"
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
