// This file is imported by main.tsx and exports a build timestamp.
// Vite replaces __BUILD_TIME__ with the actual build time via define().
// Used to verify that Vercel is serving fresh builds.
export const BUILD_INFO = {
  timestamp: __BUILD_TIME__,
  version: '2.5-cache-fix',
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { __STRELIX_BUILD__?: unknown }).__STRELIX_BUILD__ = BUILD_INFO;
}
