import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Blocks access to protected routes when the user is not signed in.
 *
 * Behavior:
 * 1. While auth state is loading → show a visible full-screen loader
 * 2. When auth resolves and user IS signed in → render children
 * 3. When auth resolves and user is NOT signed in → redirect to /login
 *
 * The loading state has a 4-second timeout (in useAuthInit) so it can't
 * hang forever — after 4s, the state is cleared and this route redirects
 * to /login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const isReady = useAuthStore((s) => s.isReady);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Step 1: Still loading — show visible loader
  if (!isReady || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
        <div className="text-center">
          <p className="font-display text-lg font-semibold">Checking your session...</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This should only take a moment. If you're stuck here, Firebase may be misconfigured.
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Auth resolved, no user → redirect to login
  if (!firebaseUser) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  // Step 3: Auth resolved, user exists → render the protected page
  return <>{children}</>;
}
