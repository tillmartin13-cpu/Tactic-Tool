// Cache version — update this string on every deploy to force cache refresh
const CACHE = 'sg-spotinfo-v1.20260604.0935';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Always network-first for external tiles and CDN resources
  if(e.request.url.includes('tile.openstreetmap') ||
     e.request.url.includes('arcgisonline') ||
     e.request.url.includes('opentopomap') ||
     e.request.url.includes('cdnjs') ||
     e.request.url.includes('unpkg') ||
     e.request.url.includes('cdn.jsdelivr') ||
     e.request.url.includes('netlify/functions')){
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache-first for app shell
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(response => {
      return caches.open(CACHE).then(cache => {
        cache.put(e.request, response.clone());
        return response;
      });
    }))
  );
});
