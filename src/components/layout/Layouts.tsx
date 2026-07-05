import { Outlet } from 'react-router-dom';

import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { CommandPalette } from './CommandPalette';
import { PageErrorBoundary } from './PageErrorBoundary';
import { useSEO } from '@/hooks/useSEO';

/**
 * Public layout: navbar on top, content in middle, footer at bottom.
 * The footer sticks to the bottom of the viewport via `min-h-screen flex flex-col`.
 * Pages are wrapped in a PageErrorBoundary so a runtime error in one page
 * shows a clear error message instead of a blank screen.
 */
export function PublicLayout() {
  useSEO();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ScrollToTop />
      <Navbar />
      <CommandPalette />
      <main className="flex-1 pt-16">
        <PageErrorBoundary>
          <Outlet />
        </PageErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

/**
 * Bare layout for auth / watch pages — no navbar, no footer.
 */
export function BareLayout() {
  useSEO();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ScrollToTop />
      <main className="flex-1">
        <PageErrorBoundary>
          <Outlet />
        </PageErrorBoundary>
      </main>
    </div>
  );
}
