self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("prod-log").then(cache => {
            return cache.addAll([
                "index.html",
                "style.css",
                "app.js"
            ]);
        })
    );
});
