import { Link } from 'react-router-dom';
import { Bookmark, Calendar, Heart, Mail, MonitorPlay, User as UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useUserDataStore } from '@/stores/userDataStore';
import { ROUTES } from '@/lib/constants';
import { formatDate, getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.user);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const watchlistCount = useUserDataStore((s) => s.watchlist.length);
  const favoritesCount = useUserDataStore((s) => s.favorites.length);
  const continueCount = useUserDataStore((s) => s.continueWatching.length);

  if (!profile) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar className="h-24 w-24 border-2 border-brand">
          <AvatarImage src={profile.photoURL ?? firebaseUser?.photoURL ?? undefined} alt={profile.username} />
          <AvatarFallback className="text-2xl">{getInitials(profile.username)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {profile.username}
            </h1>
            {firebaseUser?.emailVerified ? (
              <Badge variant="outline" className="gap-1 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-500">Unverified</Badge>
            )}
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" /> {profile.email || firebaseUser?.email}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" /> Joined {formatDate(new Date(profile.createdAt).toISOString())}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to={ROUTES.SETTINGS}>Settings</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Bookmark className="h-5 w-5" />}
          label="Watchlist"
          count={watchlistCount}
          to={ROUTES.WATCHLIST}
        />
        <StatCard
          icon={<Heart className="h-5 w-5" />}
          label="Favorites"
          count={favoritesCount}
          to={ROUTES.FAVORITES}
        />
        <StatCard
          icon={<MonitorPlay className="h-5 w-5" />}
          label="Continue Watching"
          count={continueCount}
          to={ROUTES.CONTINUE_WATCHING}
        />
      </div>

      {/* Profile info */}
      <div className="mt-8 rounded-lg border border-border bg-card/40 p-6">
        <h2 className="font-display text-lg font-semibold">Profile details</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <Detail icon={<UserIcon className="h-4 w-4" />} label="Username" value={profile.username} />
          <Detail icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email || firebaseUser?.email || '—'} />
          <Detail
            icon={<Calendar className="h-4 w-4" />}
            label="Member since"
            value={formatDate(new Date(profile.createdAt).toISOString())}
          />
          <Detail
            icon={<UserIcon className="h-4 w-4" />}
            label="User ID"
            value={profile.uid.slice(0, 12) + '...'}
          />
        </dl>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  count,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card/50 p-5 transition-all hover:border-brand/40 hover:bg-accent/30"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-muted-foreground">
        {icon}
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}
