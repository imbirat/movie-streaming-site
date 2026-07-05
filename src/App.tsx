import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { PublicLayout, BareLayout } from '@/components/layout/Layouts';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { PageLoader } from '@/components/common/PageLoader';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { useAuthInit } from '@/hooks/useAuthInit';
import { useUserData } from '@/hooks/useUserData';

// Lazy-loaded pages for code-splitting
const HomePage = lazy(() => import('@/pages/Home/HomePage'));
const MoviesPage = lazy(() => import('@/pages/Movies/MoviesPage'));
const TVPage = lazy(() => import('@/pages/TV/TVPage'));
const AnimePage = lazy(() => import('@/pages/Anime/AnimePage'));
const SearchPage = lazy(() => import('@/pages/Search/SearchPage'));
const MovieDetailPage = lazy(() => import('@/pages/Home/MovieDetailPage'));
const TVDetailPage = lazy(() => import('@/pages/Home/TVDetailPage'));
const WatchMoviePage = lazy(() => import('@/pages/Watch/WatchMoviePage'));
const WatchTVPage = lazy(() => import('@/pages/Watch/WatchTVPage'));
const LoginPage = lazy(() => import('@/pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/Auth/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/pages/Auth/VerifyEmailPage'));
const WatchlistPage = lazy(() => import('@/pages/Profile/WatchlistPage'));
const ContinueWatchingPage = lazy(() => import('@/pages/Profile/ContinueWatchingPage'));
const FavoritesPage = lazy(() => import('@/pages/Profile/FavoritesPage'));
const ProfilePage = lazy(() => import('@/pages/Profile/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/Profile/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));

export default function App() {
  const authReady = useAuthInit();
  useUserData();

  if (!authReady) {
    return <PageLoader fullScreen />;
  }

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public layout routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TVPage />} />
          <Route path="/anime" element={<AnimePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/tv/:id" element={<TVDetailPage />} />
          <Route path="/anime/:id" element={<TVDetailPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/continue-watching" element={<ContinueWatchingPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Bare layout for watch + auth */}
        <Route element={<BareLayout />}>
          {/* Watch routes are PUBLIC — continue-watching tracking silently no-ops when not signed in */}
          <Route path="/watch/movie/:id" element={<WatchMoviePage />} />
          <Route path="/watch/tv/:id/:season/:episode" element={<WatchTVPage />} />
          <Route path="/watch/anime/:id/:season/:episode" element={<WatchTVPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
