# Strelix Stream

A production-ready premium streaming platform inspired by Netflix, Crunchyroll, and Streamflix.

![Strelix Stream](home-page.png)

## Features

### Public Pages
- **Home** — Hero banner, Trending, Popular Movies/TV/Anime, Top Rated, Recently Added
- **Movies / TV / Anime** — Filter by genre, year, rating + sort + infinite scroll
- **Search** — Multi-search with instant suggestions and tab filters
- **Detail pages** — Poster, backdrop, overview, rating, genres, cast, runtime, trailer, episodes, recommendations

### Watch Page
- Video player with **server selection** (VidLink, VidSrc, MultiEmbed, 2Embed)
- Episode navigation (Previous / Next) for TV/anime
- Episode list sheet (per-season) for TV/anime
- Continue-watching tracking synced to Firestore
- **Provider abstraction layer** — add new providers by editing `src/services/streaming/providers.ts`

### Authentication (Firebase)
- Email + password login/register
- Google + GitHub sign-in (popup)
- Password reset (forgot password)
- Email verification flow
- Persistent login sessions
- Protected routes (`ProtectedRoute`)

### User Features (Firestore-backed)
- **Watchlist** — save titles for later
- **Favorites** — track favorite titles
- **Continue Watching** — auto-tracks progress every 30s while watching
- **Profile** — avatar, username, email, join date, counts
- **Settings** — theme, default server, autoplay, subtitles

### UX & Design
- Netflix-inspired dark theme (default) + light theme
- Responsive, mobile-first
- Smooth Framer Motion animations
- Skeleton loaders + shimmer effect
- Toast notifications (sonner)
- Command palette (⌘K / Ctrl+K) for global search
- Hover effects on every interactive element
- Custom 404 page
- Error boundary

### Performance & SEO
- PWA support (offline cache for TMDB images)
- Code-splitting (lazy-loaded routes)
- Open Graph metadata
- Sitemap-ready
- robots.txt

## Tech Stack

| Layer | Tech |
|------|------|
| Framework | Vite + React 19 |
| Language | TypeScript (strict) |
| Routing | React Router v7 |
| Styling | Tailwind CSS v3 + shadcn/ui-style components |
| Primitives | Radix UI |
| Icons | Lucide React |
| Animation | Framer Motion |
| Server state | TanStack Query v5 |
| Client state | Zustand (with persist) |
| Auth + DB | Firebase Authentication + Firestore |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| PWA | vite-plugin-pwa |

> **Note on Tailwind v3 vs v4**: The project uses Tailwind v3 for maximum stability with the shadcn/ui-style component system (HSL CSS variables). Upgrading to v4 is a drop-in change if desired.

## Quickstart

### 1. Install dependencies
```bash
bun install   # or npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env.local` and fill in:
- `VITE_TMDB_API_KEY` — your TMDB API key (https://www.themoviedb.org/settings/api)
- `VITE_FIREBASE_*` — your Firebase project config (https://console.firebase.google.com/)

### 3. Run the dev server
```bash
bun run dev
```
Open http://localhost:3000

### 4. Build for production
```bash
bun run build      # outputs to dist/
bun run preview    # preview the production build
```

### 5. Lint & format
```bash
bun run lint
bun run format
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn-style UI primitives (Button, Card, Dialog, ...)
│   ├── layout/      # Navbar, Footer, Layouts, ThemeProvider, CommandPalette, ErrorBoundary
│   ├── movie/       # MediaCard, MediaRow, MediaGrid, HeroBanner, DetailHero, FilterBar
│   ├── player/      # VideoPlayer, ServerSelector
│   └── common/      # PageLoader
├── pages/
│   ├── Home/        # HomePage, MovieDetailPage, TVDetailPage, DetailPage
│   ├── Movies/      # MoviesPage
│   ├── TV/          # TVPage
│   ├── Anime/       # AnimePage
│   ├── Search/      # SearchPage
│   ├── Watch/       # WatchMoviePage, WatchTVPage
│   ├── Auth/        # LoginPage, RegisterPage, ForgotPasswordPage, VerifyEmailPage
│   ├── Profile/     # ProfilePage, WatchlistPage, FavoritesPage, ContinueWatchingPage, SettingsPage
│   ├── NotFound/    # NotFoundPage
│   └── BrowsePage.tsx   # shared browse page with filters + infinite scroll
├── hooks/           # useTmdb, useUserData, useAuthInit, useDebounce, useInfiniteScroll, ...
├── services/
│   ├── firebase/    # config.ts, auth.ts, firestore.ts
│   ├── tmdb/        # index.ts (TMDB API client)
│   └── streaming/   # providers.ts (serverManager abstraction)
├── stores/          # authStore, themeStore, userDataStore, settingsStore (Zustand)
├── types/           # index.ts (TMDB + app types)
├── lib/             # utils.ts, constants.ts
├── routes/          # ProtectedRoute.tsx
├── App.tsx          # Routing + lazy loading
└── main.tsx         # Entry point (React Query, ThemeProvider, BrowserRouter, Toaster)
```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable **Authentication** → Email/Password, Google, GitHub providers
3. Enable **Firestore Database** (production mode)
4. Copy your web app config into `.env.local`
5. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Firestore Collections

- **users** `{uid, username, email, photoURL, createdAt}`
- **watchlists** `{uid, tmdbId, type, title, posterPath, addedAt}`
- **favorites** `{uid, tmdbId, type, addedAt}`
- **watchProgress** `{uid, tmdbId, type, season, episode, currentTime, duration, updatedAt}`
- **userSettings** `{uid, theme, autoplay, preferredServer, ...}`

### Security Rules

See `firestore.rules` — each user can only read/write their own documents.

## Streaming Provider Abstraction

The `serverManager` in `src/services/streaming/providers.ts` exposes a single API:

```ts
import { serverManager } from '@/services/streaming/providers';

// Get URL for a single provider
const url = serverManager.getUrl('vidlink', { type: 'movie', id: 123 });

// Get all provider URLs (handy for "all servers" UI)
const all = serverManager.getAll({ type: 'tv', id: 456, season: 1, episode: 1 });

// Add a new provider:
const myProvider = {
  id: 'myprovider',
  name: 'My Provider',
  description: 'A new embed source.',
  getUrl: ({ type, id, season, episode }) =>
    type === 'movie'
      ? `https://myprovider.com/movie/${id}`
      : `https://myprovider.com/tv/${id}/${season}/${episode}`,
};
```

## Deployment

### Vercel
1. Push your repo to GitHub
2. Import in Vercel — it auto-detects Vite
3. Set environment variables in the project settings
4. Deploy — `vercel.json` is pre-configured

### Netlify
1. Push to GitHub
2. New site from Git in Netlify
3. Build command: `bun run build` — publish dir: `dist`
4. Set environment variables — `netlify.toml` is pre-configured

### Firebase Hosting
1. `npm i -g firebase-tools`
2. `firebase login`
3. `firebase deploy` — `firebase.json` is pre-configured

## Adding a New Streaming Provider

1. Open `src/services/streaming/providers.ts`
2. Add a new object implementing `StreamingProvider`
3. Add it to the `STREAMING_PROVIDERS` array
4. (Optional) Set it as the default by changing `DEFAULT_PROVIDER_ID`

## Code Quality

- ✅ Strict TypeScript (no `any` allowed by ESLint)
- ✅ ESLint + Prettier configured
- ✅ Modular architecture (services, stores, hooks, components, pages)
- ✅ Reusable components (shadcn/ui-style)
- ✅ Custom hooks for data + side-effects
- ✅ No hardcoded secrets (all env vars via `import.meta.env`)
- ✅ Input validation (Zod schemas on all auth forms)
- ✅ Route protection + auth guards

## License

MIT — build amazing things with it.
