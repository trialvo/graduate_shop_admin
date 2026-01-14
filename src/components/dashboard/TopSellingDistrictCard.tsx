import * as React from "react";
import { MapPin } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import TopSellingDistrictModal from "./TopSellingDistrictModal";
import TopViewedRangeFilter from "./TopViewedRangeFilter";

import {
  dashboardKeys,
  getDashboardTopSellingArea,
  type DashboardTimeRange,
  type DashboardTopSellingAreaItem,
} from "@/api/dashboard.api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function formatBDTFromString(v: string): string {
  const n = Number.parseFloat(v);
  if (!Number.isFinite(n)) return "৳0";
  const formatted = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(n);
  return `৳${formatted}`;
}

function titleCase(s: string): string {
  if (!s) return "—";
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function revenueNumber(v: string): number {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

const TopSellingDistrictCard: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  // ✅ API default is all
  const [timeRange, setTimeRange] = React.useState<DashboardTimeRange>("all");

  const query = useQuery({
    queryKey: dashboardKeys.topSellingAreaList({ timeRange, limit: PAGE_SIZE, offset: 0 }),
    queryFn: () => getDashboardTopSellingArea({ timeRange, limit: PAGE_SIZE, offset: 0 }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const rows: DashboardTopSellingAreaItem[] = query.data?.data ?? [];
  const totalCount = query.data?.meta?.count ?? 0;

  const maxRevenue = React.useMemo(() => {
    if (!rows.length) return 0;
    return Math.max(...rows.map((r) => revenueNumber(r.total_revenue)));
  }, [rows]);

  return (
    <div className="h-full w-full rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 flex flex-col">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">Top Selling by District</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {query.isError ? "Failed to load data." : `Showing top ${PAGE_SIZE} areas by revenue.`}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <TopViewedRangeFilter value={timeRange} onChange={setTimeRange} />

          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn("text-sm font-semibold text-brand-600 hover:text-brand-700", "dark:text-brand-400")}
          >
            View More
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {query.isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-4 py-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse dark:bg-gray-800" />
                <div className="flex-1">
                  <div className="h-4 w-40 rounded bg-gray-200 animate-pulse dark:bg-gray-800" />
                  <div className="mt-3 h-2 w-full rounded bg-gray-200 animate-pulse dark:bg-gray-800" />
                </div>
                <div className="h-4 w-20 rounded bg-gray-200 animate-pulse dark:bg-gray-800" />
              </div>
            ))
          ) : rows.length === 0 ? (
            <div className="py-6 text-sm text-gray-500 dark:text-gray-400">No data found.</div>
          ) : (
            rows.map((d) => {
              const revenue = revenueNumber(d.total_revenue);
              const percent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

              return (
                <div key={d.city} className="flex items-center gap-4 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-gray-200 dark:ring-gray-800">
                    <MapPin className="text-brand-600 dark:text-brand-400" size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white/90">
                        {titleCase(d.city)}
                      </p>

                      <p className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                        Orders: <span className="font-semibold text-gray-800 dark:text-gray-200">{d.total_orders}</span>
                        <span className="mx-2 text-gray-300 dark:text-gray-700">•</span>
                        Items:{" "}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{d.total_items_sold}</span>
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                        <div className="h-2 rounded-full bg-brand-600" style={{ width: `${percent}%` }} />
                      </div>

                      <p className="w-[72px] text-right text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {percent.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <p className="w-[110px] text-right text-sm font-semibold text-gray-900 dark:text-white/90">
                    {formatBDTFromString(d.total_revenue)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>Total {totalCount} entries</span>
        <span className="text-gray-400">→</span>
      </div>

      <TopSellingDistrictModal
        open={open}
        onClose={() => setOpen(false)}
        timeRange={timeRange}
        onChangeTimeRange={setTimeRange}
      />
    </div>
  );
};

export default TopSellingDistrictCard;
