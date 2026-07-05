import { useParams } from 'react-router-dom';

import { VideoPlayer } from '@/components/player/VideoPlayer';
import { useDetail } from '@/hooks/useTmdb';
import { PageLoader } from '@/components/common/PageLoader';

export default function WatchMoviePage() {
  const { id } = useParams<{ id: string }>();
  const detailQuery = useDetail('movie', id);

  if (detailQuery.isLoading) {
    return <PageLoader fullScreen label="Loading movie..." />;
  }

  const detail = detailQuery.data;
  const title = detail && 'title' in detail ? detail.title : 'Movie';

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
