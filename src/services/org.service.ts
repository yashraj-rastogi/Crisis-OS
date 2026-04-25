import {
  collection, doc, setDoc, getDoc, updateDoc, serverTimestamp, query, where, getDocs,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';

export interface OrgData {
  name: string;
  contactEmail: string;
  emergencyPhone: string;
}

export async function createOrg(data: OrgData, createdBy: string): Promise<string> {
  const ref = doc(collection(db, COLLECTIONS.ORGANIZATIONS));
  await setDoc(ref, {
    ...data,
    createdBy,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getOrg(orgId: string) {
  const snap = await getDoc(doc(db, COLLECTIONS.ORGANIZATIONS, orgId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateOrg(orgId: string, data: Partial<OrgData>) {
  await updateDoc(doc(db, COLLECTIONS.ORGANIZATIONS, orgId), { ...data, updatedAt: serverTimestamp() });
}

export async function getOrgByCreator(uid: string) {
  const q = query(collection(db, COLLECTIONS.ORGANIZATIONS), where('createdBy', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}
