import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getIncident } from '@/services/incident.service';
import { createBroadcast } from '@/services/broadcast.service';
import type { IncidentDoc } from '@/services/incident.service';
import type { BroadcastScope } from '@/lib/types';
import {
  BROADCAST_SCOPE_LABELS,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
  INCIDENT_TYPE_LABELS,
} from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Textarea } from '@/components/ui/Textarea';
import {
  Send, Users, Layers, UserCheck, CheckCircle2, AlertTriangle, Edit2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SCOPE_OPTIONS: { value: BroadcastScope; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'all',        icon: <Users className="w-4 h-4" />,     label: 'All Guests & Staff', description: 'Send to everyone in the property' },
  { value: 'floor',      icon: <Layers className="w-4 h-4" />,    label: 'Specific Floor',     description: 'Target guests on a specific floor only' },
  { value: 'staff-only', icon: <UserCheck className="w-4 h-4" />, label: 'Staff Only',         description: 'Internal message for staff team only' },
];

export default function BroadcastPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [incident, setIncident]     = useState<IncidentDoc | null>(null);
  const [scope, setScope]           = useState<BroadcastScope>('all');
  const [messageEn, setMessageEn]   = useState('');
  const [messageHi, setMessageHi]   = useState('');
  const [isEditing, setIsEditing]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!id) return;
    getIncident(id)
      .then((inc) => {
        setIncident(inc);
        if (inc?.aiOutput) {
          setMessageEn(inc.aiOutput.guestInstructions.en);
          setMessageHi(inc.aiOutput.guestInstructions.hi ?? '');
        }
      })
      .catch(() => setError('Failed to load incident.'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSend = async () => {
    if (!messageEn.trim()) { setError('Message cannot be empty.'); return; }
    if (!incident || !user) return;
    setError('');
    setLoading(true);
    try {
      await createBroadcast({
        incidentId: incident.id,
        propertyId: incident.propertyId,
        scope,
        messageEn:  messageEn.trim(),
        messageHi:  messageHi.trim() || undefined,
        sentBy:     user.uid,
        sentByRole: 'manager',
      });
      toast.success('Broadcast sent! Incident is now active.');
      navigate(`/manager/incidents/${incident.id}/live`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send broadcast.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="page-container py-6 max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
            <div className="h-16 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="page-container py-6">
        <AlertBanner type="danger">Incident not found.</AlertBanner>
      </div>
    );
  }

  const severity = incident.aiOutput?.severity ?? 'high';

  return (
    <div className="page-container py-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Broadcast Center</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review and send the emergency message to guests and staff
        </p>
      </div>

      {error && <AlertBanner type="danger" dismissible>{error}</AlertBanner>}

      {/* Incident summary chip */}
      <div className="glass-card p-4 flex items-center gap-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${SEVERITY_COLORS[severity]}`}>
          {SEVERITY_LABELS[severity]}
        </span>
        <div>
          <p className="text-white font-medium">{INCIDENT_TYPE_LABELS[incident.type]}</p>
          <p className="text-xs text-slate-400">{incident.location.freeText}</p>
        </div>
      </div>

      {/* Audience selector */}
      <div className="glass-card p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Who should receive this?
        </p>
        <div className="space-y-2">
          {SCOPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setScope(opt.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                ${scope === opt.value
                  ? 'border-primary-600 bg-primary-900/20'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
            >
              <span className={scope === opt.value ? 'text-primary-400' : 'text-slate-400'}>
                {opt.icon}
              </span>
              <div>
                <p className={`text-sm font-medium ${scope === opt.value ? 'text-white' : 'text-slate-300'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500">{opt.description}</p>
              </div>
              {scope === opt.value && (
                <CheckCircle2 className="w-4 h-4 text-primary-400 ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Message editor */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Message Preview
          </p>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            {isEditing ? 'Done editing' : 'Edit message'}
          </button>
        </div>

        {incident.aiOutput && !isEditing && (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            AI-generated message • approved by you
          </div>
        )}

        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              label="English Message"
              value={messageEn}
              onChange={(e) => setMessageEn(e.target.value)}
              rows={4}
            />
            <Textarea
              label="Hindi Message (optional)"
              value={messageHi}
              onChange={(e) => setMessageHi(e.target.value)}
              rows={3}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1.5">🇬🇧 English</p>
              <p className="text-sm text-white leading-relaxed">
                {messageEn || <span className="text-slate-500 italic">No message yet</span>}
              </p>
            </div>
            {messageHi && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1.5">🇮🇳 Hindi</p>
                <p className="text-sm text-white leading-relaxed">{messageHi}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Warning for no AI output */}
      {!incident.aiOutput && (
        <AlertBanner type="warning">
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          AI analysis may still be loading. You can still send a manual message.
        </AlertBanner>
      )}

      {/* CTA */}
      <Button
        onClick={handleSend}
        loading={loading}
        size="lg"
        className="w-full"
        icon={<Send className="w-4 h-4" />}
      >
        {loading ? 'Sending…' : `Send Broadcast to ${BROADCAST_SCOPE_LABELS[scope]}`}
      </Button>
    </div>
  );
}
