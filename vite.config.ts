import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Strelix Stream',
        short_name: 'Strelix',
        description: 'Premium streaming platform for movies, TV shows and anime.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Only precache static assets — NOT JS/CSS chunks, which change hash
        // on every deploy and would otherwise be served stale from the SW cache.
        globPatterns: ['**/*.{ico,png,svg,woff2,html}'],
        // Skip waiting + clients claim so the new SW activates immediately
        // on the next visit, rather than waiting for all tabs to close.
        skipWaiting: true,
        clientsClaim: true,
        // Don't navigate-fallback to index.html via the SW — let the browser
        // handle routing natively. This prevents stale index.html from being
        // served when the user navigates directly to a protected route.
        navigateFallbackDenylist: [/^\/.*/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tmdb-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Allow the cloud sandbox preview hostnames (Vite blocks unknown hosts by default).
    allowedHosts: true,
    fs: {
      // Allow serving files from project root, but ignore the skills folder.
      strict: false,
    },
  },
  // Don't try to process files in skills/, upload/, or download/
  optimizeDeps: {
    exclude: ['skills', 'upload'],
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
