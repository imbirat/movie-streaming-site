import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';

import { MediaCard } from '@/components/movie/MediaCard';
import { Button } from '@/components/ui/button';
import { useUserDataStore } from '@/stores/userDataStore';
import { ROUTES } from '@/lib/constants';
import type { TMDBMovie, TMDBTvShow } from '@/types';

export default function WatchlistPage() {
  const watchlist = useUserDataStore((s) => s.watchlist);

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Bookmark className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">My Watchlist</h1>
          <p className="text-sm text-muted-foreground">
            {watchlist.length === 0
              ? 'Your watchlist is empty — add titles to watch later.'
              : `${watchlist.length} title${watchlist.length === 1 ? '' : 's'} saved.`}
          </p>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center text-muted-foreground">
          <Bookmark className="mb-3 h-12 w-12 opacity-40" />
          <p className="font-display text-xl font-semibold">No saved titles yet</p>
          <p className="mt-1 text-sm">Tap the bookmark icon on any title to save it here.</p>
          <Button asChild variant="brand" className="mt-4">
            <Link to={ROUTES.MOVIES}>Browse Movies</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {watchlist.map((item, idx) => (
            <MediaCard
              key={item.id}
              item={
                {
                  id: item.tmdbId,
                  title: item.title,
                  name: item.title,
                  poster_path: item.posterPath,
                  backdrop_path: item.backdropPath ?? null,
                  vote_average: 0,
                  media_type: item.type === 'movie' ? 'movie' : 'tv',
                  overview: '',
                } as unknown as TMDBMovie | TMDBTvShow
              }
              category={item.type}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
