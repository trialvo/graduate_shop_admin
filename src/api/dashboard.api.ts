import { api } from "./client";

export type OverviewBucketKey = "today" | "week" | "month" | "year";

export type OverviewNumbers = {
  total_orders: number;
  total_sales: number;
  total_cancelled: number;
  total_views: number;
};

export type OverviewBucket = {
  current: OverviewNumbers;
  last: OverviewNumbers;
  change: OverviewNumbers; // percent numbers from API (can be 0..100..)
};

export type DashboardOverview = {
  today: OverviewBucket;
  week: OverviewBucket;
  month: OverviewBucket;
  year: OverviewBucket;
};

export type DashboardOverviewResponse = {
  success: boolean;
  overview: DashboardOverview;
};

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
};

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  const res = await api.get("/admin/dashboard/overview");
  return res.data as DashboardOverviewResponse;
}
