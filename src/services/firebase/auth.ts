import {
  GoogleAuthProvider,
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db, firebaseReady } from './config';
import type { UserProfile } from '@/types';

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

/**
 * Ensure a user document exists in Firestore. Creates one if missing.
 */
async function ensureUserDocument(user: User): Promise<UserProfile> {
  if (!db) throw new Error('Firestore not initialized');
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const username =
      user.displayName ??
      user.email?.split('@')[0] ??
      `user_${user.uid.slice(0, 6)}`;

    const profile: Omit<UserProfile, 'uid'> = {
      username,
      email: user.email ?? '',
      photoURL: user.photoURL,
      createdAt: Date.now(),
    };

    await setDoc(ref, {
      ...profile,
      createdAt: serverTimestamp(),
    });

    return { uid: user.uid, ...profile };
  }

  const data = snap.data();
  return {
    uid: user.uid,
    username: data.username ?? user.displayName ?? 'User',
    email: data.email ?? user.email ?? '',
    photoURL: data.photoURL ?? user.photoURL ?? null,
    createdAt:
      typeof data.createdAt?.toMillis === 'function'
        ? data.createdAt.toMillis()
        : data.createdAt ?? Date.now(),
  };
}

export const authService = {
  /** Returns true if Firebase auth is ready to use. */
  isReady(): boolean {
    return firebaseReady && Boolean(auth);
  },

  /** Subscribe to auth state changes. */
  onAuthChange(callback: (user: User | null, profile: UserProfile | null) => void): () => void {
    if (!auth) {
      callback(null, null);
      return () => {};
    }
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        callback(null, null);
        return;
      }
      try {
        const profile = await ensureUserDocument(user);
        callback(user, profile);
      } catch (err) {
        console.error('[auth] ensureUserDocument failed:', err);
        callback(user, null);
      }
    });
  },

  /** Register a new user with email + password. */
  async registerWithEmail(email: string, password: string, username: string): Promise<User> {
    if (!auth) throw new Error('Firebase auth is not initialized.');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
    await ensureUserDocument(cred.user);
    return cred.user;
  },

  /** Login with email + password. */
  async loginWithEmail(email: string, password: string): Promise<User> {
    if (!auth) throw new Error('Firebase auth is not initialized.');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  },

  /** Sign in with Google popup. */
  async loginWithGoogle(): Promise<User> {
    if (!auth) throw new Error('Firebase auth is not initialized.');
    const cred = await signInWithPopup(auth, googleProvider);
    await ensureUserDocument(cred.user);
    return cred.user;
  },

  /** Sign in with GitHub popup. */
  async loginWithGithub(): Promise<User> {
    if (!auth) throw new Error('Firebase auth is not initialized.');
    const cred = await signInWithPopup(auth, githubProvider);
    await ensureUserDocument(cred.user);
    return cred.user;
  },

  /** Send a password reset email. */
  async resetPassword(email: string): Promise<void> {
    if (!auth) throw new Error('Firebase auth is not initialized.');
    await sendPasswordResetEmail(auth, email);
  },

  /** Send a verification email to the current user. */
  async sendVerification(): Promise<void> {
    if (!auth?.currentUser) throw new Error('No user signed in.');
    await sendEmailVerification(auth.currentUser);
  },

  /** Reload the current user (refreshes emailVerified flag). */
  async reloadUser(): Promise<User | null> {
    if (!auth?.currentUser) return null;
    await auth.currentUser.reload();
    return auth.currentUser;
  },

  /** Sign out the current user. */
  async logout(): Promise<void> {
    if (!auth) return;
    await signOut(auth);
  },

  /** Get the current user. */
  getCurrentUser(): User | null {
    return auth?.currentUser ?? null;
  },
};
