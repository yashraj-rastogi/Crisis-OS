import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createIncident } from '@/services/incident.service';
import { structureIncident } from '@/services/ai.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { INCIDENT_TYPES, INCIDENT_TYPE_LABELS } from '@/lib/constants';
import type { IncidentType } from '@/lib/types';
import { Flame, AlertTriangle, Zap, Wind, ShieldAlert, Activity, Droplets, Building2, HelpCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<IncidentType, React.ReactNode> = {
  fire:          <Flame className="w-5 h-5" />,
  gas_leak:      <Wind className="w-5 h-5" />,
  flood:         <Droplets className="w-5 h-5" />,
  power_outage:  <Zap className="w-5 h-5" />,
  food_poisoning:<AlertTriangle className="w-5 h-5" />,
  medical:       <Activity className="w-5 h-5" />,
  security:      <ShieldAlert className="w-5 h-5" />,
  structural:    <Building2 className="w-5 h-5" />,
  other:         <HelpCircle className="w-5 h-5" />,
};

const TYPE_COLORS: Record<IncidentType, string> = {
  fire:          'border-red-700 bg-red-900/30 text-red-400',
  gas_leak:      'border-orange-700 bg-orange-900/30 text-orange-400',
  flood:         'border-blue-700 bg-blue-900/30 text-blue-400',
  power_outage:  'border-yellow-700 bg-yellow-900/30 text-yellow-400',
  food_poisoning:'border-purple-700 bg-purple-900/30 text-purple-400',
  medical:       'border-pink-700 bg-pink-900/30 text-pink-400',
  security:      'border-primary-700 bg-primary-900/30 text-primary-400',
  structural:    'border-slate-600 bg-slate-800/50 text-slate-300',
  other:         'border-slate-700 bg-slate-800/30 text-slate-400',
};

export default function CreateIncidentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [type, setType]         = useState<IncidentType | null>(null);
  const [location, setLocation] = useState('');
  const [details, setDetails]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState<'type' | 'details'>('type');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type)              { setError('Please select an incident type.'); return; }
    if (!location.trim())   { setError('Please enter the location.'); return; }
    if (!details.trim())    { setError('Please describe what happened.'); return; }
    if (!user?.propertyId)  { setError('No property linked to your account. Contact admin.'); return; }

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

      toast.success('Incident created — generating AI analysis…');

      // Trigger AI structuring in background (non-blocking for navigation)
      structureIncident({
        incidentId,
        type,
        location: location.trim(),
        details:  details.trim(),
        actorUid:  user.uid,
        actorRole: user.role,
      }).catch(console.error);

      navigate(`/manager/incidents/${incidentId}/review`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create incident.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Report Incident</h1>
        <p className="text-sm text-slate-400 mt-1">
          AI will structure this into an actionable response plan
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex items-center gap-2 text-sm font-medium ${step === 'type' ? 'text-white' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'type' ? 'bg-primary-600' : 'bg-slate-700'}`}>1</span>
          Incident Type
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <div className={`flex items-center gap-2 text-sm font-medium ${step === 'details' ? 'text-white' : 'text-slate-500'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'details' ? 'bg-primary-600' : 'bg-slate-800 border border-slate-700'}`}>2</span>
          Location & Details
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <AlertBanner type="danger" dismissible>{error}</AlertBanner>
        </div>
      )}

      {/* Step 1: Type selection */}
      {step === 'type' && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
            What type of crisis is this?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INCIDENT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setStep('details'); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105
                  ${type === t
                    ? TYPE_COLORS[t] + ' scale-105'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
              >
                {TYPE_ICONS[t]}
                <span className="text-xs font-medium text-center leading-tight">
                  {INCIDENT_TYPE_LABELS[t]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Location + Details */}
      {step === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected type chip */}
          <div className="glass-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`p-2 rounded-lg border ${type ? TYPE_COLORS[type] : ''}`}>
                {type && TYPE_ICONS[type]}
              </span>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Crisis Type</p>
                <p className="text-white font-semibold">{type && INCIDENT_TYPE_LABELS[type]}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep('type')}
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              Change
            </button>
          </div>

          <div className="glass-card p-6 space-y-4">
            <Input
              label="Location"
              placeholder="e.g. Floor 2 – Kitchen area near gas stoves"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              disabled={loading}
            />
            <Textarea
              label="What happened? (describe clearly)"
              placeholder="Provide as much detail as possible — what was seen, smelled, heard, and when it started…"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              disabled={loading}
              rows={5}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('type')}
              disabled={loading}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
              size="lg"
            >
              {loading ? 'Creating…' : 'Create Incident'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
