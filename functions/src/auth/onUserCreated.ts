// ============================================================
// BE-01: On User Created — Set default role in Firestore
// ============================================================

import { user } from 'firebase-functions/v1/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const onUserCreated = user().onCreate(async (userRecord) => {
  const db = getFirestore();

  await db.collection('users').doc(userRecord.uid).set({
    uid:         userRecord.uid,
    email:       userRecord.email ?? '',
    displayName: userRecord.displayName ?? '',
    role:        'guest',
    orgId:       null,
    propertyId:  null,
    joinedAt:    FieldValue.serverTimestamp(),
  });

  console.log(`[onUserCreated] Profile created for ${userRecord.uid}`);
});
