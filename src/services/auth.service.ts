// ============================================================
// Crisis OS — Auth Service (Frontend)
// Handles sign-in, sign-out, and user profile operations.
// Reads role from Firestore /users/{uid} document.
// NOTE: Profile creation is done client-side (no Cloud Function needed).
// ============================================================

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/services/firebase';
import { COLLECTIONS } from '@/lib/constants';
import type { Role, UserProfile } from '@/lib/types';

// ---- Sign In -----------------------------------------------

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // Auto-create profile if it doesn't exist yet (e.g. manually created via console)
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(cred.user);
  return cred.user;
}

export async function loginAnonymously() {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

// ---- Sign Up -----------------------------------------------

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  // Create profile immediately — no Cloud Function needed
  await createUserProfile(cred.user, 'guest');
  return cred.user;
}

// ---- Sign Out ----------------------------------------------

export async function logout() {
  await signOut(auth);
}

// ---- User Profile ------------------------------------------

/**
 * Ensures a Firestore profile exists for the user.
 * Creates one with role='guest' if missing.
 * Does NOT overwrite existing data (merge: true + check first).
 */
export async function ensureUserProfile(user: User): Promise<void> {
  const ref = doc(db, COLLECTIONS.USERS, user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:         user.uid,
      email:       user.email ?? '',
      displayName: user.displayName ?? '',
      role:        'guest',
      orgId:       null,
      propertyId:  null,
      joinedAt:    serverTimestamp(),
    });
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid:         data.uid,
    email:       data.email ?? '',
    displayName: data.displayName ?? '',
    role:        data.role as Role,
    orgId:       data.orgId ?? undefined,
    propertyId:  data.propertyId ?? undefined,
    roomId:      data.roomId ?? undefined,
    joinedAt:    data.joinedAt?.toDate?.() ?? new Date(),
  } satisfies UserProfile;
}

/**
 * Create or overwrite a user profile in Firestore.
 * Used by guest join flow and admin user creation.
 */
export async function createUserProfile(
  user: User,
  role: Role,
  extra?: {
    orgId?: string;
    propertyId?: string;
    roomId?: string;
  },
) {
  const profile: Record<string, unknown> = {
    uid:         user.uid,
    email:       user.email ?? '',
    displayName: user.displayName ?? '',
    role,
    orgId:       extra?.orgId ?? null,
    propertyId:  extra?.propertyId ?? null,
    roomId:      extra?.roomId ?? null,
    joinedAt:    serverTimestamp(),
  };
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), profile, { merge: true });
}

/**
 * Update specific fields on a user profile.
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'role' | 'orgId' | 'propertyId' | 'roomId' | 'displayName'>>,
) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), data);
}

// ---- Role Assignment (client-side, no Cloud Function) ------

interface SetRolePayload {
  targetUid: string;
  role: Role;
  orgId: string;
  propertyId: string;
}

/**
 * Directly updates a user's role in Firestore.
 * The caller must be org_admin — enforced by Firestore security rules.
 * This replaces the Cloud Function approach for MVP.
 */
export async function setUserRole(payload: SetRolePayload): Promise<{ success: boolean }> {
  await updateDoc(doc(db, COLLECTIONS.USERS, payload.targetUid), {
    role:       payload.role,
    orgId:      payload.orgId,
    propertyId: payload.propertyId,
  });
  return { success: true };
}
