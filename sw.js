const CACHE = 'pecera-v1';

const urlsToCache = [
  './',
  './app.html',
  './index.html',
  './css/style.css',
  './css/landing.css',
  './css/jsxgraph.css',
  './css/bootstrap.min.css',
  './js/script.js',
  './js/landing.js',
  './js/splash.js',
  './js/jsxgraphcore.js',
  './js/three.min.js',
  './js/OrbitControls.js',
  './js/bootstrap.min.js',
  './img/pecera.png',
  './img/panel_solar.png',
  './img/bomba_agua.png',
  './img/bomba_agua_issue.png',
  './img/icon-144.png',
  './img/icon-192.png',
  './img/icon-512.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
