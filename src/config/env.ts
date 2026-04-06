const DEFAULT_API_ORIGIN =
  import.meta.env.DEV
    ? "http://localhost:7000"
    : "https://graduatefashion-api-641431966702.asia-south1.run.app";

export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || DEFAULT_API_ORIGIN;
export const PUBLIC_ORIGIN = import.meta.env.VITE_ASSET_ORIGIN || API_ORIGIN;

export const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api/v1";

export const API_BASE_URL = `${API_ORIGIN}${API_PREFIX}`;

export function toPublicUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${PUBLIC_ORIGIN}${path}`;
}

// ── Firebase Push Notifications (V2-034) ─────────────────────────────────────
// Values are loaded from VITE_FIREBASE_* environment variables.
// For local dev:  set in .env.local  (not committed to git)
// For production: set in .env.production or CI/CD environment
export const FIREBASE_CONFIG = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY             || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         || '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID          || '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              || '',
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID      || '',
};

// VAPID public key — Firebase Console → Project Settings → Cloud Messaging
// → Web Push certificates → Generate key pair
export const FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
