export type ThemeMode = "light" | "dark";

export type SiteConfig = {
  /** Shown in page titles, login screen, sidebar header etc. */
  appName: string;
  /** Shorter name (PWA / compact UI if needed). */
  appShortName?: string;

  /** Brand assets (public/ path or full URL). */
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  appleTouchIconUrl?: string;
  defaultOgImageUrl?: string;

  /** Title template: <Page> <separator> <App>. */
  titleSeparator: string;

  /** Default meta description used when a page does not provide one. */
  defaultDescription: string;

  /** Default theme when no saved value exists. */
  defaultTheme: ThemeMode;

  /** Used in meta theme-color (browser UI color). */
  themeColorLight: string;
  themeColorDark: string;
};

/**
 * ✅ Single source of truth for your admin branding + defaults.
 *
 * Change values here to update:
 * - App name
 * - Logo
 * - Favicon
 * - Default theme
 * - Default meta description/OG image (via PageMeta)
 */
export const siteConfig: SiteConfig = {
  appName: "Trialvo Shop Admin",
  appShortName: "Shop Admin",

  // ✅ Your project already has these assets:
  // public/images/logo/logo.svg
  // public/images/logo/logo-dark.svg
  logoLightUrl: "/images/logo/logo.svg",
  logoDarkUrl: "/images/logo/logo-dark.svg",

  // ✅ Your project already has: public/favicon.png
  faviconUrl: "/favicon.png",

  // appleTouchIconUrl: "/apple-touch-icon.png",
  // defaultOgImageUrl: "/og-image.png",

  titleSeparator: "|",

  defaultDescription:
    "Admin dashboard for managing products, orders, customers, and settings.",

  defaultTheme: "light",

  // Keep these aligned with your Tailwind theme brand colors.
  themeColorLight: "#465fff",
  themeColorDark: "#161950",
};

/** LocalStorage keys used across the app (keep centralized). */
export const storageKeys = {
  theme: "theme",
  branding: "app_branding",
} as const;
