const CACHE = "tzlil-run-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => cached))
  );
});

self.addEventListener("push", (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) {}

  const title = data.title || "🏃‍♀️ זמן לרוץ, צליל!";
  const body = data.body || "יאללה, יציאה לריצה 🌸";

  const options = {
    body,
    icon: "icon-192.png",
    badge: "icon-192.png",
    dir: "rtl",
    lang: "he",
    tag: "tzlil-run-reminder",
    renotify: true,
    vibrate: [120, 60, 120],
    data: { date: data.date || null, url: "./index.html" },
    actions: [
      { action: "done", title: "✅ סימנתי שרצתי" },
      { action: "snooze", title: "⏰ עוד קצת" }
    ]
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (e) => {
  const notif = e.notification;
  const date = (notif.data && notif.data.date) || null;
  notif.close();

  if (e.action === "done") {
    e.waitUntil(
      fetch("/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date })
      }).catch(() => {})
    );
    return;
  }

  if (e.action === "snooze") {
    return; // just dismiss, the next scheduled tick will remind again
  }

  const url = (notif.data && notif.data.url) || "./index.html";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
