"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { StockCategoryRow } from "../types";

type Props = { rows: StockCategoryRow[] };

const CategoryStockCard: React.FC<Props> = ({ rows }) => {
  return (
    <div
      className={cn(
        "h-full rounded-[4px] border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6"
      )}
    >
      <div className="text-base font-semibold text-gray-900 dark:text-white">Category Stock</div>
      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{r.name}</div>
              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                SKU: {r.totalSku} • Low: {r.lowStock} • Out: {r.outOfStock}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-success-500/10 text-success-700 dark:text-success-400 px-2 py-1 text-xs font-semibold border border-success-500/20">
                {r.totalSku}
              </span>
              <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 text-xs font-semibold border border-amber-500/20">
                {r.lowStock}
              </span>
              <span className="rounded-full bg-error-500/10 text-error-700 dark:text-error-400 px-2 py-1 text-xs font-semibold border border-error-500/20">
                {r.outOfStock}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryStockCard;
