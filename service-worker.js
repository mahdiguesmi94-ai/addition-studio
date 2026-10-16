const CACHE_NAME = "addition-studio-v1";
const APP_FILES = [
    "./projet%201.html",
    "./manifest.webmanifest",
    "./app-icon.svg"
];
const APP_URL = new URL("./projet%201.html", self.location.href).href;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith("addition-studio-") && cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

    event.respondWith((async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        try {
            const response = await fetch(event.request);
            if (response.ok && response.type === "basic") {
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, response.clone());
            }
            return response;
        } catch {
            if (event.request.mode === "navigate") {
                return (await caches.match(APP_URL)) || Response.error();
            }
            return Response.error();
        }
    })());
});