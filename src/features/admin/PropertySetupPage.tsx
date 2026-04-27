import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { createProperty, getPropertiesByOrg } from '@/services/property.service';
import { updateUserProfile } from '@/services/auth.service';
import { Hotel, Copy, Check, Plus, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const propertyTypes = [
  { value: 'hotel',    label: 'Hotel' },
  { value: 'hostel',   label: 'Hostel' },
  { value: 'resort',   label: 'Resort' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'other',    label: 'Other' },
];

interface ExistingProperty {
  id: string;
  name: string;
  type: string;
  joinCode?: string;
  address?: string;
}

export default function PropertySetupPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // existing properties list
  const [existingProps, setExistingProps] = useState<ExistingProperty[]>([]);
  const [checking, setChecking] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);

  // form state
  const [name, setName] = useState('');
  const [type, setType] = useState('hotel');
  const [address, setAddress] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.orgId) { setChecking(false); return; }
    getPropertiesByOrg(user.orgId).then((props) => {
      setExistingProps(props as ExistingProperty[]);
      setChecking(false);
    });
  }, [user?.orgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Property name is required.'); return; }
    if (!user?.orgId) { setError('Organization not found. Go back and set it up.'); return; }

    setLoading(true);
    try {
      const { propertyId } = await createProperty({
        orgId: user.orgId,
        name: name.trim(),
        type: type as 'hotel',
        address: address.trim(),
        defaultLanguage: language,
      });
      // Update user profile with new propertyId
      await updateUserProfile(user.uid, { propertyId });
      // CRITICAL: refresh in-memory user so downstream pages (LayoutSetup) see propertyId
      await refreshUser();
      toast.success('Property created! You can now set up the layout.');
      navigate('/admin/setup/layout');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create property.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = async (prop: ExistingProperty) => {
    if (!user) return;
    // Switch active property
    await updateUserProfile(user.uid, { propertyId: prop.id });
    await refreshUser();
    toast.success(`Switched to ${prop.name}`);
    navigate('/admin/setup/layout');
  };

  const copyCode = (code: string, propId: string) => {
    navigator.clipboard.writeText(code);
    setCopied(propId);
    toast.success('Join code copied!');
    setTimeout(() => setCopied(null), 2000);
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
          {/* Existing Properties */}
          {existingProps.length > 0 && !showNewForm && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-200">Your Properties</p>
                <Button size="sm" variant="outline" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowNewForm(true)}>
                  Add Property
                </Button>
              </div>
              <div className="space-y-2">
                {existingProps.map((prop) => (
                  <div
                    key={prop.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer hover:bg-slate-800/50 ${
                      user?.propertyId === prop.id
                        ? 'border-primary-700 bg-primary-900/20'
                        : 'border-slate-800 bg-slate-800/20'
                    }`}
                    onClick={() => handleSelectProperty(prop)}
                  >
                    <div className="flex items-center gap-3">
                      <Hotel className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{prop.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{prop.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {prop.joinCode && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded border border-primary-800">
                            {prop.joinCode}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyCode(prop.joinCode!, prop.id); }}
                            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            {copied === prop.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                      {user?.propertyId === prop.id && (
                        <Badge variant="active" dot>Active</Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
              {user?.propertyId && (
                <Button onClick={() => navigate('/admin/setup/layout')} className="w-full mt-2" size="lg">
                  Continue to Layout Setup
                </Button>
              )}
            </div>
          )}

          {/* New Property Form */}
          {(existingProps.length === 0 || showNewForm) && (
            <>
              {showNewForm && (
                <button
                  onClick={() => setShowNewForm(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 mb-4 flex items-center gap-1 transition-colors"
                >
                  ← Back to properties
                </button>
              )}
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
