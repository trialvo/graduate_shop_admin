"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { OrderReportTabKey, TimePeriodKey } from "./types";

type Props = {
  activeTab: OrderReportTabKey;
  onTabChange: (t: OrderReportTabKey) => void;
  period: TimePeriodKey;
  onPeriodChange: (p: TimePeriodKey) => void;
};

const PERIODS: Array<{ value: TimePeriodKey; label: string }> = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "thisYear", label: "This Year" },
];

const OrderReportTopBar: React.FC<Props> = ({ activeTab, onTabChange, period, onPeriodChange }) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Order Report
        </h1>

        <div className="mt-4 inline-flex rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
          <button
            type="button"
            onClick={() => onTabChange("dashboard")}
            className={cn(
              "h-10 px-4 rounded-lg text-sm font-semibold transition",
              activeTab === "dashboard"
                ? "bg-brand-500 text-white shadow-theme-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/[0.04]"
            )}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => onTabChange("report")}
            className={cn(
              "h-10 px-4 rounded-lg text-sm font-semibold transition",
              activeTab === "report"
                ? "bg-brand-500 text-white shadow-theme-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/[0.04]"
            )}
          >
            Report
          </button>
        </div>
      </div>

      <div className="w-full lg:w-[220px]">
        <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Time period</div>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as TimePeriodKey)}
          className={cn(
            "h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800",
            "bg-white dark:bg-gray-950 text-sm text-gray-900 dark:text-white",
            "outline-none focus:ring-2 focus:ring-brand-500/30"
          )}
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value} className="bg-white dark:bg-gray-950">
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default OrderReportTopBar;
