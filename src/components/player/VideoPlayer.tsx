import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Server,
  Settings,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { serverManager, STREAMING_PROVIDERS } from '@/services/streaming/providers';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWatchProgressActions } from '@/hooks/useUserData';
import { useDetail, useSeason } from '@/hooks/useTmdb';
import { cn } from '@/lib/utils';
import type { MediaCategory } from '@/types';

interface VideoPlayerProps {
  type: 'movie' | 'tv';
  id: number | string;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  category?: MediaCategory;
  season?: number;
  episode?: number;
}

/**
 * Full-featured watch page: video iframe + server selector + episode list (TV) +
 * continue-watching tracking.
 */
export function VideoPlayer({
  type,
  id,
  title,
  posterPath,
  backdropPath,
  category,
  season,
  episode,
}: VideoPlayerProps) {
  const navigate = useNavigate();
  const preferredServer = useSettingsStore((s) => s.preferredServer);
  const setPreferredServer = useSettingsStore((s) => s.setPreferredServer);
  const progressActions = useWatchProgressActions();

  const [serverId, setServerId] = useState<string>(preferredServer);
  const [episodeListOpen, setEpisodeListOpen] = useState(false);
  const saveTimerRef = useRef<number | null>(null);

  // Detail + season (for TV/anime episode navigation)
  const isTv = type === 'tv';
  const { data: detail } = useDetail(category ?? 'tv', id);
  const seasons = isTv && detail && 'seasons' in detail ? detail.seasons : undefined;
  const [activeSeason, setActiveSeason] = useState<number>(season ?? 1);
  const { data: seasonData } = useSeason(isTv ? id : undefined, activeSeason);
  const episodes = seasonData?.episodes ?? [];

  // Compute the stream URL
  const streamUrl = useMemo(() => {
    return serverManager.getUrl(serverId, {
      type,
      id: Number(id),
      season: isTv ? activeSeason : undefined,
      episode: isTv ? episode ?? 1 : undefined,
    });
  }, [serverId, type, id, isTv, activeSeason, episode]);

  // Save watch progress periodically (simulated via localStorage since we can't
  // access iframe currentTime cross-origin). For a real implementation you'd
  // use postMessage with a friendly embed provider, or a custom player.
  useEffect(() => {
    if (saveTimerRef.current) window.clearInterval(saveTimerRef.current);
    if (!title) return;

    saveTimerRef.current = window.setInterval(() => {
      // Simulated progress: store every 30s as a fraction of the runtime.
      const runtime = type === 'movie' ? 90 * 60 : 24 * 60;
      void progressActions.save({
        tmdbId: Number(id),
        type: (category ?? (type === 'movie' ? 'movie' : 'tv')) as MediaCategory,
        title,
        posterPath: posterPath ?? null,
        backdropPath: backdropPath ?? null,
        season: isTv ? activeSeason : undefined,
        episode: isTv ? episode : undefined,
        currentTime: Math.min(runtime, 30 * 60),
        duration: runtime,
      });
    }, 30_000);

    return () => {
      if (saveTimerRef.current) window.clearInterval(saveTimerRef.current);
    };
  }, [id, title, type, isTv, activeSeason, episode, category, posterPath, backdropPath, progressActions]);

  // Persist last-used server
  useEffect(() => {
    if (serverId !== preferredServer) setPreferredServer(serverId);
  }, [serverId, preferredServer, setPreferredServer]);

  // Episode navigation
  const currentSeasonNum = isTv ? activeSeason : 1;
  const currentEpisodeNum = isTv ? episode ?? 1 : 1;
  const totalEpisodes = episodes.length;

  function goPrevEpisode() {
    if (currentEpisodeNum > 1) {
      navigate(`/watch/${type === 'movie' ? 'movie' : 'tv'}/${id}/${currentSeasonNum}/${currentEpisodeNum - 1}`);
    } else {
      // Find previous season
      const prevSeason = seasons
        ?.filter((s) => s.season_number > 0)
        .sort((a, b) => b.season_number - a.season_number)
        .find((s) => s.season_number < currentSeasonNum);
      if (prevSeason) {
        navigate(`/watch/tv/${id}/${prevSeason.season_number}/${prevSeason.episode_count}`);
      }
    }
  }

  function goNextEpisode() {
    if (currentEpisodeNum < totalEpisodes) {
      navigate(`/watch/tv/${id}/${currentSeasonNum}/${currentEpisodeNum + 1}`);
    } else {
      const nextSeason = seasons
        ?.filter((s) => s.season_number > 0)
        .sort((a, b) => a.season_number - b.season_number)
        .find((s) => s.season_number > currentSeasonNum);
      if (nextSeason) {
        navigate(`/watch/tv/${id}/${nextSeason.season_number}/1`);
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
          <p className="text-xs text-white/60">
            {isTv ? `Season ${currentSeasonNum} • Episode ${currentEpisodeNum}` : 'Movie'}
          </p>
        </div>

        {/* Server selector */}
        <Select value={serverId} onValueChange={setServerId}>
          <SelectTrigger className="h-9 w-40 border-white/20 bg-white/5 text-xs text-white">
            <div className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {STREAMING_PROVIDERS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Episode list (TV) */}
        {isTv && seasons && seasons.length > 0 && (
          <Sheet open={episodeListOpen} onOpenChange={setEpisodeListOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label="Episodes">
                <List className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 border-white/10 bg-zinc-950 p-0 text-white sm:w-96">
              <SheetHeader className="border-b border-white/10 p-4">
                <SheetTitle className="text-white">Episodes</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 p-3">
                <Select value={String(activeSeason)} onValueChange={(v) => setActiveSeason(Number(v))}>
                  <SelectTrigger className="border-white/20 bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons
                      .filter((s) => s.season_number > 0)
                      .map((s) => (
                        <SelectItem key={s.id} value={String(s.season_number)}>
                          {s.name} ({s.episode_count} eps)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <div className="mt-2 max-h-[70vh] space-y-1 overflow-y-auto scrollbar-thin">
                  {episodes.map((ep) => {
                    const isCurrent = ep.episode_number === currentEpisodeNum;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => {
                          navigate(`/watch/tv/${id}/${activeSeason}/${ep.episode_number}`);
                          setEpisodeListOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors',
                          isCurrent ? 'bg-white/10' : 'hover:bg-white/5',
                        )}
                      >
                        <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-white/10 text-xs font-semibold">
                          {ep.still_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${ep.still_path}`}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            `E${ep.episode_number}`
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium">
                            E{ep.episode_number}. {ep.name}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-white/60">
                            {ep.overview || 'No description.'}
                          </p>
                        </div>
                        {isCurrent && (
                          <Badge variant="brand" className="shrink-0 text-[10px]">
                            Playing
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Player */}
      <div className="relative flex flex-1 items-center justify-center bg-black">
        <div className="aspect-video w-full max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.iframe
              key={streamUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={streamUrl}
              title={title}
              className="h-full w-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              referrerPolicy="origin"
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom controls (TV only) */}
      {isTv && (
        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-zinc-950 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-white hover:bg-white/10"
            onClick={goPrevEpisode}
            disabled={currentEpisodeNum === 1 && !seasons?.some((s) => s.season_number < currentSeasonNum && s.season_number > 0)}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <span className="text-xs text-white/60">
            Episode {currentEpisodeNum} of {totalEpisodes}
          </span>
          <Button
            variant="brand"
            size="sm"
            className="gap-1.5"
            onClick={goNextEpisode}
            disabled={currentEpisodeNum >= totalEpisodes && !seasons?.some((s) => s.season_number > currentSeasonNum)}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
