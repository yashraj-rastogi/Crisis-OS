import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS, SEVERITY_COLORS, SEVERITY_LABELS, INCIDENT_TYPE_LABELS } from '@/lib/constants';
import { getIncident } from '@/services/incident.service';
import type { IncidentDoc } from '@/services/incident.service';
import type { AIStructuredOutput } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Textarea } from '@/components/ui/Textarea';
import { Edit3, Bot, AlertTriangle, ArrowRight, Loader2, List, Shield } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse space-y-3">
      <div className="h-4 bg-slate-700 rounded w-1/4" />
      <div className="h-3 bg-slate-800 rounded w-full" />
      <div className="h-3 bg-slate-800 rounded w-5/6" />
      <div className="h-3 bg-slate-800 rounded w-4/6" />
    </div>
  );
}

export default function ReviewIncidentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident]           = useState<IncidentDoc | null>(null);
  const [aiOutput, setAiOutput]           = useState<AIStructuredOutput | null>(null);
  const [aiLoading, setAiLoading]         = useState(true);
  const [editingMessage, setEditingMessage] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [fetching, setFetching]           = useState(true);
  const [error, setError]                 = useState('');

  // Load incident once
  useEffect(() => {
    if (!id) return;
    getIncident(id)
      .then((inc) => { setIncident(inc); setFetching(false); })
      .catch(() => { setError('Failed to load incident.'); setFetching(false); });
  }, [id]);

  // Real-time listener for AI output (fires when structureIncident() writes it)
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, COLLECTIONS.INCIDENTS, id), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data.aiOutput) {
        setAiOutput(data.aiOutput as AIStructuredOutput);
        setEditedMessage(data.aiOutput.guestInstructions.en);
        setAiLoading(false);
      }
    });

    // Timeout fallback — if no AI in 15s, stop waiting
    const timeout = setTimeout(() => setAiLoading(false), 15_000);
    return () => { unsub(); clearTimeout(timeout); };
  }, [id]);

  const handleProceed = () => {
    if (!id) return;
    if (aiOutput && editingMessage && editedMessage !== aiOutput.guestInstructions.en) {
      // If they edited the message, store it on the session (passed via navigate state)
      navigate(`/manager/incidents/${id}/broadcast`, {
        state: { overrideMessageEn: editedMessage },
      });
    } else {
      navigate(`/manager/incidents/${id}/broadcast`);
    }
  };

  if (fetching) {
    return (
      <div className="page-container py-6 max-w-2xl mx-auto space-y-4">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="page-container py-6">
        <AlertBanner type="danger">{error || 'Incident not found.'}</AlertBanner>
      </div>
    );
  }

  const severity = aiOutput?.severity ?? 'high';

  return (
    <div className="page-container py-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">AI Draft Review</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review the AI-structured response plan before broadcasting
        </p>
      </div>

      {/* Incident Summary */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-white font-semibold">{INCIDENT_TYPE_LABELS[incident.type]}</p>
          <p className="text-xs text-slate-400 mt-0.5">{incident.location.freeText}</p>
        </div>
        {aiOutput && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${SEVERITY_COLORS[severity]}`}>
            {SEVERITY_LABELS[severity]}
          </span>
        )}
      </div>

      {/* AI Loading State */}
      {aiLoading && (
        <div className="glass-card p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-primary-900/40 border border-primary-800 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-400 animate-pulse" />
          </div>
          <div>
            <p className="text-white font-semibold">Gemini is analyzing the incident…</p>
            <p className="text-xs text-slate-400 mt-1">Generating situation summary, severity assessment, and recommended actions</p>
          </div>
          <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
        </div>
      )}

      {/* AI Output */}
      {aiOutput && !aiLoading && (
        <>
          {/* Summary */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-primary-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Situation Summary</p>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{aiOutput.summary}</p>
          </div>

          {/* Guest Message */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Guest Alert Message</p>
              <button
                onClick={() => { setEditingMessage(!editingMessage); }}
                className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                {editingMessage ? 'Done' : 'Edit'}
              </button>
            </div>
            {editingMessage ? (
              <Textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                rows={4}
              />
            ) : (
              <div className="space-y-3">
                <div className="bg-slate-800/70 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">🇬🇧 English</p>
                  <p className="text-sm text-white">{editedMessage}</p>
                </div>
                {aiOutput.guestInstructions.hi && (
                  <div className="bg-slate-800/70 rounded-lg p-3 border border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">🇮🇳 Hindi</p>
                    <p className="text-sm text-white">{aiOutput.guestInstructions.hi}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Staff Checklist */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Staff Action Checklist</p>
            </div>
            <ol className="space-y-2">
              {aiOutput.staffChecklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-900/40 border border-amber-700 text-amber-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          {/* Do Not List */}
          {aiOutput.doNotList.length > 0 && (
            <div className="glass-card p-5 border border-red-900/50">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-red-400" />
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Do NOT Do This</p>
              </div>
              <ul className="space-y-1.5">
                {aiOutput.doNotList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-red-500 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Escalation */}
          <div className="glass-card p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">{aiOutput.escalationRecommendation}</p>
          </div>
        </>
      )}

      {/* Timeout fallback */}
      {!aiLoading && !aiOutput && (
        <AlertBanner type="warning">
          AI analysis is taking longer than expected. You can proceed with a manual broadcast message.
        </AlertBanner>
      )}

      {/* CTAs */}
      <div className="flex gap-3 pb-6">
        <Button variant="outline" className="flex-1" onClick={() => navigate('/manager/dashboard')}>
          Save as Draft
        </Button>
        <Button
          className="flex-1"
          size="lg"
          onClick={handleProceed}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Approve & Broadcast
        </Button>
      </div>
    </div>
  );
}
