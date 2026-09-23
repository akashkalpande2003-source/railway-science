const CACHE_NAME = "railway-warrior-v2";

const CORE_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./railway-warrior-icon.svg"
];

/* INSTALL */
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CORE_FILES);
    })
  );

  self.skipWaiting();
});

/* ACTIVATE */
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

/* FAST CACHE-FIRST LOADING */
self.addEventListener("fetch", function(event) {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    caches.match(event.request).then(function(cachedResponse) {

      if (cachedResponse) {

        /* Background update */
        fetch(event.request)
          .then(function(networkResponse) {

            if (networkResponse && networkResponse.ok) {

              caches.open(CACHE_NAME).then(function(cache) {
                cache.put(
                  event.request,
                  networkResponse.clone()
                );
              });

            }

          })
          .catch(function() {});

        return cachedResponse;
      }

      /* Not cached → network */
      return fetch(event.request)
        .then(function(networkResponse) {

          if (networkResponse && networkResponse.ok) {

            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(
                event.request,
                networkResponse.clone()
              );
            });

          }

          return networkResponse;

        })
        .catch(function() {

          return caches.match("./index.html");

        });

    })

  );
});
