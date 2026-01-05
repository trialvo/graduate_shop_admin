import type {
  BestProduct,
  CategoryLite,
  ProductReportMetric,
  ProductReportRow,
  ProductStatusSummary,
} from "./types";

export const PRODUCT_REPORT_METRICS: ProductReportMetric[] = [
  { key: "total", label: "Total Product", qty: 25 },
  { key: "low", label: "Low Stock", qty: 7 },
  { key: "high", label: "High Stock", qty: 18 },
  { key: "category", label: "Total Category", qty: 5 },
  { key: "upcoming", label: "Upcoming", qty: 2 },
];

export const PRODUCT_STATUS_SUMMARY: ProductStatusSummary = {
  published: 19,
  draft: 3,
  trash: 0,
  coupon: 0,
  inventoryValue: 2182.11,
};

export const BEST_PRODUCTS: BestProduct[] = [
  {
    id: "BP-1001",
    name: "Smart Home Voice Assistant Speaker",
    imageUrl: "/images/products/chips.png",
    soldQty: 125,
    stockQty: 90,
  },
  {
    id: "BP-1002",
    name: "Curved Display Monitor 27\"",
    imageUrl: "/images/products/foam.png",
    soldQty: 189,
    stockQty: 140,
  },
  {
    id: "BP-1003",
    name: "Premium Aromatic Atta",
    imageUrl: "/images/products/atta.png",
    soldQty: 72,
    stockQty: 55,
  },
  {
    id: "BP-1004",
    name: "Fresh Green Peas",
    imageUrl: "/images/products/peas.png",
    soldQty: 38,
    stockQty: 34,
  },
];

export const TOP_CATEGORIES: CategoryLite[] = [
  { id: "c1", name: "Electronics", count: 19 },
  { id: "c2", name: "Gadgets", count: 35 },
  { id: "c3", name: "Display", count: 2 },
  { id: "c4", name: "Watch", count: 2 },
  { id: "c5", name: "Desktop", count: 7 },
];

export const OVERALL_SUMMARY = {
  totalItemPrice: 98000,
  totalItemCost: 51470,
};

export const PRODUCT_REPORT_ROWS: ProductReportRow[] = [
  {
    id: "PR-1001",
    name: "Multi-Purpose Cleaner",
    sku: "SKU-CLN-001",
    categoryPath: "Cleaning",
    stockQty: 99,
    soldQty: 28,
    revenue: 280,
    cost: 190,
    profit: 90,
    status: "active",
    updatedAt: "2025-10-12",
  },
  {
    id: "PR-1002",
    name: "Bathroom Foam Cleaner",
    sku: "SKU-CLN-002",
    categoryPath: "Cleaning",
    stockQty: 500,
    soldQty: 64,
    revenue: 1600,
    cost: 960,
    profit: 640,
    status: "active",
    updatedAt: "2025-10-11",
  },
  {
    id: "PR-1003",
    name: "Lay's Classic Chips",
    sku: "SKU-FOOD-020",
    categoryPath: "Dairy & Eggs > Snacks > Chips",
    stockQty: 3000,
    soldQty: 420,
    revenue: 30240,
    cost: 23100,
    profit: 7140,
    status: "active",
    updatedAt: "2025-10-10",
  },
  {
    id: "PR-1004",
    name: "Tones Mild Chili Powder",
    sku: "SKU-SPC-011",
    categoryPath: "Dairy & Eggs > Spices",
    stockQty: 8,
    soldQty: 12,
    revenue: 1200,
    cost: 840,
    profit: 360,
    status: "inactive",
    updatedAt: "2025-10-09",
  },
  {
    id: "PR-1005",
    name: "Premium Aromatic Atta",
    sku: "SKU-FOOD-033",
    categoryPath: "Dairy & Eggs > Grocery > Flour",
    stockQty: 5000,
    soldQty: 510,
    revenue: 130050,
    cost: 104550,
    profit: 25500,
    status: "active",
    updatedAt: "2025-10-08",
  },
  {
    id: "PR-1006",
    name: "Fresh Green Peas",
    sku: "SKU-VEG-005",
    categoryPath: "Dairy & Eggs > Vegetables",
    stockQty: 997,
    soldQty: 88,
    revenue: 88000,
    cost: 68200,
    profit: 19800,
    status: "active",
    updatedAt: "2025-10-07",
  },
];
