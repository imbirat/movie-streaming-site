import { useEffect, useState } from 'react';

/**
 * Tracks whether the page has been scrolled past a threshold.
 * Useful for adding a backdrop to the navbar after scrolling.
 */
export function useScrollPosition(threshold = 30): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);

  return scrolled;
}
