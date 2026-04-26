import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { triggerMockSensorIncident, simulateGuestResponses } from '@/services/demo.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Flame, Users } from 'lucide-react';

export default function DrillConsolePage() {
  const { user } = useAuth();
  const [loadingIoT, setLoadingIoT] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [incidentId, setIncidentId] = useState('');

  const handleIoTTrigger = async () => {
    if (!user?.propertyId || !user?.orgId) {
      toast.error('Admin must belong to a property and org.');
      return;
    }
    setLoadingIoT(true);
    try {
      const newId = await triggerMockSensorIncident(user.propertyId, user.orgId, user.uid, user.role);
      setIncidentId(newId);
      toast.success('Mock sensor incident triggered!');
    } catch (err) {
      toast.error('Failed to trigger mock incident.');
    }
    setLoadingIoT(false);
  };

  const handleGuestResponses = async () => {
    if (!user?.propertyId || !incidentId.trim()) {
      toast.error('Provide a valid incident ID first.');
      return;
    }
    setLoadingGuest(true);
    try {
      await simulateGuestResponses(incidentId.trim(), user.propertyId);
      toast.success('Mock guest responses seeded!');
    } catch (err) {
      toast.error('Failed to seed guest responses.');
    }
    setLoadingGuest(false);
  };

  return (
    <div className="page-container py-8 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Drill Console</h1>
        <p className="text-sm text-slate-400 mt-1">Admin tools for simulation and testing.</p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-start gap-4 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-full bg-red-900/30 text-red-400">
            <Flame className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">1. Simulate IoT Sensor Alert</h3>
            <p className="text-sm text-slate-400 mt-1 mb-3">
              Automatically creates a draft fire incident as if triggered by a connected smoke detector in the Main Kitchen.
            </p>
            <Button onClick={handleIoTTrigger} loading={loadingIoT} className="bg-red-600 hover:bg-red-500 text-white border-red-500">
              Trigger Smoke Detector
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-4 pt-2">
          <div className="p-3 rounded-full bg-indigo-900/30 text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-white">2. Seed Mock Guest Responses</h3>
              <p className="text-sm text-slate-400 mt-1">
                Generates 5 dummy guest check-ins (Safe, Need Help, Unable to Move) for an active incident to test the Live Dashboard.
              </p>
            </div>
            <Input 
              placeholder="Incident ID" 
              value={incidentId} 
              onChange={e => setIncidentId(e.target.value)} 
            />
            <Button onClick={handleGuestResponses} loading={loadingGuest} disabled={!incidentId.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 w-full">
              Simulate 5 Guest Responses
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
