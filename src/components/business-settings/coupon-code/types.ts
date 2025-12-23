export type DiscountType = "flat" | "percent";
export type CouponScope = "all" | "specific";

export type CouponRow = {
  id: number;
  title: string;
  code: string;

  discountType: DiscountType;
  discountValue: number;

  minPurchase: number;
  maxDiscount: number; // works for percent coupons, can keep 0 if not needed
  limitPerUser: number;

  startDate: string; // yyyy-mm-dd
  expireDate: string; // yyyy-mm-dd

  status: boolean;

  // NEW:
  productScope: CouponScope;
  productIds: number[];

  customerScope: CouponScope;
  customerIds: number[];

  totalUses: number;
};

export type ProductLite = {
  id: number;
  name: string;
  sku: string;
};

export type CustomerLite = {
  id: number;
  name: string;
  phone: string;
};

export type Option = { value: string; label: string };

export function safeNumber(input: string, fallback = 0): number {
  const n = Number(input);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
