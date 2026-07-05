import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { FilterBar } from '@/components/movie/FilterBar';
import { MediaGrid } from '@/components/movie/MediaGrid';
import { PageLoader } from '@/components/common/PageLoader';
import { useDiscoverInfinite } from '@/hooks/useTmdb';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { FilterState, MediaCategory, TMDBMovie, TMDBTvShow } from '@/types';

interface BrowsePageProps {
  category: MediaCategory;
  title: string;
  description?: string;
}

/**
 * Generic browse page with filters + infinite scroll.
 * Used by Movies, TV, and Anime.
 */
export function BrowsePage({ category, title, description }: BrowsePageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({ sortBy: 'popularity.desc' });

  // Restore filters from URL on mount
  useEffect(() => {
    const genre = searchParams.get('genre');
    const year = searchParams.get('year');
    const minRating = searchParams.get('rating');
    const sortBy = searchParams.get('sort');
    const next: FilterState = {
      sortBy: (sortBy as FilterState['sortBy']) ?? 'popularity.desc',
      genre: genre ? Number(genre) : undefined,
      year: year ? Number(year) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
    };
    setFilters(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFiltersChange(next: FilterState) {
    setFilters(next);
    const params: Record<string, string> = {};
    if (next.genre) params.genre = String(next.genre);
    if (next.year) params.year = String(next.year);
    if (next.minRating) params.rating = String(next.minRating);
    if (next.sortBy && next.sortBy !== 'popularity.desc') params.sort = next.sortBy;
    setSearchParams(params, { replace: true });
  }

  function handleReset() {
    setFilters({ sortBy: 'popularity.desc' });
    setSearchParams({}, { replace: true });
  }

  const query = useDiscoverInfinite(category, filters);

  // Flatten paginated results into a single list
  const allItems = useMemo(() => {
    const data = query.data as unknown as { pages?: { results?: (TMDBMovie | TMDBTvShow)[] }[] } | undefined;
    const pages = data?.pages ?? [];
    const items: (TMDBMovie | TMDBTvShow)[] = [];
    for (const page of pages) {
      const results = page.results;
      if (results) items.push(...results);
    }
    return items;
  }, [query.data]);

  const hasNextPage = Boolean(query.hasNextPage);
  const { sentinelRef, isLoading: isLoadingMore } = useInfiniteScroll({
    hasMore: hasNextPage,
    onLoadMore: () => void query.fetchNextPage(),
  });

  if (query.isLoading) {
    return (
      <div className="container py-8">
        <BrowseHeader title={title} description={description} />
        <FilterBar category={category} filters={filters} onChange={handleFiltersChange} onReset={handleReset} />
        <PageLoader label={`Loading ${title.toLowerCase()}...`} />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <BrowseHeader title={title} description={description} />

      <FilterBar
        category={category}
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />

      {allItems.length === 0 && !query.isLoading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center text-muted-foreground">
          <h3 className="font-display text-xl font-semibold">No results found</h3>
          <p className="mt-1 text-sm">Try changing your filters or sorting.</p>
        </div>
      ) : (
        <>
          <MediaGrid
            items={allItems}
            category={category}
            loadingMore={isLoadingMore || query.isFetchingNextPage}
          />
          <div ref={sentinelRef} className="h-10" />
          {query.isFetchingNextPage && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Loading more...
            </p>
          )}
          {!hasNextPage && allItems.length > 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              You've reached the end.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function BrowseHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
