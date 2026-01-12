"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TimePeriodKey, YearlyBarSeries } from "../types";

type Props = {
  period: TimePeriodKey;
  series: YearlyBarSeries[];
};

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const periodLabel = (p: TimePeriodKey) => {
  if (p === "today") return "Today";
  if (p === "last7") return "Last 7 Days";
  if (p === "thisMonth") return "This Month";
  return "This Year";
};

const OrdersBarChart: React.FC<Props> = ({ period, series }) => {
  const maxValue = React.useMemo(() => {
    const all = series.flatMap((s) => s.values);
    return Math.max(1, ...all);
  }, [series]);

  const colorByYear: Record<YearlyBarSeries["year"], string> = {
    "2020": "bg-indigo-500/80",
    "2021": "bg-cyan-500/80",
    "2022": "bg-rose-400/80",
  };

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
          <div className="text-base font-semibold text-gray-900 dark:text-white">Overall</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Time period: {periodLabel(period)}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <LegendDot className="bg-indigo-500/80" label="2020" />
          <LegendDot className="bg-cyan-500/80" label="2021" />
          <LegendDot className="bg-rose-400/80" label="2022" />
        </div>
      </div>

      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="mt-6">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-12 gap-4 items-end">
              {months.map((m, idx) => (
                <div key={m} className="flex flex-col items-center gap-2">
                  <div className="h-[220px] w-full flex items-end justify-center gap-1">
                    {series.map((s) => {
                      const h = Math.round((s.values[idx] / maxValue) * 100);
                      return (
                        <div
                          key={s.year}
                          className={cn("w-3 rounded-full", colorByYear[s.year])}
                          style={{ height: `${Math.max(6, h)}%` }}
                          title={`${s.year}: ${s.values[idx]}`}
                        />
                      );
                    })}
                  </div>
                  <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    {m}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Grouped monthly orders (UI demo)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      <span>{label}</span>
    </div>
  );
}

export default OrdersBarChart;
