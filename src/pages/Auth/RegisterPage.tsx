import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Github, Loader2, Mail, User, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

import { Brand } from '@/components/layout/Brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { authService } from '@/services/firebase/auth';
import { ROUTES } from '@/lib/constants';
import { AuthShell } from './LoginPage';

const registerSchema = z
  .object({
    username: z.string().min(2, 'Username must be at least 2 characters').max(30),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterForm) {
    if (!authService.isReady()) {
      toast.error('Authentication is not configured. Set VITE_FIREBASE_* env vars to enable.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.registerWithEmail(values.email, values.password, values.username);
      toast.success('Account created! Check your email to verify.');
      navigate(ROUTES.VERIFY_EMAIL);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Registration failed.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogle() {
    if (!authService.isReady()) {
      toast.error('Authentication is not configured.');
      return;
    }
    setGoogleLoading(true);
    try {
      await authService.loginWithGoogle();
      toast.success('Welcome to Strelix!');
      navigate(redirect);
    } catch (err) {
      console.error(err);
      toast.error('Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGithub() {
    if (!authService.isReady()) {
      toast.error('Authentication is not configured.');
      return;
    }
    setGithubLoading(true);
    try {
      await authService.loginWithGithub();
      toast.success('Welcome to Strelix!');
      navigate(redirect);
    } catch (err) {
      console.error(err);
      toast.error('GitHub sign-in failed.');
    } finally {
      setGithubLoading(false);
    }
  }

  return (
    <AuthShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Brand className="justify-center" />
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Strelix Stream and start your watchlist today.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogle}
            disabled={googleLoading || isSubmitting || githubLoading}
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base font-bold text-blue-500">G</span>}
            Sign up with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGithub}
            disabled={githubLoading || isSubmitting || googleLoading}
          >
            {githubLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
            Sign up with GitHub
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                placeholder="yourname"
                autoComplete="username"
                className="pl-9"
                {...register('username')}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="pl-9"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="brand"
            className="w-full gap-2"
            disabled={isSubmitting || googleLoading || githubLoading}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
