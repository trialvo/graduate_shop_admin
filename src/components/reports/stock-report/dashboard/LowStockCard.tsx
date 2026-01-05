"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LowStockProduct } from "../types";

type Props = { items: LowStockProduct[] };

const LowStockCard: React.FC<Props> = ({ items }) => {
  return (
    <div
      className={cn(
        "h-full rounded-[4px] border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-semibold text-gray-900 dark:text-white">Low Stock</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Products near reorder threshold
          </div>
        </div>

        <div className="rounded-full border border-error-200 bg-error-50 px-3 py-1 text-xs font-semibold text-error-600 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-400">
          {items.length} items
        </div>
      </div>

      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="mt-4 space-y-3">
        {items.map((p) => {
          const ratio = Math.max(0, Math.min(100, Math.round((p.stockQty / Math.max(1, p.reorderLevel)) * 100)));
          return (
            <div key={p.id} className="rounded-[4px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {p.name}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {p.sku} • {p.categoryPath}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-error-600 dark:text-error-500">
                    {p.stockQty}
                  </div>
                  <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    / {p.reorderLevel}
                  </div>
                </div>
              </div>

              <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className={cn("h-full rounded-full bg-error-500")} style={{ width: `${ratio}%` }} />
              </div>

              <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                Updated: <span className="font-semibold">{p.updatedAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LowStockCard;
