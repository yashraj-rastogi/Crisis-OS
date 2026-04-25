import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '@/lib/constants';
import { generateJoinCode } from '@/lib/utils';
import type { Property, Floor, Room } from '@/lib/types';

/**
 * Seeds a dummy property with floors and rooms for demonstration purposes.
 * @param orgId The organization ID to attach the property to
 * @returns { propertyId, joinCode }
 */
export async function seedDemoProperty(orgId: string) {
  const batch = writeBatch(db);

  // 1. Create Property
  const propRef = doc(collection(db, COLLECTIONS.PROPERTIES));
  const joinCode = generateJoinCode();
  
  const property: Property = {
    id: propRef.id,
    orgId,
    name: 'Grand Hotel Demo',
    type: 'hotel',
    address: '123 Demo Street',
    defaultLanguage: 'en',
    joinCode,
    isActive: true,
    createdAt: new Date(),
  };
  batch.set(propRef, property);

  // 2. Create Floors
  const floorsData = [
    { label: 'Ground Floor', order: 0 },
    { label: 'Floor 1', order: 1 },
    { label: 'Floor 2', order: 2 },
  ];

  const floorDocs = floorsData.map((f) => {
    const ref = doc(collection(db, COLLECTIONS.FLOORS));
    const floor: Floor = {
      id: ref.id,
      propertyId: propRef.id,
      label: f.label,
      order: f.order,
    };
    batch.set(ref, floor);
    return floor;
  });

  // 3. Create Rooms
  const roomsData = [
    { floorIndex: 0, label: 'Lobby', zone: 'North Wing', type: 'common_area' },
    { floorIndex: 0, label: 'Restaurant', zone: 'South Wing', type: 'common_area' },
    { floorIndex: 1, label: '101', zone: 'North Wing', type: 'room' },
    { floorIndex: 1, label: '102', zone: 'North Wing', type: 'room' },
    { floorIndex: 1, label: '103', zone: 'South Wing', type: 'room' },
    { floorIndex: 2, label: '201', zone: 'North Wing', type: 'suite' },
    { floorIndex: 2, label: '202', zone: 'South Wing', type: 'suite' },
    { floorIndex: 2, label: 'Kitchen', zone: 'East Wing', type: 'common_area' },
  ];

  roomsData.forEach((r) => {
    const ref = doc(collection(db, COLLECTIONS.ROOMS));
    const room: Room = {
      id: ref.id,
      propertyId: propRef.id,
      floorId: floorDocs[r.floorIndex].id,
      label: r.label,
      zone: r.zone,
      type: r.type as 'room' | 'suite' | 'common_area' | 'bed',
    };
    batch.set(ref, room);
  });

  await batch.commit();
  console.log(`✅ Seeded Property: ${property.name} (Join Code: ${joinCode})`);

  return { propertyId: propRef.id, joinCode };
}

/**
 * Simulates dummy guest responses for an active incident to showcase the live dashboard.
 * @param incidentId 
 * @param propertyId 
 */
export async function simulateGuestResponses(incidentId: string, propertyId: string) {
  const batch = writeBatch(db);
  
  const dummyResponses = [
    { guestName: 'Alice Smith', roomLabel: '101', floorLabel: 'Floor 1', status: 'safe', note: '' },
    { guestName: 'Bob Johnson', roomLabel: '102', floorLabel: 'Floor 1', status: 'need_help', note: 'Smoke in hallway' },
    { guestName: 'Charlie Davis', roomLabel: '103', floorLabel: 'Floor 1', status: 'safe', note: '' },
    { guestName: 'Diana Prince', roomLabel: '201', floorLabel: 'Floor 2', status: 'unable_to_move', note: 'Twisted ankle' },
    { guestName: 'Evan Wright', roomLabel: '202', floorLabel: 'Floor 2', status: 'pending', note: '' },
  ];

  const aggregates = {
    total: 5,
    safe: 2,
    needHelp: 1,
    unableToMove: 1,
    pending: 1,
  };

  dummyResponses.forEach((r, i) => {
    const ref = doc(collection(db, COLLECTIONS.GUEST_RESPONSES));
    batch.set(ref, {
      id: ref.id,
      incidentId,
      propertyId,
      guestUid: `dummy_guest_${i}_${Date.now()}`,
      guestName: r.guestName,
      roomLabel: r.roomLabel,
      floorLabel: r.floorLabel,
      status: r.status,
      note: r.note,
      respondedAt: new Date(),
      updatedAt: new Date(),
    });
  });

  const aggRef = doc(db, COLLECTIONS.AGGREGATES, incidentId);
  batch.set(aggRef, {
    incidentId,
    total: aggregates.total,
    safe: aggregates.safe,
    needHelp: aggregates.needHelp,
    unableToMove: aggregates.unableToMove,
    pending: aggregates.pending,
    lastUpdated: new Date()
  });

  await batch.commit();
  console.log(`✅ Seeded ${dummyResponses.length} dummy guest responses for incident ${incidentId}`);
}
