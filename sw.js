// 2Rat Radwegemelder – Service Worker v7
// FIX 2026-04-16: clone() vor return r aufrufen (war Race-Condition)
//                 Version-Bump v6 -> v7 erzwingt Update auf allen Geraeten
const CACHE_NAME = 'radmelder-v7';
const BASE = self.location.pathname.replace(/\/sw\.js$/, '/');

self.addEventListener('install', (event) => {
  console.log('[SW] Install v7');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const urls = ['', 'index.html', 'manifest.json', 'datenschutz.html', 'whitelabel.js'].map(p => BASE + p);
      urls.push('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      urls.push('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      urls.push('https://unpkg.com/dexie@3/dist/dexie.js');
      return cache.addAll(urls);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Supabase API: immer direkt zum Netz, kein Cache
  if (url.hostname.includes('supabase')) return;

  // Nominatim (Geocoding fuer White-Label): immer Netz, kein Cache
  if (url.hostname.includes('nominatim')) return;

  // OSM Tiles: Network-first
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request)
        .then(r => {
          // FIX 2026-04-16: clone() VOR return r, damit Body nicht schon konsumiert ist
          const clone = r.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return r;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // App + Libraries: Network-first, Cache-Fallback
  event.respondWith(
    fetch(event.request)
      .then(r => {
        // FIX 2026-04-16: clone() VOR return r
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return r;
      })
      .catch(() => caches.match(event.request))
  );
});
