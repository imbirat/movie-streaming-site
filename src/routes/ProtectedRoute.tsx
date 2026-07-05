import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Blocks access to protected routes when the user is not signed in.
 * Shows a visible loader while the initial auth check is running.
 * If auth takes too long, useAuthInit's 4-second timeout will fire and
 * clear the state, causing a redirect to /login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const isReady = useAuthStore((s) => s.isReady);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Wait for the auth state to settle on first load
  if (!isReady || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm text-muted-foreground">Checking your session...</p>
      </div>
    );
  }

  // Use firebaseUser (not persisted isAuthenticated) as the source of truth
  if (!firebaseUser) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
