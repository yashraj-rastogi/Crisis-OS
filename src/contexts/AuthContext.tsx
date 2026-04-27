// ============================================================
// Crisis OS — Auth Context + Provider
// Handles Firebase auth state, custom role claims, and
// exposes the current user to all components.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/services/firebase';
import type { AuthUser, Role } from '@/lib/types';
import { COLLECTIONS } from '@/lib/constants';

// ---- Context Shape -----------------------------------------
interface AuthContextValue {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  /** Re-read the user profile from Firestore and update in-memory state. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---- Provider ----------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          setFirebaseUser(fbUser);

          // Anonymous users don't have a role profile
          if (fbUser.isAnonymous) {
            setUser(null);
            setLoading(false);
            return;
          }

          const profileRef = doc(db, COLLECTIONS.USERS, fbUser.uid);

          // Try to load profile — if Firestore is unavailable, fall back gracefully
          let data: Record<string, unknown> | null = null;
          try {
            let profileDoc = await getDoc(profileRef);

            if (!profileDoc.exists()) {
              // Auto-create profile for first-time users
              await setDoc(profileRef, {
                uid:         fbUser.uid,
                email:       fbUser.email ?? '',
                displayName: fbUser.displayName ?? '',
                role:        'org_admin', // Temporarily default to org_admin for testing
                orgId:       null,
                propertyId:  null,
                joinedAt:    serverTimestamp(),
              });
              profileDoc = await getDoc(profileRef);
            }

            data = profileDoc.data() as Record<string, unknown>;
          } catch (firestoreErr) {
            console.warn('[AuthContext] Firestore unavailable, using auth-only fallback:', firestoreErr);
          }

          setUser({
            uid:         fbUser.uid,
            email:       fbUser.email ?? '',
            displayName: fbUser.displayName ?? (data?.displayName as string) ?? 'User',
            role:        (data?.role as Role) ?? 'guest',
            orgId:       (data?.orgId as string) ?? undefined,
            propertyId:  (data?.propertyId as string) ?? undefined,
          });
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (err) {
        console.error('[AuthContext] onAuthStateChanged error:', err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged handles the rest
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInAsGuest = async () => {
    await signInAnonymously(auth);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  /**
   * Re-reads the current user's Firestore profile and refreshes the in-memory
   * user state. Call this after any service that updates the user's profile
   * (e.g. updateUserProfile, createUserProfile) so that downstream components
   * like LayoutSetupPage immediately see the new propertyId / orgId / role.
   */
  const refreshUser = async () => {
    const fbUser = auth.currentUser;
    if (!fbUser || fbUser.isAnonymous) return;
    try {
      const profileRef = doc(db, COLLECTIONS.USERS, fbUser.uid);
      const profileDoc = await getDoc(profileRef);
      if (!profileDoc.exists()) return;
      const data = profileDoc.data() as Record<string, unknown>;
      setUser({
        uid:         fbUser.uid,
        email:       fbUser.email ?? '',
        displayName: fbUser.displayName ?? (data.displayName as string) ?? 'User',
        role:        (data.role as Role) ?? 'guest',
        orgId:       (data.orgId as string) ?? undefined,
        propertyId:  (data.propertyId as string) ?? undefined,
      });
    } catch (err) {
      console.warn('[AuthContext] refreshUser error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithEmail,
        signInWithGoogle,
        signInAsGuest,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---- Hook --------------------------------------------------
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
