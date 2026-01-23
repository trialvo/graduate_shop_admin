// export const API_ORIGIN =
//   import.meta.env.VITE_API_ORIGIN || "https://shop-api.shoplinkbd.com";
//   export const PUBLIC_ORIGIN = import.meta.env.VITE_PUBLIC_ORIGIN || "https://shop-api.shoplinkbd.com";

// export const API_ORIGIN = "https://ht08m271-7000.inc1.devtunnels.ms";
// export const PUBLIC_ORIGIN = "https://ht08m271-7000.inc1.devtunnels.ms";

// export const API_ORIGIN = "https://shop-api.trialvo.com";
// export const PUBLIC_ORIGIN = "https://shop-api.trialvo.com";

// export const API_ORIGIN = "https://shop-api.shoplinkbd.com";
// export const PUBLIC_ORIGIN = "https://shop-api.shoplinkbd.com";

export const API_ORIGIN = "https://api.graduatefashionbd.com";
export const PUBLIC_ORIGIN = "https://api.graduatefashionbd.com";

export const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api/v1";

export const API_BASE_URL = `${API_ORIGIN}${API_PREFIX}`;

export function toPublicUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${PUBLIC_ORIGIN}${path}`;
}
