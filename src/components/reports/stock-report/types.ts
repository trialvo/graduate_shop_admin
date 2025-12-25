export type TimePeriodKey = "today" | "last7" | "thisMonth" | "thisYear";

export type StockReportTabKey = "dashboard" | "report";

export type StockLevelStatus = "in_stock" | "low_stock" | "out_of_stock";

export type StockMetricKey = "total_sku" | "in_stock" | "low_stock" | "out_of_stock" | "restock";

export type StockReportMetric = {
  key: StockMetricKey;
  label: string;
  qty: number;
};

export type StockHealthSummary = {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  stockValue: number;
};

export type LowStockProduct = {
  id: string;
  name: string;
  sku: string;
  categoryPath: string;
  stockQty: number;
  reorderLevel: number;
  updatedAt: string;
};

export type StockCategoryRow = {
  id: string;
  name: string;
  totalSku: number;
  lowStock: number;
  outOfStock: number;
};

export type StockTrendPoint = {
  month: string; // Jan..Dec
  in: number;
  out: number;
};

export type StockReportRow = {
  id: string;
  name: string;
  sku: string;
  categoryPath: string;
  stockQty: number;
  reorderLevel: number;
  status: StockLevelStatus;
  lastUpdated: string; // yyyy-mm-dd
};
