import {
  collection, doc, setDoc, getDoc, updateDoc, serverTimestamp, query, where, getDocs,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';
import { generateJoinCode } from '@/lib/utils';

export interface PropertyData {
  orgId: string;
  name: string;
  type: 'hotel' | 'hostel' | 'resort' | 'hospital' | 'other';
  address: string;
  defaultLanguage: string;
}

export async function createProperty(data: PropertyData): Promise<{ propertyId: string; joinCode: string }> {
  const ref = doc(collection(db, COLLECTIONS.PROPERTIES));
  const joinCode = generateJoinCode();
  await setDoc(ref, {
    ...data,
    joinCode,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return { propertyId: ref.id, joinCode };
}

export async function getProperty(propertyId: string) {
  const snap = await getDoc(doc(db, COLLECTIONS.PROPERTIES, propertyId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateProperty(propertyId: string, data: Partial<PropertyData>) {
  await updateDoc(doc(db, COLLECTIONS.PROPERTIES, propertyId), { ...data, updatedAt: serverTimestamp() });
}

export async function getPropertyByJoinCode(code: string) {
  const q = query(
    collection(db, COLLECTIONS.PROPERTIES),
    where('joinCode', '==', code.toUpperCase()),
    where('isActive', '==', true),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getPropertiesByOrg(orgId: string) {
  const q = query(collection(db, COLLECTIONS.PROPERTIES), where('orgId', '==', orgId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
