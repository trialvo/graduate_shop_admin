"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { VisitorMetric } from "./types";

type Props = { metric: VisitorMetric };

const MetricCard: React.FC<Props> = ({ metric }) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6"
      )}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">{metric.label}</div>

        <div className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {metric.value}
        </div>

        {metric.hint ? (
          <div className="mt-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500">{metric.hint}</div>
        ) : (
          <div className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">—</div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
