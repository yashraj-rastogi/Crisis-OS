// ============================================================
// BE-01: setUserRole — Callable Cloud Function (v2 API)
// Allows org_admin to assign roles to other users.
// ============================================================

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

const VALID_ROLES = ['org_admin', 'manager', 'staff', 'guest', 'responder'];

export const setUserRole = onCall({ region: 'asia-south1' }, async (request) => {
  const db = getFirestore();

  // 1. Verify caller is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  // 2. Get caller's profile to verify role
  const callerDoc = await db.collection('users').doc(request.auth.uid).get();
  if (!callerDoc.exists) {
    throw new HttpsError('not-found', 'Caller profile not found.');
  }
  const callerData = callerDoc.data()!;
  if (callerData.role !== 'org_admin') {
    throw new HttpsError('permission-denied', 'Only org_admin can assign roles.');
  }

  // 3. Validate payload
  const { targetUid, role, orgId, propertyId } = request.data as {
    targetUid: string;
    role: string;
    orgId: string;
    propertyId: string;
  };

  if (!targetUid || !role || !orgId || !propertyId) {
    throw new HttpsError('invalid-argument', 'targetUid, role, orgId, and propertyId are all required.');
  }
  if (!VALID_ROLES.includes(role)) {
    throw new HttpsError('invalid-argument', `Invalid role: ${role}.`);
  }

  // 4. Verify caller belongs to same org
  if (callerData.orgId !== orgId) {
    throw new HttpsError('permission-denied', 'You can only manage users within your own organization.');
  }

  // 5. Update target user profile
  await db.collection('users').doc(targetUid).set(
    { role, orgId, propertyId },
    { merge: true },
  );

  console.log(`[setUserRole] ${request.auth.uid} set role=${role} on ${targetUid}`);
  return { success: true };
});
