import { Link } from 'react-router-dom';
import { Github, Heart, Twitter } from 'lucide-react';

import { Brand } from './Brand';
import { ROUTES, APP_NAME } from '@/lib/constants';

const FOOTER_LINKS = [
  {
    title: 'Browse',
    links: [
      { label: 'Home', to: ROUTES.HOME },
      { label: 'Movies', to: ROUTES.MOVIES },
      { label: 'TV Shows', to: ROUTES.TV },
      { label: 'Anime', to: ROUTES.ANIME },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', to: ROUTES.LOGIN },
      { label: 'Sign Up', to: ROUTES.REGISTER },
      { label: 'Watchlist', to: ROUTES.WATCHLIST },
      { label: 'Favorites', to: ROUTES.FAVORITES },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'Privacy', to: '/' },
      { label: 'Terms', to: '/' },
      { label: 'Contact', to: '/' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/30">
      <div className="container grid grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-2">
          <Brand />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            {APP_NAME} is a premium streaming experience for movies, TV shows, and anime. Discover,
            stream, and sync your watchlist across all your devices.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>

        {FOOTER_LINKS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 fill-brand text-brand" /> for streaming lovers.
            Powered by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
