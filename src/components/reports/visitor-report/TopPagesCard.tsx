"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TopPageRow } from "./types";

type Props = { rows: TopPageRow[] };

const mmss = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const TopPagesCard: React.FC<Props> = ({ rows }) => {
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
          <div className="text-base font-semibold text-gray-900 dark:text-white">Top Pages</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Most visited pages & engagement
          </div>
        </div>

        <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
          {rows.length} pages
        </div>
      </div>

      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div
            key={r.path}
            className="rounded-[4px] border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {r.title}
                </div>
                <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                  {r.path}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-gray-900 dark:text-white">
                  {r.visitors}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">visitors</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-gray-50 px-2 py-2 text-gray-700 dark:bg-white/[0.04] dark:text-gray-200">
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Bounce</div>
                <div className="font-extrabold">{r.bounceRatePct}%</div>
              </div>
              <div className="rounded-lg bg-gray-50 px-2 py-2 text-gray-700 dark:bg-white/[0.04] dark:text-gray-200">
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Avg Time</div>
                <div className="font-extrabold">{mmss(r.avgTimeSec)}</div>
              </div>
              <div className="rounded-lg bg-gray-50 px-2 py-2 text-gray-700 dark:bg-white/[0.04] dark:text-gray-200">
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Quality</div>
                <div className="font-extrabold text-success-600 dark:text-success-500">Good</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPagesCard;
