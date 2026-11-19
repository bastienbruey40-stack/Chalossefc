// Service Worker PWA - FC Chalosse (Network-First avec repli sur le cache hors-ligne)
const CACHE_NAME = 'chalosse-v7';
const ASSETS = [
    './',
    './index.html',
    './calendrier.html',
    './effectif.html',
    './stats.html',
    './classement.html',
    './match_detail.html',
    './connexion.html',
    './inscription.html',
    './css/style.css',
    './js/firebase.js',
    './js/ui.js',
    './js/layout.js',
    './js/matchs.js',
    './js/tactique.js',
    './js/fff_import.js',
    './chalosse.webp',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    if (url.origin !== self.location.origin) return;

    e.respondWith(
        fetch(e.request, { cache: 'no-cache' })
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
                return response;
            })
            .catch(() => caches.match(e.request))
    );
});
