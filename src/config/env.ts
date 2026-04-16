/**
 * src/config/env.ts — Centralized environment configuration
 *
 * Two objects: `dev` and `production` — same properties.
 * Automatically selects based on Vite's import.meta.env.DEV.
 *
 * `import.meta.env.DEV` is set automatically by Vite:
 *   - `vite` (dev server)  → true
 *   - `vite build`         → false
 */

// ── Dev Environment ──────────────────────────────────────────────────────────
const dev = {
  API_ORIGIN: "https://shop-api.shoplinkbd.com",
  IMAGE_URL: "https://shop-api.shoplinkbd.com",
  API_PREFIX: "/api/v1",

  FIREBASE_CONFIG: {
    apiKey: "AIzaSyC4fJZkFkNELDlaRDpnGgKCVEPRHiJqxio",
    authDomain: "ecom-cf845.firebaseapp.com",
    projectId: "ecom-cf845",
    storageBucket: "ecom-cf845.firebasestorage.app",
    messagingSenderId: "1083282032252",
    appId: "1:1083282032252:web:a735a6ec3fe0fc733aebf9",
    measurementId: "G-V8X1WY30JC",
  },
  FIREBASE_VAPID_KEY: "BKBNywW3bD6z0GNXtR6g2-C5Kqyb5MYq2AWiRV4AK8Ru5R9xrfSSejy3kV2zZjnHlpmgYn_1KQDW7bjyHo_JLJM",
};

// ── Live Dev Environment ──────────────────────────────────────────────────────────
const live_dev = {
  API_ORIGIN: "https://shop-api.shoplinkbd.com",
  IMAGE_URL: "https://shop.shoplinkbd.com",
  API_PREFIX: "/api/v1",

  FIREBASE_CONFIG: {
    apiKey: "AIzaSyC4fJZkFkNELDlaRDpnGgKCVEPRHiJqxio",
    authDomain: "ecom-cf845.firebaseapp.com",
    projectId: "ecom-cf845",
    storageBucket: "ecom-cf845.firebasestorage.app",
    messagingSenderId: "1083282032252",
    appId: "1:1083282032252:web:a735a6ec3fe0fc733aebf9",
    measurementId: "G-V8X1WY30JC",
  },
  FIREBASE_VAPID_KEY: "BKBNywW3bD6z0GNXtR6g2-C5Kqyb5MYq2AWiRV4AK8Ru5R9xrfSSejy3kV2zZjnHlpmgYn_1KQDW7bjyHo_JLJM",
};

// ── Production Environment ───────────────────────────────────────────────────
const production = {
  API_ORIGIN: "https://graduatefashion-api-641431966702.asia-south1.run.app",
  IMAGE_URL: "https://storage.googleapis.com/graduate-ecom-mumbai-641431966702",
  API_PREFIX: "/api/v1",

  FIREBASE_CONFIG: {
    apiKey: "AIzaSyC4fJZkFkNELDlaRDpnGgKCVEPRHiJqxio",
    authDomain: "ecom-cf845.firebaseapp.com",
    projectId: "ecom-cf845",
    storageBucket: "ecom-cf845.firebasestorage.app",
    messagingSenderId: "1083282032252",
    appId: "1:1083282032252:web:a735a6ec3fe0fc733aebf9",
    measurementId: "G-V8X1WY30JC",
  },
  FIREBASE_VAPID_KEY: "BKBNywW3bD6z0GNXtR6g2-C5Kqyb5MYq2AWiRV4AK8Ru5R9xrfSSejy3kV2zZjnHlpmgYn_1KQDW7bjyHo_JLJM",
};

// ── Auto-select ──────────────────────────────────────────────────────────────
// `import.meta.env.DEV` → true on `vite`, false on `vite build`
// const env = import.meta.env.DEV ? dev : production;÷
const env = production;

export const API_ORIGIN = env.API_ORIGIN;
export const IMAGE_URL = env.IMAGE_URL;
export const API_PREFIX = env.API_PREFIX;
export const API_BASE_URL = `${env.API_ORIGIN}${env.API_PREFIX}`;
export const FIREBASE_CONFIG = env.FIREBASE_CONFIG;
export const FIREBASE_VAPID_KEY = env.FIREBASE_VAPID_KEY;

export function toPublicUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${IMAGE_URL}${path}`;
}
