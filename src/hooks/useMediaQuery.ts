import { useEffect, useState } from 'react';

/**
 * Returns true when the document matches the given media query.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Convenience: is the viewport currently mobile (< 768px)? */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
