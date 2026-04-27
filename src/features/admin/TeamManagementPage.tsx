// ============================================================
// Crisis OS — Team Management Page (Admin)
// Allows the org_admin to view staff, managers, and responders
// for the active property and assign roles to new users.
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS, ROLE_LABELS } from '@/lib/constants';
import { setUserRole } from '@/services/auth.service';
import type { Role, UserProfile } from '@/lib/types';
import { Users, UserPlus, Trash2, ShieldCheck, Briefcase, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ASSIGNABLE_ROLES: { value: string; label: string }[] = [
  { value: 'manager',   label: 'Manager' },
  { value: 'staff',     label: 'Staff' },
  { value: 'responder', label: 'Responder' },
];

const ROLE_ICONS: Partial<Record<Role, React.ReactNode>> = {
  manager:   <Briefcase className="w-3.5 h-3.5" />,
  staff:     <User className="w-3.5 h-3.5" />,
  responder: <ShieldCheck className="w-3.5 h-3.5" />,
};

export default function TeamManagementPage() {
  const { user } = useAuth();

  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // Invite by UID or email lookup
  const [targetUid, setTargetUid] = useState('');
  const [targetRole, setTargetRole] = useState<Role>('staff');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');

  const propertyId = user?.propertyId;
  const orgId = user?.orgId;

  useEffect(() => {
    if (!propertyId) { setLoadingTeam(false); return; }
    loadTeam();
  }, [propertyId]);

  const loadTeam = async () => {
    if (!propertyId) return;
    setLoadingTeam(true);
    try {
      const q = query(
        collection(db, COLLECTIONS.USERS),
        where('propertyId', '==', propertyId),
      );
      const snap = await getDocs(q);
      const members = snap.docs
        .map((d) => ({ ...d.data() } as UserProfile))
        .filter((m) => m.role !== 'org_admin' && m.role !== 'guest');
      setTeamMembers(members);
    } catch {
      toast.error('Failed to load team members.');
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleAssign = async () => {
    setError('');
    if (!targetUid.trim()) { setError('Please enter the User UID.'); return; }
    if (!orgId || !propertyId) { setError('No active property found. Set up a property first.'); return; }

    // Verify the user exists in Firestore
    setAssigning(true);
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.USERS, targetUid.trim()));
      if (!snap.exists()) {
        setError('No user found with that UID. Make sure they have signed in at least once.');
        setAssigning(false);
        return;
      }
      await setUserRole({
        targetUid: targetUid.trim(),
        role: targetRole,
        orgId,
        propertyId,
      });
      toast.success(`Role assigned: ${ROLE_LABELS[targetRole]}`);
      setTargetUid('');
      await loadTeam();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to assign role.');
    } finally {
      setAssigning(false);
    }
  };

  if (!propertyId) {
    return (
      <div className="max-w-2xl mx-auto">
        <AlertBanner type="warning">
          You need to set up a property before managing the team. Go to the <strong>Property</strong> tab first.
        </AlertBanner>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Assign roles to staff, managers, and responders for your property.
        </p>
      </div>

      {/* Assign role */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-900/30 border border-primary-800/50 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <CardTitle>Add Team Member</CardTitle>
              <CardDescription>
                Enter the Firebase UID of a user who has already signed up. You can find their UID in Firebase Console → Authentication.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <AlertBanner type="danger" dismissible>{error}</AlertBanner>}
          <Input
            label="User UID"
            placeholder="e.g. abc123XYZ..."
            value={targetUid}
            onChange={(e) => setTargetUid(e.target.value)}
            disabled={assigning}
          />
          <Select
            label="Role"
            options={ASSIGNABLE_ROLES}
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value as Role)}
            disabled={assigning}
          />
          <Button
            onClick={handleAssign}
            loading={assigning}
            disabled={!targetUid.trim()}
            icon={<UserPlus className="w-4 h-4" />}
            className="w-full"
          >
            Assign Role
          </Button>

          <div className="mt-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">How to find a User UID</p>
            <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
              <li>Ask the team member to sign up / sign in to Crisis OS</li>
              <li>Go to Firebase Console → Authentication → Users</li>
              <li>Find their email and copy the <strong className="text-slate-400">User UID</strong> column</li>
              <li>Paste it above and assign their role</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Current team */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <CardTitle>Current Team</CardTitle>
              <CardDescription>Staff, managers, and responders linked to this property.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTeam ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No team members yet.</p>
              <p className="text-xs text-slate-600 mt-1">Use the form above to add staff, managers, or responders.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.uid}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-800"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{member.displayName || member.email}</p>
                    {member.displayName && <p className="text-xs text-slate-500">{member.email}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="flex items-center gap-1">
                      {ROLE_ICONS[member.role]}
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
