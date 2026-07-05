import { Link } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';

import { MediaCard } from '@/components/movie/MediaCard';
import { Button } from '@/components/ui/button';
import { SignInRequired, useRequireAuth } from '@/components/common/SignInRequired';
import { useUserDataStore } from '@/stores/userDataStore';
import { ROUTES } from '@/lib/constants';
import type { TMDBMovie, TMDBTvShow } from '@/types';

export default function FavoritesPage() {
  const favorites = useUserDataStore((s) => s.favorites);
  const { needsAuth, loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (needsAuth) {
    return <SignInRequired title="Your favorites are waiting" description="Sign in to favorite titles and access them from any device." />;
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Heart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">My Favorites</h1>
          <p className="text-sm text-muted-foreground">
            {favorites.length === 0
              ? 'No favorites yet — tap the heart on any title to favorite it.'
              : `${favorites.length} favorite title${favorites.length === 1 ? '' : 's'}.`}
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center text-muted-foreground">
          <Heart className="mb-3 h-12 w-12 opacity-40" />
          <p className="font-display text-xl font-semibold">Nothing favorited yet</p>
          <p className="mt-1 text-sm">Tap the heart icon on any title to add it here.</p>
          <Button asChild variant="brand" className="mt-4">
            <Link to={ROUTES.TV}>Browse TV Shows</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {favorites.map((item, idx) => (
            <MediaCard
              key={item.id}
              item={
                {
                  id: item.tmdbId,
                  title: item.title,
                  name: item.title,
                  poster_path: item.posterPath,
                  backdrop_path: null,
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
