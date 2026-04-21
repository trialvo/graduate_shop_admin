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
  API_ORIGIN: "http://localhost:9000",
  PUBLIC_ORIGIN: "http://localhost:9000",
  API_PREFIX: "/api/v1",

  FIREBASE_CONFIG: {
    apiKey: "AIzaSyAeak1AHqd69XyYx7_rwFrBCqhg0zTYjHA",
    authDomain: "graduatefashion.firebaseapp.com",
    projectId: "graduatefashion",
    storageBucket: "graduatefashion.firebasestorage.app",
    messagingSenderId: "641431966702",
    appId: "1:641431966702:web:95b602b594d576dfeeb4ff",
    measurementId: "G-LL5PHT6M9L",
  },
  FIREBASE_VAPID_KEY: "BFJkMtzWWy_lZQ0IPrt_ZsgnKsTvtDHkSmCIs4v_y56HwYH4xE3OJLS4UpPXGe772KI2D50XMM7FR1A8D-KO2cY",
};

// ── Live Dev Environment ──────────────────────────────────────────────────────────
const live_dev = {
  API_ORIGIN: "https://shop-api.shoplinkbd.com",
  IMAGE_URL: "https://shop.shoplinkbd.com",
  API_PREFIX: "/api/v1",

  FIREBASE_CONFIG: {
    apiKey: "AIzaSyAeak1AHqd69XyYx7_rwFrBCqhg0zTYjHA",
    authDomain: "graduatefashion.firebaseapp.com",
    projectId: "graduatefashion",
    storageBucket: "graduatefashion.firebasestorage.app",
    messagingSenderId: "641431966702",
    appId: "1:641431966702:web:95b602b594d576dfeeb4ff",
    measurementId: "G-LL5PHT6M9L",
  },
  FIREBASE_VAPID_KEY: "BFJkMtzWWy_lZQ0IPrt_ZsgnKsTvtDHkSmCIs4v_y56HwYH4xE3OJLS4UpPXGe772KI2D50XMM7FR1A8D-KO2cY",
};

// ── Production Environment ───────────────────────────────────────────────────
const production = {
  API_ORIGIN: "https://graduatefashion-api-641431966702.asia-south1.run.app",
  // Images served directly from public GCS bucket — no Cloud Run hop
  PUBLIC_ORIGIN: "https://storage.googleapis.com/graduate-ecom-mumbai-641431966702",
  API_PREFIX: "/api/v1",

  FIREBASE_CONFIG: {
    apiKey: "AIzaSyAeak1AHqd69XyYx7_rwFrBCqhg0zTYjHA",
    authDomain: "graduatefashion.firebaseapp.com",
    projectId: "graduatefashion",
    storageBucket: "graduatefashion.firebasestorage.app",
    messagingSenderId: "641431966702",
    appId: "1:641431966702:web:95b602b594d576dfeeb4ff",
    measurementId: "G-LL5PHT6M9L",
  },
  FIREBASE_VAPID_KEY: "BFJkMtzWWy_lZQ0IPrt_ZsgnKsTvtDHkSmCIs4v_y56HwYH4xE3OJLS4UpPXGe772KI2D50XMM7FR1A8D-KO2cY",
};

// ── Auto-select ──────────────────────────────────────────────────────────────
// Vite sets import.meta.env.DEV=true during `vite dev`, false during `vite build`.
const env = dev;

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
