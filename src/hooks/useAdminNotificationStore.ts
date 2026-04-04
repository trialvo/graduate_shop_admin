/**
 * src/hooks/useAdminNotificationStore.ts  — V2-035
 *
 * Lightweight localStorage-backed push notification store for the admin panel.
 * PushNotificationProvider writes to it; NotificationDropdown reads the count.
 */

import { useCallback, useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminPushNotification {
  id:          string;
  title:       string;
  body:        string;
  order_id?:   string;
  event_type?: string;
  read:        boolean;
  receivedAt:  number;
}

// ── Module-level singleton ─────────────────────────────────────────────────────

type Listener = () => void;
const listeners  = new Set<Listener>();
const STORAGE_KEY = "gf_admin_push_notifications";
const MAX_STORED  = 30;

function readStore(): AdminPushNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminPushNotification[]) : [];
  } catch { return []; }
}

function writeStore(items: AdminPushNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_STORED)));
  } catch { /* storage full */ }
  listeners.forEach((fn) => fn());
}

// ── Public helpers (called outside the hook) ──────────────────────────────────

/** Called by PushNotificationProvider when a foreground or background push arrives.
 *  Returns true if the notification was stored, false if suppressed as a duplicate. */
export function pushAdminNotification(
  title: string,
  body:  string,
  data?: Record<string, string>
): boolean {
  // ── Deduplication guard ───────────────────────────────────────────────────
  // Both the FCM foreground handler and the SW postMessage handler can fire
  // for the same payload.  Skip if same order_id + event_type already stored
  // within the last 5 seconds.
  const now   = Date.now();
  const store = readStore();
  const isDuplicate = store.some(
    (n) =>
      n.order_id   === data?.order_id &&
      n.event_type === data?.event_type &&
      now - n.receivedAt < 5_000
  );
  if (isDuplicate) {
    console.debug('[AdminNotifStore] Duplicate push suppressed', data?.order_id, data?.event_type);
    return false;
  }
  // ─────────────────────────────────────────────────────────────────────────

  const next: AdminPushNotification = {
    id:         `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    body,
    order_id:   data?.order_id,
    event_type: data?.event_type,
    read:        false,
    receivedAt:  now,
  };
  writeStore([next, ...store]);
  return true;
}

export function markAllAdminNotificationsRead(): void {
  writeStore(readStore().map((n) => ({ ...n, read: true })));
}

export function clearAdminNotifications(): void {
  writeStore([]);
}

// ── React hook ────────────────────────────────────────────────────────────────

export function useAdminNotificationStore() {
  const [items, setItems] = useState<AdminPushNotification[]>([]);

  const refresh = useCallback(() => setItems([...readStore()]), []);

  useEffect(() => {
    refresh();
    listeners.add(refresh);

    // Cross-tab sync: when another tab writes to localStorage, the 'storage'
    // event fires in every OTHER tab. This keeps the bell badge in sync across
    // all open admin panel windows without any server round-trip.
    function handleStorageEvent(e: StorageEvent) {
      if (e.key === STORAGE_KEY) refresh();
    }
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      listeners.delete(refresh);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [refresh]);

  const unreadCount = items.filter((n) => !n.read).length;

  return {
    items,
    unreadCount,
    markAllRead: markAllAdminNotificationsRead,
    clearAll:    clearAdminNotifications,
  };
}
