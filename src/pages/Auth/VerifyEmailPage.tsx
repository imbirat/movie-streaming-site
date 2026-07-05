import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, MailX, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

import { Brand } from '@/components/layout/Brand';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/firebase/auth';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/lib/constants';
import { AuthShell } from './LoginPage';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  // If user is not signed in, redirect to login
  useEffect(() => {
    if (!firebaseUser) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [firebaseUser, navigate]);

  // If already verified, redirect home
  useEffect(() => {
    if (firebaseUser?.emailVerified) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [firebaseUser?.emailVerified, navigate]);

  async function handleResend() {
    if (!authService.isReady()) {
      toast.error('Authentication is not configured.');
      return;
    }
    setSending(true);
    try {
      await authService.sendVerification();
      toast.success('Verification email sent.');
    } catch (err) {
      console.error(err);
      toast.error('Could not send verification email.');
    } finally {
      setSending(false);
    }
  }

  async function handleCheck() {
    if (!authService.isReady()) return;
    setChecking(true);
    try {
      const user = await authService.reloadUser();
      if (user?.emailVerified) {
        toast.success('Email verified! Redirecting...');
        setTimeout(() => navigate(ROUTES.HOME), 800);
      } else {
        toast.info('Email is not verified yet. Check your inbox.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not refresh verification status.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <Brand className="justify-center" />
        <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <MailX className="h-8 w-8 text-brand" />
        </div>

        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We've sent a verification link to{' '}
          <strong className="text-foreground">{firebaseUser?.email}</strong>. Click the link in
          the email to activate your account.
        </p>

        <div className="mt-8 space-y-3">
          <Button
            variant="brand"
            className="w-full gap-2"
            onClick={handleCheck}
            disabled={checking}
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            I've verified my email
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleResend}
            disabled={sending}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Resend verification email
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          <Link to={ROUTES.HOME} className="text-brand hover:underline">
            Continue to home
          </Link>{' '}
          without verifying.
        </p>
      </motion.div>
    </AuthShell>
  );
}
