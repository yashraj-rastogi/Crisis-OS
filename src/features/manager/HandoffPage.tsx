import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHandoffSummary, generateHandoffSummary } from '@/services/incident.service';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Copy, Check, ArrowRight, Loader2 } from 'lucide-react';
import type { HandoffSummary } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function HandoffPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<HandoffSummary | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getHandoffSummary(id).then(s => {
      setSummary(s);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load summary');
      setLoading(false);
    });
  }, [id]);

  const handleGenerate = async () => {
    if (!id || !user) return;
    try {
      setGenerating(true);
      await generateHandoffSummary(id, user.uid);
      const s = await getHandoffSummary(id);
      setSummary(s);
      toast.success('Handoff summary generated successfully');
    } catch (e) {
      toast.error('Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!summary?.responderLink) return;
    navigator.clipboard.writeText(summary.responderLink);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="page-container py-6">
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-400" />
          Responder Handoff
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate and share a secure, real-time read-only view for external responders (fire, medical, police).
        </p>
      </header>

      {!summary ? (
        <div className="glass-card p-8 text-center space-y-4">
          <Shield className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-lg font-semibold text-slate-200">No Handoff Generated Yet</h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Generate a snapshot of the current situation including active aggregate counts, critical guest locations, and AI summaries.
          </p>
          <Button
            onClick={handleGenerate}
            loading={generating}
            className="mt-4"
            icon={generating ? undefined : <ArrowRight className="w-4 h-4" />}
          >
            {generating ? 'Generating…' : 'Generate Handoff Link'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">Secure Responder Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={summary.responderLink}
                className="input-field flex-1 text-sm bg-slate-950/50 text-slate-300 font-mono"
              />
              <Button
                variant="outline"
                onClick={handleCopy}
                icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                className="whitespace-nowrap"
              >
                {copied ? 'Copied' : 'Copy Link'}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              This link provides read-only access to the incident details and live aggregate counts.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Snapshot Overview</h3>
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                {generating ? 'Regenerating...' : 'Regenerate Snapshot'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
               <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                 <div className="text-xs text-slate-500 mb-1">Total Guests</div>
                 <div className="text-xl font-bold text-slate-200">{summary.totalGuests}</div>
               </div>
               <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                 <div className="text-xs text-slate-500 mb-1">Safe</div>
                 <div className="text-xl font-bold text-green-400">{summary.safeCount}</div>
               </div>
               <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                 <div className="text-xs text-slate-500 mb-1">At Risk</div>
                 <div className="text-xl font-bold text-red-400">{summary.helpCount + summary.unableCount}</div>
               </div>
               <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                 <div className="text-xs text-slate-500 mb-1">Unresolved</div>
                 <div className="text-xl font-bold text-amber-400">{summary.unresolvedCritical.length}</div>
               </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Situation Summary</div>
                <p className="text-sm text-slate-300">{summary.summary}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => navigate(`/manager/incidents/${id}/live`)}
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => navigate(`/manager/incidents/${id}/live`)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Resolution
            </Button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
