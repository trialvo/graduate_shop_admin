import type { CouponRow } from "./types";

export type CustomerLite = { id: number; name: string; phone: string };
export type CategoryLite = { id: number; name: string };
export type ProductLite = { id: number; name: string; sku: string };

export const CUSTOMERS: CustomerLite[] = [
  { id: 101, name: "Nazmul Hasan", phone: "+8801711122233" },
  { id: 102, name: "Rooney Hossain", phone: "+8801999888777" },
  { id: 103, name: "Mehedi Hossain", phone: "+8801555444333" },
];

export const CATEGORIES: CategoryLite[] = [
  { id: 1, name: "Bag" },
  { id: 2, name: "Books" },
  { id: 3, name: "Mobile Accessories" },
  { id: 4, name: "T-shirt" },
];

export const PRODUCTS: ProductLite[] = [
  { id: 9001, name: "Men T-shirt", sku: "TSHIRT-001" },
  { id: 9002, name: "Ladies Bag", sku: "BAG-001" },
  { id: 9003, name: "Sandal", sku: "SANDAL-001" },
];

export const INITIAL_COUPONS: CouponRow[] = [
  {
    id: 1,
    titles: { default: "Big Offer", en: "Big Offer", ar: "عرض كبير" },
    code: "BIG50",
    type: "GENERAL",
    target: { kind: "ALL" },
    discountType: "PERCENT",
    discountValue: 25,
    maxDiscount: 300,
    minPurchase: 100,
    usageLimitTotal: 0,
    usageLimitPerUser: 1,
    totalUses: 8,
    startDate: "2025-12-22",
    expireDate: "2025-12-31",
    stackable: false,
    firstOrderOnly: false,
    newCustomerOnly: false,
    status: true,
    createdAt: "2025-12-22 10:00 PM",
    updatedAt: "2025-12-22 10:00 PM",
  },
  {
    id: 2,
    titles: { default: "Free Delivery", en: "Free Delivery", ar: "توصيل مجاني" },
    code: "FREEDEL",
    type: "FREE_DELIVERY",
    target: { kind: "ALL" },
    discountType: "FREE_DELIVERY",
    discountValue: 0,
    maxDiscount: 0,
    minPurchase: 0,
    usageLimitTotal: 0,
    usageLimitPerUser: 0,
    totalUses: 2,
    startDate: "2025-12-22",
    expireDate: "2026-01-10",
    stackable: true,
    firstOrderOnly: false,
    newCustomerOnly: false,
    status: true,
    createdAt: "2025-12-22 10:05 PM",
    updatedAt: "2025-12-22 10:05 PM",
  },
  {
    id: 3,
    titles: { default: "VIP Customer", en: "VIP Customer", ar: "عميل VIP" },
    code: "VIP150",
    type: "CUSTOMER",
    target: { kind: "CUSTOMERS", customerIds: [101] },
    discountType: "AMOUNT",
    discountValue: 150,
    maxDiscount: 0,
    minPurchase: 500,
    usageLimitTotal: 20,
    usageLimitPerUser: 5,
    totalUses: 1,
    startDate: "2025-12-22",
    expireDate: "2025-12-30",
    stackable: false,
    firstOrderOnly: true,
    newCustomerOnly: false,
    status: true,
    createdAt: "2025-12-22 10:10 PM",
    updatedAt: "2025-12-22 10:10 PM",
  },
];
