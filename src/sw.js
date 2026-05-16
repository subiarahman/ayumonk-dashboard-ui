/* eslint-disable no-restricted-globals */
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// vite-plugin-pwa injects the precache manifest at build time.
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// SPA navigation fallback to index.html (except API + asset paths).
const navigationHandler = createHandlerBoundToURL("/index.html");
registerRoute(
  new NavigationRoute(navigationHandler, {
    denylist: [/^\/api\//, /\.[a-z0-9]+$/i],
  }),
);

registerRoute(
  ({ request }) => request.destination === "document",
  new NetworkFirst({
    cacheName: "ayumonk-html",
    networkTimeoutSeconds: 4,
    plugins: [
      new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  }),
);

registerRoute(
  ({ request }) => ["script", "style", "worker"].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: "ayumonk-assets",
    plugins: [
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  }),
);

registerRoute(
  ({ request }) => ["image", "font"].includes(request.destination),
  new CacheFirst({
    cacheName: "ayumonk-media",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 60 }),
    ],
  }),
);

registerRoute(
  /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
  new CacheFirst({
    cacheName: "google-fonts",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  }),
);

// Cache GET API responses with NetworkFirst so the app stays responsive
// when offline. Mutations (POST/PUT/etc) are always passed through.
registerRoute(
  ({ url, request }) => request.method === "GET" && url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "ayumonk-api",
    networkTimeoutSeconds: 6,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  }),
);

// Auto-update: when the client tells us to skip waiting, do so. This is what
// vite-plugin-pwa's updateServiceWorker(true) posts.
self.addEventListener("message", (event) => {
  if (event?.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", () => {
  // Wait for the explicit message before activating so the user controls
  // the swap (the update prompt UI calls updateServiceWorker(true)).
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notifications.
const DEFAULT_CLICK_URL = "/user/dashboard";

self.addEventListener("push", (event) => {
  // Backend sends a flat { title, body, icon, url } payload.
  let data = {};
  if (event.data) {
    try {
      data = event.data.json() ?? {};
    } catch {
      data = { title: "Ayumonk", body: event.data.text() };
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Ayumonk", {
      body: data.body || "You have a new notification",
      icon: data.icon || "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      data: { url: data.url || DEFAULT_CLICK_URL },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || DEFAULT_CLICK_URL;
  const absoluteTarget = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Find a same-origin tab we can reuse.
      for (const client of allClients) {
        let clientOrigin;
        try {
          clientOrigin = new URL(client.url).origin;
        } catch {
          continue;
        }
        if (clientOrigin !== self.location.origin) continue;

        // Notify the SPA so it can route via React Router (no full reload).
        client.postMessage({ type: "NOTIFICATION_CLICK", url: targetUrl });

        // Bring the tab forward. focus() returns the (possibly new) WindowClient.
        const focused = "focus" in client ? await client.focus() : client;

        // Navigate the WindowClient as a fallback in case no SPA listener
        // is wired up yet. Skip the navigate call if we're already there.
        if (focused && "navigate" in focused && focused.url !== absoluteTarget) {
          try {
            await focused.navigate(absoluteTarget);
          } catch {
            // Some browsers reject navigate() across history boundaries —
            // the postMessage above will still drive the SPA.
          }
        }
        return;
      }

      // No app tab is open → open a fresh one at the target URL.
      if (self.clients.openWindow) {
        await self.clients.openWindow(absoluteTarget);
      }
    })(),
  );
});
