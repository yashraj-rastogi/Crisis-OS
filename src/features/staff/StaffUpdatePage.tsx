import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { ChevronLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffUpdatePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [note, setNote]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) { setError('Please enter an update.'); return; }
    if (!id || !user) return;
    setError('');
    setLoading(true);
    try {
      await addDoc(collection(db, COLLECTIONS.TIMELINE), {
        incidentId: id,
        type:       'staff_update',
        actorUid:   user.uid,
        actorRole:  user.role,
        message:    note.trim(),
        timestamp:  serverTimestamp(),
      });
      toast.success('Update submitted.');
      navigate(`/staff/incidents/${id}/checklist`);
    } catch {
      setError('Failed to submit update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container py-6 max-w-lg mx-auto space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white">Status Update</h1>
        <p className="text-sm text-slate-400 mt-1">
          Your update will be logged to the incident timeline
        </p>
      </div>

      {error && <AlertBanner type="danger" dismissible>{error}</AlertBanner>}

      <form onSubmit={handleSubmit} className="glass-card p-5 space-y-4">
        <Textarea
          label="What's the current situation?"
          placeholder="e.g. Floor 2 evacuated, all guests accounted for. Fire crew on site."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={6}
          required
          disabled={loading}
        />
        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
          icon={<Send className="w-4 h-4" />}
        >
          Submit Update
        </Button>
      </form>
    </div>
  );
}
