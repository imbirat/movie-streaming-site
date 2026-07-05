import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { tmdbImage, formatYear } from '@/lib/utils';
import type { TMDBMovie, TMDBTvShow } from '@/types';

interface DetailHeroProps {
  item: TMDBMovie | TMDBTvShow;
  category: 'movie' | 'tv' | 'anime';
  trailerKey?: string | null;
}

function getTitle(item: DetailHeroProps['item']): string {
  if ('title' in item && item.title) return item.title;
  if ('name' in item && item.name) return item.name;
  return 'Untitled';
}

function getDate(item: DetailHeroProps['item']): string | null {
  if ('release_date' in item && item.release_date) return item.release_date;
  if ('first_air_date' in item && item.first_air_date) return item.first_air_date;
  return null;
}

/**
 * Detail page hero: large backdrop with gradient, title, genres, rating, and meta.
 */
export function DetailHero({ item, category }: DetailHeroProps) {
  const title = getTitle(item);
  const date = getDate(item);
  const year = formatYear(date);
  const backdrop = tmdbImage(item.backdrop_path, 'w1280');
  const poster = tmdbImage(item.poster_path, 'w500');
  const rating = (item.vote_average ?? 0).toFixed(1);
  const genres = item.genres ?? [];
  const runtime = 'runtime' in item ? item.runtime : ('episode_run_time' in item ? item.episode_run_time?.[0] : undefined);
  const tagline = 'tagline' in item ? item.tagline : undefined;

  return (
    <section className="relative -mt-16 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10">
        {backdrop ? (
          <img src={backdrop} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
      </div>

      <div className="container grid gap-6 px-4 pb-8 pt-24 sm:pt-28 md:grid-cols-[260px_1fr] md:gap-8 md:pt-32">
        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-40 sm:w-52 md:w-full"
        >
          <div className="aspect-[2/3] overflow-hidden rounded-xl border border-border/60 shadow-xl">
            {poster ? (
              <img src={poster} alt={`${title} poster`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="brand" className="uppercase">
              {category}
            </Badge>
            {Number(rating) > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {rating}
              </div>
            )}
            {year && <Badge variant="outline">{year}</Badge>}
            {runtime ? (
              <Badge variant="outline">{runtime} min</Badge>
            ) : null}
            {item.status && (
              <Badge variant="outline" className="capitalize">
                {item.status}
              </Badge>
            )}
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight drop-shadow-lg sm:text-4xl md:text-5xl">
            {title}
          </h1>

          {tagline && (
            <p className="mt-2 text-sm italic text-muted-foreground">"{tagline}"</p>
          )}

          {genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <Badge key={g.id} variant="secondary" className="capitalize">
                  {g.name}
                </Badge>
              ))}
            </div>
          )}

          {item.overview && (
            <p className="mt-4 max-w-3xl text-sm text-foreground/85 sm:text-base">
              {item.overview}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
