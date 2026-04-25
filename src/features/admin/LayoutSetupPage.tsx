import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Badge } from '@/components/ui/Badge';
import { addFloor, getFloorsByProperty, deleteFloor, addRoom, getRoomsByFloor } from '@/services/layout.service';
import { LayoutGrid, Plus, Trash2, DoorOpen, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface FloorItem { id: string; label: string; order: number; rooms: RoomItem[]; }
interface RoomItem  { id: string; label: string; zone: string; }

export default function LayoutSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [floors, setFloors] = useState<FloorItem[]>([]);
  const [floorLabel, setFloorLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null);
  // Room form
  const [roomLabel, setRoomLabel] = useState('');
  const [roomZone, setRoomZone] = useState('');
  const [addingRoomTo, setAddingRoomTo] = useState<string | null>(null);

  const propertyId = user?.propertyId;

  useEffect(() => {
    if (!propertyId) return;
    loadFloors();
  }, [propertyId]);

  const loadFloors = async () => {
    if (!propertyId) return;
    const raw = await getFloorsByProperty(propertyId);
    const withRooms: FloorItem[] = [];
    for (const f of raw) {
      const rooms = await getRoomsByFloor(f.id);
      withRooms.push({ id: f.id, label: (f as unknown as { label: string }).label, order: (f as unknown as { order: number }).order, rooms: rooms.map((r) => ({ id: r.id, label: (r as unknown as { label: string }).label, zone: (r as unknown as { zone: string }).zone })) });
    }
    setFloors(withRooms);
  };

  const handleAddFloor = async () => {
    if (!floorLabel.trim() || !propertyId) return;
    setLoading(true);
    try {
      await addFloor({ propertyId, label: floorLabel.trim(), order: floors.length + 1 });
      setFloorLabel('');
      await loadFloors();
      toast.success('Floor added!');
    } catch { setError('Failed to add floor.'); }
    setLoading(false);
  };

  const handleDeleteFloor = async (floorId: string) => {
    if (!confirm('Delete this floor and all its rooms?')) return;
    await deleteFloor(floorId);
    await loadFloors();
    toast.success('Floor deleted.');
  };

  const handleAddRoom = async (floorId: string) => {
    if (!roomLabel.trim() || !propertyId) return;
    setLoading(true);
    try {
      await addRoom({ floorId, propertyId, label: roomLabel.trim(), zone: roomZone.trim() || 'General' });
      setRoomLabel('');
      setRoomZone('');
      setAddingRoomTo(null);
      await loadFloors();
      toast.success('Room added!');
    } catch { setError('Failed to add room.'); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step <= 3 ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>{step < 3 ? '✓' : step}</div>
            {step < 4 && <div className={`w-8 h-px ${step < 3 ? 'bg-primary-600' : 'bg-slate-800'}`} />}
          </div>
        ))}
        <span className="text-xs text-slate-500 ml-2">Step 3 of 4</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-900/30 border border-primary-800/50 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <CardTitle>Floor &amp; Room Layout</CardTitle>
              <CardDescription>Add your floors and rooms so broadcasts can target specific areas.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && <AlertBanner type="danger" dismissible className="mb-4">{error}</AlertBanner>}

          {/* Add floor */}
          <div className="flex gap-2 mb-6">
            <Input placeholder="Floor label (e.g. Floor 1)" value={floorLabel} onChange={(e) => setFloorLabel(e.target.value)} className="flex-1" />
            <Button onClick={handleAddFloor} loading={loading} icon={<Plus className="w-4 h-4" />} disabled={!floorLabel.trim()}>Add Floor</Button>
          </div>

          {/* Floor list */}
          {floors.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No floors yet. Add your first floor above.</p>
          ) : (
            <div className="space-y-2">
              {floors.map((floor) => (
                <div key={floor.id} className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 cursor-pointer" onClick={() => setExpandedFloor(expandedFloor === floor.id ? null : floor.id)}>
                    <div className="flex items-center gap-2">
                      {expandedFloor === floor.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <span className="text-sm font-medium text-slate-200">{floor.label}</span>
                      <Badge variant="default">{floor.rooms.length} rooms</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setAddingRoomTo(floor.id); setExpandedFloor(floor.id); }} className="text-xs text-primary-400 hover:text-primary-300"><DoorOpen className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteFloor(floor.id); }} className="text-xs text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {expandedFloor === floor.id && (
                    <div className="px-4 py-3 border-t border-slate-800 space-y-2">
                      {floor.rooms.map((room) => (
                        <div key={room.id} className="flex items-center justify-between px-3 py-2 bg-slate-800/20 rounded-lg text-sm">
                          <span className="text-slate-300">{room.label}</span>
                          <Badge variant="default">{room.zone}</Badge>
                        </div>
                      ))}
                      {addingRoomTo === floor.id && (
                        <div className="flex gap-2 pt-2">
                          <Input placeholder="Room (e.g. 201)" value={roomLabel} onChange={(e) => setRoomLabel(e.target.value)} className="flex-1" />
                          <Input placeholder="Zone" value={roomZone} onChange={(e) => setRoomZone(e.target.value)} className="w-28" />
                          <Button size="sm" onClick={() => handleAddRoom(floor.id)} disabled={!roomLabel.trim()}>Add</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-6">
            <Button onClick={() => navigate('/admin/setup/guest-access')} className="w-full" size="lg" variant={floors.length > 0 ? 'primary' : 'outline'}>
              {floors.length > 0 ? 'Continue to Guest Access' : 'Skip for Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
