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
  API_ORIGIN: "http://localhost:7010",
  PUBLIC_ORIGIN: "http://localhost:7010",
  IMAGE_URL: "http://localhost:7010",
  API_PREFIX: "/api/v1",
};

// ── Live Dev Environment ──────────────────────────────────────────────────────────
const live_dev = {
  API_ORIGIN: "https://shop-api.shoplinkbd.com",
  IMAGE_URL: "https://shop.shoplinkbd.com",
  API_PREFIX: "/api/v1",
};

// ── Production Environment ───────────────────────────────────────────────────
const production = {
  API_ORIGIN: "https://graduatefashion-api-641431966702.asia-south1.run.app",
  // Images served directly from public GCS bucket — no Cloud Run hop
  PUBLIC_ORIGIN: "https://storage.googleapis.com/graduate-ecom-mumbai-641431966702",
  IMAGE_URL: "https://storage.googleapis.com/graduate-ecom-mumbai-641431966702",
  API_PREFIX: "/api/v1",
};

// ── VPS IP deploy ────────────────────────────────────────────────────────────
const vps = {
  API_ORIGIN: "http://46.250.224.125",
  PUBLIC_ORIGIN: "http://46.250.224.125",
  IMAGE_URL: "http://46.250.224.125",
  API_PREFIX: "/api/v1",
};

// ── Auto-select ──────────────────────────────────────────────────────────────
// VITE_DEPLOY_TARGET=vps during `vite build` selects the VPS profile.
const deployTarget = import.meta.env.VITE_DEPLOY_TARGET || "";
const env =
  deployTarget === "vps" ? vps : import.meta.env.DEV ? dev : production;

export const API_ORIGIN = env.API_ORIGIN;
export const IMAGE_URL = env.IMAGE_URL;
export const API_PREFIX = env.API_PREFIX;
export const API_BASE_URL = `${env.API_ORIGIN}${env.API_PREFIX}`;

export function toPublicUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${IMAGE_URL}${path}`;
}
