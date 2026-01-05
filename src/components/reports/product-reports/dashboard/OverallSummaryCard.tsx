"use client";

import React from "react";

import ComponentCard from "@/components/common/ComponentCard";

const fmtBdt = (n: number) => {
  return `${n.toLocaleString()}৳`;
};

type Props = {
  totalItemPrice: number;
  totalItemCost: number;
};

const OverallSummaryCard: React.FC<Props> = ({ totalItemPrice, totalItemCost }) => {
  return (
    <ComponentCard title="Overall" className="h-full">
      <div className="space-y-8">
        <div className="text-center">
          <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {fmtBdt(totalItemPrice)}
          </div>
          <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Item Price</div>
        </div>

        <div className="h-px w-full bg-gray-200 dark:bg-white/10" />

        <div className="text-center">
          <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {fmtBdt(totalItemCost)}
          </div>
          <div className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Item Cost</div>
        </div>
      </div>
    </ComponentCard>
  );
};

export default OverallSummaryCard;
