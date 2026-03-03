// BAHAW Studio — Service Worker v5
var CACHE_NAME = 'bahaw-v6';
var URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/shop.html',
    '/product.html',
    '/cart.html',
    '/checkout.html',
    '/about.html',
    '/contact.html',
    '/terms.html',
    '/css/style.css',
    '/js/app.js',
    '/js/cart.js',
    '/js/products.js',
    '/js/checkout.js',
    '/data/products.js',
    '/BAHAW-Studio-PP.png',
    '/manifest.json'
];

// Install
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(URLS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).then(function(response) {
            // Cache successful responses
            if (response && response.status === 200 && response.type === 'basic') {
                var responseClone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseClone);
                });
            }
            return response;
        }).catch(function() {
            return caches.match(event.request);
        })
    );
});
