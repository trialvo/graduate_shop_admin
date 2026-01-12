"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { StockTrendPoint, TimePeriodKey } from "../types";

type Props = {
  period: TimePeriodKey;
  points: StockTrendPoint[];
};

const periodLabel = (p: TimePeriodKey) => {
  if (p === "today") return "Today";
  if (p === "last7") return "Last 7 Days";
  if (p === "thisMonth") return "This Month";
  return "This Year";
};

function toPath(values: number[], w: number, h: number, padding: number) {
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const span = Math.max(1, max - min);

  const step = (w - padding * 2) / Math.max(1, values.length - 1);

  return values
    .map((v, i) => {
      const x = padding + i * step;
      const y = padding + (1 - (v - min) / span) * (h - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

const StockTrendChart: React.FC<Props> = ({ period, points }) => {
  const inValues = points.map((p) => p.in);
  const outValues = points.map((p) => p.out);

  const w = 980;
  const h = 280;
  const pad = 24;

  const inPath = toPath(inValues, w, h, pad);
  const outPath = toPath(outValues, w, h, pad);

  return (
    <div
      className={cn(
        "rounded-[4px] border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-semibold text-gray-900 dark:text-white">Stock Trend</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Time period: {periodLabel(period)} • In vs Out movement
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <LegendDot className="bg-success-500" label="Stock In" />
          <LegendDot className="bg-error-500" label="Stock Out" />
        </div>
      </div>

      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="mt-4 w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[980px]">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[280px]">
            <defs>
              <linearGradient id="inFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.20" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="outFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* grid */}
            {[0, 1, 2, 3, 4].map((g) => (
              <line
                key={g}
                x1={pad}
                x2={w - pad}
                y1={pad + (g * (h - pad * 2)) / 4}
                y2={pad + (g * (h - pad * 2)) / 4}
                className="stroke-gray-200 dark:stroke-white/10"
                strokeDasharray="6 6"
              />
            ))}

            {/* in */}
            <path d={`${inPath} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} className="fill-success-500/10" />
            <path d={inPath} className="stroke-success-500" fill="none" strokeWidth="3" />

            {/* out */}
            <path d={`${outPath} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} className="fill-error-500/10" />
            <path d={outPath} className="stroke-error-500" fill="none" strokeWidth="3" />

            {/* labels */}
            {points.map((p, i) => {
              const step = (w - pad * 2) / Math.max(1, points.length - 1);
              const x = pad + i * step;
              return (
                <text
                  key={p.month}
                  x={x}
                  y={h - 6}
                  textAnchor="middle"
                  className="fill-gray-500 dark:fill-gray-400"
                  fontSize="11"
                  fontWeight="600"
                >
                  {p.month}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      <span className="font-semibold">{label}</span>
    </div>
  );
}

export default StockTrendChart;
