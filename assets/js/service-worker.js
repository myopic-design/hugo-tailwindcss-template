/*
{{ $latestArticles := partial "utils/articles-latest" }}
{{ $latestArticles = delimit (apply $latestArticles "partial" "utils/rel-permalink" ".") "\", \"" }}

{{ $offlineImage := (resources.GetMatch "images/offline.svg").Content }}

{{ $version := now.Format "v20060102" }}
*/

const version = "{{ $version }}";
const staticCacheName = version + "-static";
const pagesCacheName = version + "-pages";
const imagesCacheName = version + "-images";
const assetsCacheName = version + "-assets";

const offlinePages = [
  "{{ relref . "/" }}",
  "{{ relref . "/about" }}",
  "{{ relref . "/blog" }}",
  "{{ $latestArticles }}",
];

const staticAssets = [
  "{{ "offline.html" | relURL }}",
  "{{ "css/styles.css" | relURL }}",
  "{{ "js/scripts.js" | relURL }}",
  "{{ "favicon.ico" | relURL }}",
  "{{ "images/logo.svg" | relURL }}",
];

const updateStaticCache = () => {
  // These items can be cached after install.
  caches
    .open(staticCacheName)
    .then((cache) => cache.addAll(offlinePages.map((url) => new Request(url))));
  // These items must be cached for the ServiceWorker to complete installation.
  return caches
    .open(staticCacheName)
    .then((cache) => cache.addAll(staticAssets.map((url) => new Request(url))));
};

const stashInCache = async (cacheName, request, response) => {
  const cache = await caches.open(cacheName);
  cache.put(request, response);
};

const readCaches = (request) => caches.match(request, { ignoreVary: true });

const trimCache = async (cacheName, maxItems) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    trimCache(cacheName, maxItems);
  }
};

const clearOldCaches = async () => {
  const keys = await caches.keys();
  const keysToDelete = keys.filter((key) => key.indexOf(version) !== 0);
  return Promise.all(keysToDelete.map((key) => caches.delete(key)));
};

const isRequestOfType = (request, type) => {
  const accept = request.headers.get("accept") || "text/html";
  return accept.indexOf(type) != -1;
};

const isRequestForOfflinePage = (request) => {
  const { pathname } = new URL(request.url);
  return offlinePages.includes(pathname) || offlinePages.includes(`${pathname}/`);
};

const isRequestForStaticAsset = (request) => {
  const { pathname } = new URL(request.url);
  return staticAssets.includes(pathname);
};

const getCacheNameForRequest = (request) => {
  if (isRequestForOfflinePage(request) || isRequestForStaticAsset(request)) {
    return staticCacheName;
  }
  if (isRequestOfType(request, "text/html")) {
    return pagesCacheName;
  }
  if (isRequestOfType(request, "image")) {
    return imagesCacheName;
  }
  return assetsCacheName;
};

self.addEventListener("install", (event) => {
  event.waitUntil(updateStaticCache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clearOldCaches().then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data.command === "trimCaches") {
    trimCache(pagesCacheName, 25);
    trimCache(imagesCacheName, 10);
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const onNetworkResolve = (response) => {
    const cacheCopy = response.clone();
    const cacheName = getCacheNameForRequest(request);
    stashInCache(cacheName, request, cacheCopy);

    return response;
  };

  const onNetworkReject = async () => {
    if (isRequestOfType(request, "text/html")) {
      const cachedResponse = await readCaches(request);
      return cachedResponse || readCaches("{{ "offline.html" | relURL }}");
    }
    if (isRequestOfType(request, "image")) {
      return new Response(`{{ $offlineImage }}`, { headers: { "content-type": "image/svg+xml" } });
    }
  };

  const fetchFromNetworkOrFallback = async () => {
    try {
      const response = await fetch(request);
      return onNetworkResolve(response);
    } catch (err) {
      return onNetworkReject();
    }
  };

  const cacheOrFetchFromNetworkOrFallback = async () => {
    const cachedResponse = await readCaches(request);
    return cachedResponse || fetchFromNetworkOrFallback();
  };

  // For HTML requests, try the network first, then fall back to the cache.
  if (isRequestOfType(request, "text/html")) {
    return event.respondWith(fetchFromNetworkOrFallback());
  }
  // For non-HTML requests, try the cache first, then network if no cache exists, then fallback.
  event.respondWith(cacheOrFetchFromNetworkOrFallback());
});
