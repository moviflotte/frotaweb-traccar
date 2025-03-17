import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import palette from './src/common/theme/palette.js';
import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(() => ({
  base: "/traccar",
  server: {
    port: 3000,
    proxy: {
      '/api/socket': 'ws://gps.rastreosat.com.br',
      '/api': 'http://gps.rastreosat.com.br',
      '/icons3d': {
        target: 'https://library.service24gps.com',
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/icons3d/, "img/iconUber/iconsDinamicos_new_medidas"),
      }
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true, // Source map generation must be turned on
  },
  plugins: [
    svgr(),
    react(),
    VitePWA({
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /\/sw\.js$/, /^\/traccar\/api/],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,woff,woff2,mp3}'],
      },
      manifest: {
        short_name: '${title}',
        name: '${name}',
        description: '${description}',
        theme_color: palette(undefined, false).primary.main,
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
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
    }),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "rastreosat",
      project: "rastreosat",
    }),
  ],
}));
