import { useState, useEffect, useRef } from 'react';
import type { HazardPin, HazardPinType } from '@/lib/types';
import { HAZARD_PIN_LABELS, HAZARD_PIN_COLORS } from '@/lib/constants';
import { subscribeToHazardPins, addHazardPin, deleteHazardPin } from '@/services/hazardPin.service';
import { getFloorsByProperty } from '@/services/layout.service';
import {
  MapPin, AlertTriangle, ShieldCheck, DoorOpen, Flag,
  Plus, X, Loader2, Map as MapIcon, Layers, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Pin Icon Mapping ────────────────────────────────────────
const PIN_ICONS: Record<HazardPinType, React.ReactNode> = {
  danger:         <AlertTriangle className="w-3.5 h-3.5" />,
  caution:        <AlertTriangle className="w-3.5 h-3.5" />,
  safe_zone:      <ShieldCheck className="w-3.5 h-3.5" />,
  exit:           <DoorOpen className="w-3.5 h-3.5" />,
  assembly_point: <Flag className="w-3.5 h-3.5" />,
};

// ─── Props ───────────────────────────────────────────────────
interface MapOverlayProps {
  incidentId: string;
  propertyId: string;
  /** If provided, only show pins for this specific floor */
  targetFloorId?: string;
  /** Allow adding/removing pins (manager mode) */
  editable?: boolean;
  /** UID of user adding pins */
  userId?: string;
  /** Compact height for embedding inside cards */
  compact?: boolean;
}

interface FloorInfo {
  id: string;
  label: string;
  mapImageUrl?: string;
}

export function MapOverlay({
  incidentId,
  propertyId,
  targetFloorId,
  editable = false,
  userId,
  compact = false,
}: MapOverlayProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const [floors, setFloors] = useState<FloorInfo[]>([]);
  const [activeFloor, setActiveFloor] = useState<string | null>(null);
  const [pins, setPins] = useState<HazardPin[]>([]);
  const [loadingFloors, setLoadingFloors] = useState(true);

  // New pin form state
  const [placing, setPlacing] = useState(false);
  const [newPinType, setNewPinType] = useState<HazardPinType>('danger');
  const [newPinLabel, setNewPinLabel] = useState('');
  const [saving, setSaving] = useState(false);

  // Load floors for property
  useEffect(() => {
    if (!propertyId) return;
    setLoadingFloors(true);
    getFloorsByProperty(propertyId).then((raw) => {
      const mapped: FloorInfo[] = raw.map((f: any) => ({
        id: f.id,
        label: f.label,
        mapImageUrl: f.mapImageUrl,
      }));
      setFloors(mapped);

      // Select the target floor or first floor with a map
      const target = targetFloorId
        ? mapped.find((f) => f.id === targetFloorId)
        : mapped.find((f) => f.mapImageUrl);
      setActiveFloor(target?.id ?? mapped[0]?.id ?? null);
      setLoadingFloors(false);
    });
  }, [propertyId, targetFloorId]);

  // Subscribe to hazard pins
  useEffect(() => {
    if (!incidentId) return;
    const unsub = subscribeToHazardPins(incidentId, (p) => setPins(p));
    return unsub;
  }, [incidentId]);

  // Active floor data
  const currentFloor = floors.find((f) => f.id === activeFloor);
  const floorPins = pins.filter((p) => p.floorId === activeFloor);

  // ─── Click handler for placing pins ──────────────────────────
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placing || !editable || !currentFloor?.mapImageUrl || !userId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setSaving(true);
    addHazardPin({
      incidentId,
      floorId: activeFloor!,
      label: newPinLabel.trim() || HAZARD_PIN_LABELS[newPinType],
      type: newPinType,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      createdBy: userId,
    })
      .then(() => {
        toast.success('Pin placed!');
        setNewPinLabel('');
      })
      .catch(() => toast.error('Failed to place pin'))
      .finally(() => setSaving(false));
  };

  const handleDeletePin = (pinId: string) => {
    deleteHazardPin(pinId)
      .then(() => toast.success('Pin removed'))
      .catch(() => toast.error('Failed to remove pin'));
  };

  // ─── Loading state ───────────────────────────────────────────
  if (loadingFloors) {
    return (
      <div className="glass-card p-6 flex items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading floor plans...
      </div>
    );
  }

  // ─── No floors with maps ────────────────────────────────────
  if (floors.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <MapIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">No floor plans available for this property.</p>
        <p className="text-xs text-slate-500 mt-1">An admin can upload floor maps in Setup → Layout.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* ── Header with floor tabs ─────────────────────────────── */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-semibold text-slate-200">Floor Map</span>
        </div>
        <div className="flex gap-1">
          {floors.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFloor(f.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                activeFloor === f.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map canvas ─────────────────────────────────────────── */}
      <div className={`relative ${compact ? 'h-56' : 'h-72 md:h-96'} bg-slate-950 overflow-hidden`}>
        {currentFloor?.mapImageUrl ? (
          <>
            {/* Floor plan image */}
            <img
              src={currentFloor.mapImageUrl}
              alt={`${currentFloor.label} floor plan`}
              className="w-full h-full object-contain opacity-80"
              draggable={false}
            />
            {/* Click overlay for placing pins */}
            <div
              ref={mapRef}
              onClick={handleMapClick}
              className={`absolute inset-0 ${placing ? 'cursor-crosshair' : ''}`}
            >
              {/* Hazard Pins */}
              {floorPins.map((pin) => {
                const colors = HAZARD_PIN_COLORS[pin.type];
                return (
                  <div
                    key={pin.id}
                    className="absolute group"
                    style={{
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Pulse ring for danger */}
                    {pin.type === 'danger' && (
                      <span
                        className="absolute inset-0 animate-ping rounded-full bg-red-500/30"
                        style={{ width: '32px', height: '32px', margin: '-4px' }}
                      />
                    )}
                    {/* Pin dot */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg
                        border-2 ${colors.border} ${colors.bg} backdrop-blur-sm
                        transition-transform hover:scale-125 z-10 relative`}
                    >
                      <span className={colors.text}>{PIN_ICONS[pin.type]}</span>
                    </div>
                    {/* Tooltip label */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                      opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap
                        ${colors.bg} ${colors.text} border ${colors.border} shadow-xl backdrop-blur-sm`}>
                        {pin.label}
                      </div>
                    </div>
                    {/* Delete button for editable mode */}
                    {editable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePin(pin.id);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-slate-700
                          flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30
                          hover:bg-red-900 hover:border-red-600"
                      >
                        <X className="w-2.5 h-2.5 text-slate-400" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MapIcon className="w-12 h-12 text-slate-700 mb-3" />
            <p className="text-sm text-slate-400 mb-1">No map uploaded for {currentFloor?.label}</p>
            <p className="text-xs text-slate-500">Upload a floor plan image in Admin Setup.</p>
          </div>
        )}
      </div>

      {/* ── Legend ──────────────────────────────────────────────── */}
      {floorPins.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-800 flex flex-wrap gap-3">
          {(Object.keys(HAZARD_PIN_LABELS) as HazardPinType[])
            .filter((type) => floorPins.some((p) => p.type === type))
            .map((type) => {
              const colors = HAZARD_PIN_COLORS[type];
              return (
                <div key={type} className="flex items-center gap-1.5 text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span className={colors.text}>{HAZARD_PIN_LABELS[type].replace(/^[^\s]+\s/, '')}</span>
                </div>
              );
            })}
        </div>
      )}

      {/* ── Editable toolbar ───────────────────────────────────── */}
      {editable && currentFloor?.mapImageUrl && (
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50">
          {placing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <MapPin className="w-3.5 h-3.5" />
                Click on the map to place a pin
              </div>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(HAZARD_PIN_LABELS) as HazardPinType[]).map((type) => {
                  const colors = HAZARD_PIN_COLORS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setNewPinType(type)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        newPinType === type
                          ? `${colors.bg} ${colors.border} ${colors.text}`
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {HAZARD_PIN_LABELS[type]}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pin label (optional)"
                  value={newPinLabel}
                  onChange={(e) => setNewPinLabel(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200
                    placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  onClick={() => { setPlacing(false); setNewPinLabel(''); }}
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-400
                    hover:text-white hover:border-slate-600 transition-colors"
                >
                  Done
                </button>
              </div>
              {saving && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving pin...
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setPlacing(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600/20 border border-primary-700/50
                text-sm text-primary-400 hover:bg-primary-600/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Hazard Pin
            </button>
          )}
        </div>
      )}
    </div>
  );
}
