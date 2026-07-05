import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info, Play, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants';
import { cn, formatYear, tmdbImage, truncate } from '@/lib/utils';
import type { MediaCategory, TMDBMovie, TMDBSearchMultiResult, TMDBTvShow } from '@/types';

interface HeroBannerProps {
  item: TMDBMovie | TMDBTvShow | TMDBSearchMultiResult;
  category?: MediaCategory;
  className?: string;
}

function getTitle(item: HeroBannerProps['item']): string {
  if ('title' in item && item.title) return item.title;
  if ('name' in item && item.name) return item.name;
  return 'Untitled';
}

function getDate(item: HeroBannerProps['item']): string | null {
  if ('release_date' in item && item.release_date) return item.release_date;
  if ('first_air_date' in item && item.first_air_date) return item.first_air_date;
  return null;
}

function getMediaType(item: HeroBannerProps['item']): 'movie' | 'tv' {
  if ('media_type' in item && item.media_type) return item.media_type === 'movie' ? 'movie' : 'tv';
  if ('title' in item) return 'movie';
  return 'tv';
}

/**
 * Big cinematic hero banner with backdrop image, gradient overlay, title, overview + CTA.
 */
export function HeroBanner({ item, category, className }: HeroBannerProps) {
  const title = getTitle(item);
  const date = getDate(item);
  const year = formatYear(date);
  const overview = item.overview ?? '';
  const mediaType = getMediaType(item);
  const rating = (item.vote_average ?? 0).toFixed(1);
  const backdrop = tmdbImage(item.backdrop_path, 'w1280');
  const detailRoute =
    category === 'anime'
      ? ROUTES.TV_DETAIL(item.id)
      : mediaType === 'movie'
        ? ROUTES.MOVIE_DETAIL(item.id)
        : ROUTES.TV_DETAIL(item.id);
  const watchRoute =
    mediaType === 'movie'
      ? ROUTES.WATCH_MOVIE(item.id)
      : ROUTES.WATCH_TV(item.id, 1, 1);

  return (
    <section className={cn('relative -mt-16 h-[75vh] min-h-[480px] w-full overflow-hidden', className)}>
      {/* Backdrop */}
      <div className="absolute inset-0">
        {backdrop ? (
          <img
            src={backdrop}
            alt=""
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-secondary to-background" />
        )}
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex h-full items-end">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="container max-w-3xl px-4 pb-16 pt-24"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="brand" className="uppercase">
              Featured
            </Badge>
            {Number(rating) > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {rating}
              </div>
            )}
            {year && (
              <Badge variant="outline" className="border-white/20 bg-black/40 backdrop-blur-sm">
                {year}
              </Badge>
            )}
            <Badge variant="outline" className="border-white/20 bg-black/40 capitalize backdrop-blur-sm">
              {category ?? mediaType}
            </Badge>
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight drop-shadow-lg sm:text-5xl md:text-6xl">
            {title}
          </h1>

          {overview && (
            <p className="mt-4 max-w-2xl text-sm text-foreground/80 sm:text-base">
              {truncate(overview, 280)}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild variant="brand" size="xl" className="gap-2">
              <Link to={watchRoute}>
                <Play className="h-5 w-5 fill-current" /> Watch Now
              </Link>
            </Button>
            <Button asChild variant="secondary" size="xl" className="gap-2 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
              <Link to={detailRoute}>
                <Info className="h-5 w-5" /> More Info
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
