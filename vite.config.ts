import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 8080,
      host: '0.0.0.0',
      strictPort: true,
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        offlinePage: '/offline.html',
        devOptions: {
          enabled: true,
          type: 'classic'
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Shazacin DescribeAT',
          short_name: 'DescribeAT',
          description: 'Audio descriptions for movies and TV shows',
          theme_color: '#0f172a',
          gcm_sender_id: '103953800507',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
      'global': 'window',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks(id) {
            const p = id.replace(/\\/g, '/');
            if (p.includes('/node_modules/')) {
              if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)(\/|$)/.test(p)) return 'vendor-react';
              if (/\/node_modules\/(aws-amplify|@aws-amplify\/[^/]+)(\/|$)/.test(p)) return 'vendor-amplify';
              if (/\/node_modules\/(framer-motion|motion-dom|motion-utils|motion)(\/|$)/.test(p)) return 'vendor-framer';
              if (/\/node_modules\/(firebase|@firebase\/[^/]+)(\/|$)/.test(p)) return 'vendor-firebase';
            }
            return undefined;
          }
        }
      }
    }
  };
});