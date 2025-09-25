// public/sw.js
const CACHE_NAME = "eventosfx-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  e.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((network) => {
          const clone = network.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return network;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// === Push Notifications (FCM) ===
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.notification?.title || "Recordatorio";
  const body = data.notification?.body || "Tienes novedades del evento.";
  const icon = "/icons/icon-192.png";
  const badge = "/icons/icon-192.png"; // opcional
  const tag = data.notification?.tag || "eventosfx";
  const actions = data.notification?.actions || [];

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      actions,
      // En Android suena por defecto si el canal lo permite
      // En iOS PWA es más limitado (se aceptará lo disponible)
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification?.data && event.notification.data.url) || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clis) => {
      for (const c of clis) {
        if ("focus" in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
