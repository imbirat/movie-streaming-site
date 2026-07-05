import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Bookmark,
  Check,
  ChevronDown,
  Film,
  Heart,
  Home,
  LogOut,
  Menu,
  MonitorPlay,
  Moon,
  Search,
  Settings,
  Sun,
  Tv,
  User as UserIcon,
  X,
} from 'lucide-react';

import { Brand } from './Brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useUserDataStore } from '@/stores/userDataStore';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { authService } from '@/services/firebase/auth';
import { cn, getInitials } from '@/lib/utils';

const NAV_LINKS = [
  { to: ROUTES.HOME, label: 'Home', icon: Home },
  { to: ROUTES.MOVIES, label: 'Movies', icon: Film },
  { to: ROUTES.TV, label: 'TV Shows', icon: Tv },
  { to: ROUTES.ANIME, label: 'Anime', icon: MonitorPlay },
];

function useCommandPaletteOpen() {
  // Lightweight singleton so any component can open the palette.
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}

// Global command palette state via window event
export const commandPaletteEvents = {
  open: () => window.dispatchEvent(new CustomEvent('strelix:command-palette:open')),
};

export function Navbar() {
  const scrolled = useScrollPosition(20);
  const navigate = useNavigate();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const profile = useAuthStore((s) => s.user);
  const { theme, toggle } = useThemeStore();
  const watchlistCount = useUserDataStore((s) => s.watchlist.length);
  const favCount = useUserDataStore((s) => s.favorites.length);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(q)}`);
    setSearchQuery('');
    setMobileOpen(false);
  }

  async function handleLogout() {
    await authService.logout();
    navigate(ROUTES.HOME);
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/85 backdrop-blur-lg'
          : 'bg-gradient-to-b from-black/80 to-transparent',
      )}
    >
      <div className="container flex h-16 items-center gap-3 px-4 sm:gap-6">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle asChild>
                <Brand />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-3">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <SheetClose asChild key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </NavLink>
                  </SheetClose>
                );
              })}
              {firebaseUser && (
                <>
                  <div className="my-2 h-px bg-border" />
                  <SheetClose asChild>
                    <NavLink
                      to={ROUTES.WATCHLIST}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )
                      }
                    >
                      <Bookmark className="h-4 w-4" /> Watchlist
                    </NavLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <NavLink
                      to={ROUTES.FAVORITES}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )
                      }
                    >
                      <Heart className="h-4 w-4" /> Favorites
                    </NavLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <NavLink
                      to={ROUTES.PROFILE}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )
                      }
                    >
                      <UserIcon className="h-4 w-4" /> Profile
                    </NavLink>
                  </SheetClose>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Brand />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Search (desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative ml-auto hidden max-w-sm flex-1 items-center md:flex"
        >
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, shows, anime..."
            className="h-9 bg-secondary pl-9 pr-12"
          />
          <kbd
            className="pointer-events-none absolute right-3 hidden select-none rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-block"
          >
            ⌘K
          </kbd>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          {/* Command palette trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => commandPaletteEvents.open()}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          {/* Notifications (decorative) */}
          <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden sm:inline-flex">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User menu */}
          {firebaseUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-accent">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={profile?.photoURL ?? firebaseUser.photoURL ?? undefined} alt={profile?.username ?? 'User avatar'} />
                    <AvatarFallback>
                      {getInitials(profile?.username ?? firebaseUser.email ?? 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{profile?.username ?? 'User'}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {firebaseUser.email}
                  </p>
                  {!firebaseUser.emailVerified && (
                    <Badge variant="outline" className="mt-1.5 text-amber-500">
                      Email unverified
                    </Badge>
                  )}
                  {firebaseUser.emailVerified && (
                    <Badge variant="outline" className="mt-1.5 gap-1 text-emerald-500">
                      <Check className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.PROFILE}>
                    <UserIcon className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.WATCHLIST}>
                    <Bookmark className="h-4 w-4" /> Watchlist
                    {watchlistCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {watchlistCount}
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.FAVORITES}>
                    <Heart className="h-4 w-4" /> Favorites
                    {favCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {favCount}
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.CONTINUE_WATCHING}>
                    <MonitorPlay className="h-4 w-4" /> Continue Watching
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.SETTINGS}>
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to={ROUTES.LOGIN}>Sign In</Link>
              </Button>
              <Button asChild variant="brand" size="sm">
                <Link to={ROUTES.REGISTER}>Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
