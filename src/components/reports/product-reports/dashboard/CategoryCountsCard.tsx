"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  main: number;
  sub: number;
  child: number;
  isLoading?: boolean;
};

const CategoryCountsCard: React.FC<Props> = ({ main, sub, child, isLoading }) => {
  const rows = [
    { label: "Main Categories", value: main },
    { label: "Sub Categories", value: sub },
    { label: "Child Categories", value: child },
  ];

  return (
    <div
      className={cn(
        "h-full rounded-[4px] border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6"
      )}
    >
      <div className="text-base font-semibold text-gray-900 dark:text-white">Categories</div>
      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      {isLoading ? (
        <div className="mt-6 space-y-3">
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-44 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{r.label}</div>
              <div className="text-sm font-extrabold text-gray-900 dark:text-white">
                {String(r.value).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryCountsCard;
