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
          "relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white p-5 shadow-theme-md",
          "dark:border-white/10 dark:bg-gray-900"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200/80 dark:bg-gray-800" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200/80 dark:bg-gray-800" />
        </div>

        <div className="h-4 w-24 animate-pulse rounded bg-gray-200/80 dark:bg-gray-800" />
        <div className="mt-3 h-9 w-36 animate-pulse rounded bg-gray-200/80 dark:bg-gray-800" />

        <div className="my-4 h-px w-full bg-gray-200 dark:bg-white/10" />

        <div className="flex items-center justify-between">
          <div className="h-3 w-28 animate-pulse rounded bg-gray-200/80 dark:bg-gray-800" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200/80 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  const color = trendUp ? "success" : "danger";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white p-5 shadow-theme-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-theme-lg",
        "dark:border-white/10 dark:bg-gray-900"
      )}
    >
      <div className="pointer-events-none absolute -top-10 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-brand-50/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-brand-500/10" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-gray-100 to-transparent dark:from-white/5" />

      {/* Top */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold",
            trendUp
              ? "border-success-200/60 bg-success-50 text-success-700 dark:border-success-500/20 dark:bg-success-500/10 dark:text-success-300"
              : "border-danger-200/60 bg-danger-50 text-danger-700 dark:border-danger-500/20 dark:bg-danger-500/10 dark:text-danger-300"
          )}
        >
          <span className="inline-flex items-center gap-1">
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full",
                trendUp
                  ? "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-200"
                  : "bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-200"
              )}
            >
              {icon}
            </span>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(changePercent).toFixed(2).replace(/\.00$/, "")}%
          </span>
        </div>

        {/* Sparkline placeholder */}
        <div
          className={cn(
            "relative h-8 w-24 overflow-hidden rounded-lg border bg-gray-50/80",
            "dark:bg-white/5",
            color === "success"
              ? "border-success-200/60"
              : "border-danger-200/60"
          )}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 96 32"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="metric-line" x1="0" y1="0" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor={color === "success" ? "rgb(16 185 129)" : "rgb(239 68 68)"}
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor={color === "success" ? "rgb(16 185 129)" : "rgb(239 68 68)"}
                  stopOpacity="0.7"
                />
              </linearGradient>
              <linearGradient id="metric-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={color === "success" ? "rgb(16 185 129)" : "rgb(239 68 68)"}
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor={color === "success" ? "rgb(16 185 129)" : "rgb(239 68 68)"}
                  stopOpacity="0.02"
                />
              </linearGradient>
            </defs>
            <path
              d="M0 26 L12 22 L24 24 L36 18 L48 16 L60 19 L72 12 L84 8 L96 10 L96 32 L0 32 Z"
              fill="url(#metric-fill)"
            />
            <path
              d="M0 26 L12 22 L24 24 L36 18 L48 16 L60 19 L72 12 L84 8 L96 10"
              stroke="url(#metric-line)"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="84"
              cy="8"
              r="2"
              fill={color === "success" ? "rgb(16 185 129)" : "rgb(239 68 68)"}
            />
          </svg>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.55),transparent_40%,transparent_60%,rgba(255,255,255,0.55))] opacity-50 dark:opacity-20" />
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>

      {/* Value */}
      <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>

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
