const CACHE_NAME = "V1";
const STATIC_CACHE_URLS = ["/", "/style.css", "/script.js", "/images/favicon.ico"];

self.addEventListener("install", event => {
  console.log("Service Worker installing.");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener("fetch", event => {
  // Cache-First Strategy
  event.respondWith(
    caches
      .match(event.request) 
      .then(cached => cached || fetch(event.request)) 
      .then(
        response =>
          cache(event.request, response) 
            .then(() => response) 
      )
  );
});

function cache(request, response) {
  if (response.type === "error" || response.type === "opaque") {
    return Promise.resolve();
  }

  return caches
    .open(CACHE_NAME)
    .then(cache => cache.put(request, response.clone()));
}

self.addEventListener("activate", event => {
  console.log("Service Worker activating.");
});