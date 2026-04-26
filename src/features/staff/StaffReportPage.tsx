import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createIncident } from '@/services/incident.service';
import { structureIncident } from '@/services/ai.service';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { INCIDENT_TYPE_LABELS } from '@/lib/constants';
import type { IncidentType } from '@/lib/types';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Staff can report a subset of types
const STAFF_TYPES: IncidentType[] = ['fire', 'gas_leak', 'flood', 'power_outage', 'medical', 'security', 'structural', 'other'];

export default function StaffReportPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [type, setType]         = useState<IncidentType>('other');
  const [location, setLocation] = useState('');
  const [details, setDetails]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // ── Voice dictation ────────────────────────────────────────
  const { transcript, listening, supported, start, stop, reset } = useVoiceInput();

  // Sync transcript into details textarea in real-time
  useEffect(() => {
    if (transcript) setDetails(transcript);
  }, [transcript]);

  const handleMicToggle = () => {
    if (listening) {
      stop();
    } else {
      reset();
      setDetails('');
      start();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (listening) stop();
    if (!location.trim()) { setError('Please enter the location.'); return; }
    if (!details.trim())  { setError('Please describe what happened.'); return; }
    if (!user?.propertyId) { setError('No property linked to your account.'); return; }

    setError('');
    setLoading(true);
    try {
      const incidentId = await createIncident({
        propertyId:    user.propertyId!,
        orgId:         user.orgId ?? '',
        type,
        location:      { freeText: location.trim() },
        details:       details.trim(),
        createdBy:     user.uid,
        createdByRole: user.role,
      });

      // Fire AI structuring in background
      structureIncident({
        incidentId,
        type,
        location: location.trim(),
        details:  details.trim(),
        actorUid:  user.uid,
        actorRole: user.role,
      }).catch(console.error);

      toast.success('Incident reported to management.');
      navigate('/staff/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report incident.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-6 max-w-lg mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Report Incident</h1>
        <p className="text-sm text-slate-400 mt-1">Management will be notified immediately</p>
      </div>

      {error && <AlertBanner type="danger" dismissible>{error}</AlertBanner>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Incident Type</p>
          <div className="grid grid-cols-2 gap-2">
            {STAFF_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all text-left
                  ${type === t
                    ? 'border-primary-600 bg-primary-900/30 text-primary-400'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
              >
                {INCIDENT_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <Input
            label="Exact Location"
            placeholder="e.g. Floor 2, Room 204 corridor"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            disabled={loading}
          />

          {/* Details with voice input */}
          <div className="relative">
            <Textarea
              label="What did you observe?"
              placeholder="Describe what you saw, heard, or smelled. Include time of observation."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              disabled={loading}
              rows={5}
            />

            {/* Voice mic button */}
            {supported && (
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onPointerDown={handleMicToggle}
                  disabled={loading}
                  aria-label={listening ? 'Stop recording' : 'Start voice dictation'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 border
                    ${listening
                      ? 'bg-red-900/40 border-red-600 text-red-400 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-primary-600 hover:text-primary-400'
                    } disabled:opacity-50`}
                >
                  {listening
                    ? <><MicOff className="w-4 h-4" /> Stop Recording</>
                    : <><Mic className="w-4 h-4" /> Hold to Speak</>
                  }
                </button>

                {listening && (
                  <span className="flex items-center gap-1.5 text-xs text-red-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Listening…
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? 'Submitting…' : 'Report to Management'}
        </Button>
      </form>
    </div>
  );
}
