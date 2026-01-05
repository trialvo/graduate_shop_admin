"use client";

import React from "react";

import ComponentCard from "@/components/common/ComponentCard";

import type { CategoryLite } from "../types";

type Props = {
  categories: CategoryLite[];
};

const TopCategoryCard: React.FC<Props> = ({ categories }) => {
  return (
    <ComponentCard title="Top Category" className="h-full">
      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{c.name}:</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {String(c.count).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
};

export default TopCategoryCard;
