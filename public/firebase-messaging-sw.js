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
          tag:   data.order_id   ? `order-${data.order_id}`
               : data.report_id  ? `report-${data.report_id}`
               : data.message_id ? `message-${data.message_id}`
               : 'gf-admin',
          data,
        });
      }

      // ── Always postMessage ALL clients (visible or not) ──────────────────────
      // The focused tab needs this to update its bell badge when onBackgroundMessage
      // fires (some browsers fire it even for focused tabs in the compat SDK).
      // The dedup guard in pushAdminNotification() prevents double-counting.
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


// ── Helpers ───────────────────────────────────────────────────────────────────
function buildTargetPath(data) {
  if (data && data.order_id)   return '/all-orders?orderId='   + data.order_id;
  if (data && data.report_id)  return '/support-reports?reportId=' + data.report_id;
  if (data && data.message_id) return '/contact-page?messageId='   + data.message_id;
  return '/dashboard';
}

// ── notificationclick — navigate to entity-specific page ──────────────────────
//
// WHY postMessage instead of client.navigate():
//   client.navigate() is unreliable in Chrome when the client window is
//   not already focused (cross-window, background tab in another Chrome window).
//   The reliable pattern is:
//     1. Focus the existing admin tab (brings it to front)
//     2. Post a GF_NAVIGATE message so the React app calls React Router navigate()
//   If no admin tab is open, open a new window with the full absolute URL.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data       = event.notification.data || {};
  const targetPath = buildTargetPath(data);
  // Build an absolute URL so openWindow() works correctly across origins/ports
  const targetUrl  = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Look for an existing admin panel tab
      const adminClient = clientList.find((c) =>
        c.url.includes('localhost:5173') || c.url.includes('/admin')
      );

      if (adminClient) {
        // 1. Focus brings the window/tab to the front
        return adminClient.focus().then((wc) => {
          // 2. Tell the React app to navigate — more reliable than client.navigate()
          const target = wc || adminClient;
          target.postMessage({ type: 'GF_NAVIGATE', path: targetPath });
        }).catch(() => {
          // Focus failed (e.g. cross-origin restriction) — open new window
          return clients.openWindow(targetUrl);
        });
      }

      // No existing admin tab — open a new one with the full URL
      return clients.openWindow(targetUrl);
    })
  );
});
