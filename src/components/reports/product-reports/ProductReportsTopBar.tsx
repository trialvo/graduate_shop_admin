"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Select from "@/components/form/Select";
import type { ProductReportsTabKey, TimePeriodKey } from "./types";

const PERIOD_OPTIONS: Array<{ value: TimePeriodKey; label: string }> = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "thisYear", label: "This Year" },
];

type Props = {
  activeTab: ProductReportsTabKey;
  onTabChange: (tab: ProductReportsTabKey) => void;
  period: TimePeriodKey;
  onPeriodChange: (v: TimePeriodKey) => void;
};

const ProductReportsTopBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  period,
  onPeriodChange,
}) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-3xl">
          Product Report
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track stock health, inventory valuation, and product performance.
        </p>

        <div className="mt-4 inline-flex rounded-[4px] border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => onTabChange("dashboard")}
            className={cn(
              "h-10 rounded-lg px-4 text-sm font-semibold transition",
              activeTab === "dashboard"
                ? "bg-brand-500 text-white shadow-theme-xs"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
            )}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => onTabChange("report")}
            className={cn(
              "h-10 rounded-lg px-4 text-sm font-semibold transition",
              activeTab === "report"
                ? "bg-brand-500 text-white shadow-theme-xs"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
            )}
          >
            Report
          </button>
        </div>
      </div>

      <div className="w-full lg:w-[220px]">
        <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Time period</div>
        <Select
          options={PERIOD_OPTIONS}
          defaultValue={period}
          onChange={(v) => onPeriodChange(v as TimePeriodKey)}
          className="h-11 rounded-[4px] border-gray-200 dark:border-gray-800"
        />
      </div>
    </div>
  );
};

export default ProductReportsTopBar;
