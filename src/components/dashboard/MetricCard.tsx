import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type MetricsRange = "day" | "week" | "month" | "year";


interface MetricCardProps {
  title: string;
  value: string;

  // API change% can be positive/0 (your sample), but keep sign-safe
  changePercent: number;

  subLeftText: string;
  subRightText: string;

  trendUp?: boolean;
  icon: React.ReactNode;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  changePercent,
  subLeftText,
  subRightText,
  trendUp = true,
  icon,
  loading = false,
}) => {
  if (loading) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-white p-5 shadow-theme-md ring-1 ring-gray-200",
          "dark:bg-gray-900 dark:ring-white/10"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-3 h-9 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

        <div className="my-4 h-px w-full bg-gray-200 dark:bg-white/10" />

        <div className="flex items-center justify-between">
          <div className="h-3 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  const color = trendUp ? "success" : "danger";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-5 shadow-theme-md ring-1 ring-gray-200",
        "dark:bg-gray-900 dark:ring-white/10"
      )}
    >
      {/* Top */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold",
            trendUp
              ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300"
              : "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-300"
          )}
        >
          <span className="inline-flex items-center gap-1">
            {icon}
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(changePercent).toFixed(2).replace(/\.00$/, "")}%
          </span>
        </div>

        {/* Sparkline placeholder */}
        <div className="h-7 w-20 overflow-hidden rounded-lg ring-1 ring-gray-200 dark:ring-white/10">
          <div
            className={cn(
              "h-full w-full",
              color === "success" ? "bg-success-500/15" : "bg-danger-500/15"
            )}
          />
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>

      {/* Value */}
      <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{value}</p>

      {/* Divider */}
      <div className="my-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      {/* Bottom */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="truncate text-gray-500 dark:text-gray-400">{subLeftText}</span>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 font-semibold",
            trendUp ? "text-success-600 dark:text-success-400" : "text-danger-600 dark:text-danger-400"
          )}
        >
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {subRightText}
        </span>
      </div>
    </div>
  );
};

export default MetricCard;
