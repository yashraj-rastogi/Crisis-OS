import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ROLE_HOME_ROUTES } from '@/lib/constants';
import { ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const { user, loading: authLoading, signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect when auth state resolves with a logged-in user
  useEffect(() => {
    if (!authLoading && user) {
      const dest = from ?? ROLE_HOME_ROUTES[user.role];
      navigate(dest, { replace: true });
    }
  }, [user, authLoading, from, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      // Redirect handled by the useEffect above when user state updates
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Invalid email or password. Please try again.');
      } else if (msg.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      if (!msg.includes('popup-closed')) {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-900/40 border border-primary-800/50 mb-4">
            <ShieldAlert className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Crisis OS</h1>
          <p className="text-sm text-slate-400">
            Coordinated Response. Every Second Counts.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Sign in to continue</h2>

          {error && (
            <div className="mb-4">
              <AlertBanner type="danger" dismissible>{error}</AlertBanner>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@hotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-3 text-xs text-slate-500">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={loading}
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
              </svg>
            }
          >
            Continue with Google
          </Button>
        </div>

        {/* Guest link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Are you a guest?{' '}
          <button
            onClick={() => navigate('/guest/join')}
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Join your property&apos;s safety channel
          </button>
        </p>
      </div>
    </div>
  );
}
