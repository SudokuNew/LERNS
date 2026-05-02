const CACHE_NAME = 'lerns-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/tabs.css',
  './css/timer.css',
  './css/kotowaza.css',
  './js/functions.js',
  './js/tabs.js',
  './js/timer.js',
  './js/kotowaza.js',
  './js/clock.js',
  './js/todo.js',
  './icons/lerns-192.png',
  './icons/lerns-512.png'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evt) => {
  if (evt.request.method !== 'GET') return;
  evt.respondWith(
    caches.match(evt.request).then((cached) => {
      if (cached) return cached;
      return fetch(evt.request)
        .then((resp) => {
          if (!resp || resp.status !== 200) return resp;
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, clone));
          return resp;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
