import { collection, doc, setDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';
import type { TimelineEvent, TimelineEventType, Role } from '@/lib/types';

export interface CreateTimelineEventParams {
  incidentId: string;
  type: TimelineEventType;
  actorUid: string;
  actorRole: Role;
  message: string;
  metadata?: Record<string, unknown>;
}

export async function addTimelineEvent(params: CreateTimelineEventParams): Promise<void> {
  const ref = doc(collection(db, COLLECTIONS.TIMELINE));
  await setDoc(ref, {
    ...params,
    id: ref.id,
    timestamp: serverTimestamp(),
  });
}

export async function getIncidentTimeline(incidentId: string): Promise<TimelineEvent[]> {
  const q = query(
    collection(db, COLLECTIONS.TIMELINE),
    where('incidentId', '==', incidentId),
    orderBy('timestamp', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      timestamp: data.timestamp?.toDate?.() ?? new Date(),
    } as TimelineEvent;
  });
}
