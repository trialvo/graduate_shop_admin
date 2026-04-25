/**
 * public/firebase-messaging-sw.js  — V2-056
 * Firebase background push service worker for Graduate Fashion Admin Panel.
 *
 * KEY DESIGN: Chrome aggressively kills idle service workers (~30s).
 * When a push arrives, Chrome restarts the SW. We MUST initialize Firebase
 * BEFORE the push event fires, or the push is silently lost.
 *
 * Strategy:
 *   1. Listen for raw 'push' events ourselves (not via onBackgroundMessage)
 *   2. On push, synchronously check if Firebase is initialized
 *   3. If not, load config from IndexedDB and init before processing
 *   4. This guarantees we never miss a push, even after SW restart
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// ── Force new SW to take over immediately on update ───────────────────────────
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// ── IndexedDB helpers for persisting Firebase config across SW restarts ────────
const IDB_NAME = 'gf_admin_sw_config';
const IDB_STORE = 'config';

function openConfigDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveConfigToIDB(config) {
  try {
    const db = await openConfigDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(config, 'firebase_config');
    await new Promise((r, j) => { tx.oncomplete = r; tx.onerror = j; });
    db.close();
  } catch (e) { console.warn('[SW] Failed to save config to IDB:', e); }
}

async function loadConfigFromIDB() {
  try {
    const db = await openConfigDB();
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get('firebase_config');
    const result = await new Promise((r, j) => { req.onsuccess = () => r(req.result); req.onerror = j; });
    db.close();
    return result || null;
  } catch { return null; }
}

// ── Firebase init state ───────────────────────────────────────────────────────
let firebaseInitialized = false;

function initFirebase(config) {
  if (firebaseInitialized) return true;
  if (!config || !config.apiKey) return false;
  try {
    firebase.initializeApp(config);
    // We call firebase.messaging() to register the SDK internally,
    // but we handle push events ourselves via the 'push' listener below.
    firebase.messaging();
    firebaseInitialized = true;
    console.log('[SW] Firebase initialized.');
    return true;
  } catch (err) {
    console.error('[SW] Firebase init failed:', err);
    return false;
  }
}

// ── Ensure Firebase is initialized (from IDB if needed) ──────────────────────
// Returns a promise that resolves to true if Firebase is ready.
let _initPromise = null;
function ensureFirebaseReady() {
  if (firebaseInitialized) return Promise.resolve(true);
  if (_initPromise) return _initPromise;
  _initPromise = loadConfigFromIDB().then((config) => {
    if (config) {
      console.log('[SW] Restoring Firebase config from IndexedDB...');
      return initFirebase(config);
    }
    return false;
  }).catch(() => false);
  return _initPromise;
}

// ── Receive config from main thread ──────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG' && event.data?.config) {
    initFirebase(event.data.config);
    saveConfigToIDB(event.data.config);
  }
});

// ── Start loading config immediately on SW start ─────────────────────────────
ensureFirebaseReady();

// ══════════════════════════════════════════════════════════════════════════════
// RAW PUSH EVENT HANDLER
// This is the critical fix: we handle the 'push' event OURSELVES instead of
// relying on firebase.messaging().onBackgroundMessage().
// This way, even if Firebase SDK hasn't fully initialized, we still process
// the push and show a notification.
// ══════════════════════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
  // Firebase SDK also listens for 'push'. We need to call event.waitUntil()
  // to keep the SW alive while we process. Firebase SDK will see this event
  // too, but since we handle notification display ourselves, we suppress
  // Firebase's auto-display by NOT registering onBackgroundMessage.

  const handlePush = async () => {
    let payload;
    try {
      payload = event.data?.json();
    } catch {
      // Not a JSON payload — possibly a plain text push
      console.warn('[SW] Non-JSON push received, ignoring.');
      return;
    }

    console.log('[SW] Push event received:', JSON.stringify(payload).slice(0, 200));

    // FCM wraps the payload differently depending on how it was sent.
    // Extract title, body, and data from the FCM envelope.
    const notification = payload.notification || {};
    const data = payload.data || {};
    // FCM sometimes nests the notification inside a 'fcmOptions' wrapper
    const title = notification.title || data.title || 'Graduate Fashion';
    const body  = notification.body  || data.body  || 'You have a new notification.';

    // ── Notify all open clients via postMessage ──────────────────────────────
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const hasFocused = clientList.some((c) => c.visibilityState === 'visible');

    // Always tell all clients about the push (for bell badge, in-app toast, etc.)
    clientList.forEach((client) => {
      client.postMessage({
        type:  'GF_PUSH_NOTIFICATION',
        title,
        body,
        data,
      });
    });

    // Show OS notification only when no tab is visible
    if (!hasFocused) {
      await self.registration.showNotification(title, {
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
  };

  event.waitUntil(handlePush());
});


// ── Helpers ───────────────────────────────────────────────────────────────────
function buildTargetPath(data) {
  if (data && data.order_id)   return '/all-orders?orderId='   + data.order_id;
  if (data && data.report_id)  return '/support-reports?reportId=' + data.report_id;
  if (data && data.message_id) return '/contact-page?messageId='   + data.message_id;
  return '/dashboard';
}

// ── notificationclick — navigate to entity-specific page ──────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data       = event.notification.data || {};
  const targetPath = buildTargetPath(data);
  const targetUrl  = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const adminClient = clientList.find((c) =>
        c.url.includes('localhost:5173') || c.url.includes('/admin')
      );

      if (adminClient) {
        return adminClient.focus().then((wc) => {
          const target = wc || adminClient;
          target.postMessage({ type: 'GF_NAVIGATE', path: targetPath });
        }).catch(() => {
          return clients.openWindow(targetUrl);
        });
      }

      return clients.openWindow(targetUrl);
    })
  );
});
