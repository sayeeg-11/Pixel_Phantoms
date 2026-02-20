const CACHE_NAME = 'pixel-phantoms-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './about.html',
    './contact.html',
    './events.html',
    './pages/join-us.html',
    './pages/projects.html',
    './assets/logo_compressed.png',
    './manifest.json',
    './css/style.min.css',
    './css/back-to-top.css',
    './css/animations.css',
    './css/share-button.css',
    './css/home-gsap.min.css',
    './css/cursor-effect.css',
    './css/scroll-buttons.css',
    './css/stats-widget.css',
    './css/keyboard-shortcuts.css',
    './css/focus.css',
    './css/join-us.css',
    './css/scroll-progress.css',
    './js/navbar.js',
    './js/footer.js',
    './js/cursor-effect.js',
    './js/scroll-buttons.js',
    './js/home-gsap.min.js',
    './js/home-leaderboard.min.js',
    './js/quick-stats.js',
    './js/home-stats-enhanced.js',
    './js/share-button.js',
    './js/join-us.js',
    './js/scroll-progress.js',
    './js/theme.js',
    './js/back-to-top.js',
    './js/keyboard-shortcuts.js',
    './js/main.js'
];

// Install Service Worker and cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate Service Worker and clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch assets from cache or network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Cache hit - return response
            if (response) {
                return response;
            }

            // Clone the request for fetch
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then((response) => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone the response for caching
                const responseToCache = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // Fallback for offline access if resource is not in cache
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
