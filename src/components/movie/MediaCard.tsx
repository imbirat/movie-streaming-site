import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants';
import { cn, formatYear, tmdbImage } from '@/lib/utils';
import type { TMDBMovie, TMDBSearchMultiResult, TMDBTvShow, MediaCategory } from '@/types';

interface MediaCardProps {
  item: TMDBMovie | TMDBTvShow | TMDBSearchMultiResult;
  category?: MediaCategory;
  className?: string;
  priority?: boolean;
  index?: number;
}

function getTitle(item: MediaCardProps['item']): string {
  if ('title' in item && item.title) return item.title;
  if ('name' in item && item.name) return item.name;
  return 'Untitled';
}

function getDate(item: MediaCardProps['item']): string | null {
  if ('release_date' in item && item.release_date) return item.release_date;
  if ('first_air_date' in item && item.first_air_date) return item.first_air_date;
  return null;
}

function getMediaType(item: MediaCardProps['item']): 'movie' | 'tv' {
  if ('media_type' in item && item.media_type) {
    return item.media_type === 'movie' ? 'movie' : 'tv';
  }
  if ('title' in item) return 'movie';
  return 'tv';
}

function getDetailRoute(item: MediaCardProps['item'], category?: MediaCategory): string {
  const mediaType = getMediaType(item);
  const id = item.id;
  // Anime category uses /tv/:id route (still a TV show)
  if (category === 'anime') return ROUTES.TV_DETAIL(id);
  if (mediaType === 'movie') return ROUTES.MOVIE_DETAIL(id);
  return ROUTES.TV_DETAIL(id);
}

/**
 * Poster card for movies / TV / anime.
 * Hover reveals play button + rating.
 */
export const MediaCard = memo(function MediaCard({
  item,
  category,
  className,
  priority,
  index = 0,
}: MediaCardProps) {
  const title = getTitle(item);
  const date = getDate(item);
  const year = formatYear(date);
  const route = getDetailRoute(item, category);
  const rating = (item.vote_average ?? 0).toFixed(1);
  const poster = tmdbImage(item.poster_path, 'w342');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
      className={cn('group relative', className)}
    >
      <Link to={route} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border/60 bg-secondary shadow-sm transition-all duration-300 group-hover:border-border group-hover:shadow-xl group-hover:shadow-black/30 group-hover:-translate-y-1">
          {poster ? (
            <img
              src={poster}
              alt={`${title} poster`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}

          {/* Top-left rating */}
          {Number(rating) > 0 && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-xs font-semibold backdrop-blur-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/90 shadow-lg shadow-brand/30 transition-transform duration-300 group-hover:scale-110">
              <Play className="h-5 w-5 fill-white text-white" />
            </div>
          </div>

          {/* Bottom info on hover */}
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <p className="line-clamp-2 text-xs text-white/90">{title}</p>
            {year && <p className="mt-0.5 text-[10px] text-white/60">{year}</p>}
          </div>
        </div>

        {/* Below poster */}
        <div className="mt-2">
          <p className="line-clamp-1 text-sm font-medium">{title}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            {year && (
              <span className="text-xs text-muted-foreground">{year}</span>
            )}
            <span className="text-xs text-muted-foreground">•</span>
            <Badge variant="outline" className="px-1.5 py-0 text-[10px] capitalize">
              {category ?? (getMediaType(item) === 'movie' ? 'movie' : 'tv')}
            </Badge>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
