/**
 * src/providers/PushNotificationProvider.tsx  — V2-034
 *
 * Manages FCM push notification permission + token lifecycle for the admin panel:
 *  1. On first render after login, checks permission state and prompts user.
 *  2. If granted, acquires token and registers it with the backend.
 *  3. Sets up foreground message handler (shows rich toast).
 *  4. On logout, unregisters token from backend.
 *
 * Wrapped inside AuthProvider so it can read auth state.
 */

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, BellOff, X } from 'lucide-react';
import {
  requestAndGetToken,
  onForegroundMessage,
  VAPID_KEY,
} from '@/lib/firebase';
import { registerPushToken, unregisterPushToken } from '@/api/admin-push.api';
import { useAuth } from '@/context/AuthProvider';
import { pushAdminNotification } from '@/hooks/useAdminNotificationStore';

// Storage key to remember the last registered token per session
const STORAGE_KEY = 'gf_admin_fcm_token';

/**
 * Module-level foreground listener — shared across all remounts of this component.
 * Prevents the React StrictMode double-invoke race where two concurrent
 * registerToken() calls both see unsubRef.current === null and both attach
 * a separate onForegroundMessage listener, causing every push to show twice.
 */
let _fgUnsub: (() => void) | null = null;

export default function PushNotificationProvider() {
  const { token: authToken } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const tokenRef = useRef<string | null>(null);

  // ── SW background push → bell badge (tab was hidden) ──────────────────────
  useEffect(() => {
    function handleSWMessage(event: MessageEvent) {
      if (event.data?.type === 'GF_PUSH_NOTIFICATION') {
        const { title, body, data } = event.data;
        pushAdminNotification(
          title || 'Graduate Fashion',
          body  || 'You have a new notification.',
          (data || {}) as Record<string, string>
        );
      }
    }
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
  }, []);

  // ── Register token on login ────────────────────────────────────────────────
  useEffect(() => {
    if (!authToken) return; // not logged in
    if (!VAPID_KEY) return; // not configured — silently skip

    // Only run in secure contexts (HTTPS or localhost)
    if (!('Notification' in window)) return;

    const alreadyDenied = Notification.permission === 'denied';
    if (alreadyDenied) return;

    // If already granted, register immediately without prompting
    if (Notification.permission === 'granted') {
      void registerToken();
    } else {
      // Show our own in-app prompt first (better UX than raw browser dialog)
      setShowBanner(true);
    }

    return () => {
      // Cleanup foreground listener on auth change / unmount
      _fgUnsub?.();
      _fgUnsub = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  // ── Unregister token on logout ─────────────────────────────────────────────
  useEffect(() => {
    if (authToken) return; // still logged in
    const savedToken = localStorage.getItem(STORAGE_KEY);
    if (savedToken) {
      unregisterPushToken(savedToken).catch(() => {});
      localStorage.removeItem(STORAGE_KEY);
      tokenRef.current = null;
    }
    _fgUnsub?.();
    _fgUnsub = null;
  }, [authToken]);

  async function registerToken() {
    // Synchronously remove any existing foreground listener before first await.
    // Prevents the StrictMode race where two concurrent calls both see null
    // and both attach a listener without removing the other.
    _fgUnsub?.();
    _fgUnsub = null;

    try {
      const fcmToken = await requestAndGetToken();
      if (!fcmToken) return;

      tokenRef.current = fcmToken;
      localStorage.setItem(STORAGE_KEY, fcmToken);

      await registerPushToken(fcmToken);
      console.info('[Push] Token registered.');

      // Remove any listener a concurrent call may have registered, then attach ours
      const prevUnsub = _fgUnsub;
      prevUnsub?.();
      _fgUnsub = onForegroundMessage((payload) => {
        const title = payload.notification?.title || 'Graduate Fashion';
        const body  = payload.notification?.body  || 'You have a new notification.';
        const data  = payload.data || {};

        // Update bell badge — returns false if this is a duplicate (dedup guard)
        const wasNew = pushAdminNotification(title, body, data as Record<string, string>);
        if (wasNew === false) return;

        // Show a rich toast for foreground messages
        toast.custom(
          (t) => (
            <div
              className={`flex items-start gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3 shadow-lg dark:border-brand-700 dark:bg-gray-900 transition-all ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
              style={{ maxWidth: 360 }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{body}</p>
                {data.order_id && (
                  <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mt-1">
                    Order #{data.order_id}
                  </p>
                )}
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            </div>
          ),
          { duration: 8000, position: 'top-right' }
        );
      });
    } catch (err) {
      console.error('[Push] Token registration failed:', err);
    }
  }

  function handleEnablePush() {
    setShowBanner(false);
    void registerToken();
  }

  function handleDismissBanner() {
    setShowBanner(false);
    // Don't ask again this session — next login will prompt again
  }

  if (!showBanner || !authToken) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 rounded-2xl border border-brand-200 bg-white shadow-2xl dark:border-brand-800 dark:bg-gray-900 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Bell size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Enable Push Notifications
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Get real-time alerts for new orders, assignments, and pool updates — even when this tab isn't active.
          </p>
        </div>
        <button
          onClick={handleDismissBanner}
          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={15} />
        </button>
      </div>
      <div className="flex gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
        <button
          onClick={handleEnablePush}
          className="flex-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          Enable Push
        </button>
        <button
          onClick={handleDismissBanner}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <BellOff size={11} />
          Not Now
        </button>
      </div>
    </div>
  );
}
