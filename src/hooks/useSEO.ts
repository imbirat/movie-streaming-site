import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Lightweight SEO helper:
 * - Updates document.title based on route
 * - Updates meta description for the current page
 *
 * For richer per-page metadata, swap this for react-helmet-async.
 */
const TITLES: Record<string, string> = {
  '/': 'Strelix Stream — Premium Streaming Platform',
  '/movies': 'Movies — Strelix Stream',
  '/tv': 'TV Shows — Strelix Stream',
  '/anime': 'Anime — Strelix Stream',
  '/search': 'Search — Strelix Stream',
  '/login': 'Sign In — Strelix Stream',
  '/register': 'Create Account — Strelix Stream',
  '/watchlist': 'My Watchlist — Strelix Stream',
  '/favorites': 'My Favorites — Strelix Stream',
  '/continue-watching': 'Continue Watching — Strelix Stream',
  '/profile': 'My Profile — Strelix Stream',
  '/settings': 'Settings — Strelix Stream',
};

const DESCRIPTIONS: Record<string, string> = {
  '/': 'Stream movies, TV shows and anime in beautiful HD. Build watchlists, sync progress across devices.',
  '/movies': 'Browse and stream thousands of movies on Strelix Stream.',
  '/tv': 'Discover and stream TV shows on Strelix Stream.',
  '/anime': 'Stream the best anime — from classics to seasonal hits.',
  '/search': 'Search across movies, TV shows, and anime on Strelix Stream.',
};

export function useSEO(title?: string, description?: string) {
  const { pathname } = useLocation();

  useEffect(() => {
    const finalTitle = title ?? TITLES[pathname] ?? 'Strelix Stream';
    const finalDesc = description ?? DESCRIPTIONS[pathname] ?? 'Premium streaming for movies, TV shows and anime.';

    document.title = finalTitle;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', finalDesc);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', finalTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', finalDesc);
  }, [pathname, title, description]);
}
