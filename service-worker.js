const CACHE_NAME = 'paperclip-maximizer-v1.2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/index-BpfXcTd-.js',
  '/assets/index-DeJ3zc_Z.css',
  '/assets/icon-192-yO-6osho.svg',
  '/assets/manifest-BWk7JkWz.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});