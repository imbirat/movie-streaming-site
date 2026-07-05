import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import { PageLoader } from '@/components/common/PageLoader';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Blocks access to protected routes when the user is not signed in.
 * Shows a loader while the initial auth check is running.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isReady = useAuthStore((s) => s.isReady);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Wait for the auth state to settle on first load
  if (!isReady || isLoading) {
    return <PageLoader fullScreen label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
