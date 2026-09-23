const CACHE_NAME = "railway-warrior-v1";

const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./railway-warrior-icon.svg"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CORE_FILES);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        const copy = response.clone();

        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, copy);
        });

        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
