export type BannerType =
  | "default"
  | "category_wise"
  | "product_wise"
  | "custom_url";

export type BannerZone =
  | "Home Top"
  | "Home Middle"
  | "Home Bottom"
  | "Category Page"
  | "Product Page"
  | "Campaign";

export type BannerRow = {
  id: number;

  // ✅ Only default title
  title: string;

  zone: BannerZone;
  type: BannerType;

  // Optional targeting
  categoryId?: number | null;
  productId?: number | null;
  url?: string | null;

  // Image
  imageUrl?: string | null; // preview url (mock/local)
  imageFileName?: string | null;

  featured: boolean;
  status: boolean;

  createdAt: string; // ISO string
};

export type CategoryLite = { id: number; name: string };
export type ProductLite = { id: number; name: string; sku: string };

export type Option = { value: string; label: string };

export function nowISO(): string {
  return new Date().toISOString();
}

export function safeText(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export function safeNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
