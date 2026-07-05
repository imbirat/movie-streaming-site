import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PageLoaderProps {
  fullScreen?: boolean;
  label?: string;
  className?: string;
}

export function PageLoader({ fullScreen, label, className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-muted-foreground',
        fullScreen ? 'min-h-screen' : 'min-h-[40vh]',
        className,
      )}
    >
      <Loader2 className="h-7 w-7 animate-spin text-brand" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
