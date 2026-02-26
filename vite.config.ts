import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Bekpen Hesap',
        short_name: 'Bekpen',
        description: 'Modern araç gelir-gider takip sistemi',
        theme_color: '#0f0f17',
        background_color: '#0f0f17',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['business', 'finance', 'productivity'],
        lang: 'tr'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
        runtimeCaching: [
          // API requests - Network First
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'googleapis',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // Firebase API - Network First
          {
            urlPattern: /^https:\/\/.*\.firebaseapp\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              }
            }
          },
          // Static assets - Cache First
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // Fonts - Cache First
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        // Dev modda SW kapalı: HMR'ın çalışması için. say-acc ile aynı davranış.
        enabled: false,
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'antd'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'query-vendor': ['@tanstack/react-query'],
          'utils-vendor': ['dayjs', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
});
