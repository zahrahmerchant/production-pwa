const CACHE_NAME = 'prod-log-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/lists.json'
];

// Install event: cache essential assets
self.addEventListener('install', e => {
    console.log('[Service Worker] Installing...');
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching assets');
            return cache.addAll(ASSETS).catch(err => {
                // If some assets fail to cache, continue anyway
                console.warn('[Service Worker] Some assets failed to cache:', err);
                return cache.addAll(ASSETS.filter(asset => asset !== '/lists.json'));
            });
        })
    );
    self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', e => {
    console.log('[Service Worker] Activating...');
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event: network-first for lists.json, cache-first for others
self.addEventListener('fetch', e => {
    const { request } = e;

    // Network-first for lists.json to always get latest
    if (request.url.includes('lists.json')) {
        e.respondWith(
            fetch(request)
                .then(response => {
                    // Cache the response for offline use
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, response.clone());
                    });
                    return response;
                })
                .catch(() => {
                    // Fall back to cache if network fails
                    return caches.match(request).then(cached => cached || new Response('[]', {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: new Headers({ 'Content-Type': 'application/json' })
                    }));
                })
        );
    } else {
        // Cache-first for other assets
        e.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, response.clone());
                    });
                    return response;
                }).catch(() => {
                    // Return offline page if all else fails
                    return caches.match('/index.html');
                });
            })
        );
    }
});
