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
      // Don't persist isLoading / isReady
      partialize: (state) => ({
        user: state.user,
        firebaseUser: state.firebaseUser,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
