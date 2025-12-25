"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TodaySummary } from "../types";

type Props = { summary: TodaySummary };

const TodaySummaryCard: React.FC<Props> = ({ summary }) => {
  const total = Math.max(1, summary.order + summary.completed + summary.cancelled + summary.pending);
  const completedPct = (summary.completed / total) * 100;
  const orderPct = (summary.order / total) * 100;

  // Blue + Green (like screenshot)
  const pieStyle: React.CSSProperties = {
    background: `conic-gradient(#6366F1 0% ${orderPct}%, #10B981 ${orderPct}% ${orderPct + completedPct}%, rgba(255,255,255,0.10) ${orderPct + completedPct}% 100%)`,
  };

  return (
    <div
      className={cn(
        "h-full rounded-2xl border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6"
      )}
    >
      <div className="text-base font-semibold text-gray-900 dark:text-white">Today order Summary</div>
      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
        <div className="md:col-span-5 space-y-3">
          <Row label="Order" value={summary.order} tone="brand" />
          <Row label="Complete Order" value={summary.completed} tone="success" />
          <Row label="Canceled Order" value={summary.cancelled} tone="error" />
          <Row label="Pending" value={summary.pending} tone="warning" />
        </div>

        <div className="md:col-span-7 flex items-center justify-center">
          <div className="relative h-[200px] w-[200px]">
            <div className="absolute inset-0 rounded-full" style={pieStyle} />
            <div className="absolute inset-[26px] rounded-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.order}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "success" | "warning" | "error";
}) {
  const valueClass =
    tone === "brand"
      ? "text-brand-500"
      : tone === "success"
        ? "text-success-600 dark:text-success-500"
        : tone === "warning"
          ? "text-amber-600 dark:text-amber-400"
          : "text-error-600 dark:text-error-500";

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}:</div>
      <div className={cn("text-sm font-extrabold", valueClass)}>{String(value).padStart(2, "0")}</div>
    </div>
  );
}

export default TodaySummaryCard;
