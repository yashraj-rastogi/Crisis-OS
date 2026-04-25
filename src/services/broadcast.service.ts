// ============================================================
// Crisis OS — Broadcast Service (BE-05)
// Creates broadcast messages scoped by audience and updates
// incident state to active.
// ============================================================

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';
import type { BroadcastMessage, BroadcastScope, Role } from '@/lib/types';
import { addTimelineEvent } from '@/services/timeline.service';

// ── Types ─────────────────────────────────────────────────────

export interface CreateBroadcastParams {
  incidentId: string;
  propertyId: string;
  scope: BroadcastScope;
  messageEn: string;
  messageHi?: string;
  targetFloorId?: string;
  targetZone?: string;
  sentBy: string; // manager uid
  sentByRole: Role;
}

// ── Create Broadcast ─────────────────────────────────────────

/**
 * Creates a broadcast document and transitions incident to 'active'.
 * Emits a timeline event.
 */
export async function createBroadcast(
  params: CreateBroadcastParams,
): Promise<string> {
  const {
    incidentId,
    propertyId,
    scope,
    messageEn,
    messageHi,
    targetFloorId,
    targetZone,
    sentBy,
    sentByRole,
  } = params;

  // 1. Write broadcast doc
  const broadcastRef = await addDoc(collection(db, COLLECTIONS.BROADCASTS), {
    incidentId,
    propertyId,
    scope,
    messageEn,
    messageHi:     messageHi ?? null,
    targetFloorId: targetFloorId ?? null,
    targetZone:    targetZone ?? null,
    sentBy,
    sentAt:        serverTimestamp(),
  });

  // 2. Transition incident → active + record broadcast metadata
  const incidentRef = doc(db, COLLECTIONS.INCIDENTS, incidentId);
  await updateDoc(incidentRef, {
    state:           'active',
    broadcastSentAt: serverTimestamp(),
    broadcastScope:  scope,
  });

  // 3. Timeline event
  await addTimelineEvent({
    incidentId,
    type: 'broadcast_sent',
    actorUid: sentBy,
    actorRole: sentByRole,
    message: `Broadcast sent to scope: ${scope}`,
    metadata: { broadcastId: broadcastRef.id, scope },
  });

  return broadcastRef.id;
}

// ── Read Broadcasts ───────────────────────────────────────────

export async function getBroadcastsForIncident(
  incidentId: string,
): Promise<BroadcastMessage[]> {
  const q = query(
    collection(db, COLLECTIONS.BROADCASTS),
    where('incidentId', '==', incidentId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id:            d.id,
      incidentId:    data.incidentId,
      propertyId:    data.propertyId,
      scope:         data.scope as BroadcastScope,
      targetFloorId: data.targetFloorId ?? undefined,
      targetZone:    data.targetZone ?? undefined,
      messageEn:     data.messageEn,
      messageHi:     data.messageHi ?? undefined,
      sentBy:        data.sentBy,
      sentAt:        data.sentAt?.toDate?.() ?? new Date(),
    } satisfies BroadcastMessage;
  });
}
