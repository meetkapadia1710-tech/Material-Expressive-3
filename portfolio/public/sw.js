const CACHE_VERSION = "v2";
const PAGES_CACHE = `portfolio-pages-${CACHE_VERSION}`;
const API_CACHE = `portfolio-api-${CACHE_VERSION}`;
const ASSETS_CACHE = `portfolio-assets-${CACHE_VERSION}`;

const CODING_API_PATHS = [
  "/api/coding-stats",
  "/api/leetcode",
  "/api/gfg",
  "/api/github-calendar",
];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all([
        ...keys
          .filter((key) => ![PAGES_CACHE, API_CACHE, ASSETS_CACHE].includes(key))
          .map((key) => caches.delete(key)),
        self.clients.claim(),
      ]),
    ),
  );
});

function markBundleAsCached(data) {
  if (!data || typeof data !== "object") return data;
  const clone = { ...data };
  if (clone.source === "live") clone.source = "cache";
  if (clone.leetcode && typeof clone.leetcode === "object" && clone.leetcode.source === "live") {
    clone.leetcode = { ...clone.leetcode, source: "cache" };
  }
  if (clone.geeksforgeeks && typeof clone.geeksforgeeks === "object" && clone.geeksforgeeks.source === "live") {
    clone.geeksforgeeks = { ...clone.geeksforgeeks, source: "cache" };
  }
  if (clone.github && typeof clone.github === "object") {
    clone.github = {
      ...clone.github,
      stats:
        clone.github.stats && clone.github.stats.source === "live"
          ? { ...clone.github.stats, source: "cache" }
          : clone.github.stats,
      calendar:
        clone.github.calendar && clone.github.calendar.source === "live"
          ? { ...clone.github.calendar, source: "cache" }
          : clone.github.calendar,
    };
  }
  return clone;
}

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  const url = new URL(request.url);
  // Normalize cache key without ?refresh=1 so offline reloads match the base API path cleanly.
  const cacheKey = new Request(url.origin + url.pathname);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(cacheKey, response.clone());
      return response;
    }
    const cached = await cache.match(cacheKey);
    if (cached) {
      const json = markBundleAsCached(await cached.json());
      return new Response(JSON.stringify(json), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Portfolio-Cache": "hit",
        },
      });
    }
    return response;
  } catch {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const json = markBundleAsCached(await cached.json());
      return new Response(JSON.stringify(json), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Portfolio-Cache": "hit",
        },
      });
    }
    return new Response(JSON.stringify({ error: "Offline and no cached stats available" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleNavigationRequest(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    const cacheControl = response.headers.get("cache-control") || "";
    if (response.ok && !cacheControl.includes("no-store")) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = (await cache.match(request)) || (await cache.match(new URL(request.url).pathname));
    if (cached) return cached;
    return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function handleAssetRequest(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    const cachedControl = cached.headers.get("cache-control") || "";
    if (cachedControl.includes("immutable") && !cachedControl.includes("no-store")) {
      return cached;
    }
    await cache.delete(request);
  }
  try {
    const response = await fetch(request);
    const cacheControl = response.headers.get("cache-control") || "";
    if (
      response.ok &&
      cacheControl.includes("immutable") &&
      !cacheControl.includes("no-store") &&
      !cacheControl.includes("no-cache")
    ) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 504 });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (CODING_API_PATHS.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(handleAssetRequest(request));
  }
});

