import type {
  DeviceShareRow,
  TopPageRow,
  TrafficSourceRow,
  VisitorDayPoint,
  VisitorMetric,
} from "./types";

export const VISITOR_METRICS: VisitorMetric[] = [
  { key: "active", label: "Active Visitor", value: 0, hint: "Real-time" },
  { key: "today", label: "Today Visitor", value: 2 },
  { key: "yesterday", label: "Yesterday Visitor", value: 11 },
  { key: "this_week", label: "This Week Visitor", value: 88 },
  { key: "last_week", label: "Last Week Visitor", value: 126 },
  { key: "this_month", label: "This Month Visitor", value: 392 },
  { key: "last_month", label: "Last Month Visitor", value: 0 },
  { key: "total", label: "Total Visitor", value: 392 },
];

export const VISITOR_LAST_30_DAYS: VisitorDayPoint[] = [
  { date: "2025-12-04", visitors: 5 },
  { date: "2025-12-05", visitors: 32 },
  { date: "2025-12-06", visitors: 26 },
  { date: "2025-12-07", visitors: 27 },
  { date: "2025-12-08", visitors: 18 },
  { date: "2025-12-09", visitors: 17 },
  { date: "2025-12-10", visitors: 12 },
  { date: "2025-12-11", visitors: 21 },
  { date: "2025-12-12", visitors: 14 },
  { date: "2025-12-13", visitors: 34 },
  { date: "2025-12-14", visitors: 26 },
  { date: "2025-12-15", visitors: 22 },
  { date: "2025-12-16", visitors: 21 },
  { date: "2025-12-17", visitors: 10 },
  { date: "2025-12-18", visitors: 13 },
  { date: "2025-12-19", visitors: 4 },
  { date: "2025-12-20", visitors: 17 },
  { date: "2025-12-21", visitors: 22 },
  { date: "2025-12-22", visitors: 8 },
  { date: "2025-12-23", visitors: 17 },
  { date: "2025-12-24", visitors: 13 },
  { date: "2025-12-25", visitors: 11 },
  { date: "2025-12-26", visitors: 2 },
];

export const TOP_PAGES: TopPageRow[] = [
  { path: "/", title: "Homepage", visitors: 142, bounceRatePct: 34, avgTimeSec: 98 },
  { path: "/products", title: "All Products", visitors: 96, bounceRatePct: 41, avgTimeSec: 74 },
  { path: "/order-report", title: "Order Report", visitors: 61, bounceRatePct: 29, avgTimeSec: 125 },
  { path: "/stock-report", title: "Stock Report", visitors: 44, bounceRatePct: 37, avgTimeSec: 88 },
  { path: "/my-profile", title: "My Profile", visitors: 31, bounceRatePct: 48, avgTimeSec: 52 },
];

export const TRAFFIC_SOURCES: TrafficSourceRow[] = [
  { source: "Direct", visitors: 210, pct: 54 },
  { source: "Google / Organic", visitors: 124, pct: 32 },
  { source: "Facebook", visitors: 36, pct: 9 },
  { source: "Referral", visitors: 22, pct: 5 },
];

export const DEVICE_SHARE: DeviceShareRow[] = [
  { device: "Desktop", pct: 52 },
  { device: "Mobile", pct: 43 },
  { device: "Tablet", pct: 5 },
];
