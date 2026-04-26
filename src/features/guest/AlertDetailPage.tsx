import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS, SEVERITY_COLORS, SEVERITY_LABELS } from '@/lib/constants';
import type { AIStructuredOutput } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { submitGuestResponse } from '@/services/guestResponse.service';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { LanguageSwitcher, useGuestLanguage } from '@/components/ui/LanguageSwitcher';
import { MapOverlay } from '@/components/crisis/MapOverlay';
import {
  ShieldCheck, AlertCircle, MoveHorizontal, Loader2, Siren,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StatusOption {
  status: 'safe' | 'need_help' | 'unable_to_move';
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  border: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    status:   'safe',
    label:    "I'm Safe",
    sublabel: 'I can move and am not in danger',
    icon:     <ShieldCheck className="w-8 h-8" />,
    color:    'text-green-400',
    border:   'border-green-700 hover:border-green-500',
  },
  {
    status:   'need_help',
    label:    'I Need Help',
    sublabel: 'I need assistance but can communicate',
    icon:     <AlertCircle className="w-8 h-8" />,
    color:    'text-amber-400',
    border:   'border-amber-700 hover:border-amber-500',
  },
  {
    status:   'unable_to_move',
    label:    "I Can't Move",
    sublabel: 'I am injured or trapped',
    icon:     <MoveHorizontal className="w-8 h-8" />,
    color:    'text-red-400',
    border:   'border-red-700 hover:border-red-500',
  },
];

export default function AlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang] = useGuestLanguage();

  const [incident, setIncident]     = useState<{
    type: string; propertyId: string; location: { freeText: string; floorId?: string }; aiOutput?: AIStructuredOutput;
  } | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, COLLECTIONS.INCIDENTS, id), (snap) => {
      if (snap.exists()) setIncident(snap.data() as typeof incident);
    });
    return unsub;
  }, [id]);

  const handleStatus = async (status: StatusOption['status']) => {
    if (!id || !firebaseUser) return;
    setError('');
    setSubmitting(status);
    try {
      await submitGuestResponse({
        incidentId:  id,
        propertyId:  user?.propertyId ?? '',
        guestUid:    firebaseUser.uid,
        guestName:   firebaseUser.displayName ?? user?.displayName ?? 'Guest',
        roomLabel:   'Unknown',   // ideally from user profile
        floorLabel:  'Unknown',
        status,
      });
      toast.success('Status submitted — stay safe!');
      navigate(`/guest/incidents/${id}/check-in`);
    } catch (err) {
      setError('Failed to submit status. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const severity = incident?.aiOutput?.severity ?? 'high';
  // Pick the instruction in the guest's preferred language, fall back to English
  const message = incident?.aiOutput?.guestInstructions?.[lang]
    ?? incident?.aiOutput?.guestInstructions?.en
    ?? 'An emergency has been reported. Please remain calm and follow all instructions from staff.';

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 flex flex-col max-w-lg mx-auto">
      {/* Language switcher */}
      <div className="flex justify-end mb-4">
        <LanguageSwitcher value={lang} onChange={setLang} />
      </div>
      {/* Alert header */}
      <div className={`glass-card p-5 mb-6 border-2 ${
        severity === 'critical' ? 'border-red-600 bg-red-950/30' :
        severity === 'high'     ? 'border-red-700 bg-red-950/20' :
        'border-amber-700 bg-amber-950/20'
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <Siren className={`w-5 h-5 flex-shrink-0 ${
            severity === 'critical' || severity === 'high' ? 'text-red-400 animate-pulse' : 'text-amber-400'
          }`} />
          <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[severity]}`}>
            {SEVERITY_LABELS[severity]} Alert
          </span>
        </div>
        <p className="text-white font-bold text-lg leading-snug mb-3">
          {message ?? 'An emergency has been reported. Please remain calm and follow staff instructions.'}
        </p>
        {incident?.location?.freeText && (
          <p className="text-xs text-slate-400">📍 {incident.location.freeText}</p>
        )}
      </div>

      {/* Map Overlay — spatial awareness */}
      {id && incident?.propertyId && (
        <div className="mb-6">
          <MapOverlay
            incidentId={id}
            propertyId={incident.propertyId}
            targetFloorId={incident.location?.floorId}
            compact
          />
        </div>
      )}

      {error && <div className="mb-4"><AlertBanner type="danger" dismissible>{error}</AlertBanner></div>}

      {/* Status selection */}
      <p className="text-sm font-semibold text-slate-300 mb-4 text-center uppercase tracking-wide">
        What is your current status?
      </p>

      <div className="space-y-3 flex-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.status}
            onClick={() => handleStatus(opt.status)}
            disabled={!!submitting}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 bg-slate-900/70 backdrop-blur-sm
              transition-all duration-200 active:scale-95 text-left
              ${submitting === opt.status ? 'opacity-100 scale-95' : 'hover:scale-102'}
              ${opt.border}`}
          >
            <span className={opt.color}>
              {submitting === opt.status
                ? <Loader2 className="w-8 h-8 animate-spin" />
                : opt.icon
              }
            </span>
            <div>
              <p className={`text-lg font-bold ${opt.color}`}>{opt.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{opt.sublabel}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Do not list */}
      {incident?.aiOutput?.doNotList && incident.aiOutput.doNotList.length > 0 && (
        <div className="mt-6 glass-card p-4 border border-slate-800">
          <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-2">Important — Do NOT:</p>
          <ul className="space-y-1">
            {incident.aiOutput.doNotList.map((item, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-1.5">
                <span className="text-red-500">✕</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
