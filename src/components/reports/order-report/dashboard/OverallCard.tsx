"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { OrderOverall } from "../types";

type Props = { overall: OrderOverall };

const bdt = (n: number) => `${n.toLocaleString()}৳`;

const OverallCard: React.FC<Props> = ({ overall }) => {
  return (
    <div
      className={cn(
        "h-full rounded-2xl border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-white/[0.03]",
        "p-5 sm:p-6"
      )}
    >
      <div className="text-base font-semibold text-gray-900 dark:text-white">Overall</div>
      <div className="mt-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="mt-8 text-center">
        <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-500">
          {bdt(overall.totalOrderAmount)}
        </div>
        <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          Total Order Amount
        </div>
      </div>

      <div className="my-8 h-px w-full bg-gray-200 dark:bg-white/10" />

      <div className="text-center">
        <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-success-600 dark:text-success-500">
          {bdt(overall.totalOrderCost)}
        </div>
        <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          Total Order Cost
        </div>
      </div>
    </div>
  );
};

export default OverallCard;
