import { useParams } from 'react-router-dom';

import { VideoPlayer } from '@/components/player/VideoPlayer';
import { useDetail } from '@/hooks/useTmdb';
import { PageLoader } from '@/components/common/PageLoader';
import type { MediaCategory } from '@/types';

interface WatchTVPageProps {
  category?: MediaCategory;
}

export default function WatchTVPage({ category = 'tv' }: WatchTVPageProps) {
  const params = useParams<{ id: string; season: string; episode: string }>();
  const id = params.id!;
  const season = Number(params.season ?? 1);
  const episode = Number(params.episode ?? 1);

  const detailQuery = useDetail('tv', id);

  // Same pattern as WatchMoviePage: don't block the embed on TMDB metadata.
  if (detailQuery.isLoading) {
    return <PageLoader fullScreen label="Loading episode..." />;
  }

  const detail = detailQuery.data;
  const title =
    detail && 'name' in detail && detail.name ? detail.name : 'TV Show';

  return (
    <VideoPlayer
      type="tv"
      id={id}
      title={title}
      posterPath={detail?.poster_path ?? null}
      backdropPath={detail?.backdrop_path ?? null}
      category={category}
      season={season}
      episode={episode}
    />
  );
}
