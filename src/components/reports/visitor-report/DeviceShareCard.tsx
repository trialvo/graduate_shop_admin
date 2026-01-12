"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { DeviceShareRow } from "./types";

type Props = { rows: DeviceShareRow[] };

function ringStyle(rows: DeviceShareRow[]) {
  // Desktop (brand) + Mobile (success) + Tablet (warning)
  const d = rows.find((r) => r.device === "Desktop")?.pct ?? 0;
  const m = rows.find((r) => r.device === "Mobile")?.pct ?? 0;
  const t = rows.find((r) => r.device === "Tablet")?.pct ?? 0;

  const a = Math.max(0, Math.min(100, d));
  const b = Math.max(0, Math.min(100, m));
  const c = Math.max(0, Math.min(100, t));

  return {
    background: `conic-gradient(#3B82F6 0% ${a}%, #10B981 ${a}% ${a + b}%, #F59E0B ${a + b}% ${
      a + b + c
    }%, rgba(255,255,255,0.10) ${a + b + c}% 100%)`,
  } as React.CSSProperties;
}

const DeviceShareCard: React.FC<Props> = ({ rows }) => {
  const total = rows.reduce((acc, r) => acc + r.pct, 0);

  return (
    <div
      className={cn(
        "h-full rounded-[4px] border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6"
      )}
    >
      <div className="text-base font-semibold text-gray-900 dark:text-white">Device Share</div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Traffic by device type</div>

      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="mt-5 flex items-center justify-center">
        <div className="relative h-[180px] w-[180px]">
          <div className="absolute inset-0 rounded-full" style={ringStyle(rows)} />
          <div className="absolute inset-[26px] rounded-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total</div>
              <div className="mt-1 text-xl font-extrabold text-gray-900 dark:text-white">{total}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {rows.map((r) => (
          <div key={r.device} className="flex items-center justify-between text-sm">
            <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  r.device === "Desktop"
                    ? "bg-brand-500"
                    : r.device === "Mobile"
                      ? "bg-success-500"
                      : "bg-amber-500"
                )}
              />
              <span className="font-semibold">{r.device}</span>
            </div>
            <div className="font-extrabold text-gray-900 dark:text-white">{r.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceShareCard;
