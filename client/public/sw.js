// Firebase Cloud Messaging (importScripts for service worker)
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBCc8qNzCrzG2Wctny7GriCY-dizFNhIoA",
  authDomain: "fittrackx-d14b0.firebaseapp.com",
  projectId: "fittrackx-d14b0",
  storageBucket: "fittrackx-d14b0.firebasestorage.app",
  messagingSenderId: "735622815654",
  appId: "1:735622815654:web:268518cf835eaaaaadb967",
});

const messaging = firebase.messaging();

// Background notification with actions
messaging.onBackgroundMessage((payload) => {
  const { title, body, image } = payload.notification || {};
  const data = payload.data || {};
  
  if (title) {
    const options = {
      body,
      icon: image || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: data.actions || [
        { action: "view", title: "View" },
        { action: "dismiss", title: "Dismiss" }
      ],
      tag: data.tag || title,
      data: data,
      renotify: true
    };
    
    self.registration.showNotification(title, options);
  }
});

// Handle notification clicks with routing
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const { action, route, id } = event.notification.data || {};
  
  if (action === "dismiss") {
    return;
  }
  
  let url = route || '/';
  if (id) {
    url = `${url}${url.includes('?') ? '&' : '?'}id=${id}`;
  }
  
  if (action && action !== 'view') {
    url = `${url}${url.includes('?') ? '&' : '?'}action=${action}`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background Sync - sync offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-actions") {
    event.waitUntil(syncOfflineData());
  }
});

// Periodic Background Sync
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "sync-progress") {
    event.waitUntil(fetchLatestProgress());
  }
});

// Sync function for queued offline actions
async function syncOfflineData() {
  try {
    const cache = await caches.open("api-cache");
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes("/api/progress/toggle")) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.delete(request);
          }
        } catch (err) {
          console.log("Sync failed for:", request.url, err);
        }
      }
    }
    
    console.log("Background sync completed");
  } catch (err) {
    console.error("Background sync error:", err);
  }
}

// Fetch latest progress data
async function fetchLatestProgress() {
  try {
    // Update cached data, refresh stats
    console.log("Periodic sync: fetching latest data");
    // Implementation depends on your API endpoints
  } catch (err) {
    console.error("Periodic sync error:", err);
  }
}

// App badge management
self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_BADGE") {
    event.waitUntil(
      self.registration.setAppBadge(event.data.count || 0)
    );
  }
  if (event.data?.type === "CLEAR_BADGE") {
    event.waitUntil(self.registration.clearAppBadge());
  }
});

// Cache management
const CACHE_NAME = "fittrackx-v1";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching static assets...");
      return cache.addAll(STATIC_ASSETS);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  
  // API requests - network first, fallback to cache
  if (url.includes("/api")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open("api-cache").then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }
  
  // Static assets - cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  const whitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!whitelist.includes(key)) {
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
});

