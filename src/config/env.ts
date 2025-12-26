export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "https://api.graduatefashionbd.com";

export const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api/v1";

export const API_BASE_URL = `${API_ORIGIN}${API_PREFIX}`;

/**
 * Backend returns paths like: "/uploads/profiles/admins/17/xxx.png"
 * Convert to: "https://api.graduatefashionbd.com/uploads/..."
 */
export function toPublicUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}
