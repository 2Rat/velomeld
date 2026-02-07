// 2Rat Radwegemelder – Service Worker
const CACHE_NAME = 'radmelder-v2';
const BASE = self.location.pathname.replace(/\/sw\.js$/, '/');

const APP_SHELL_PATHS = [
  '',
  'index.html',
  'manifest.json',
  'datenschutz.html',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install v2');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const urls = APP_SHELL_PATHS.map(p => BASE + p);
      urls.push('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      urls.push('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      urls.push('https://unpkg.com/dexie@3/dist/dexie.js');
      return cache.addAll(urls);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v2');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Supabase CDN: immer vom Netz laden, nicht cachen
  if (url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(fetch(event.request).catch(() => new Response('')));
    return;
  }

  // OSM Tiles: Network-first, Cache-Fallback
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request)
        .then((r) => { const c = r.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, c)); return r; })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // App-Dateien: Network-first, Cache-Fallback
  event.respondWith(
    fetch(event.request)
      .then((r) => { const c = r.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, c)); return r; })
      .catch(() => caches.match(event.request))
  );
});
