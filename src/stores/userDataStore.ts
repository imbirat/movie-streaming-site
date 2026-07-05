import { create } from 'zustand';

import type { FavoriteItem, MediaCategory, WatchProgressItem, WatchlistItem } from '@/types';

interface UserDataState {
  watchlist: WatchlistItem[];
  favorites: FavoriteItem[];
  continueWatching: WatchProgressItem[];
  isLoading: boolean;

  setWatchlist: (items: WatchlistItem[]) => void;
  setFavorites: (items: FavoriteItem[]) => void;
  setContinueWatching: (items: WatchProgressItem[]) => void;
  setLoading: (loading: boolean) => void;

  isInWatchlist: (tmdbId: number, type: MediaCategory) => boolean;
  isInFavorites: (tmdbId: number, type: MediaCategory) => boolean;

  clear: () => void;
}

export const useUserDataStore = create<UserDataState>((set, get) => ({
  watchlist: [],
  favorites: [],
  continueWatching: [],
  isLoading: false,

  setWatchlist: (items) => set({ watchlist: items }),
  setFavorites: (items) => set({ favorites: items }),
  setContinueWatching: (items) => set({ continueWatching: items }),
  setLoading: (loading) => set({ isLoading: loading }),

  isInWatchlist: (tmdbId, type) =>
    get().watchlist.some((i) => i.tmdbId === tmdbId && i.type === type),

  isInFavorites: (tmdbId, type) =>
    get().favorites.some((i) => i.tmdbId === tmdbId && i.type === type),

  clear: () =>
    set({ watchlist: [], favorites: [], continueWatching: [], isLoading: false }),
}));
