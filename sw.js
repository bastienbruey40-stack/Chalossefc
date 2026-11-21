// Service Worker PWA - FC Chalosse (Stale-While-Revalidate pour les ressources statiques, Network-First pour les pages)
const CACHE_NAME = 'chalosse-v26';
const ASSETS = [
    './',
    './index.html',
    './calendrier.html',
    './classement_equipes.html',
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
    './js/fff_parser.js',
    './js/fff_classement.js',
    './js/fff_ocr.js',
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

    const estDonneeDynamique = url.pathname.includes('/data/');
    const estRessourceStatique = !estDonneeDynamique && /\.(?:css|js|webp|png|jpe?g|svg|json|ico|woff2?)$/i.test(url.pathname);

    if (estRessourceStatique) {
        // Stale-While-Revalidate : réponse instantanée depuis le cache + mise à jour en arrière-plan
        e.respondWith(
            caches.open(CACHE_NAME).then((cache) =>
                cache.match(e.request).then((cached) => {
                    const majReseau = fetch(e.request).then((response) => {
                        if (response && response.ok) {
                            cache.put(e.request, response.clone());
                        }
                        return response;
                    }).catch(() => cached);

                    return cached || majReseau;
                })
            )
        );
        return;
    }

    // Pages HTML : Network-First avec repli cache hors-ligne
    e.respondWith(
        fetch(e.request)
            .then((response) => {
                if (response && response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(e.request))
    );
});
