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
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-amplify': ['aws-amplify', '@aws-amplify/ui-react'],
            'vendor-framer': ['framer-motion'],
            'vendor-firebase': ['firebase/app', 'firebase/messaging'],
          }
        }
      }
    }
  };
});