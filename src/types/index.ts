/**
 * TMDB-related types
 */

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: TMDBGenre[];
  popularity: number;
  adult?: boolean;
  original_language?: string;
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_companies?: TMDBCompany[];
  spoken_languages?: TMDBLanguage[];
  homepage?: string;
  imdb_id?: string;
}

export interface TMDBTvShow {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  last_air_date?: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: TMDBGenre[];
  popularity: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  seasons?: TMDBSeason[];
  status?: string;
  tagline?: string;
  production_companies?: TMDBCompany[];
  networks?: TMDBCompany[];
  spoken_languages?: TMDBLanguage[];
  homepage?: string;
  origin_country?: string[];
  original_language?: string;
  in_production?: boolean;
  type?: string;
  last_episode_to_air?: TMDBEpisode;
  next_episode_to_air?: TMDBEpisode | null;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country?: string;
}

export interface TMDBLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  episodes?: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  cast_id?: number;
  credit_id?: string;
  gender?: number;
}

export interface TMDBCreditResponse {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
  size: number;
}

export interface TMDBVideoResponse {
  id: number;
  results: TMDBVideo[];
}

export interface TMDBSearchMultiResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  // Movie fields
  title?: string;
  original_title?: string;
  release_date?: string;
  // TV fields
  name?: string;
  original_name?: string;
  first_air_date?: string;
  // Common
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  popularity?: number;
  // Person
  profile_path?: string | null;
  known_for?: TMDBSearchMultiResult[];
}

/**
 * Local app types
 */

export type MediaCategory = 'movie' | 'tv' | 'anime';

export interface WatchlistItem {
  id: string;
  uid: string;
  tmdbId: number;
  type: MediaCategory;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  addedAt: number;
}

export interface FavoriteItem {
  id: string;
  uid: string;
  tmdbId: number;
  type: MediaCategory;
  title: string;
  posterPath: string | null;
  addedAt: number;
}

export interface WatchProgressItem {
  id: string;
  uid: string;
  tmdbId: number;
  type: MediaCategory;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  season?: number;
  episode?: number;
  currentTime: number;
  duration: number;
  updatedAt: number;
}

export interface UserSettings {
  id: string;
  uid: string;
  theme: 'dark' | 'light' | 'system';
  autoplay: boolean;
  preferredServer: string;
  subtitlesEnabled: boolean;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  photoURL: string | null;
  createdAt: number;
}

export interface StreamingProvider {
  id: string;
  name: string;
  description: string;
  getUrl(params: StreamingParams): string;
}

export interface StreamingParams {
  type: 'movie' | 'tv';
  id: number;
  season?: number;
  episode?: number;
}

export interface FilterState {
  genre?: number;
  year?: number;
  minRating?: number;
  sortBy?: 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'title.asc';
}

export interface AuthFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues extends AuthFormValues {
  username: string;
  confirmPassword: string;
}
