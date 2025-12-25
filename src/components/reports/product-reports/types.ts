export type TimePeriodKey = "today" | "last7" | "thisMonth" | "thisYear";

export type ProductPublishStatus = "published" | "draft" | "trash" | "coupon";

export type ReportStatus = "active" | "inactive";

export type CategoryLite = {
  id: string;
  name: string;
  count: number;
};

export type BestProduct = {
  id: string;
  name: string;
  imageUrl?: string;
  soldQty: number;
  stockQty: number;
};

export type ProductStatusSummary = {
  published: number;
  draft: number;
  trash: number;
  coupon: number;
  inventoryValue: number;
};

export type ProductReportMetric = {
  key: string;
  label: string;
  qty: number;
};

export type ProductReportRow = {
  id: string;
  name: string;
  sku: string;
  categoryPath: string;
  stockQty: number;
  soldQty: number;
  revenue: number;
  cost: number;
  profit: number;
  status: ReportStatus;
  updatedAt: string;
};
