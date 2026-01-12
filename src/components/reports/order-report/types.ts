export type TimePeriodKey = "today" | "last7" | "thisMonth" | "thisYear";

export type OrderReportTabKey = "dashboard" | "report";

export type OrderStatusKey =
  | "new"
  | "approved"
  | "processing"
  | "packaging"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "cancelled"
  | "draft"
  | "on_hold"
  | "trash";

export type OrderReportMetric = {
  key: "total" | "completed" | "cancelled" | "pending";
  label: string;
  qty: number;
};

export type TodaySummary = {
  order: number;
  completed: number;
  cancelled: number;
  pending: number;
};

export type DeliveryFlowItem = {
  key: OrderStatusKey;
  label: string;
  qty: number;
  tone: "brand" | "success" | "warning" | "error" | "muted";
};

export type OrderReportRow = {
  id: string;
  customerName: string;
  phone: string;
  items: number;
  orderAmount: number;
  orderCost: number;
  status: "completed" | "pending" | "cancelled";
  createdAt: string; // yyyy-mm-dd
};

export type YearlyBarSeries = {
  year: "2020" | "2021" | "2022";
  values: number[]; // 12 months
};

export type OrderOverall = {
  totalOrderAmount: number;
  totalOrderCost: number;
};
