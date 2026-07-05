import { Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';

interface SignInRequiredProps {
  title?: string;
  description?: string;
}

/**
 * Shown when a protected page is accessed without a signed-in user.
 * This is a defensive fallback — ProtectedRoute should normally redirect
 * to /login before this ever renders. But if the auth state is in flux
 * (e.g. Firebase check still running, or stale cache), this ensures the
 * user sees a clear message instead of a blank page.
 */
export function SignInRequired({
  title = 'Sign in required',
  description = 'You need to be signed in to view this page.',
}: SignInRequiredProps) {
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
        <LockKeyhole className="h-8 w-8 text-brand" />
      </div>
      <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild variant="brand">
          <Link to={`/login?redirect=${redirect}`}>Sign In</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={ROUTES.REGISTER}>Create Account</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Hook that returns true if the current user is definitely not signed in.
 * Used by protected pages to show <SignInRequired /> as a defensive fallback.
 */
export function useRequireAuth(): { needsAuth: boolean; loading: boolean } {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const isReady = useAuthStore((s) => s.isReady);
  const isLoading = useAuthStore((s) => s.isLoading);

  // If auth check is done and we have no firebaseUser, show sign-in prompt
  if (isReady && !isLoading && !firebaseUser) {
    return { needsAuth: true, loading: false };
  }

  return { needsAuth: false, loading: !isReady || isLoading };
}
