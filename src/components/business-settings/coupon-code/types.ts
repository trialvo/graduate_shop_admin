export type CouponLang = "default" | "en" | "ar";

export type CouponType =
  | "GENERAL"
  | "CUSTOMER"
  | "FREE_DELIVERY"
  | "CATEGORY"
  | "PRODUCT";

export type DiscountType = "PERCENT" | "AMOUNT" | "FREE_DELIVERY";

export type CouponStatus = boolean;

export type CouponTarget =
  | { kind: "ALL" }
  | { kind: "CUSTOMERS"; customerIds: number[] }
  | { kind: "CATEGORIES"; categoryIds: number[] }
  | { kind: "PRODUCTS"; productIds: number[] };

export interface CouponTitles {
  default: string;
  en: string;
  ar: string;
}

export interface CouponRow {
  id: number;

  titles: CouponTitles;
  code: string;

  type: CouponType;

  target: CouponTarget;

  discountType: DiscountType;
  discountValue: number; // percent or amount (0 for free delivery)
  maxDiscount: number; // for percent/amount, optional clamp, 0 means none
  minPurchase: number;

  usageLimitTotal: number; // 0 = unlimited
  usageLimitPerUser: number; // 0 = unlimited
  totalUses: number; // analytics/demo

  startDate: string; // yyyy-mm-dd
  expireDate: string; // yyyy-mm-dd

  stackable: boolean; // can combine with other coupons
  firstOrderOnly: boolean;
  newCustomerOnly: boolean;

  status: CouponStatus;

  createdAt: string;
  updatedAt: string;
}

export function safeNumber(input: string, fallback: number): number {
  const n = Number(input);
  return Number.isFinite(n) ? n : fallback;
}
