import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, MonitorPlay, Search, Tv, TrendingUp } from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ROUTES } from '@/lib/constants';
import { tmdbImage } from '@/lib/utils';
import { useSearchSuggestions } from '@/hooks/useTmdb';
import type { TMDBSearchMultiResult } from '@/types';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);

    // Allow other components to open the palette
    const openHandler = () => setOpen(true);
    window.addEventListener('strelix:command-palette:open', openHandler);

    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('strelix:command-palette:open', openHandler);
    };
  }, []);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const { data: suggestions, isFetching } = useSearchSuggestions(query);

  function go(to: string) {
    setOpen(false);
    setQuery('');
    navigate(to);
  }

  function handleSearchSubmit() {
    if (!query.trim()) return;
    go(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
    >
      <CommandInput
        placeholder="Search movies, TV shows, anime..."
        value={query}
        onValueChange={setQuery}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchSubmit();
          }
        }}
      />
      <CommandList>
        <CommandEmpty>
          {isFetching ? 'Searching...' : 'No results found. Try another search.'}
        </CommandEmpty>

        {/* Quick navigation */}
        {!query && (
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => go(ROUTES.HOME)}>
              <TrendingUp className="h-4 w-4" /> Home
            </CommandItem>
            <CommandItem onSelect={() => go(ROUTES.MOVIES)}>
              <Film className="h-4 w-4" /> Movies
            </CommandItem>
            <CommandItem onSelect={() => go(ROUTES.TV)}>
              <Tv className="h-4 w-4" /> TV Shows
            </CommandItem>
            <CommandItem onSelect={() => go(ROUTES.ANIME)}>
              <MonitorPlay className="h-4 w-4" /> Anime
            </CommandItem>
          </CommandGroup>
        )}

        {/* Suggestions */}
        {query && suggestions && suggestions.length > 0 && (
          <CommandGroup heading="Suggestions">
            {suggestions.map((item) => (
              <SuggestionItem key={`${item.media_type}-${item.id}`} item={item} onSelect={go} />
            ))}
          </CommandGroup>
        )}

        {/* Always show "search for..." */}
        {query.trim() && (
          <CommandGroup heading="Search">
            <CommandItem onSelect={handleSearchSubmit}>
              <Search className="h-4 w-4" />
              <span>
                Search for <strong className="text-foreground">"{query.trim()}"</strong>
              </span>
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

function SuggestionItem({
  item,
  onSelect,
}: {
  item: TMDBSearchMultiResult;
  onSelect: (to: string) => void;
}) {
  const title = item.title ?? item.name ?? 'Untitled';
  const isMovie = item.media_type === 'movie';
  const isTv = item.media_type === 'tv';
  const poster = tmdbImage(item.poster_path, 'w92');
  const route = isMovie
    ? ROUTES.MOVIE_DETAIL(item.id)
    : isTv
      ? ROUTES.TV_DETAIL(item.id)
      : '#';

  if (!isMovie && !isTv) return null;

  return (
    <CommandItem onSelect={() => onSelect(route)} value={`${item.media_type}-${item.id}-${title}`}>
      <div className="mr-2 h-10 w-8 shrink-0 overflow-hidden rounded bg-secondary">
        {poster && (
          <img
            src={poster}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm">{title}</span>
        <span className="text-xs text-muted-foreground">
          {isMovie ? 'Movie' : 'TV Show'}
          {item.release_date ? ` • ${item.release_date.slice(0, 4)}` : ''}
        </span>
      </div>
    </CommandItem>
  );
}
