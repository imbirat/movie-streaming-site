import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { HeroBanner } from '@/components/movie/HeroBanner';
import { MediaRow } from '@/components/movie/MediaRow';
import { ContinueWatchingCard } from '@/components/movie/ContinueWatchingCard';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import {
  usePopular,
  useRecentlyAdded,
  useTopRated,
  useTrendingAll,
  useTrendingMovies,
  useTrendingTv,
} from '@/hooks/useTmdb';
import { useUserDataStore } from '@/stores/userDataStore';
import type { TMDBMovie, TMDBSearchMultiResult, TMDBTvShow } from '@/types';

type AnyResults = (TMDBMovie | TMDBTvShow | TMDBSearchMultiResult)[];

function getResults(
  data: { results?: unknown[] } | undefined,
): AnyResults {
  if (!data?.results) return [];
  return data.results as AnyResults;
}

export default function HomePage() {
  const trending = useTrendingAll('week');
  const trendingMovies = useTrendingMovies('week');
  const trendingTv = useTrendingTv('week');
  const popularMovies = usePopular('movie');
  const popularTv = usePopular('tv');
  const popularAnime = usePopular('anime');
  const topRatedMovies = useTopRated('movie');
  const recentlyAddedMovies = useRecentlyAdded('movie');

  const continueWatching = useUserDataStore((s) => s.continueWatching);

  // Pick a hero item: first trending with a backdrop
  const heroItem = useMemo(() => {
    const items = getResults(trending.data);
    return items.find((i) => i.backdrop_path) ?? items[0] ?? null;
  }, [trending.data]);

  return (
    <div className="pb-12">
      {heroItem ? (
        <HeroBanner item={heroItem as TMDBSearchMultiResult} />
      ) : (
        <div className="-mt-16 h-[60vh] min-h-[400px] skeleton-shimmer" />
      )}

      <div className="mt-6 space-y-2">
        {/* Continue Watching (only if user has items) */}
        {continueWatching.length > 0 && (
          <section className="py-4">
            <div className="mb-3 flex items-center justify-between px-4">
              <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                Continue Watching
              </h2>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <Link to={ROUTES.CONTINUE_WATCHING}>
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
              {continueWatching.slice(0, 10).map((item, idx) => (
                <ContinueWatchingCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          </section>
        )}

        <MediaRow
          title="Trending Now"
          items={getResults(trending.data)}
          loading={trending.isLoading}
        />
        <MediaRow
          title="Trending Movies"
          items={getResults(trendingMovies.data)}
          category="movie"
          loading={trendingMovies.isLoading}
        />
        <MediaRow
          title="Popular Movies"
          items={getResults(popularMovies.data)}
          category="movie"
          viewAllTo={ROUTES.MOVIES}
          loading={popularMovies.isLoading}
        />
        <MediaRow
          title="Popular TV Shows"
          items={getResults(popularTv.data)}
          category="tv"
          viewAllTo={ROUTES.TV}
          loading={popularTv.isLoading}
        />
        <MediaRow
          title="Popular Anime"
          items={getResults(popularAnime.data)}
          category="anime"
          viewAllTo={ROUTES.ANIME}
          loading={popularAnime.isLoading}
        />
        <MediaRow
          title="Top Rated Movies"
          items={getResults(topRatedMovies.data)}
          category="movie"
          loading={topRatedMovies.isLoading}
        />
        <MediaRow
          title="Recently Added"
          items={getResults(recentlyAddedMovies.data)}
          category="movie"
          loading={recentlyAddedMovies.isLoading}
        />
      </div>
    </div>
  );
}
