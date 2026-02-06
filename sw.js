// 2Rat Radmelder – Service Worker
const CACHE_NAME = 'radmelder-v1';
const BASE = self.location.pathname.replace(/\/sw\.js$/, '/');

const APP_SHELL_PATHS = [
  '',
  'index.html',
  'css/app.css',
  'js/app.js',
  'js/db.js',
  'js/map.js',
  'js/categories.js',
  'js/export.js',
  'js/camera.js',
  'js/router.js',
  'manifest.json',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const urls = APP_SHELL_PATHS.map(p => BASE + p);
      urls.push('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      urls.push('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      return cache.addAll(urls);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request)
        .then((r) => { const c = r.clone(); caches.open(CACHE_NAME).then((cache) => cache.put(event.request, c)); return r; })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
