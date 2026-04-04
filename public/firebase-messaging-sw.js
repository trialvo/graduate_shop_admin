/**
 * public/firebase-messaging-sw.js  — V2-034
 * Firebase background push service worker for Graduate Fashion Admin Panel.
 *
 * Config is embedded directly so Firebase initializes synchronously at load
 * time, eliminating the postMessage race condition with getToken().
 *
 * When config changes, update FIREBASE_CONFIG below.
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// ── Force new SW to take over immediately on update ───────────────────────────
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// ── Embedded config (must match .env.local VITE_FIREBASE_* values) ────────────
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAeak1AHqd69XyYx7_rwFrBCqhg0zTYjHA",
  authDomain:        "graduatefashion.firebaseapp.com",
  projectId:         "graduatefashion",
  storageBucket:     "graduatefashion.firebasestorage.app",
  messagingSenderId: "641431966702",
  appId:             "1:641431966702:web:95b602b594d576dfeeb4ff",
  measurementId:     "G-LL5PHT6M9L",
};

// ── Initialize immediately ─────────────────────────────────────────────────────
let messaging = null;
try {
  firebase.initializeApp(FIREBASE_CONFIG);
  messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background push received:', payload);

    const title = payload.notification?.title || 'Graduate Fashion';
    const body  = payload.notification?.body  || 'You have a new notification.';
    const data  = payload.data || {};

    // ── Deduplicate: skip OS notification when a tab is already visible ──────
    // In some browsers the Firebase compat SDK fires onBackgroundMessage even
    // for focused tabs. If a visible tab is open, the foreground handler
    // (onForegroundMessage) is already showing the in-app toast, so we must
    // NOT also show an OS notification — that would cause a double alert.
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const hasFocused = clientList.some((c) => c.visibilityState === 'visible');

      if (!hasFocused) {
        // Tab is hidden/closed — show the OS system notification
        self.registration.showNotification(title, {
          body,
          icon:  '/favicon.ico',
          badge: '/favicon.ico',
          tag:   data.order_id ? `order-${data.order_id}` : 'gf-admin',
          data,
        });
      }

      // Always postMessage so the bell badge updates in any open tab
      clientList.forEach((client) => {
        client.postMessage({
          type:  'GF_PUSH_NOTIFICATION',
          title,
          body,
          data,
        });
      });
    });
  });

  console.log('[SW] Firebase initialized at load time.');
} catch (err) {
  console.error('[SW] Firebase init failed:', err);
}


// ── notificationclick — focus or open admin tab ────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('localhost:5173') || client.url.includes('admin')) {
          client.focus();
          return;
        }
      }
      clients.openWindow('/dashboard');
    })
  );
});
