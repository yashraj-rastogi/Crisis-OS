// ============================================================
// Crisis OS — Guest Response Service (BE-06)
// Handles guest check-in status submissions and provides
// realtime aggregate subscriptions for the Live Response Board.
// ============================================================

import {
  collection,
  doc,
  setDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';
import type { GuestResponse, GuestStatus } from '@/lib/types';
import { addTimelineEvent } from '@/services/timeline.service';

// ── Submit / Update Guest Response ────────────────────────────

export interface SubmitResponseParams {
  incidentId: string;
  propertyId: string;
  guestUid: string;
  guestName: string;
  roomLabel: string;
  floorLabel: string;
  zone?: string;
  status: GuestStatus;
  note?: string;
}

const OFFLINE_QUEUE_KEY = 'crisis_os_offline_responses';

/**
 * Upserts a guest response doc (one per guest per incident).
 * Uses guestUid + incidentId as a deterministic doc ID.
 * Supports offline queuing if navigator.onLine is false.
 */
export async function submitGuestResponse(
  params: SubmitResponseParams,
): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    // Keep only the latest status per guest/incident
    const existingIdx = queue.findIndex((q: any) => q.incidentId === params.incidentId && q.guestUid === params.guestUid);
    if (existingIdx >= 0) {
      queue[existingIdx] = params;
    } else {
      queue.push(params);
    }
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return Promise.resolve();
  }

  const { incidentId, guestUid, ...rest } = params;

  // Deterministic ID = no duplicates per guest per incident
  const docId = `${incidentId}_${guestUid}`;
  const responseRef = doc(db, COLLECTIONS.GUEST_RESPONSES, docId);

  await setDoc(
    responseRef,
    {
      id:          docId,
      incidentId,
      guestUid,
      respondedAt: serverTimestamp(),
      updatedAt:   serverTimestamp(),
      ...rest,
    },
    { merge: true },
  );

  // Timeline event
  await addTimelineEvent({
    incidentId,
    type: 'guest_response',
    actorUid: guestUid,
    actorRole: 'guest',
    message: `Guest ${rest.guestName} (${rest.roomLabel}) reported: ${rest.status}`,
    metadata: { status: rest.status, roomLabel: rest.roomLabel },
  });
}

export async function flushOfflineQueue() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  if (queue.length === 0) return;

  localStorage.removeItem(OFFLINE_QUEUE_KEY);

  for (const item of queue) {
    try {
      await submitGuestResponse(item);
    } catch (e) {
      console.error('Failed to sync offline response:', e);
      // Simple retry: put back in queue if it fails
      const currentQueue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      currentQueue.push(item);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(currentQueue));
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', flushOfflineQueue);
}

// ── Realtime Aggregate Subscription ──────────────────────────

export interface ResponseAggregates {
  safe: number;
  needHelp: number;
  unableToMove: number;
  pending: number;
  total: number;
  responses: GuestResponse[];
}

/**
 * Subscribes to all guest responses for an incident.
 * Computes live aggregate counts and returns the full list.
 * Returns an unsubscribe function.
 */
export function subscribeToResponseAggregates(
  incidentId: string,
  callback: (agg: ResponseAggregates) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.GUEST_RESPONSES),
    where('incidentId', '==', incidentId),
  );

  return onSnapshot(q, (snap) => {
    const responses: GuestResponse[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id:           d.id,
        incidentId:   data.incidentId,
        propertyId:   data.propertyId,
        guestUid:     data.guestUid,
        guestName:    data.guestName,
        roomLabel:    data.roomLabel,
        floorLabel:   data.floorLabel,
        zone:         data.zone,
        status:       data.status as GuestStatus,
        note:         data.note,
        respondedAt:  data.respondedAt?.toDate?.() ?? new Date(),
        updatedAt:    data.updatedAt?.toDate?.() ?? new Date(),
      } satisfies GuestResponse;
    });

    const agg: ResponseAggregates = {
      safe:         responses.filter((r) => r.status === 'safe').length,
      needHelp:     responses.filter((r) => r.status === 'need_help').length,
      unableToMove: responses.filter((r) => r.status === 'unable_to_move').length,
      pending:      responses.filter((r) => r.status === 'pending').length,
      total:        responses.length,
      responses,
    };

    callback(agg);
  });
}
