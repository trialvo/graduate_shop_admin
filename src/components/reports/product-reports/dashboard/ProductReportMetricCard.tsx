"use client";

import React from "react";

type Props = {
  qty: number;
  label: string;
};

const ProductReportMetricCard: React.FC<Props> = ({ qty, label }) => {
  return (
    <div
      className={[
        "rounded-[4px] border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6",
      ].join(" ")}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {String(qty).padStart(2, "0")}
        </div>
        <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          Qty
        </div>
        <div className="mt-3 text-sm font-semibold text-gray-800 dark:text-white/90">{label}</div>
      </div>
    </div>
  );
};

export default ProductReportMetricCard;
