import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { seedDemoProperty, simulateGuestResponses } from '@/services/demo.service';
import { Button } from './Button';
import toast from 'react-hot-toast';
import { Beaker, Users, Building2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function DemoTools() {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) return null;

  const handleSeedProperty = async () => {
    if (!user) {
      toast.error('Must be logged in to seed property');
      return;
    }
    try {
      setLoading(true);
      const { joinCode } = await seedDemoProperty(user.orgId || `demo_org_${Date.now()}`);
      toast.success(`Property seeded! Join Code: ${joinCode}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to seed property');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateGuests = async () => {
    if (!user?.propertyId) {
      toast.error('Must belong to a property');
      return;
    }
    // Extract incident ID from URL if we're on a live dashboard
    const match = location.pathname.match(/\/incidents\/([a-zA-Z0-9_-]+)\//);
    const incidentId = match ? match[1] : null;

    if (!incidentId) {
      toast.error('Must be on an incident page (e.g., Live Board) to simulate responses');
      return;
    }

    try {
      setLoading(true);
      await simulateGuestResponses(incidentId, user.propertyId);
      toast.success('Simulated guest responses added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to simulate guests');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-800 text-slate-400 hover:text-white p-3 rounded-full shadow-lg border border-slate-700 transition-colors"
          title="Demo Tools"
        >
          <Beaker className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-64 glass-card p-4 shadow-xl border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Beaker className="w-4 h-4 text-primary-400" />
          Demo Tools
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white text-xs"
        >
          Close
        </button>
      </div>

      <div className="space-y-3">
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full text-xs justify-start"
          icon={<Building2 className="w-4 h-4" />}
          loading={loading}
          onClick={handleSeedProperty}
        >
          Seed Demo Property
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full text-xs justify-start"
          icon={<Users className="w-4 h-4" />}
          loading={loading}
          onClick={handleSimulateGuests}
        >
          Simulate Guest Responses
        </Button>
      </div>
    </div>
  );
}
