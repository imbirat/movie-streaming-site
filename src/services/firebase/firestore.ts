import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore';

import { db, firebaseReady } from './config';
import type { FavoriteItem, MediaCategory, WatchProgressItem, WatchlistItem } from '@/types';

function assertReady(): void {
  if (!firebaseReady || !db) {
    throw new Error(
      'Firestore is not configured. Please set VITE_FIREBASE_* environment variables.',
    );
  }
}

/** Watchlists */
export const watchlistService = {
  subscribe(uid: string, cb: (items: WatchlistItem[]) => void): () => void {
    assertReady();
    const q = query(
      collection(db!, 'watchlists'),
      where('uid', '==', uid),
      orderBy('addedAt', 'desc'),
    );
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WatchlistItem);
        cb(items);
      },
      (err) => console.error('[watchlist] subscribe error:', err),
    );
  },

  async add(
    uid: string,
    item: Omit<WatchlistItem, 'id' | 'uid' | 'addedAt'>,
  ): Promise<string | null> {
    assertReady();
    // Avoid duplicates
    const existing = await getDocs(
      query(
        collection(db!, 'watchlists'),
        where('uid', '==', uid),
        where('tmdbId', '==', item.tmdbId),
        where('type', '==', item.type),
      ),
    );
    if (!existing.empty) return null;

    const ref = await addDoc(collection(db!, 'watchlists'), {
      ...item,
      uid,
      addedAt: Date.now(),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async remove(id: string): Promise<void> {
    assertReady();
    await deleteDoc(doc(db!, 'watchlists', id));
  },

  async removeByMedia(uid: string, tmdbId: number, type: MediaCategory): Promise<void> {
    assertReady();
    const q = query(
      collection(db!, 'watchlists'),
      where('uid', '==', uid),
      where('tmdbId', '==', tmdbId),
      where('type', '==', type),
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  },

  async exists(uid: string, tmdbId: number, type: MediaCategory): Promise<boolean> {
    assertReady();
    const q = query(
      collection(db!, 'watchlists'),
      where('uid', '==', uid),
      where('tmdbId', '==', tmdbId),
      where('type', '==', type),
    );
    const snap = await getDocs(q);
    return !snap.empty;
  },
};

/** Favorites */
export const favoritesService = {
  subscribe(uid: string, cb: (items: FavoriteItem[]) => void): () => void {
    assertReady();
    const q = query(
      collection(db!, 'favorites'),
      where('uid', '==', uid),
      orderBy('addedAt', 'desc'),
    );
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FavoriteItem);
        cb(items);
      },
      (err) => console.error('[favorites] subscribe error:', err),
    );
  },

  async add(
    uid: string,
    item: Omit<FavoriteItem, 'id' | 'uid' | 'addedAt'>,
  ): Promise<string | null> {
    assertReady();
    const existing = await getDocs(
      query(
        collection(db!, 'favorites'),
        where('uid', '==', uid),
        where('tmdbId', '==', item.tmdbId),
        where('type', '==', item.type),
      ),
    );
    if (!existing.empty) return null;

    const ref = await addDoc(collection(db!, 'favorites'), {
      ...item,
      uid,
      addedAt: Date.now(),
      createdAt: serverTimestamp(),
    });
    return ref.id;
  },

  async remove(id: string): Promise<void> {
    assertReady();
    await deleteDoc(doc(db!, 'favorites', id));
  },

  async removeByMedia(uid: string, tmdbId: number, type: MediaCategory): Promise<void> {
    assertReady();
    const q = query(
      collection(db!, 'favorites'),
      where('uid', '==', uid),
      where('tmdbId', '==', tmdbId),
      where('type', '==', type),
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  },

  async exists(uid: string, tmdbId: number, type: MediaCategory): Promise<boolean> {
    assertReady();
    const q = query(
      collection(db!, 'favorites'),
      where('uid', '==', uid),
      where('tmdbId', '==', tmdbId),
      where('type', '==', type),
    );
    const snap = await getDocs(q);
    return !snap.empty;
  },
};

/** Watch Progress (Continue Watching) */
export const watchProgressService = {
  subscribe(uid: string, cb: (items: WatchProgressItem[]) => void): () => void {
    assertReady();
    const q = query(
      collection(db!, 'watchProgress'),
      where('uid', '==', uid),
      orderBy('updatedAt', 'desc'),
    );
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WatchProgressItem);
        cb(items);
      },
      (err) => console.error('[watchProgress] subscribe error:', err),
    );
  },

  async upsert(
    uid: string,
    item: Omit<WatchProgressItem, 'id' | 'uid' | 'updatedAt'>,
  ): Promise<void> {
    assertReady();
    const q = query(
      collection(db!, 'watchProgress'),
      where('uid', '==', uid),
      where('tmdbId', '==', item.tmdbId),
      where('type', '==', item.type),
    );
    const snap = await getDocs(q);

    const payload = {
      ...item,
      uid,
      updatedAt: Date.now(),
      updatedServerAt: serverTimestamp(),
    };

    if (snap.empty) {
      await addDoc(collection(db!, 'watchProgress'), payload);
    } else {
      const ref = snap.docs[0]!.ref;
      await updateDoc(ref, payload);
    }
  },

  async remove(id: string): Promise<void> {
    assertReady();
    await deleteDoc(doc(db!, 'watchProgress', id));
  },

  async removeByMedia(uid: string, tmdbId: number, type: MediaCategory): Promise<void> {
    assertReady();
    const q = query(
      collection(db!, 'watchProgress'),
      where('uid', '==', uid),
      where('tmdbId', '==', tmdbId),
      where('type', '==', type),
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  },
};

/** User settings */
export const userSettingsService = {
  async get(uid: string): Promise<Record<string, unknown> | null> {
    assertReady();
    const ref = doc(db!, 'userSettings', uid);
    const snap = await getDocSafe(ref);
    return snap ? { id: snap.id, ...snap.data() } : null;
  },

  async update(
    uid: string,
    settings: Record<string, unknown>,
  ): Promise<void> {
    assertReady();
    const ref = doc(db!, 'userSettings', uid);
    await updateDoc(ref, { ...settings, updatedAt: serverTimestamp() }).catch(async () => {
      // Document doesn't exist yet, create it
      await setDocSafe(ref, { ...settings, updatedAt: serverTimestamp() });
    });
  },
};

// Internal helpers (kept local to avoid extra imports above)
import { getDoc as getDocSafe, setDoc as setDocSafe } from 'firebase/firestore';

export function timestampToDate(ts: unknown): Date | null {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  if (typeof ts === 'object' && ts !== null && 'toMillis' in ts && typeof (ts as { toMillis: unknown }).toMillis === 'function') {
    return new Date((ts as { toMillis: () => number }).toMillis());
  }
  return null;
}

export { collection, query, where, orderBy };
export type { QueryConstraint };
