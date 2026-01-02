const CACHE_NAME = 'invoice-generator-v1';
const urlsToCache = [
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'favicon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => Promise.all(
                urlsToCache.map(url => cache.add(url).catch(() => {/* ignore failed */}))
            ))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});