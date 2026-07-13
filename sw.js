// Network-first service worker.
// This always tries to get the latest file from the server first.
// The cache is ONLY used as a fallback if you're offline.
// You never need to bump a version number here again — every
// online visit automatically refreshes the cache with whatever
// is currently on GitHub Pages.

const CACHE = 'pocket-pay-cache';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(response => {
        // Got a fresh copy from the network — use it, and quietly
        // update the offline cache with this latest version.
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy));
        return response;
      })
      .catch(() => {
        // Offline / network failed — fall back to whatever was
        // last cached, or to index.html for page navigations.
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          if (e.request.mode === 'navigate') return caches.match('/index.html');
        });
      })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
