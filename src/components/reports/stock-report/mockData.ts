import type {
  LowStockProduct,
  StockCategoryRow,
  StockHealthSummary,
  StockReportMetric,
  StockReportRow,
  StockTrendPoint,
} from "./types";

export const STOCK_REPORT_METRICS: StockReportMetric[] = [
  { key: "total_sku", label: "Total SKU", qty: 125 },
  { key: "in_stock", label: "In Stock", qty: 98 },
  { key: "low_stock", label: "Low Stock", qty: 21 },
  { key: "out_of_stock", label: "Out of Stock", qty: 6 },
  { key: "restock", label: "Restock Requests", qty: 9 },
];

export const STOCK_HEALTH: StockHealthSummary = {
  inStock: 98,
  lowStock: 21,
  outOfStock: 6,
  stockValue: 218211,
};

export const LOW_STOCK_PRODUCTS: LowStockProduct[] = [
  {
    id: "LS-1001",
    name: "Tones Mild Chili Powder",
    sku: "SKU-SPC-011",
    categoryPath: "Dairy & Eggs > Spices",
    stockQty: 8,
    reorderLevel: 25,
    updatedAt: "2025-10-09",
  },
  {
    id: "LS-1002",
    name: "Bathroom Foam Cleaner",
    sku: "SKU-CLN-002",
    categoryPath: "Cleaning",
    stockQty: 12,
    reorderLevel: 40,
    updatedAt: "2025-10-11",
  },
  {
    id: "LS-1003",
    name: "Fresh Green Peas",
    sku: "SKU-VEG-005",
    categoryPath: "Dairy & Eggs > Vegetables",
    stockQty: 10,
    reorderLevel: 35,
    updatedAt: "2025-10-07",
  },
  {
    id: "LS-1004",
    name: "Premium Aromatic Atta",
    sku: "SKU-FOOD-033",
    categoryPath: "Dairy & Eggs > Grocery > Flour",
    stockQty: 15,
    reorderLevel: 60,
    updatedAt: "2025-10-08",
  },
];

export const STOCK_CATEGORIES: StockCategoryRow[] = [
  { id: "c1", name: "Cleaning", totalSku: 18, lowStock: 3, outOfStock: 1 },
  { id: "c2", name: "Dairy & Eggs", totalSku: 55, lowStock: 12, outOfStock: 2 },
  { id: "c3", name: "Electronics", totalSku: 22, lowStock: 2, outOfStock: 1 },
  { id: "c4", name: "Gadgets", totalSku: 15, lowStock: 2, outOfStock: 1 },
  { id: "c5", name: "Stationery", totalSku: 15, lowStock: 2, outOfStock: 1 },
];

export const STOCK_TREND: StockTrendPoint[] = [
  { month: "Jan", in: 82, out: 45 },
  { month: "Feb", in: 90, out: 54 },
  { month: "Mar", in: 100, out: 58 },
  { month: "Apr", in: 92, out: 50 },
  { month: "May", in: 88, out: 62 },
  { month: "Jun", in: 104, out: 56 },
  { month: "Jul", in: 96, out: 70 },
  { month: "Aug", in: 112, out: 60 },
  { month: "Sep", in: 98, out: 66 },
  { month: "Oct", in: 86, out: 55 },
  { month: "Nov", in: 94, out: 60 },
  { month: "Dec", in: 90, out: 58 },
];

export const STOCK_REPORT_ROWS: StockReportRow[] = [
  {
    id: "SR-1001",
    name: "Multi-Purpose Cleaner",
    sku: "SKU-CLN-001",
    categoryPath: "Cleaning",
    stockQty: 99,
    reorderLevel: 25,
    status: "in_stock",
    lastUpdated: "2025-10-12",
  },
  {
    id: "SR-1002",
    name: "Bathroom Foam Cleaner",
    sku: "SKU-CLN-002",
    categoryPath: "Cleaning",
    stockQty: 12,
    reorderLevel: 40,
    status: "low_stock",
    lastUpdated: "2025-10-11",
  },
  {
    id: "SR-1003",
    name: "Lay's Classic Chips",
    sku: "SKU-FOOD-020",
    categoryPath: "Dairy & Eggs > Snacks > Chips",
    stockQty: 3000,
    reorderLevel: 300,
    status: "in_stock",
    lastUpdated: "2025-10-10",
  },
  {
    id: "SR-1004",
    name: "Tones Mild Chili Powder",
    sku: "SKU-SPC-011",
    categoryPath: "Dairy & Eggs > Spices",
    stockQty: 8,
    reorderLevel: 25,
    status: "low_stock",
    lastUpdated: "2025-10-09",
  },
  {
    id: "SR-1005",
    name: "Premium Aromatic Atta",
    sku: "SKU-FOOD-033",
    categoryPath: "Dairy & Eggs > Grocery > Flour",
    stockQty: 0,
    reorderLevel: 60,
    status: "out_of_stock",
    lastUpdated: "2025-10-08",
  },
  {
    id: "SR-1006",
    name: "Fresh Green Peas",
    sku: "SKU-VEG-005",
    categoryPath: "Dairy & Eggs > Vegetables",
    stockQty: 10,
    reorderLevel: 35,
    status: "low_stock",
    lastUpdated: "2025-10-07",
  },
];
