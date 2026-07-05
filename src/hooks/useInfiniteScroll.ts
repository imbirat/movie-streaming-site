import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  threshold?: number;
  rootMargin?: string;
  hasMore: boolean;
  onLoadMore: () => void;
}

/**
 * Triggers `onLoadMore` when the sentinel element enters the viewport.
 */
export function useInfiniteScroll({ threshold = 0.1, rootMargin = '200px', hasMore, onLoadMore }: Options) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const callback = useCallback<IntersectionObserverCallback>(
    (entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasMore && !isLoading) {
        setIsLoading(true);
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore],
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(callback, { threshold, rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [callback, threshold, rootMargin]);

  // Reset loading flag whenever there's no more data
  useEffect(() => {
    if (!hasMore) setIsLoading(false);
  }, [hasMore]);

  // Reset loading flag after a short delay so consumer can update
  useEffect(() => {
    if (isLoading) {
      const t = setTimeout(() => setIsLoading(false), 1200);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  return { sentinelRef, isLoading };
}
