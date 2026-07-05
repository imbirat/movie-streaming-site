import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  HeartOff,
  List,
  Play,
  Star,
} from 'lucide-react';

import { DetailHero } from '@/components/movie/DetailHero';
import { MediaCard } from '@/components/movie/MediaCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useCredits,
  useDetail,
  useRecommendations,
  useSeason,
  useVideos,
} from '@/hooks/useTmdb';
import {
  useFavoritesActions,
  useWatchlistActions,
} from '@/hooks/useUserData';
import { useUserDataStore } from '@/stores/userDataStore';
import { ROUTES } from '@/lib/constants';
import { formatRuntime, tmdbImage } from '@/lib/utils';
import type { MediaCategory, TMDBMovie, TMDBTvShow } from '@/types';

interface DetailPageProps {
  category: MediaCategory;
}

export default function DetailPage({ category }: DetailPageProps) {
  const params = useParams();
  const id = params.id!;
  const type = category === 'movie' ? 'movie' : 'tv';
  const tmdbType = category === 'movie' ? 'movie' : 'tv';

  const detailQuery = useDetail(category, id);
  const creditsQuery = useCredits(category, id);
  const videosQuery = useVideos(category, id);
  const recommendationsQuery = useRecommendations(category, id);

  const watchlistActions = useWatchlistActions();
  const favoritesActions = useFavoritesActions();
  const isInWatchlist = useUserDataStore((s) => s.isInWatchlist(Number(id), category));
  const isInFavorites = useUserDataStore((s) => s.isInFavorites(Number(id), category));

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const seasonQuery = useSeason(
    category !== 'movie' ? id : undefined,
    selectedSeason,
  );

  const detail = detailQuery.data as TMDBMovie | TMDBTvShow | undefined;
  const title =
    detail && 'title' in detail ? detail.title : detail && 'name' in detail ? detail.name : 'Loading...';
  const trailerKey = videosQuery.data ? pickTrailerKey(videosQuery.data.results) : null;

  if (detailQuery.isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="-mx-4 mb-8 aspect-video w-[calc(100%+2rem)] rounded-lg" />
        <Skeleton className="mb-4 h-10 w-2/3" />
        <Skeleton className="mb-2 h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (detailQuery.isError || !detail) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-2xl font-bold">Title not found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn't load this title. It may have been removed or never existed.
        </p>
        <Button asChild className="mt-4" variant="brand">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  function handleWatchlist() {
    if (!detail) return;
    watchlistActions.toggle(
      {
        tmdbId: Number(id),
        type: category,
        title,
        posterPath: detail.poster_path,
        backdropPath: detail.backdrop_path,
      },
      isInWatchlist,
    );
  }

  function handleFavorite() {
    if (!detail) return;
    favoritesActions.toggle(
      {
        tmdbId: Number(id),
        type: category,
        title,
        posterPath: detail.poster_path,
      },
      isInFavorites,
    );
  }

  const watchRoute =
    category === 'movie'
      ? ROUTES.WATCH_MOVIE(id)
      : ROUTES.WATCH_TV(id, 1, 1);

  const cast = creditsQuery.data ? creditsQuery.data.cast.slice(0, 12) : [];
  const recommendations = recommendationsQuery.data?.results ?? [];
  const seasons =
    category !== 'movie' && 'seasons' in detail
      ? detail.seasons?.filter((s) => s.season_number > 0) ?? []
      : [];
  const episodes = seasonQuery.data?.episodes ?? [];
  const runtime = 'runtime' in detail ? detail.runtime : ('episode_run_time' in detail ? detail.episode_run_time?.[0] : undefined);

  return (
    <div className="pb-12">
      <DetailHero item={detail} category={category} />

      {/* Action bar */}
      <div className="container mt-2 flex flex-wrap items-center gap-3 px-4">
        <Button asChild variant="brand" size="lg" className="gap-2">
          <Link to={watchRoute}>
            <Play className="h-5 w-5 fill-current" /> Watch Now
          </Link>
        </Button>

        {trailerKey && (
          <Button variant="secondary" size="lg" className="gap-2" onClick={() => setTrailerOpen(true)}>
            <Play className="h-4 w-4" /> Trailer
          </Button>
        )}

        <Button
          variant={isInWatchlist ? 'secondary' : 'outline'}
          size="lg"
          className="gap-2"
          onClick={handleWatchlist}
        >
          {isInWatchlist ? (
            <>
              <BookmarkCheck className="h-5 w-5 text-brand" /> In Watchlist
            </>
          ) : (
            <>
              <Bookmark className="h-5 w-5" /> Add to Watchlist
            </>
          )}
        </Button>

        <Button
          variant={isInFavorites ? 'secondary' : 'outline'}
          size="lg"
          className="gap-2"
          onClick={handleFavorite}
        >
          {isInFavorites ? (
            <>
              <Heart className="h-5 w-5 fill-brand text-brand" /> Favorited
            </>
          ) : (
            <>
              <Heart className="h-5 w-5" /> Favorite
            </>
          )}
        </Button>

        {detail.vote_count ? (
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-foreground">
              {(detail.vote_average ?? 0).toFixed(1)}
            </span>
            <span>({detail.vote_count.toLocaleString()} votes)</span>
          </div>
        ) : null}
      </div>

      {/* Quick facts */}
      <div className="container mt-6 grid gap-8 px-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cast">Cast</TabsTrigger>
              {category !== 'movie' && seasons.length > 0 && (
                <TabsTrigger value="episodes">Episodes</TabsTrigger>
              )}
              {recommendations.length > 0 && (
                <TabsTrigger value="more">More Like This</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <h2 className="font-display text-lg font-semibold">Synopsis</h2>
              <p className="mt-2 text-sm text-foreground/85 sm:text-base">
                {detail.overview || 'No synopsis available.'}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                {runtime ? (
                  <FactRow label="Runtime" value={formatRuntime(runtime)} />
                ) : null}
                {'release_date' in detail && detail.release_date ? (
                  <FactRow label="Release Date" value={new Date(detail.release_date).toLocaleDateString()} />
                ) : null}
                {'first_air_date' in detail && detail.first_air_date ? (
                  <FactRow label="First Aired" value={new Date(detail.first_air_date).toLocaleDateString()} />
                ) : null}
                {detail.status && <FactRow label="Status" value={detail.status} />}
                {'number_of_seasons' in detail && (
                  <FactRow label="Seasons" value={String(detail.number_of_seasons)} />
                )}
                {'number_of_episodes' in detail && (
                  <FactRow label="Episodes" value={String(detail.number_of_episodes)} />
                )}
                {detail.original_language && (
                  <FactRow
                    label="Language"
                    value={detail.original_language.toUpperCase()}
                  />
                )}
                {detail.production_companies?.[0] && (
                  <FactRow label="Studio" value={detail.production_companies[0].name} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="cast" className="mt-4">
              {cast.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cast information available.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {cast.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-secondary">
                        {c.profile_path && (
                          <img
                            src={tmdbImage(c.profile_path, 'w185')}
                            alt={c.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium">{c.name}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{c.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {category !== 'movie' && seasons.length > 0 && (
              <TabsContent value="episodes" className="mt-4">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {seasons.map((s) => (
                    <Button
                      key={s.id}
                      variant={selectedSeason === s.season_number ? 'brand' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSeason(s.season_number)}
                    >
                      {s.name}
                    </Button>
                  ))}
                </div>
                {seasonQuery.isLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <div className="space-y-3">
                    {episodes.map((ep) => (
                      <div
                        key={ep.id}
                        className="flex gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/30"
                      >
                        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded bg-secondary">
                          {ep.still_path ? (
                            <img
                              src={tmdbImage(ep.still_path, 'w185')}
                              alt={ep.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <List className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <Link
                            to={ROUTES.WATCH_TV(id, selectedSeason, ep.episode_number)}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                            aria-label={`Watch ${ep.name}`}
                          >
                            <Play className="h-5 w-5 fill-white text-white" />
                          </Link>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                              E{ep.episode_number}
                            </span>
                            <p className="line-clamp-1 text-sm font-medium">{ep.name}</p>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {ep.overview || 'No description.'}
                          </p>
                          {ep.runtime ? (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {formatRuntime(ep.runtime)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            {recommendations.length > 0 && (
              <TabsContent value="more" className="mt-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {recommendations.slice(0, 12).map((rec, idx) => (
                    <MediaCard
                      key={rec.id}
                      item={rec}
                      category={category}
                      index={idx}
                    />
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar facts */}
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <h3 className="mb-3 font-display text-sm font-semibold">Information</h3>
            <dl className="space-y-2 text-xs">
              {detail.genres && detail.genres.length > 0 && (
                <div>
                  <dt className="text-muted-foreground">Genres</dt>
                  <dd className="flex flex-wrap gap-1">
                    {detail.genres.map((g) => (
                      <Badge key={g.id} variant="secondary" className="text-[10px]">
                        {g.name}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}
              {runtime ? <FactRow label="Runtime" value={formatRuntime(runtime)} /> : null}
              {detail.status && <FactRow label="Status" value={detail.status} />}
              {detail.original_language && (
                <FactRow label="Language" value={detail.original_language.toUpperCase()} />
              )}
              {'number_of_seasons' in detail && (
                <FactRow label="Seasons" value={String(detail.number_of_seasons)} />
              )}
              {'number_of_episodes' in detail && (
                <FactRow label="Episodes" value={String(detail.number_of_episodes)} />
              )}
            </dl>
          </div>
        </aside>
      </div>

      {/* Trailer dialog */}
      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="max-w-4xl border-border bg-black p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{title} — Trailer</DialogTitle>
          </DialogHeader>
          {trailerKey && (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title={`${title} trailer`}
                className="h-full w-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function pickTrailerKey(videos: { site: string; type: string; official?: boolean; key: string }[]) {
  if (!videos?.length) return null;
  const yt = videos.filter((v) => v.site === 'YouTube');
  if (yt.length === 0) return null;
  return (
    yt.find((v) => v.type === 'Trailer' && v.official)?.key ??
    yt.find((v) => v.type === 'Trailer')?.key ??
    yt[0]!.key
  );
}
