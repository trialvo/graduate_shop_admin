import type {
  DeliveryFlowItem,
  OrderOverall,
  OrderReportMetric,
  OrderReportRow,
  TodaySummary,
  YearlyBarSeries,
} from "./types";

export const ORDER_REPORT_METRICS: OrderReportMetric[] = [
  { key: "total", label: "Total Order", qty: 1250 },
  { key: "completed", label: "Completed Order", qty: 875 },
  { key: "cancelled", label: "Cancelled Order", qty: 45 },
  { key: "pending", label: "Pending Order", qty: 5 },
];

export const TODAY_SUMMARY: TodaySummary = {
  order: 19,
  completed: 3,
  cancelled: 0,
  pending: 0,
};

export const DELIVERY_FLOW: DeliveryFlowItem[] = [
  { key: "new", label: "New", qty: 50, tone: "brand" },
  { key: "approved", label: "Approved", qty: 35, tone: "success" },
  { key: "processing", label: "Processing", qty: 28, tone: "brand" },
  { key: "packaging", label: "Packaging", qty: 22, tone: "warning" },
  { key: "shipped", label: "Shipped", qty: 18, tone: "success" },
  { key: "out_for_delivery", label: "Out of Delivery", qty: 12, tone: "brand" },
  { key: "delivered", label: "Delivered", qty: 45, tone: "success" },
  { key: "returned", label: "Returned", qty: 8, tone: "warning" },
  { key: "cancelled", label: "Cancelled", qty: 20, tone: "error" },
  { key: "draft", label: "Draft", qty: 5, tone: "muted" },
  { key: "on_hold", label: "On Hold", qty: 3, tone: "warning" },
  { key: "trash", label: "Trash", qty: 1, tone: "muted" },
];

export const ORDER_OVERALL: OrderOverall = {
  totalOrderAmount: 98000,
  totalOrderCost: 51470,
};

export const ORDER_BAR_SERIES: YearlyBarSeries[] = [
  {
    year: "2020",
    values: [42, 55, 58, 56, 60, 58, 62, 60, 66, 44, 55, 50],
  },
  {
    year: "2021",
    values: [75, 85, 100, 96, 86, 104, 90, 112, 92, 80, 94, 85],
  },
  {
    year: "2022",
    values: [33, 40, 35, 25, 44, 46, 50, 52, 40, 33, 44, 39],
  },
];

export const ORDER_REPORT_ROWS: OrderReportRow[] = [
  {
    id: "OR-1001",
    customerName: "Sarah Johnson",
    phone: "01234567890",
    items: 3,
    orderAmount: 5200,
    orderCost: 3600,
    status: "completed",
    createdAt: "2025-10-18",
  },
  {
    id: "OR-1002",
    customerName: "Michael Chen",
    phone: "01567890123",
    items: 1,
    orderAmount: 899,
    orderCost: 620,
    status: "pending",
    createdAt: "2025-10-18",
  },
  {
    id: "OR-1003",
    customerName: "Emily Davis",
    phone: "01456789012",
    items: 5,
    orderAmount: 12100,
    orderCost: 8900,
    status: "completed",
    createdAt: "2025-10-17",
  },
  {
    id: "OR-1004",
    customerName: "James Wilson",
    phone: "01678901234",
    items: 2,
    orderAmount: 1450,
    orderCost: 1020,
    status: "cancelled",
    createdAt: "2025-10-17",
  },
  {
    id: "OR-1005",
    customerName: "Lisa Anderson",
    phone: "01890123456",
    items: 7,
    orderAmount: 28900,
    orderCost: 20500,
    status: "completed",
    createdAt: "2025-10-16",
  },
  {
    id: "OR-1006",
    customerName: "David Brown",
    phone: "01987654321",
    items: 2,
    orderAmount: 7800,
    orderCost: 6100,
    status: "completed",
    createdAt: "2025-10-16",
  },
];
