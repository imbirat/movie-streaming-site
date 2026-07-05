import type { StreamingProvider, StreamingParams } from '@/types';

/**
 * Streaming Provider Abstraction Layer
 * -------------------------------------
 * Each provider implements the StreamingProvider interface.
 * To add a new provider:
 *   1. Add an entry to `STREAMING_PROVIDERS` below.
 *   2. Implement `getUrl({ type, id, season, episode })`.
 *   3. (Optional) add it to the user-facing default list.
 *
 * The `serverManager` exposes a single API:
 *   serverManager.getUrl(providerId, params)
 *   serverManager.getAll(params)  // returns all provider URLs
 */

const vidlink: StreamingProvider = {
  id: 'vidlink',
  name: 'VidLink',
  description: 'Fast, reliable multi-source embed with subtitles.',
  getUrl({ type, id, season, episode }: StreamingParams): string {
    if (type === 'movie') return `https://vidlink.pro/movie/${id}`;
    return `https://vidlink.pro/tv/${id}/${season ?? 1}/${episode ?? 1}`;
  },
};

const vidsrc: StreamingProvider = {
  id: 'vidsrc',
  name: 'VidSrc',
  description: 'Popular embed provider, wide catalog.',
  getUrl({ type, id, season, episode }: StreamingParams): string {
    if (type === 'movie') return `https://vidsrc.to/embed/movie/${id}`;
    return `https://vidsrc.to/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`;
  },
};

const multiembed: StreamingProvider = {
  id: 'multiembed',
  name: 'MultiEmbed',
  description: 'Multi-host aggregator with fallback sources.',
  getUrl({ type, id, season, episode }: StreamingParams): string {
    if (type === 'movie') return `https://multiembed.mov/?video_id=${id}`;
    return `https://multiembed.mov/?video_id=${id}&s=${season ?? 1}&e=${episode ?? 1}`;
  },
};

const twoembed: StreamingProvider = {
  id: '2embed',
  name: '2Embed',
  description: 'High-quality streams with backup mirrors.',
  getUrl({ type, id, season, episode }: StreamingParams): string {
    if (type === 'movie') return `https://www.2embed.cc/embed/${id}`;
    return `https://www.2embed.cc/embedtv/${id}&s=${season ?? 1}&e=${episode ?? 1}`;
  },
};

export const STREAMING_PROVIDERS: StreamingProvider[] = [
  vidlink,
  vidsrc,
  multiembed,
  twoembed,
];

export const DEFAULT_PROVIDER_ID = 'vidlink';

export const serverManager = {
  /** List all registered providers. */
  list(): StreamingProvider[] {
    return STREAMING_PROVIDERS;
  },

  /** Find a single provider by id. */
  get(providerId: string): StreamingProvider | undefined {
    return STREAMING_PROVIDERS.find((p) => p.id === providerId);
  },

  /** Get a stream URL for a single provider. */
  getUrl(providerId: string, params: StreamingParams): string {
    const provider = this.get(providerId) ?? STREAMING_PROVIDERS[0]!;
    return provider.getUrl(params);
  },

  /** Get URLs for every provider (handy for "all servers" UI). */
  getAll(params: StreamingParams): { id: string; name: string; url: string }[] {
    return STREAMING_PROVIDERS.map((p) => ({ id: p.id, name: p.name, url: p.getUrl(params) }));
  },

  /** Default provider. */
  default(): StreamingProvider {
    return this.get(DEFAULT_PROVIDER_ID) ?? STREAMING_PROVIDERS[0]!;
  },
};
