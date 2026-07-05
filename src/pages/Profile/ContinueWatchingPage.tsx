import { Link } from 'react-router-dom';
import { MonitorPlay, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ContinueWatchingCard } from '@/components/movie/ContinueWatchingCard';
import { Button } from '@/components/ui/button';
import { SignInRequired, useRequireAuth } from '@/components/common/SignInRequired';
import { useUserDataStore } from '@/stores/userDataStore';
import { useWatchProgressActions } from '@/hooks/useUserData';
import { ROUTES } from '@/lib/constants';

export default function ContinueWatchingPage() {
  const continueWatching = useUserDataStore((s) => s.continueWatching);
  const progressActions = useWatchProgressActions();
  const { needsAuth } = useRequireAuth();

  if (needsAuth) {
    return <SignInRequired title="Continue watching where you left off" description="Sign in to sync your watch progress across all your devices." />;
  }

  function handleRemove(id: string, tmdbId: number, type: 'movie' | 'tv' | 'anime') {
    void progressActions.removeByMedia(tmdbId, type);
    toast.success('Removed from Continue Watching.');
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <MonitorPlay className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Continue Watching</h1>
          <p className="text-sm text-muted-foreground">
            {continueWatching.length === 0
              ? 'You have no in-progress titles.'
              : `${continueWatching.length} title${continueWatching.length === 1 ? '' : 's'} in progress.`}
          </p>
        </div>
      </div>

      {continueWatching.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center text-muted-foreground">
          <MonitorPlay className="mb-3 h-12 w-12 opacity-40" />
          <p className="font-display text-xl font-semibold">Nothing in progress</p>
          <p className="mt-1 text-sm">Start watching something and we'll save your progress here.</p>
          <Button asChild variant="brand" className="mt-4">
            <Link to={ROUTES.HOME}>Browse titles</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={() => {
                continueWatching.forEach((i) =>
                  void progressActions.removeByMedia(i.tmdbId, i.type),
                );
                toast.success('Cleared continue watching.');
              }}
            >
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {continueWatching.map((item, idx) => (
              <ContinueWatchingCard
                key={item.id}
                item={item}
                index={idx}
                onRemove={() => handleRemove(item.id, item.tmdbId, item.type)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
