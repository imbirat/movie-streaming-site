/**
 * App-wide constants
 */

export const APP_NAME = 'Strelix Stream';
export const APP_SHORT_NAME = 'Strelix';
export const APP_TAGLINE = 'Stream Without Limits';

export const TMDB_API_BASE = 'https://api.themoviedb.org/3';

export const MEDIA_TYPES = {
  MOVIE: 'movie',
  TV: 'tv',
  ANIME: 'anime',
} as const;

export type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];

export const ROUTES = {
  HOME: '/',
  MOVIES: '/movies',
  TV: '/tv',
  ANIME: '/anime',
  SEARCH: '/search',
  MOVIE_DETAIL: (id: number | string) => `/movie/${id}`,
  TV_DETAIL: (id: number | string) => `/tv/${id}`,
  ANIME_DETAIL: (id: number | string) => `/anime/${id}`,
  WATCH_MOVIE: (id: number | string) => `/watch/movie/${id}`,
  WATCH_TV: (id: number | string, season: number, episode: number) =>
    `/watch/tv/${id}/${season}/${episode}`,
  WATCH_ANIME: (id: number | string, season: number, episode: number) =>
    `/watch/anime/${id}/${season}/${episode}`,
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',
  WATCHLIST: '/watchlist',
  CONTINUE_WATCHING: '/continue-watching',
  FAVORITES: '/favorites',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const STORAGE_KEYS = {
  THEME: 'strelix-theme',
  ONBOARDED: 'strelix-onboarded',
} as const;

export const TMDB_GENRES = {
  movie: [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
  ],
  tv: [
    { id: 10759, name: 'Action & Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 10762, name: 'Kids' },
    { id: 9648, name: 'Mystery' },
    { id: 10763, name: 'News' },
    { id: 10764, name: 'Reality' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 10766, name: 'Soap' },
    { id: 10767, name: 'Talk' },
    { id: 10768, name: 'War & Politics' },
    { id: 37, name: 'Western' },
  ],
} as const;
