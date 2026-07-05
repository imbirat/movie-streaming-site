import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';

import { MediaGrid } from '@/components/movie/MediaGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchMulti } from '@/hooks/useTmdb';
import { useDebounce } from '@/hooks/useDebounce';
import type { TMDBMovie, TMDBSearchMultiResult, TMDBTvShow } from '@/types';

type FilterTab = 'all' | 'movie' | 'tv';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [input, setInput] = useState(initialQuery);
  const [tab, setTab] = useState<FilterTab>('all');

  const debounced = useDebounce(input, 350);
  const query = useSearchMulti(debounced, debounced.length > 1);

  // Sync URL ↔ input
  useEffect(() => {
    if (debounced && debounced !== searchParams.get('q')) {
      setSearchParams({ q: debounced }, { replace: true });
    } else if (!debounced && searchParams.get('q')) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    const urlQ = searchParams.get('q') ?? '';
    if (urlQ && urlQ !== input) setInput(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Filter + sort by tab
  const filtered = useMemo(() => {
    const results = query.data?.results ?? [];
    return results
      .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
      .filter((r) => (tab === 'all' ? true : r.media_type === tab)) as TMDBSearchMultiResult[];
  }, [query.data, tab]);

  const isSearching = debounced.length > 1;

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Search
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Find movies, TV shows, and anime across the entire catalog.
      </p>

      {/* Search input */}
      <div className="relative mt-6 max-w-2xl">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search for a title, person, or keyword..."
          className="h-12 pl-10 pr-12 text-base"
          autoFocus
        />
        {input && (
          <button
            type="button"
            onClick={() => setInput('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      {isSearching && (
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)} className="mt-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="movie">Movies</TabsTrigger>
            <TabsTrigger value="tv">TV Shows</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Results */}
      <div className="mt-6">
        {!isSearching ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center text-muted-foreground">
            <SearchIcon className="mb-3 h-10 w-10 opacity-50" />
            <p className="text-sm">
              Start typing to search across movies, TV shows, and anime.
            </p>
          </div>
        ) : query.isLoading ? (
          <MediaGrid items={[]} loading skeletonCount={8} />
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center text-muted-foreground">
            <p className="font-display text-xl font-semibold">No results found</p>
            <p className="mt-1 text-sm">
              We couldn't find anything for "{debounced}". Try a different search.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setInput('')}>
              Clear search
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {filtered.length} result{filtered.length === 1 ? '' : 's'} for "{debounced}"
            </p>
            <MediaGrid
              items={filtered as (TMDBMovie | TMDBTvShow | TMDBSearchMultiResult)[]}
            />
          </>
        )}
      </div>
    </div>
  );
}
