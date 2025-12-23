import type { CouponRow, CustomerLite, ProductLite } from "./types";

export const INITIAL_PRODUCTS: ProductLite[] = [
  { id: 9001, name: "Men T-shirt", sku: "TSHIRT-001" },
  { id: 9002, name: "Ladies Bag", sku: "BAG-001" },
  { id: 9003, name: "Sandal", sku: "SANDAL-001" },
  { id: 9004, name: "Mobile Accessories", sku: "ACC-001" },
];

export const INITIAL_CUSTOMERS: CustomerLite[] = [
  { id: 101, name: "Nazmul Hasan", phone: "01711122233" },
  { id: 102, name: "Rooney Hossain", phone: "01999988877" },
  { id: 103, name: "Mehedi Hossain", phone: "01815544433" },
  { id: 104, name: "Fahim Ahmed", phone: "01999977666" },
];

export const INITIAL_COUPONS: CouponRow[] = [
  {
    id: 1,
    title: "Big Offer",
    code: "BIG123",
    discountType: "flat",
    discountValue: 200,
    minPurchase: 1000,
    maxDiscount: 0,
    limitPerUser: 2,
    startDate: "2025-12-22",
    expireDate: "2025-12-31",
    status: true,

    productScope: "all",
    productIds: [],

    customerScope: "all",
    customerIds: [],

    totalUses: 1,
  },
  {
    id: 2,
    title: "Festival Offer",
    code: "FEST25",
    discountType: "percent",
    discountValue: 25,
    minPurchase: 2000,
    maxDiscount: 500,
    limitPerUser: 1,
    startDate: "2025-12-20",
    expireDate: "2025-12-30",
    status: true,

    productScope: "specific",
    productIds: [9001, 9003],

    customerScope: "specific",
    customerIds: [101, 103],

    totalUses: 0,
  },
];
