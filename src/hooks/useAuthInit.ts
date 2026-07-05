import { useEffect, useRef, useState } from 'react';

import { authService } from '@/services/firebase/auth';
import { useAuthStore } from '@/stores/authStore';

/**
 * Subscribes to Firebase auth state changes and updates the auth store.
 * Includes a 4-second safety timeout: if Firebase doesn't respond, we
 * assume the user is not signed in and let ProtectedRoute redirect.
 * Returns true once the initial check has completed.
 */
export function useAuthInit(): boolean {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clear = useAuthStore((s) => s.clear);
  const setLoading = useAuthStore((s) => s.setLoading);
  const [done, setDone] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      setDone(true);
    };

    // Firebase not configured — mark ready immediately so the app works
    // in preview mode. ProtectedRoute will redirect to /login.
    if (!authService.isReady()) {
      clear();
      setLoading(false);
      finish();
      return;
    }

    setLoading(true);

    // Safety timeout: if Firebase Auth doesn't fire onAuthStateChanged within
    // 4 seconds (e.g. network issues, misconfigured project), give up and
    // treat the user as signed-out.
    timeoutId = window.setTimeout(() => {
      console.warn('[auth] Firebase auth check timed out after 4s — treating as signed out.');
      clear();
      finish();
    }, 4000);

    unsubRef.current = authService.onAuthChange((user, profile) => {
      if (user) {
        setAuth(
          {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
          },
          profile,
        );
      } else {
        clear();
      }
      finish();
    });

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [setAuth, clear, setLoading]);

  return done;
}
