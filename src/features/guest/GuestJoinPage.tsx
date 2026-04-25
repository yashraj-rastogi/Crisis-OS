import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Card, CardContent } from '@/components/ui/Card';
import { getPropertyByJoinCode } from '@/services/property.service';
import { createUserProfile } from '@/services/auth.service';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuestJoinPage() {
  const { signInAsGuest, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [roomLabel, setRoomLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) { setError('Join code must be 6 characters.'); return; }
    if (!guestName.trim()) { setError('Please enter your name.'); return; }

    setLoading(true);
    try {
      // 1. Validate join code
      const property = await getPropertyByJoinCode(code);
      if (!property) {
        setError('Invalid join code. Please check with hotel staff.');
        setLoading(false);
        return;
      }

      // 2. Sign in anonymously if not already authenticated
      let uid = firebaseUser?.uid;
      if (!uid) {
        await signInAsGuest();
        // Wait a tick for auth state to propagate
        await new Promise((r) => setTimeout(r, 500));
        // Re-read from auth - we'll use the auth module directly
        const { auth } = await import('@/services/firebase');
        uid = auth.currentUser?.uid;
      }

      if (!uid) {
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      // 3. Create guest profile
      const { auth } = await import('@/services/firebase');
      const currentUser = auth.currentUser;
      if (currentUser) {
        await createUserProfile(currentUser, 'guest', {
          propertyId: property.id,
        });
      }

      toast.success(`Welcome, ${guestName.trim()}!`);
      navigate('/guest/home', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-900/40 border border-primary-800/50 mb-4">
            <ShieldAlert className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Guest Safety Channel</h1>
          <p className="text-sm text-slate-400">Enter your property&apos;s join code to receive real-time safety updates.</p>
        </div>

        <Card>
          <CardContent>
            {error && <AlertBanner type="danger" dismissible className="mb-4">{error}</AlertBanner>}
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Join Code</label>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  className="w-full text-center text-2xl font-mono font-bold tracking-[0.3em] px-4 py-4 rounded-xl bg-slate-800/60 border border-slate-700 text-primary-400 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  maxLength={6}
                  required
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1 text-center">Ask hotel staff for the 6-character code</p>
              </div>
              <Input label="Your Name" placeholder="John Doe" value={guestName} onChange={(e) => setGuestName(e.target.value)} required disabled={loading} />
              <Input label="Room Number" placeholder="e.g. 204" value={roomLabel} onChange={(e) => setRoomLabel(e.target.value)} hint="Optional — helps staff locate you faster" disabled={loading} />
              <Button type="submit" loading={loading} className="w-full" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Join Safety Channel
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Hotel staff?{' '}
          <button onClick={() => navigate('/login')} className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
