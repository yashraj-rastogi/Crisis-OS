import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getProperty } from '@/services/property.service';
import { getRoomsByProperty } from '@/services/layout.service';
import { Users, Copy, Check, QrCode, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuestAccessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [roomCount, setRoomCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.propertyId) return;
    getProperty(user.propertyId).then((p) => {
      if (p) {
        setJoinCode((p as unknown as { joinCode: string }).joinCode ?? '');
        setPropertyName((p as unknown as { name: string }).name ?? '');
      }
    });
    getRoomsByProperty(user.propertyId).then((r) => setRoomCount(r.length));
  }, [user]);

  const copyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-primary-600 text-white">
              {step < 4 ? '✓' : step}
            </div>
            {step < 4 && <div className="w-8 h-px bg-primary-600" />}
          </div>
        ))}
        <span className="text-xs text-slate-500 ml-2">Step 4 of 4</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-900/30 border border-primary-800/50 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <CardTitle>Guest Access</CardTitle>
              <CardDescription>Share this code so guests can join your property&apos;s safety channel.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-6">
            {/* Property summary */}
            <div className="flex items-center justify-center gap-3">
              <Badge variant="active" dot>{propertyName || 'Property'}</Badge>
              <Badge variant="default">{roomCount} rooms configured</Badge>
            </div>

            {/* Join code */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Property Join Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-mono font-bold tracking-[0.4em] text-primary-400 bg-slate-800/50 px-8 py-4 rounded-2xl border border-slate-700">
                  {joinCode || '------'}
                </span>
                {joinCode && (
                  <button onClick={copyCode} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>

            {/* QR placeholder */}
            <div className="glass-card p-6 inline-flex flex-col items-center gap-2">
              <QrCode className="w-16 h-16 text-slate-600" />
              <p className="text-xs text-slate-500">QR code generation available in next release</p>
            </div>

            {/* Done */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <PartyPopper className="w-5 h-5" />
                <span className="text-sm font-semibold">Setup Complete!</span>
              </div>
              <p className="text-sm text-slate-400">Your property is ready for crisis coordination.</p>
              <Button onClick={() => navigate('/admin/drill')} className="w-full" size="lg">
                Go to Drill Console
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
