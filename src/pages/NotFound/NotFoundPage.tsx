import { Link } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      {/* Background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(60% 60% at 50% 30%, hsl(var(--brand) / 0.4) 0%, transparent 60%)',
        }}
      />

      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="font-display text-[8rem] font-extrabold leading-none text-brand sm:text-[12rem]"
      >
        404
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
      >
        Page not found
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-2 max-w-md text-sm text-muted-foreground"
      >
        The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-6 flex gap-3"
      >
        <Button asChild variant="brand" className="gap-2">
          <Link to={ROUTES.HOME}>
            <HomeIcon className="h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={ROUTES.SEARCH}>Browse titles</Link>
        </Button>
      </motion.div>
    </div>
  );
}
