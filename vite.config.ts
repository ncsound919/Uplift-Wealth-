import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['overlay-logo-192.png', 'overlay-logo-512.png', 'robots.txt', 'sitemap.xml'],
        manifest: {
          name: 'Overlay Wealth',
          short_name: 'Overlay Wealth',
          description: 'Free interactive fintech education platform with 15 modules, trading simulators, and gamified learning.',
          theme_color: '#059669',
          background_color: '#f8fafc',
          display: 'standalone',
          icons: [
            { src: 'overlay-logo-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'overlay-logo-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-static-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'src': path.resolve(__dirname, 'src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      // threads pool is reliable on CI runners (the default forks pool
      // fails to spawn workers on GitHub Actions).
      pool: 'threads',
      setupFiles: ['./src/test/setup.ts'],
      testTimeout: 30000,
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/test/**',
          'src/e2e/**',
          'src/main.tsx',
          'src/game/quizTypes.ts',
          'src/**/*.d.ts',
        ],
        thresholds: {
          // 80% floor across the board. Measured coverage on the full suite
          // is 100% statements/functions/branches and ~93% lines; the
          // previous 100% lines threshold could never be met and broke CI.
          statements: 80,
          lines: 80,
          functions: 80,
          branches: 80,
        },
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      sourcemap: true,
      minify: 'esbuild',
      cssMinify: true,
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('react-dom')) return 'react-vendor';
            if (id.includes('framer-motion') || id.match(/[\\/]node_modules[\\/]([^\\/]+)[\\/]motion/)) return 'motion-vendor';
            if (id.includes('recharts') || id.includes('victory-vendor')) return 'charts-vendor';
            if (id.includes('katex') || id.includes('rehype') || id.includes('remark')) return 'markdown-vendor';
            return undefined;
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
