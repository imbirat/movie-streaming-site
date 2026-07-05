import { useEffect, useRef, useState } from 'react';

import { authService } from '@/services/firebase/auth';
import { useAuthStore } from '@/stores/authStore';

/**
 * Subscribes to Firebase auth state changes and updates the auth store.
 * Returns true once the initial check has completed.
 */
export function useAuthInit(): boolean {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clear = useAuthStore((s) => s.clear);
  const setLoading = useAuthStore((s) => s.setLoading);
  const [done, setDone] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Firebase not configured — mark ready immediately so the app works in preview mode.
    if (!authService.isReady()) {
      clear();
      setLoading(false);
      setDone(true);
      return;
    }

    setLoading(true);
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
      setDone(true);
    });

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [setAuth, clear, setLoading]);

  return done;
}
