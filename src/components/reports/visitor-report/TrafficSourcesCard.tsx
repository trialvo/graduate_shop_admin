"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrafficSourceRow } from "./types";

type Props = { rows: TrafficSourceRow[] };

const TrafficSourcesCard: React.FC<Props> = ({ rows }) => {
  return (
    <div
      className={cn(
        "h-full rounded-[4px] border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6"
      )}
    >
      <div className="text-base font-semibold text-gray-900 dark:text-white">Traffic Sources</div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Where visitors come from</div>

      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.source} className="rounded-[4px] border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{r.source}</div>
                <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{r.visitors} visitors</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-brand-500">{r.pct}%</div>
              </div>
            </div>

            <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(2, r.pct)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficSourcesCard;
