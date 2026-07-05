import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { cn, formatDuration, tmdbImage, truncate } from '@/lib/utils';
import type { WatchProgressItem } from '@/types';

interface ContinueWatchingCardProps {
  item: WatchProgressItem;
  onRemove?: () => void;
  index?: number;
}

/**
 * Card showing a partially-watched title with a progress bar.
 * Clicking resumes from where the user left off.
 */
export function ContinueWatchingCard({
  item,
  onRemove,
  index = 0,
}: ContinueWatchingCardProps) {
  const progress = item.duration > 0 ? (item.currentTime / item.duration) * 100 : 0;
  const isComplete = progress >= 95;

  const route =
    item.type === 'movie'
      ? ROUTES.WATCH_MOVIE(item.tmdbId)
      : ROUTES.WATCH_TV(item.tmdbId, item.season ?? 1, item.episode ?? 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative w-64 shrink-0 sm:w-72"
    >
      <Link to={route} className="block">
        <div className="relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-secondary shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
          {item.backdropPath || item.posterPath ? (
            <img
              src={tmdbImage(item.backdropPath ?? item.posterPath, 'w500')}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/90 shadow-lg shadow-brand/30">
              <Play className="h-5 w-5 fill-white text-white" />
            </div>
          </div>

          {/* Top-right remove */}
          {onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-destructive group-hover:opacity-100"
              aria-label="Remove from continue watching"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Bottom info */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="line-clamp-1 text-sm font-semibold text-white">
              {truncate(item.title, 40)}
            </p>
            <p className="mt-0.5 text-[11px] text-white/70">
              {item.type === 'movie' ? (
                <>Movie</>
              ) : (
                <>
                  S{item.season ?? 1} • E{item.episode ?? 1}
                </>
              )}{' '}
              • {formatDuration(item.currentTime)} left
            </p>

            {/* Progress bar */}
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className={cn(
                  'h-full rounded-full',
                  isComplete ? 'bg-emerald-500' : 'bg-brand',
                )}
                style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
