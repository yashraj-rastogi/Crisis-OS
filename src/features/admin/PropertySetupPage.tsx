import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { createProperty, getPropertiesByOrg } from '@/services/property.service';
import { updateUserProfile } from '@/services/auth.service';
import { Hotel, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const propertyTypes = [
  { value: 'hotel',    label: 'Hotel' },
  { value: 'hostel',   label: 'Hostel' },
  { value: 'resort',   label: 'Resort' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'other',    label: 'Other' },
];

export default function PropertySetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState('hotel');
  const [address, setAddress] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user?.orgId) { setChecking(false); return; }
    getPropertiesByOrg(user.orgId).then((props) => {
      if (props.length > 0) {
        navigate('/admin/setup/layout', { replace: true });
      }
      setChecking(false);
    });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Property name is required.'); return; }
    if (!user?.orgId) { setError('Organization not found. Go back and set it up.'); return; }

    setLoading(true);
    try {
      const { propertyId, joinCode: code } = await createProperty({
        orgId: user.orgId,
        name: name.trim(),
        type: type as 'hotel',
        address: address.trim(),
        defaultLanguage: language,
      });
      await updateUserProfile(user.uid, { propertyId });
      setJoinCode(code);
      toast.success('Property created!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create property.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    toast.success('Join code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (checking) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step <= 2 ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              {step < 2 ? '✓' : step}
            </div>
            {step < 4 && <div className={`w-8 h-px ${step < 2 ? 'bg-primary-600' : 'bg-slate-800'}`} />}
          </div>
        ))}
        <span className="text-xs text-slate-500 ml-2">Step 2 of 4</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-900/30 border border-primary-800/50 flex items-center justify-center">
              <Hotel className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <CardTitle>Property Setup</CardTitle>
              <CardDescription>Configure your hotel or venue.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {joinCode ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-900/30 border border-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Property Created!</h3>
              <p className="text-sm text-slate-400">Share this join code with guests:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-bold tracking-[0.3em] text-primary-400 bg-slate-800/50 px-6 py-3 rounded-xl border border-slate-700">
                  {joinCode}
                </span>
                <button onClick={copyCode} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <Button onClick={() => navigate('/admin/setup/layout')} className="w-full mt-4" size="lg">Continue to Layout Setup</Button>
            </div>
          ) : (
            <>
              {error && <AlertBanner type="danger" dismissible className="mb-4">{error}</AlertBanner>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Property Name" placeholder="Grand Hotel Downtown" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
                <Select label="Property Type" options={propertyTypes} value={type} onChange={(e) => setType(e.target.value)} required disabled={loading} />
                <Input label="Address" placeholder="123 Main Street, City" value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} />
                <Select label="Default Language" options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' }]} value={language} onChange={(e) => setLanguage(e.target.value)} disabled={loading} />
                <div className="pt-2">
                  <Button type="submit" loading={loading} className="w-full" size="lg">Create Property</Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
