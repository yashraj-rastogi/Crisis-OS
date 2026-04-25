import {
  collection, doc, setDoc, getDoc, updateDoc, getDocs,
  query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';
import type { IncidentType, IncidentState, AIStructuredOutput, Role, HandoffSummary, GuestResponse, TimelineEvent } from '@/lib/types';
import { addTimelineEvent } from '@/services/timeline.service';
import { createBroadcast } from '@/services/broadcast.service';

// ---- Types -------------------------------------------------

export interface IncidentLocation {
  floorId?: string;
  floorLabel?: string;
  zone?: string;
  freeText: string;
}

export interface CreateIncidentData {
  propertyId: string;
  orgId: string;
  type: IncidentType;
  location: IncidentLocation;
  details: string;
  createdBy: string;
  createdByRole: Role;
}

export interface IncidentDoc {
  id: string;
  propertyId: string;
  orgId: string;
  type: IncidentType;
  location: IncidentLocation;
  details: string;
  state: IncidentState;
  aiOutput?: AIStructuredOutput;
  createdBy: string;
  createdByRole: Role;
  createdAt: Date;
  resolvedAt?: Date;
}

// ---- Service -----------------------------------------------

export async function createIncident(data: CreateIncidentData): Promise<string> {
  const ref = doc(collection(db, COLLECTIONS.INCIDENTS));
  await setDoc(ref, {
    ...data,
    state: 'draft' as IncidentState,
    createdAt: serverTimestamp(),
  });

  // Emit timeline event
  await addTimelineEvent({
    incidentId: ref.id,
    type: 'incident_created',
    actorUid: data.createdBy,
    actorRole: data.createdByRole,
    message: `Incident reported: ${data.type} at ${data.location.freeText}`,
  });

  return ref.id;
}

export async function getIncident(id: string): Promise<IncidentDoc | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.INCIDENTS, id));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    propertyId: d.propertyId,
    orgId: d.orgId,
    type: d.type,
    location: d.location,
    details: d.details,
    state: d.state,
    aiOutput: d.aiOutput,
    createdBy: d.createdBy,
    createdByRole: d.createdByRole,
    createdAt: (d.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    resolvedAt: d.resolvedAt ? (d.resolvedAt as Timestamp).toDate() : undefined,
  };
}

export async function listIncidentsByProperty(propertyId: string): Promise<IncidentDoc[]> {
  const q = query(
    collection(db, COLLECTIONS.INCIDENTS),
    where('propertyId', '==', propertyId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((s) => {
    const d = s.data();
    return {
      id: s.id,
      propertyId: d.propertyId,
      orgId: d.orgId,
      type: d.type,
      location: d.location,
      details: d.details,
      state: d.state,
      aiOutput: d.aiOutput,
      createdBy: d.createdBy,
      createdByRole: d.createdByRole,
      createdAt: (d.createdAt as Timestamp)?.toDate?.() ?? new Date(),
      resolvedAt: d.resolvedAt ? (d.resolvedAt as Timestamp).toDate() : undefined,
    };
  });
}

export async function listActiveIncidentsByProperty(propertyId: string) {
  const q = query(
    collection(db, COLLECTIONS.INCIDENTS),
    where('propertyId', '==', propertyId),
    where('state', '==', 'active'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((s) => ({ id: s.id, ...s.data() }));
}

/**
 * State transitions: draft→active, active→resolved
 * Enforces one-way transitions. Only managers should call this.
 */
export async function updateIncidentState(
  incidentId: string,
  newState: IncidentState,
  userId: string,
  userRole: Role,
) {
  const inc = await getIncident(incidentId);
  if (!inc) throw new Error('Incident not found.');

  // Enforce transitions
  const valid: Record<IncidentState, IncidentState[]> = {
    draft:    ['active'],
    active:   ['resolved'],
    resolved: [],
  };
  if (!valid[inc.state].includes(newState)) {
    throw new Error(`Cannot transition from ${inc.state} to ${newState}.`);
  }

  const update: Record<string, unknown> = { state: newState };
  if (newState === 'resolved') update.resolvedAt = serverTimestamp();

  await updateDoc(doc(db, COLLECTIONS.INCIDENTS, incidentId), update);

  // Timeline event
  await addTimelineEvent({
    incidentId,
    type: newState === 'resolved' ? 'incident_resolved' : 'manager_approved',
    actorUid: userId,
    actorRole: userRole,
    message: `Incident moved to ${newState}`,
  });
}

export async function resolveIncident(
  incidentId: string,
  propertyId: string,
  userId: string,
  userRole: Role,
) {
  await updateIncidentState(incidentId, 'resolved', userId, userRole);
  
  // Send "All Clear" broadcast
  await createBroadcast({
    incidentId,
    propertyId,
    scope: 'all',
    messageEn: 'The incident has been resolved. The area is now safe. Thank you for your cooperation.',
    messageHi: 'घटना का समाधान हो गया है। क्षेत्र अब सुरक्षित है। आपके सहयोग के लिए धन्यवाद।',
    sentBy: userId,
    sentByRole: userRole,
  });
}

export async function updateIncidentAIOutput(
  incidentId: string,
  aiOutput: AIStructuredOutput,
) {
  await updateDoc(doc(db, COLLECTIONS.INCIDENTS, incidentId), { aiOutput });
}

export async function generateHandoffSummary(
  incidentId: string,
  managerUid: string
): Promise<string> {
  const inc = await getIncident(incidentId);
  if (!inc) throw new Error('Incident not found.');

  const qResponses = query(
    collection(db, COLLECTIONS.GUEST_RESPONSES),
    where('incidentId', '==', incidentId)
  );
  const snapResponses = await getDocs(qResponses);
  const responses = snapResponses.docs.map(d => d.data() as GuestResponse);

  const safeCount = responses.filter(r => r.status === 'safe').length;
  const helpCount = responses.filter(r => r.status === 'need_help').length;
  const unableCount = responses.filter(r => r.status === 'unable_to_move').length;
  const pendingCount = responses.filter(r => r.status === 'pending').length;
  
  const unresolvedCritical = responses.filter(r => r.status === 'need_help' || r.status === 'unable_to_move');
  
  const affectedZonesSet = new Set<string>();
  responses.forEach(r => { if (r.zone) affectedZonesSet.add(r.zone); });
  const affectedZones = Array.from(affectedZonesSet);

  const qTimeline = query(
    collection(db, COLLECTIONS.TIMELINE),
    where('incidentId', '==', incidentId),
    orderBy('timestamp', 'asc')
  );
  const snapTimeline = await getDocs(qTimeline);
  const timeline = snapTimeline.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      timestamp: data.timestamp?.toDate?.() ?? new Date()
    };
  }) as TimelineEvent[];

  const responderLink = `${window.location.origin}/responder/incidents/${incidentId}/view`;

  const summary: HandoffSummary = {
    id: incidentId,
    incidentId,
    propertyId: inc.propertyId,
    summary: inc.aiOutput?.summary || inc.details,
    severity: inc.aiOutput?.severity || 'medium',
    affectedZones,
    unresolvedCritical,
    timeline,
    totalGuests: responses.length,
    safeCount,
    helpCount,
    unableCount,
    pendingCount,
    generatedAt: new Date(),
    generatedBy: managerUid,
    responderLink,
  };

  await setDoc(doc(db, COLLECTIONS.HANDOFFS, incidentId), {
    ...summary,
    generatedAt: serverTimestamp(),
  });

  await addTimelineEvent({
    incidentId,
    type: 'handoff_generated',
    actorUid: managerUid,
    actorRole: 'manager',
    message: 'Responder handoff summary generated',
  });

  return responderLink;
}

export async function getHandoffSummary(incidentId: string): Promise<HandoffSummary | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.HANDOFFS, incidentId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    generatedAt: data.generatedAt?.toDate?.() ?? new Date(),
    timeline: data.timeline?.map((t: any) => ({ ...t, timestamp: t.timestamp?.toDate?.() ?? new Date() })) || [],
    unresolvedCritical: data.unresolvedCritical?.map((r: any) => ({
      ...r,
      respondedAt: r.respondedAt?.toDate?.() ?? new Date(),
      updatedAt: r.updatedAt?.toDate?.() ?? new Date()
    })) || []
  } as HandoffSummary;
}
