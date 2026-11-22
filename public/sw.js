// TeleDoc Hub - Progressive Web App Service Worker
const CACHE_NAME = 'teledoc-vault-v1';

// Static App Shell core assets for instant offline bootstrap
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[TeleDoc SW] Precache partial error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Only handle same-origin HTTP and HTTPS requests
  // Ignore chrome-extension:, moz-extension:, blob:, data:, and all cross-origin requests (e.g. Render backend, CDNs)
  if (!url.protocol.startsWith('http') || url.origin !== self.location.origin) {
    return;
  }

  // 2. Skip non-GET requests (e.g. POST uploads, PATCH, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // 3. Skip backend API requests, Telegram streaming, views, thumbnails, and auth endpoints (never cache dynamic vault data)
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/documents/') ||
    url.pathname.includes('/view') ||
    url.pathname.includes('/thumbnail') ||
    url.pathname.includes('/auth/')
  ) {
    return;
  }

  // 4. Cache-First for Vite hashed static assets (/assets/*.js, /assets/*.css)
  // Because Vite fingerprints assets with content hashes, these files are immutable and load instantaneously from cache.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone).catch((err) => {
                console.warn('[TeleDoc SW] Cache put error:', err);
              });
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. Network-First with Cache Fallback for navigation and general static assets
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // If response is valid, clone and update cache for static assets (scripts, styles, fonts, images)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch((err) => {
              console.warn('[TeleDoc SW] Cache put error:', err);
            });
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Offline fallback: try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // For HTML navigation requests, return the cached index.html
        if (request.mode === 'navigate') {
          const indexCached = await caches.match('/index.html');
          if (indexCached) return indexCached;
        }

        return new Response('Network offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
  );
});
