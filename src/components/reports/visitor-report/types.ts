export type VisitorMetricKey =
  | "active"
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "total";

export type VisitorMetric = {
  key: VisitorMetricKey;
  label: string;
  value: number;
  hint?: string;
};

export type VisitorDayPoint = {
  date: string; // yyyy-mm-dd
  visitors: number;
};

export type TopPageRow = {
  path: string;
  title: string;
  visitors: number;
  bounceRatePct: number;
  avgTimeSec: number;
};

export type TrafficSourceRow = {
  source: string;
  visitors: number;
  pct: number;
};

export type DeviceShareRow = {
  device: "Desktop" | "Mobile" | "Tablet";
  pct: number;
};
