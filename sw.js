// Ceci est le Service Worker qui permet l'installation de l'application
const cacheName = 'chalosse-v1';

self.addEventListener('install', (e) => {
    console.log('[ServiceWorker] Installation réussie');
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    console.log('[ServiceWorker] Activé');
});

self.addEventListener('fetch', (e) => {
    // On laisse internet fonctionner normalement
    e.respondWith(fetch(e.request).catch(() => console.log('Hors ligne')));
});