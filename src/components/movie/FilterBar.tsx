import { Filter, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TMDB_GENRES } from '@/lib/constants';
import type { FilterState, MediaCategory } from '@/types';

interface FilterBarProps {
  category: MediaCategory;
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest' },
  { value: 'title.asc', label: 'A → Z' },
];

const RATING_OPTIONS = [
  { value: '0', label: 'Any rating' },
  { value: '5', label: '5+' },
  { value: '6', label: '6+' },
  { value: '7', label: '7+' },
  { value: '8', label: '8+' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 25 }, (_, i) => currentYear - i);

export function FilterBar({ category, filters, onChange, onReset }: FilterBarProps) {
  const genreList =
    category === 'movie' ? TMDB_GENRES.movie : TMDB_GENRES.tv;

  const hasActiveFilters = Boolean(
    filters.genre || filters.year || filters.minRating || filters.sortBy,
  );

  return (
    <div className="mb-6 rounded-lg border border-border bg-card/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={onReset}>
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Genre</Label>
          <Select
            value={filters.genre ? String(filters.genre) : 'all'}
            onValueChange={(v) =>
              onChange({ ...filters, genre: v === 'all' ? undefined : Number(v) })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {genreList.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Year</Label>
          <Select
            value={filters.year ? String(filters.year) : 'all'}
            onValueChange={(v) =>
              onChange({ ...filters, year: v === 'all' ? undefined : Number(v) })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any year</SelectItem>
              {YEAR_OPTIONS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Rating</Label>
          <Select
            value={String(filters.minRating ?? '0')}
            onValueChange={(v) =>
              onChange({ ...filters, minRating: v === '0' ? undefined : Number(v) })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATING_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Sort by</Label>
          <Select
            value={filters.sortBy ?? 'popularity.desc'}
            onValueChange={(v) =>
              onChange({ ...filters, sortBy: v as FilterState['sortBy'] })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
