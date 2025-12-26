"use client";

import React from "react";

import ComponentCard from "@/components/common/ComponentCard";

import type { BestProduct } from "../types";

type Props = {
  items: BestProduct[];
};

const BestProductsCard: React.FC<Props> = ({ items }) => {
  return (
    <ComponentCard title="Best Products" className="h-full">
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="grid min-w-[560px] grid-cols-2 gap-4">
          {items.map((p) => (
            <div
              key={p.id}
              className="rounded-[4px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3"
            >
              <div className="h-[150px] w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden flex items-center justify-center">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-brand-500/20" />
                )}
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {p.name}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="font-semibold text-success-600 dark:text-success-500">SOLD:</span>
                  <span className="text-gray-600 dark:text-gray-300">{p.soldQty}pcs</span>
                  <span className="ml-auto text-gray-500 dark:text-gray-400">Stock: {p.stockQty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ComponentCard>
  );
};

export default BestProductsCard;
