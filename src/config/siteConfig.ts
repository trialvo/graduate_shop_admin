export type ThemeMode = "light" | "dark";

export type SiteConfig = {
  /** Shown in page titles, sidebar header etc. */
  appName: string;
  /** Optional shorter name (compact UI if needed). */
  appShortName?: string;

  /** Brand assets (public path like /images/... or full URL). */
  logoLightUrl: string;
  logoDarkUrl: string;
  /** Small mark/icon used in collapsed sidebar etc. */
  logoIconUrl: string;
  /** Optional auth page logo. If omitted, logoIconUrl will be used. */
  authLogoUrl?: string;

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
 * Change values here to update the whole dashboard.
 */
export const siteConfig: SiteConfig = {
  appName: "Trialvo Shop Admin",
  appShortName: "Shop Admin",

  // public/images/logo/logo.svg
  // public/images/logo/logo-dark.svg
  // ✅ Light theme → dark logo (better contrast on white)
  logoLightUrl: "/images/logo/my_dark_logo.svg",
  // ✅ Dark theme → light logo (better contrast on dark)
  logoDarkUrl: "/images/logo/my_light_logo.svg",
  logoIconUrl: "/images/logo/my_dark_logo.svg",
  authLogoUrl: "/images/logo/my_dark_logo.svg",

  // public/favicon.png
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
