import { MediaCard } from './MediaCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { MediaCategory, TMDBMovie, TMDBSearchMultiResult, TMDBTvShow } from '@/types';

interface MediaGridProps {
  items: (TMDBMovie | TMDBTvShow | TMDBSearchMultiResult)[];
  category?: MediaCategory;
  loading?: boolean;
  loadingMore?: boolean;
  skeletonCount?: number;
}

/**
 * Responsive grid of poster cards for browse / search / list pages.
 */
export function MediaGrid({
  items,
  category,
  loading,
  loadingMore,
  skeletonCount = 12,
}: MediaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item, idx) => (
        <MediaCard
          key={`${item.id}-${idx}`}
          item={item}
          category={category}
          index={idx}
        />
      ))}
      {loadingMore &&
        Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={`loading-${i}`} className="aspect-[2/3] w-full rounded-lg" />
        ))}
    </div>
  );
}
