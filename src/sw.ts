/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare let self: ServiceWorkerGlobalScope;

// cleanup outdated caches
cleanupOutdatedCaches();

// precache assets
precacheAndRoute(self.__WB_MANIFEST);

// claim clients immediately
self.skipWaiting();
clientsClaim();

// Runtime Caching Rules

// API Cache
registerRoute(
  ({ url }) => url.origin === import.meta.env.VITE_APPSYNC_ENDPOINT || 'https://your-appsync-endpoint.appsync-api.your-region.amazonaws.com' && url.pathname.startsWith('/graphql'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
      }),
    ],
    networkTimeoutSeconds: 4,
  })
);

// T2S Sync endpoint — POST with binary body. Must NEVER be cached or
// intercepted: a cached POST response would replay the previous sync, and
// even a GET hit on /t2s/sync during audio playback would race the audio
// range request and corrupt the partial-response cache. NetworkOnly.
registerRoute(
  ({ url }) => url.origin === import.meta.env.VITE_APP_DOMAIN || 'https://your-app-domain.com' && url.pathname.startsWith('/t2s/'),
  new NetworkOnly()
);

// Audio tracks on app.shazacin.com — NetworkOnly.
//
// Why: iOS Safari 26.x and the prior `CacheFirst + CacheableResponsePlugin({
// statuses: [0, 200] })` rule poisoned playback. Two failure modes were
// observed (Tracy, 2026-06-18):
//   1. Cached a partial HTTP Range response (bytes=0-N), then served the
//      truncated bytes for 30 days — track plays to the cut point and
//      stalls, iOS reports audio.error.code 4 (MEDIA_ERR_SRC_NOT_SUPPORTED)
//   2. Cached an opaque (status 0) response when the request had no
//      `crossorigin` attribute — served an empty body, play() rejects
//      silently, no track progress.
//
// NetworkOnly also matches the /downloads/ paths used by the offline
// downloadService, which was reporting "unable to fetch network" because
// the SW's CacheFirst was returning a corrupt cached entry even when the
// app passed `fetch(url, { cache: 'no-store' })`. Workbox's registerRoute
// runs before the browser honours `cache: 'no-store'`, so the only safe
// fix is to never intercept these fetches at all.
//
// The matcher is deliberately narrow: audio MIME types only. Static assets
// (HTML, CSS, JS, images) are NOT routed here and continue to use the
// precache + s3-cache rules below.
const AUDIO_PATH_RE = /\.(mp3|m4a|aac|wav|ogg|oga|webm)(\?|#|$)/i;
// Match any request that is either:
//   - going to an <audio> element (browser sets destination='audio'), or
//   - a fetch() call whose URL has an audio file extension.
// The downloadService uses fetch() (no destination) for offline downloads,
// so we cannot rely on destination alone to catch that path.
registerRoute(
  ({ url, request }) =>
    url.origin === import.meta.env.VITE_APP_DOMAIN || 'https://your-app-domain.com' &&
    (request.destination === 'audio' || AUDIO_PATH_RE.test(url.pathname + url.search)),
  new NetworkOnly()
);

// Static assets on the shazacin domain (HTML, CSS, JS, images, fonts).
// NetworkFirst so the browser always checks for a fresh version, falls
// back to cache offline. Strictly opaque-status caching is disabled:
// status 0 means CORS-blocked, and a cached opaque response is an empty
// body that breaks subsequent same-origin fetches via cache.
registerRoute(
  ({ url }) =>
    url.origin === import.meta.env.VITE_APP_DOMAIN || 'https://your-app-domain.com' &&
    !url.pathname.startsWith('/t2s/') &&
    !AUDIO_PATH_RE.test(url.pathname + url.search),
  new NetworkFirst({
    cacheName: 'shazacin-static-cache',
    networkTimeoutSeconds: 4,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }), // 200 only — no opaque
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
      }),
    ],
  })
);

// S3 Cache
registerRoute(
  ({ url }) => url.origin.includes('.s3.') && url.origin.includes('amazonaws.com'),
  new CacheFirst({
    cacheName: 's3-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
      }),
    ],
  })
);

// ═══════════════════════════════════════════════════════════════
// FIREBASE MESSAGING INTEGRATION (ImportScripts compat SDK)
// Must be initialized here so Firebase getToken() can talk to this SW
// ═══════════════════════════════════════════════════════════════

importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSy...icuQ",
  authDomain: "describeat.firebaseapp.com",
  projectId: "describeat",
  storageBucket: "describeat.firebasestorage.app",
  messagingSenderId: "732271041669",
  appId: "1:732271041669:web:a71b3a329bca7612aeddec",
  measurementId: "G-EQE0K3MTV9"
};

let messaging: any = null;
let firebaseReady = false;
try {
  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();
  firebaseReady = true;
  console.log('[Firebase SW] Initialized successfully via merged SW');
} catch (error) {
  console.error('[Firebase SW] Initialization failed:', error);
}

// Handle handshake ping from client — respond only after Firebase is ready
self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_READY_PING') {
    const status = firebaseReady ? 'FIREBASE_READY_ACK' : 'FIREBASE_NOT_READY';
    event.source?.postMessage({ type: status });
  }
});

// Handle background messages from Firebase
if (messaging) {
  messaging.onBackgroundMessage((payload: any) => {
    console.log('[Firebase SW] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions: any = {
      body: payload.notification?.body || 'You have a new message',
      icon: payload.notification?.icon || '/assets/logo.svg',
      badge: '/assets/logo.svg',
      image: payload.notification?.image,
      data: {
        url: payload.data?.url || '/',
        ...payload.data
      },
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'close', title: 'Close' }
      ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// ═══════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS (Raw push events - for direct backend pushes)
// ═══════════════════════════════════════════════════════════════

self.addEventListener('push', (event) => {
  let title = 'DescribeAT';
  let body = 'New notification';
  let icon = '/pwa-192x192.png';
  let data: any = {};

  if (event.data) {
    try {
      const json = event.data.json();
      title = json.title || title;
      body = json.body || body;
      icon = json.icon || icon;
      data = json.data || {};
    } catch (e) {
      body = event.data.text();
    }
  }

  // Notify clients (App) so they can update state if open
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'PUSH_RECEIVED',
        payload: { title, body, icon, data, timestamp: Date.now() },
      });
    });
  });

  const options: any = {
    body,
    icon,
    badge: '/masked-icon.svg',
    data,
    requireInteraction: false,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Unified notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if (urlToOpen !== '/') {
            client.navigate(urlToOpen);
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(self.location.origin + urlToOpen);
      }
    })
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('[Firebase SW] Notification closed:', event);
});