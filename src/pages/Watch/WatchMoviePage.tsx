import { useParams } from 'react-router-dom';

import { VideoPlayer } from '@/components/player/VideoPlayer';
import { useDetail } from '@/hooks/useTmdb';
import { PageLoader } from '@/components/common/PageLoader';

export default function WatchMoviePage() {
  const { id } = useParams<{ id: string }>();
  const detailQuery = useDetail('movie', id);

  // Only show the full-screen loader while the request is in flight AND we
  // don't yet know whether it'll succeed. If it errors (e.g. missing TMDB key),
  // fall through to the player with a default title so the user still gets
  // the embed — they didn't come here for the metadata, they came to watch.
  if (detailQuery.isLoading) {
    return <PageLoader fullScreen label="Loading movie..." />;
  }

  const detail = detailQuery.data;
  const title =
    detail && 'title' in detail && detail.title ? detail.title : 'Movie';

  return (
    <VideoPlayer
      type="movie"
      id={id!}
      title={title}
      posterPath={detail?.poster_path ?? null}
      backdropPath={detail?.backdrop_path ?? null}
      category="movie"
    />
  );
}
