"use client";

import React from "react";

import type { TimePeriodKey } from "./types";

import {
  BEST_PRODUCTS,
  OVERALL_SUMMARY,
  PRODUCT_REPORT_METRICS,
  PRODUCT_STATUS_SUMMARY,
  TOP_CATEGORIES,
} from "./mockData";
import ProductStatusCard from "./dashboard/ProductStatusCard";
import BestProductsCard from "./dashboard/BestProductsCard";
import TopCategoryCard from "./dashboard/TopCategoryCard";
import OverallSummaryCard from "./dashboard/OverallSummaryCard";
import OverallTrendsChart from "./dashboard/OverallTrendsChart";
import ProductReportMetricCard from "./dashboard/ProductReportMetricCard";


const periodToLabel = (p: TimePeriodKey) => {
  if (p === "today") return "Today";
  if (p === "last7") return "Last 7 Days";
  if (p === "thisMonth") return "This Month";
  return "This Year";
};

type Props = {
  period: TimePeriodKey;
};

const ProductReportsDashboard: React.FC<Props> = ({ period }) => {
  return (
    <div className="mt-6 space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PRODUCT_REPORT_METRICS.map((m) => (
          <ProductReportMetricCard key={m.key} qty={m.qty} label={m.label} />
        ))}
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ProductStatusCard summary={PRODUCT_STATUS_SUMMARY} />
        </div>

        <div className="lg:col-span-4">
          <BestProductsCard items={BEST_PRODUCTS} />
        </div>

        <div className="lg:col-span-4">
          <TopCategoryCard categories={TOP_CATEGORIES} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <OverallSummaryCard
            totalItemPrice={OVERALL_SUMMARY.totalItemPrice}
            totalItemCost={OVERALL_SUMMARY.totalItemCost}
          />
        </div>

        <div className="lg:col-span-8">
          <OverallTrendsChart periodLabel={`Time period: ${periodToLabel(period)}`} />
        </div>
      </div>
    </div>
  );
};

export default ProductReportsDashboard;
