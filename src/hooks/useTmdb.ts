import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { tmdbService } from '@/services/tmdb';
import type {
  FilterState,
  MediaCategory,
  TMDBMovie,
  TMDBPaginatedResponse,
  TMDBSearchMultiResult,
  TMDBTvShow,
} from '@/types';

/**
 * Hooks wrap TanStack Query for caching + dedup.
 * Cache keys are namespaced under 'tmdb'.
 */

const KEYS = {
  trending: (window: 'day' | 'week') => ['tmdb', 'trending', 'all', window] as const,
  trendingMovies: (window: 'day' | 'week') => ['tmdb', 'trending', 'movie', window] as const,
  trendingTv: (window: 'day' | 'week') => ['tmdb', 'trending', 'tv', window] as const,
  popular: (cat: MediaCategory) => ['tmdb', 'popular', cat] as const,
  topRated: (cat: MediaCategory) => ['tmdb', 'topRated', cat] as const,
  recentlyAdded: (cat: MediaCategory) => ['tmdb', 'recentlyAdded', cat] as const,
  detail: (cat: MediaCategory, id: number | string) => ['tmdb', 'detail', cat, id] as const,
  credits: (cat: MediaCategory, id: number | string) => ['tmdb', 'credits', cat, id] as const,
  videos: (cat: MediaCategory, id: number | string) => ['tmdb', 'videos', cat, id] as const,
  recommendations: (cat: MediaCategory, id: number | string) =>
    ['tmdb', 'recommendations', cat, id] as const,
  similar: (cat: MediaCategory, id: number | string) => ['tmdb', 'similar', cat, id] as const,
  season: (tvId: number | string, season: number) =>
    ['tmdb', 'season', tvId, season] as const,
  discover: (cat: MediaCategory, filters: FilterState) =>
    ['tmdb', 'discover', cat, filters] as const,
  search: (type: 'multi' | 'movie' | 'tv', query: string) =>
    ['tmdb', 'search', type, query] as const,
  suggestions: (query: string) => ['tmdb', 'suggestions', query] as const,
};

export function useTrendingAll(window: 'day' | 'week' = 'week') {
  return useQuery({
    queryKey: KEYS.trending(window),
    queryFn: () => tmdbService.trending.all(window),
  });
}

export function useTrendingMovies(window: 'day' | 'week' = 'week') {
  return useQuery({
    queryKey: KEYS.trendingMovies(window),
    queryFn: () => tmdbService.trending.movies(window),
  });
}

export function useTrendingTv(window: 'day' | 'week' = 'week') {
  return useQuery({
    queryKey: KEYS.trendingTv(window),
    queryFn: () => tmdbService.trending.tv(window),
  });
}

type AnyListResult = TMDBPaginatedResponse<TMDBMovie> | TMDBPaginatedResponse<TMDBTvShow>;

export function usePopular(category: MediaCategory) {
  return useQuery<AnyListResult>({
    queryKey: KEYS.popular(category),
    queryFn: async () => {
      if (category === 'movie') return tmdbService.popular.movies(1);
      if (category === 'tv') return tmdbService.popular.tv(1);
      return tmdbService.popular.anime(1);
    },
  });
}

export function useTopRated(category: MediaCategory) {
  return useQuery<AnyListResult>({
    queryKey: KEYS.topRated(category),
    queryFn: async () => {
      if (category === 'movie') return tmdbService.topRated.movies(1);
      if (category === 'tv') return tmdbService.topRated.tv(1);
      return tmdbService.topRated.anime(1);
    },
  });
}

export function useRecentlyAdded(category: MediaCategory) {
  return useQuery<AnyListResult>({
    queryKey: KEYS.recentlyAdded(category),
    queryFn: async () => {
      if (category === 'movie') return tmdbService.recentlyAdded.movies(1);
      if (category === 'tv') return tmdbService.recentlyAdded.tv(1);
      return tmdbService.recentlyAdded.anime(1);
    },
  });
}

export function useDetail(category: MediaCategory, id: number | string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(category, id ?? ''),
    queryFn: () => tmdbService.detailByCategory(category, id!),
    enabled: Boolean(id),
  });
}

export function useCredits(category: MediaCategory, id: number | string | undefined) {
  const type = category === 'movie' ? 'movie' : 'tv';
  return useQuery({
    queryKey: KEYS.credits(category, id ?? ''),
    queryFn: () => tmdbService.details.credits(type, id!),
    enabled: Boolean(id),
  });
}

export function useVideos(category: MediaCategory, id: number | string | undefined) {
  const type = category === 'movie' ? 'movie' : 'tv';
  return useQuery({
    queryKey: KEYS.videos(category, id ?? ''),
    queryFn: () => tmdbService.details.videos(type, id!),
    enabled: Boolean(id),
  });
}

export function useRecommendations(category: MediaCategory, id: number | string | undefined) {
  const type = category === 'movie' ? 'movie' : 'tv';
  return useQuery({
    queryKey: KEYS.recommendations(category, id ?? ''),
    queryFn: () => tmdbService.details.recommendations(type, id!, 1),
    enabled: Boolean(id),
  });
}

export function useSimilar(category: MediaCategory, id: number | string | undefined) {
  const type = category === 'movie' ? 'movie' : 'tv';
  return useQuery({
    queryKey: KEYS.similar(category, id ?? ''),
    queryFn: () => tmdbService.details.similar(type, id!, 1),
    enabled: Boolean(id),
  });
}

export function useSeason(tvId: number | string | undefined, season: number | undefined) {
  return useQuery({
    queryKey: KEYS.season(tvId ?? '', season ?? 0),
    queryFn: () => tmdbService.details.season(tvId!, season!),
    enabled: Boolean(tvId) && Boolean(season),
  });
}

export function useDiscoverInfinite(category: MediaCategory, filters: FilterState = {}) {
  return useInfiniteQuery({
    queryKey: KEYS.discover(category, filters),
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const page = pageParam ?? 1;
      if (category === 'movie') return tmdbService.discover.movies(page, filters);
      if (category === 'tv') return tmdbService.discover.tv(page, filters);
      return tmdbService.discover.anime(page, filters);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: AnyListResult) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    maxPages: 50,
  });
}

export function useSearchMulti(query: string, enabled = true) {
  return useQuery({
    queryKey: KEYS.search('multi', query),
    queryFn: () => tmdbService.search.multi(query, 1),
    enabled: enabled && query.trim().length > 1,
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: KEYS.suggestions(query),
    queryFn: () => tmdbService.search.suggestions(query),
    enabled: query.trim().length > 1,
    staleTime: 1000 * 60 * 2,
  });
}
