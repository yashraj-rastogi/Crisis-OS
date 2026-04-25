import {
  collection, doc, setDoc, getDocs, deleteDoc, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';

export interface FloorData {
  propertyId: string;
  label: string;
  order: number;
}

export interface RoomData {
  floorId: string;
  propertyId: string;
  label: string;
  zone: string;
  type?: string;
}

// ---- Floors ------------------------------------------------

export async function addFloor(data: FloorData): Promise<string> {
  const ref = doc(collection(db, COLLECTIONS.FLOORS));
  await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getFloorsByProperty(propertyId: string) {
  const q = query(
    collection(db, COLLECTIONS.FLOORS),
    where('propertyId', '==', propertyId),
    orderBy('order', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteFloor(floorId: string) {
  // Also delete rooms on this floor
  const rooms = await getRoomsByFloor(floorId);
  for (const room of rooms) {
    await deleteDoc(doc(db, COLLECTIONS.ROOMS, room.id));
  }
  await deleteDoc(doc(db, COLLECTIONS.FLOORS, floorId));
}

// ---- Rooms -------------------------------------------------

export async function addRoom(data: RoomData): Promise<string> {
  const ref = doc(collection(db, COLLECTIONS.ROOMS));
  await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getRoomsByFloor(floorId: string) {
  const q = query(collection(db, COLLECTIONS.ROOMS), where('floorId', '==', floorId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getRoomsByProperty(propertyId: string) {
  const q = query(collection(db, COLLECTIONS.ROOMS), where('propertyId', '==', propertyId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteRoom(roomId: string) {
  await deleteDoc(doc(db, COLLECTIONS.ROOMS, roomId));
}
