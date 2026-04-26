import {
  collection, doc, setDoc, getDocs, deleteDoc,
  query, where, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';
import type { HazardPin, HazardPinType } from '@/lib/types';

// ---- Types -------------------------------------------------

export interface CreateHazardPinData {
  incidentId: string;
  floorId: string;
  label: string;
  type: HazardPinType;
  x: number;   // percentage (0-100)
  y: number;   // percentage (0-100)
  createdBy: string;
}

// ---- Service -----------------------------------------------

export async function addHazardPin(data: CreateHazardPinData): Promise<string> {
  const ref = doc(collection(db, COLLECTIONS.HAZARD_PINS));
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getHazardPinsByIncident(incidentId: string): Promise<HazardPin[]> {
  const q = query(
    collection(db, COLLECTIONS.HAZARD_PINS),
    where('incidentId', '==', incidentId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  })) as HazardPin[];
}

export function subscribeToHazardPins(
  incidentId: string,
  callback: (pins: HazardPin[]) => void,
): () => void {
  const q = query(
    collection(db, COLLECTIONS.HAZARD_PINS),
    where('incidentId', '==', incidentId),
  );
  return onSnapshot(q, (snap) => {
    const pins = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as HazardPin[];
    callback(pins);
  });
}

export async function deleteHazardPin(pinId: string) {
  await deleteDoc(doc(db, COLLECTIONS.HAZARD_PINS, pinId));
}

export async function deleteHazardPinsByIncident(incidentId: string) {
  const pins = await getHazardPinsByIncident(incidentId);
  for (const pin of pins) {
    await deleteDoc(doc(db, COLLECTIONS.HAZARD_PINS, pin.id));
  }
}
