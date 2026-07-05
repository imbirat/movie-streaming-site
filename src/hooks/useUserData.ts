import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { favoritesService, watchlistService, watchProgressService } from '@/services/firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useUserDataStore } from '@/stores/userDataStore';
import type { MediaCategory } from '@/types';

/**
 * Subscribes to the current user's watchlist / favorites / watch progress.
 * Re-subscribes whenever the user changes.
 */
export function useUserData() {
  const user = useAuthStore((s) => s.user);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const {
    setWatchlist,
    setFavorites,
    setContinueWatching,
    setLoading,
  } = useUserDataStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid) {
      setWatchlist([]);
      setFavorites([]);
      setContinueWatching([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubW = watchlistService.subscribe(uid, (items) => {
      setWatchlist(items);
    });
    const unsubF = favoritesService.subscribe(uid, (items) => {
      setFavorites(items);
    });
    const unsubP = watchProgressService.subscribe(uid, (items) => {
      setContinueWatching(items);
    });

    setError(null);
    setLoading(false);

    return () => {
      unsubW();
      unsubF();
      unsubP();
    };
  }, [firebaseUser?.uid, setWatchlist, setFavorites, setContinueWatching, setLoading]);

  return { user, error };
}

interface MediaMeta {
  tmdbId: number;
  type: MediaCategory;
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
}

/**
 * Watchlist actions.
 */
export function useWatchlistActions() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  return {
    async add(meta: MediaMeta): Promise<boolean> {
      if (!firebaseUser) {
        toast.error('Please sign in to use your watchlist.');
        return false;
      }
      try {
        const id = await watchlistService.add(firebaseUser.uid, meta);
        if (id === null) {
          toast.info('Already in your watchlist.');
          return false;
        }
        toast.success('Added to watchlist.');
        return true;
      } catch (err) {
        console.error('[watchlist] add error:', err);
        toast.error('Could not add to watchlist.');
        return false;
      }
    },

    async removeByMedia(tmdbId: number, type: MediaCategory): Promise<void> {
      if (!firebaseUser) return;
      try {
        await watchlistService.removeByMedia(firebaseUser.uid, tmdbId, type);
        toast.success('Removed from watchlist.');
      } catch (err) {
        console.error('[watchlist] remove error:', err);
        toast.error('Could not remove from watchlist.');
      }
    },

    async toggle(meta: MediaMeta, isCurrentlyInList: boolean): Promise<void> {
      if (isCurrentlyInList) await this.removeByMedia(meta.tmdbId, meta.type);
      else await this.add(meta);
    },
  };
}

/**
 * Favorites actions.
 */
export function useFavoritesActions() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  return {
    async add(meta: MediaMeta): Promise<boolean> {
      if (!firebaseUser) {
        toast.error('Please sign in to use favorites.');
        return false;
      }
      try {
        const id = await favoritesService.add(firebaseUser.uid, meta);
        if (id === null) {
          toast.info('Already in favorites.');
          return false;
        }
        toast.success('Added to favorites.');
        return true;
      } catch (err) {
        console.error('[favorites] add error:', err);
        toast.error('Could not add to favorites.');
        return false;
      }
    },

    async removeByMedia(tmdbId: number, type: MediaCategory): Promise<void> {
      if (!firebaseUser) return;
      try {
        await favoritesService.removeByMedia(firebaseUser.uid, tmdbId, type);
        toast.success('Removed from favorites.');
      } catch (err) {
        console.error('[favorites] remove error:', err);
        toast.error('Could not remove from favorites.');
      }
    },

    async toggle(meta: MediaMeta, isCurrentlyFav: boolean): Promise<void> {
      if (isCurrentlyFav) await this.removeByMedia(meta.tmdbId, meta.type);
      else await this.add(meta);
    },
  };
}

/**
 * Watch progress actions.
 */
export function useWatchProgressActions() {
  const firebaseUser = useAuthStore((s) => s.firebaseUser);

  return {
    async save(
      meta: MediaMeta & { season?: number; episode?: number; currentTime: number; duration: number },
    ): Promise<void> {
      if (!firebaseUser) return; // silently skip — not signed in
      try {
        await watchProgressService.upsert(firebaseUser.uid, meta);
      } catch (err) {
        console.error('[watchProgress] save error:', err);
      }
    },

    async removeByMedia(tmdbId: number, type: MediaCategory): Promise<void> {
      if (!firebaseUser) return;
      try {
        await watchProgressService.removeByMedia(firebaseUser.uid, tmdbId, type);
      } catch (err) {
        console.error('[watchProgress] remove error:', err);
      }
    },
  };
}
