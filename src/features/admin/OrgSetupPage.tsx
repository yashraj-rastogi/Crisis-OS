import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { createOrg, getOrgByCreator } from '@/services/org.service';
import { updateUserProfile } from '@/services/auth.service';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrgSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  // Check if org already exists for this admin
  useEffect(() => {
    if (!user) return;
    getOrgByCreator(user.uid).then((org) => {
      if (org) {
        // Org already exists — skip to property setup
        navigate('/admin/setup/property', { replace: true });
      }
      setChecking(false);
    });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Organization name is required.'); return; }
    if (!contactEmail.trim()) { setError('Contact email is required.'); return; }
    if (!user) return;

    setLoading(true);
    try {
      const orgId = await createOrg(
        { name: name.trim(), contactEmail: contactEmail.trim(), emergencyPhone: emergencyPhone.trim() },
        user.uid,
      );
      // Link admin to org
      await updateUserProfile(user.uid, { orgId });
      toast.success('Organization created!');
      navigate('/admin/setup/property');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create organization.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 1 ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              {step}
            </div>
            {step < 4 && <div className="w-8 h-px bg-slate-800" />}
          </div>
        ))}
        <span className="text-xs text-slate-500 ml-2">Step 1 of 4</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-900/30 border border-primary-800/50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <CardTitle>Organization Setup</CardTitle>
              <CardDescription>Set up your hotel or property group.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && <AlertBanner type="danger" dismissible className="mb-4">{error}</AlertBanner>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Organization Name" placeholder="Grand Hotel Group" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
            <Input label="Contact Email" type="email" placeholder="admin@grandhotel.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required disabled={loading} />
            <Input label="Emergency Phone" type="tel" placeholder="+91 9876543210" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} hint="Primary emergency contact number" disabled={loading} />
            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full" size="lg">Continue to Property Setup</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
