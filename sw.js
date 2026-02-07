// 2Rat Radwegemelder – Service Worker v4
const CACHE_NAME = 'radmelder-v4';
const BASE = self.location.pathname.replace(/\/sw\.js$/, '/');

const APP_SHELL_PATHS = [
  '',
  'index.html',
  'manifest.json',
  'datenschutz.html',
];

const CDN_URLS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/dexie@3/dist/dexie.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install v4');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const urls = APP_SHELL_PATHS.map(p => BASE + p);
      return cache.addAll([...urls, ...CDN_URLS]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v4');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Supabase API-Aufrufe: immer direkt zum Netz
  if (url.hostname.includes('supabase')) {
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

  // Alles andere (App + CDN-Libraries): Cache-first, Network-Fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((r) => {
        const c = r.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, c));
        return r;
      });
    })
  );
});
