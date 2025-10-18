const CACHE_NAME = 'lerns-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/js/app.js',
    '/icons/lerns-192.png',
    '/icons/lerns-512.png',
    '/media/intro-poster.jpg'
];

self.addEventListener('install', evt => {
    evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', evt => {
    if (evt.request.method !== 'GET') return;
    evt.respondWith(
        caches.match(evt.request).then(cached => cached || fetch(evt.request).then(resp => {
            if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
            const resClone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(evt.request, resClone));
            return resp;
        })).catch(() => caches.match('/index.html'))
    );
});

document.addEventListener('DOMContentLoaded', () => {
    const targets = document.querySelectorAll('.fade-in-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // 一度だけ表示したい場合
            }
        });
    }, {
        threshold: 0.2 // 20%見えたら発火
    });

    targets.forEach(target => observer.observe(target));
});

