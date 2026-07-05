import { Link } from 'react-router-dom';

import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BrandProps {
  className?: string;
  showText?: boolean;
  to?: string;
}

/**
 * Strelix Stream brand logo — a stylized "S" mark + wordmark.
 */
export function Brand({ className, showText = true, to = '/' }: BrandProps) {
  return (
    <Link
      to={to}
      className={cn('group flex items-center gap-2 font-display font-bold tracking-tight', className)}
      aria-label={APP_NAME}
    >
      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-brand shadow-md shadow-brand/30 transition-transform group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M9 7h3l4 9-4 9H9l4-9zM14 7h3l4 9-4 9h-3l4-9z" />
        </svg>
      </div>
      {showText && (
        <span className="text-lg font-extrabold uppercase tracking-tight">
          Strelix<span className="ml-1 text-brand">Stream</span>
        </span>
      )}
    </Link>
  );
}
