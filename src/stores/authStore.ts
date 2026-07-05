import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  firebaseUser: {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    photoURL: string | null;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;

  setAuth: (
    user: AuthState['firebaseUser'],
    profile: UserProfile | null,
  ) => void;
  setLoading: (loading: boolean) => void;
  setReady: (ready: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      isLoading: true,
      isReady: false,

      setAuth: (firebaseUser, profile) =>
        set({
          firebaseUser,
          user: profile,
          isAuthenticated: Boolean(firebaseUser),
          isLoading: false,
          isReady: true,
        }),

      setLoading: (loading) => set({ isLoading: loading }),
      setReady: (ready) => set({ isReady: ready, isLoading: false }),
      clear: () =>
        set({
          user: null,
          firebaseUser: null,
          isAuthenticated: false,
          isLoading: false,
          isReady: true,
        }),
    }),
    {
      name: 'strelix-auth',
      // Only persist user display data (for instant navbar render on reload).
      // NEVER persist isAuthenticated / isLoading / isReady — those must be
      // re-derived from Firebase on every page load. Persisting them causes
      // stale "authenticated: true" state when Firebase isn't configured or
      // the user's session has expired.
      partialize: (state) => ({
        user: state.user,
        firebaseUser: state.firebaseUser,
      }),
    },
  ),
);
