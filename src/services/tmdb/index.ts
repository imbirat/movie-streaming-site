import { TMDB_API_BASE } from '@/lib/constants';
import type {
  TMDBCastMember,
  TMDBCreditResponse,
  TMDBEpisode,
  TMDBGenre,
  TMDBMovie,
  TMDBPaginatedResponse,
  TMDBSearchMultiResult,
  TMDBSeason,
  TMDBTvShow,
  TMDBVideo,
  TMDBVideoResponse,
  FilterState,
  MediaCategory,
} from '@/types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;

function assertApiKey(): void {
  if (!API_KEY || API_KEY === 'demo_tmdb_key_replace_me') {
    throw new Error(
      'TMDB API key not configured. Set VITE_TMDB_API_KEY in your .env.local file.',
    );
  }
}

/**
 * Low-level fetch wrapper for TMDB.
 * Adds api_key + language and serializes errors.
 */
async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  assertApiKey();
  const url = new URL(`${TMDB_API_BASE}${path}`);
  url.searchParams.set('api_key', API_KEY!);
  url.searchParams.set('language', 'en-US');
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`TMDB ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const tmdbService = {
  /** Trending — all media types. */
  trending: {
    async all(window: 'day' | 'week' = 'week'): Promise<TMDBPaginatedResponse<TMDBSearchMultiResult>> {
      return tmdbFetch(`/trending/all/${window}`);
    },
    async movies(window: 'day' | 'week' = 'week'): Promise<TMDBPaginatedResponse<TMDBMovie>> {
      return tmdbFetch(`/trending/movie/${window}`);
    },
    async tv(window: 'day' | 'week' = 'week'): Promise<TMDBPaginatedResponse<TMDBTvShow>> {
      return tmdbFetch(`/trending/tv/${window}`);
    },
  },

  /** Popular */
  popular: {
    async movies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
      return tmdbFetch('/movie/popular', { page });
    },
    async tv(page = 1): Promise<TMDBPaginatedResponse<TMDBTvShow>> {
      return tmdbFetch('/tv/popular', { page });
    },
    async anime(page = 1): Promise<TMDBPaginatedResponse<TMDBTvShow>> {
      // Animate genre (16) + origin JP, sorted by popularity
      return tmdbFetch('/discover/tv', {
        page,
        with_genres: 16,
        with_original_language: 'ja',
        sort_by: 'popularity.desc',
      });
    },
  },

  /** Top Rated */
  topRated: {
    async movies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
      return tmdbFetch('/movie/top_rated', { page });
    },
    async tv(page = 1): Promise<TMDBPaginatedResponse<TMDBTvShow>> {
      return tmdbFetch('/tv/top_rated', { page });
    },
    async anime(page = 1): Promise<TMDBPaginatedResponse<TMDBTvShow>> {
      return tmdbFetch('/discover/tv', {
        page,
        with_genres: 16,
        with_original_language: 'ja',
        sort_by: 'vote_average.desc',
        'vote_count.gte': 50,
      });
    },
  },

  /** Recently added (latest releases) */
  recentlyAdded: {
    async movies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
      return tmdbFetch('/movie/now_playing', { page });
    },
    async tv(page = 1): Promise<TMDBPaginatedResponse<TMDBTvShow>> {
      return tmdbFetch('/tv/airing_today', { page });
    },
    async anime(page = 1): Promise<TMDBPaginatedResponse<TMDBTvShow>> {
      return tmdbFetch('/discover/tv', {
        page,
        with_genres: 16,
        with_original_language: 'ja',
        'air_date.gte': new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
        sort_by: 'first_air_date.desc',
      });
    },
  },

  /** Discover (filtered) */
  discover: {
    async movies(page = 1, filters: FilterState = {}): Promise<TMDBPaginatedResponse<TMDBMovie>> {
      const params: Record<string, string | number | boolean | undefined> = {
        page,
        sort_by: filters.sortBy ?? 'popularity.desc',
        'vote_count.gte': 50,
      };
      if (filters.genre) params.with_genres = filters.genre;
      if (filters.year) params.primary_release_year = filters.year;
      if (filters.minRating) params['vote_average.gte'] = filters.minRating;
      return tmdbFetch('/discover/movie', params);
    },
    async tv(page = 1, filters: FilterState = {}): Promise<TMDBPaginatedResponse<TMDBTvShow>> {
      const params: Record<string, string | number | boolean | undefined> = {
        page,
        sort_by: filters.sortBy ?? 'popularity.desc',
        'vote_count.gte': 50,
      };
      if (filters.genre) params.with_genres = filters.genre;
      if (filters.year) params.first_air_date_year = filters.year;
      if (filters.minRating) params['vote_average.gte'] = filters.minRating;
      return tmdbFetch('/discover/tv', params);
    },
    async anime(page = 1, filters: FilterState = {}): Promise<TMDBPaginatedResponse<TMDBTvShow>> {
      const params: Record<string, string | number | boolean | undefined> = {
        page,
        with_genres: 16,
        with_original_language: 'ja',
        sort_by: filters.sortBy ?? 'popularity.desc',
        'vote_count.gte': 30,
      };
      if (filters.year) params.first_air_date_year = filters.year;
      if (filters.minRating) params['vote_average.gte'] = filters.minRating;
      return tmdbFetch('/discover/tv', params);
    },
  },

  /** Details */
  details: {
    async movie(id: number | string): Promise<TMDBMovie> {
      return tmdbFetch(`/movie/${id}`);
    },
    async tv(id: number | string): Promise<TMDBTvShow> {
      return tmdbFetch(`/tv/${id}`);
    },
    async season(tvId: number | string, seasonNumber: number): Promise<TMDBSeason> {
      return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
    },
    async credits(
      type: 'movie' | 'tv',
      id: number | string,
    ): Promise<TMDBCreditResponse> {
      return tmdbFetch(`/${type}/${id}/credits`);
    },
    async videos(
      type: 'movie' | 'tv',
      id: number | string,
    ): Promise<TMDBVideoResponse> {
      return tmdbFetch(`/${type}/${id}/videos`);
    },
    async recommendations(
      type: 'movie' | 'tv',
      id: number | string,
      page = 1,
    ): Promise<TMDBPaginatedResponse<TMDBMovie | TMDBTvShow>> {
      return tmdbFetch(`/${type}/${id}/recommendations`, { page });
    },
    async similar(
      type: 'movie' | 'tv',
      id: number | string,
      page = 1,
    ): Promise<TMDBPaginatedResponse<TMDBMovie | TMDBTvShow>> {
      return tmdbFetch(`/${type}/${id}/similar`, { page });
    },
  },

  /** Search */
  search: {
    async multi(query: string, page = 1): Promise<TMDBPaginatedResponse<TMDBSearchMultiResult>> {
      return tmdbFetch('/search/multi', { query, page, include_adult: false });
    },
    async movies(query: string, page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
      return tmdbFetch('/search/movie', { query, page, include_adult: false });
    },
    async tv(query: string, page = 1): Promise<TMDBPaginatedResponse<TMDBTvShow>> {
      return tmdbFetch('/search/tv', { query, page, include_adult: false });
    },
    /** Instant suggestions (multi, page 1, top results). */
    async suggestions(query: string): Promise<TMDBSearchMultiResult[]> {
      if (!query.trim()) return [];
      const res = await this.multi(query, 1);
      return res.results
        .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
        .slice(0, 8);
    },
  },

  /** Genres */
  genres: {
    async movies(): Promise<{ genres: TMDBGenre[] }> {
      return tmdbFetch('/genre/movie/list');
    },
    async tv(): Promise<{ genres: TMDBGenre[] }> {
      return tmdbFetch('/genre/tv/list');
    },
  },

  /** Helper: type-safe access to detail by category. */
  async detailByCategory(
    category: MediaCategory,
    id: number | string,
  ): Promise<TMDBMovie | TMDBTvShow> {
    if (category === 'movie') return this.details.movie(id);
    return this.details.tv(id); // tv + anime both use /tv endpoint
  },

  /** Helper: extract "title" from movie OR tv. */
  getTitle(item: TMDBMovie | TMDBTvShow | TMDBSearchMultiResult): string {
    if ('title' in item && item.title) return item.title;
    if ('name' in item && item.name) return item.name;
    return 'Untitled';
  },

  /** Helper: extract release date. */
  getReleaseDate(item: TMDBMovie | TMDBTvShow | TMDBSearchMultiResult): string | null {
    if ('release_date' in item && item.release_date) return item.release_date;
    if ('first_air_date' in item && item.first_air_date) return item.first_air_date;
    return null;
  },

  /** Pick the best YouTube trailer key. */
  pickTrailerKey(videos: TMDBVideo[]): string | null {
    if (!videos?.length) return null;
    const yt = videos.filter((v) => v.site === 'YouTube');
    if (yt.length === 0) return null;
    const trailer =
      yt.find((v) => v.type === 'Trailer' && v.official) ??
      yt.find((v) => v.type === 'Trailer') ??
      yt.find((v) => v.type === 'Teaser') ??
      yt[0]!;
    return trailer.key;
  },

  /** Cast: top N. */
  topCast(cast: TMDBCastMember[], n = 12): TMDBCastMember[] {
    return [...cast].sort((a, b) => a.order - b.order).slice(0, n);
  },

  /** Get next episode (1-based, wraps to next season if needed). */
  getNextEpisode(
    seasons: TMDBSeason[] | undefined,
    currentSeason: number,
    currentEpisode: number,
  ): { season: number; episode: number } | null {
    if (!seasons?.length) return null;
    const validSeasons = seasons.filter((s) => s.season_number > 0 && (s.episode_count ?? 0) > 0);
    if (!validSeasons.length) return null;
    const season = validSeasons.find((s) => s.season_number === currentSeason);
    if (!season) return null;
    if (currentEpisode < season.episode_count) {
      return { season: currentSeason, episode: currentEpisode + 1 };
    }
    const idx = validSeasons.findIndex((s) => s.season_number === currentSeason);
    const next = validSeasons[idx + 1];
    if (!next) return null;
    return { season: next.season_number!, episode: 1 };
  },

  /** Get previous episode. */
  getPrevEpisode(
    seasons: TMDBSeason[] | undefined,
    currentSeason: number,
    currentEpisode: number,
  ): { season: number; episode: number } | null {
    if (!seasons?.length) return null;
    const validSeasons = seasons.filter((s) => s.season_number > 0 && (s.episode_count ?? 0) > 0);
    if (!validSeasons.length) return null;
    if (currentEpisode > 1) {
      return { season: currentSeason, episode: currentEpisode - 1 };
    }
    const idx = validSeasons.findIndex((s) => s.season_number === currentSeason);
    if (idx <= 0) return null;
    const prev = validSeasons[idx - 1]!;
    return { season: prev.season_number!, episode: prev.episode_count };
  },

  /** Get episodes for a season (with details). */
  async getEpisodes(
    tvId: number | string,
    seasonNumber: number,
  ): Promise<TMDBEpisode[]> {
    const season = await this.details.season(tvId, seasonNumber);
    return season.episodes ?? [];
  },
};

export type { TMDBEpisode };
