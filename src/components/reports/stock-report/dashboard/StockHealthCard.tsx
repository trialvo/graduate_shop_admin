"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { StockHealthSummary } from "../types";

type Props = { summary: StockHealthSummary };

const money = (n: number) => `${n.toLocaleString()}৳`;

const StockHealthCard: React.FC<Props> = ({ summary }) => {
  const total = Math.max(1, summary.inStock + summary.lowStock + summary.outOfStock);

  const inPct = (summary.inStock / total) * 100;
  const lowPct = (summary.lowStock / total) * 100;
  const outPct = (summary.outOfStock / total) * 100;

  const ringStyle: React.CSSProperties = {
    background: `conic-gradient(#10B981 0% ${inPct}%, #F59E0B ${inPct}% ${
      inPct + lowPct
    }%, #EF4444 ${inPct + lowPct}% ${inPct + lowPct + outPct}%, rgba(255,255,255,0.10) ${
      inPct + lowPct + outPct
    }% 100%)`,
  };

  return (
    <div
      className={cn(
        "h-full rounded-2xl border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6"
      )}
    >
      <div className="text-base font-semibold text-gray-900 dark:text-white">Stock Health</div>
      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
        <div className="md:col-span-5 space-y-3">
          <Row label="In Stock" value={summary.inStock} tone="success" />
          <Row label="Low Stock" value={summary.lowStock} tone="warning" />
          <Row label="Out of Stock" value={summary.outOfStock} tone="error" />
        </div>

        <div className="md:col-span-7 flex items-center justify-center">
          <div className="relative h-[200px] w-[200px]">
            <div className="absolute inset-0 rounded-full" style={ringStyle} />
            <div className="absolute inset-[26px] rounded-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Stock Value
                </div>
                <div className="mt-1 text-xl font-extrabold text-gray-900 dark:text-white">
                  {money(summary.stockValue)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <MiniLegend label="In" className="bg-success-500" />
        <MiniLegend label="Low" className="bg-amber-500" />
        <MiniLegend label="Out" className="bg-error-500" />
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
  tone: "success" | "warning" | "error";
}) {
  const valueClass =
    tone === "success"
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

function MiniLegend({ label, className }: { label: string; className: string }) {
  return (
    <div className="inline-flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      <span className="font-semibold">{label}</span>
    </div>
  );
}

export default StockHealthCard;
