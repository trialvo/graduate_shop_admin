import * as React from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import {
  dashboardKeys,
  getDashboardYearlyStatistic,
  type DashboardYearlyStatisticItem,
} from "@/api/dashboard.api";

function parseMoney(v: string | number | null | undefined): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v !== "string") return 0;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function formatBDT(n: number): string {
  if (!Number.isFinite(n)) return "৳0";
  const formatted = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(n);
  return `৳${formatted}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function normalizeYearlyRows(rows: DashboardYearlyStatisticItem[] | undefined) {
  const byMonth = new Map<string, DashboardYearlyStatisticItem>();
  (rows ?? []).forEach((r) => byMonth.set(r.month, r));

  const revenue = MONTHS.map((m) => parseMoney(byMonth.get(m)?.revenue ?? "0"));
  const profit = MONTHS.map((m) => parseMoney(byMonth.get(m)?.profit ?? "0"));

  return { revenue, profit };
}

function buildYearsList(currentYear: number) {
  // current year + previous 6 years (adjust if you want)
  const years: number[] = [];
  for (let i = 0; i < 7; i += 1) years.push(currentYear - i);
  return years;
}

export default function StatisticsChart() {
  const currentYear = React.useMemo(() => new Date().getFullYear(), []);
  const [year, setYear] = React.useState<number>(currentYear);

  const years = React.useMemo(() => buildYearsList(currentYear), [currentYear]);

  const query = useQuery({
    queryKey: dashboardKeys.yearlyStatisticByYear(year),
    queryFn: () => getDashboardYearlyStatistic(year),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const { revenue, profit } = React.useMemo(() => normalizeYearlyRows(query.data?.data), [query.data?.data]);

  const options: ApexOptions = React.useMemo(
    () => ({
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "left",
        labels: {
          colors: undefined,
        },
      },
      colors: ["#465FFF", "#9CB9FF"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        height: 310,
        type: "line",
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      stroke: {
        curve: "straight",
        width: [2, 2],
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.45,
          opacityTo: 0,
        },
      },
      markers: {
        size: 0,
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: { size: 6 },
      },
      grid: {
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      dataLabels: { enabled: false },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => formatBDT(val),
          title: {
            formatter: (seriesName: string) => seriesName,
          },
        },
      },
      xaxis: {
        type: "category",
        categories: [...MONTHS],
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "12px",
            colors: ["#6B7280"],
          },
          formatter: (val: number) => {
            // show readable ticks (still full number format)
            if (!Number.isFinite(val)) return "0";
            return new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(val);
          },
        },
        title: { text: "", style: { fontSize: "0px" } },
      },
    }),
    []
  );

  const series = React.useMemo(
    () => [
      { name: "Revenue", data: revenue },
      { name: "Profit", data: profit },
    ],
    [revenue, profit]
  );

  const headerRight = (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {query.isError ? "Failed to load data" : query.isFetching ? "Updating..." : "Yearly summary"}
        </p>
      </div>

      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className={cn(
          "h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/30",
          "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
        )}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="rounded-[4px] border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">Statistics</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Revenue & Profit by month • {query.data?.year ?? year}
          </p>
        </div>

        {headerRight}
      </div>

      {/* Chart / Loading */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {query.isLoading ? (
            <div className="h-[310px] w-full animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.04]" />
          ) : (
            <Chart options={options} series={series} type="area" height={310} />
          )}
        </div>
      </div>
    </div>
  );
}
