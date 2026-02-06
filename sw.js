// ─── 2Rat Radmelder – Service Worker ───
const CACHE_NAME = 'radmelder-v1';

// Dateien, die beim Install gecacht werden (App Shell)
const APP_SHELL = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js',
  '/js/db.js',
  '/js/map.js',
  '/js/categories.js',
  '/js/export.js',
  '/js/camera.js',
  '/js/router.js',
  '/manifest.json',
  // Leaflet (wird vom CDN geladen, aber gecacht)
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

// ─── INSTALL: App Shell cachen ───
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE: Alte Caches löschen ───
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ─── FETCH: Cache-First für App Shell, Network-First für Tiles ───
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Map-Tiles: Network-First mit Cache-Fallback
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // App Shell: Cache-First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
