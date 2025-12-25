"use client";

import React from "react";

import Select from "@/components/form/Select";

import type { TimePeriodKey } from "./types";

export type ProductReportsTabKey = "dashboard" | "report";

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
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Product Report
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track product health, stock insights, and performance reports.
        </p>

        {/* Tabs */}
        <div className="mt-4 inline-flex rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
          {([
            { key: "dashboard", label: "Dashboard" },
            { key: "report", label: "Report" },
          ] as const).map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onTabChange(t.key)}
                className={[
                  "h-10 px-4 rounded-lg text-sm font-semibold transition",
                  isActive
                    ? "bg-brand-500 text-white shadow-theme-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/[0.04]",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Period */}
      <div className="w-full lg:w-[220px]">
        <div className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Time period</div>
        <Select
          options={PERIOD_OPTIONS}
          defaultValue={period}
          onChange={(v) => onPeriodChange(v as TimePeriodKey)}
          className="h-11 rounded-xl border-gray-200 dark:border-gray-800"
        />
      </div>
    </div>
  );
};

export default ProductReportsTopBar;
