self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open('memory-helper').then(function (cache) {
      return cache.addAll([
        '/Memory-Helper/',
        '/Memory-Helper/index.html',
        '/Memory-Helper/style.css',
        '/Memory-Helper/script.js',
        '/Memory-Helper/icon-192.png',
        '/Memory-Helper/icon-512.png',
        '/Memory-Helper/placeholder.jpg',
        '/Memory-Helper/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});
