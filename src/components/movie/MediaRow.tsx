import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { MediaCard } from './MediaCard';
import { Button } from '@/components/ui/button';
import type { MediaCategory, TMDBMovie, TMDBSearchMultiResult, TMDBTvShow } from '@/types';

interface MediaRowProps {
  title: string;
  items: (TMDBMovie | TMDBTvShow | TMDBSearchMultiResult)[];
  category?: MediaCategory;
  viewAllTo?: string;
  loading?: boolean;
}

/**
 * Horizontally scrollable row of poster cards with a section heading.
 */
export function MediaRow({ title, items, category, viewAllTo, loading }: MediaRowProps) {
  if (loading) {
    return <MediaRowSkeleton title={title} />;
  }

  if (!items?.length) return null;

  return (
    <section className="group/row py-4">
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
        {viewAllTo && (
          <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <Link to={viewAllTo}>
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
        {items.slice(0, 20).map((item, idx) => (
          <MediaCard
            key={`${item.id}-${idx}`}
            item={item}
            category={category}
            className="w-32 shrink-0 sm:w-40 md:w-44 lg:w-48"
            index={idx}
          />
        ))}
      </div>
    </section>
  );
}

function MediaRowSkeleton({ title }: { title: string }) {
  return (
    <section className="py-4">
      <div className="mb-3 px-4">
        <div className="skeleton-shimmer h-6 w-48 rounded" />
        <span className="sr-only">{title}</span>
      </div>
      <div className="flex gap-3 overflow-hidden px-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer aspect-[2/3] w-32 shrink-0 rounded-lg sm:w-40 md:w-44 lg:w-48"
          />
        ))}
      </div>
    </section>
  );
}
