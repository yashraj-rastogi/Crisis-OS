import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getProperty } from '@/services/property.service';
import { getRoomsByProperty } from '@/services/layout.service';
import { Users, Copy, Check, Download, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

export default function GuestAccessPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [roomCount, setRoomCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // The URL that the QR code encodes — takes guest directly to the join page with code pre-filled
  const joinUrl = joinCode
    ? `${window.location.origin}/guest/join?code=${joinCode}`
    : '';

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

  // Generate QR code whenever joinUrl changes
  useEffect(() => {
    if (!joinUrl) return;
    QRCode.toDataURL(joinUrl, {
      width: 240,
      margin: 2,
      color: { dark: '#f1f5f9', light: '#0f172a' },
      errorCorrectionLevel: 'M',
    }).then((url) => setQrDataUrl(url));
  }, [joinUrl]);

  const copyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success('Join link copied!');
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${propertyName || 'property'}-guest-qr.png`;
    a.click();
    toast.success('QR code downloaded!');
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
              <CardDescription>Share this code or QR so guests can join your property&apos;s safety channel.</CardDescription>
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

            {/* QR Code */}
            {qrDataUrl ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Scan to Join</p>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 inline-block">
                  <img
                    src={qrDataUrl}
                    alt="Guest Join QR Code"
                    className="w-48 h-48 rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadQR}
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download QR
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyLink}
                    icon={<Copy className="w-3.5 h-3.5" />}
                  >
                    Copy Link
                  </Button>
                </div>
                <p className="text-xs text-slate-600 max-w-xs">
                  Guests scan this QR code to be taken directly to the join page with your code pre-filled.
                </p>
              </div>
            ) : (
              <div className="glass-card p-6 inline-flex flex-col items-center gap-2 animate-pulse">
                <div className="w-16 h-16 bg-slate-800 rounded" />
                <p className="text-xs text-slate-500">Generating QR code…</p>
              </div>
            )}

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

      {/* Hidden canvas for QR */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
