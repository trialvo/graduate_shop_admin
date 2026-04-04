/**
 * src/lib/firebase.ts  — V2-034
 * Firebase app + FCM messaging singleton for the Graduate Fashion Admin Panel.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { FIREBASE_CONFIG, FIREBASE_VAPID_KEY } from '@/config/env';

// Singleton app — config comes from env.ts → VITE_FIREBASE_* env vars
const firebaseApp = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

// Re-export so callers only need to import from this module
export const VAPID_KEY = FIREBASE_VAPID_KEY;


/**
 * Returns the messaging instance. May throw in non-browser or insecure contexts.
 */
export function getFirebaseMessaging(): Messaging | null {
  try {
    if (typeof window === 'undefined') return null;
    return getMessaging(firebaseApp);
  } catch {
    return null;
  }
}

/**
 * Request notification permission and return the FCM token.
 * Returns null if denied or any error occurs.
 */
export async function requestAndGetToken(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[FCM] Notification permission denied.');
      return null;
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    if (!VAPID_KEY) {
      console.warn('[FCM] VAPID_KEY is not set. Push token cannot be fetched.');
      return null;
    }

    // Register the SW and send it the Firebase config via postMessage.
    // The SW cannot use import.meta.env (it's not bundled by Vite),
    // so the main thread is responsible for passing the config.
    let swReg: ServiceWorkerRegistration | undefined;
    try {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready; // ensure SW is active before messaging
      const sw = swReg.active ?? swReg.installing ?? swReg.waiting;
      sw?.postMessage({ type: 'FIREBASE_CONFIG', config: FIREBASE_CONFIG });
    } catch {
      swReg = undefined;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });


    if (token) {
      console.info('[FCM] Token obtained:', token.slice(0, 20) + '…');
      return token;
    }

    console.warn('[FCM] No token returned.');
    return null;
  } catch (err) {
    console.error('[FCM] getToken error:', err);
    return null;
  }
}

/**
 * Subscribe to foreground messages. Calls `handler` each time a message arrives
 * while the page is focused. Returns an unsubscribe function.
 */
export function onForegroundMessage(handler: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void): () => void {
  const messaging = getFirebaseMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, handler);
}

export { firebaseApp };
