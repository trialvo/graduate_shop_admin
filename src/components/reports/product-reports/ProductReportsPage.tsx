"use client";

import React from "react";

import type { TimePeriodKey } from "./types";
import ProductReportsTopBar, { type ProductReportsTabKey } from "./ProductReportsTopBar";
import ProductReportsDashboard from "./ProductReportsDashboard";
import ProductReportsReport from "./report/ProductReportsReport";

const ProductReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<ProductReportsTabKey>("dashboard");
  const [period, setPeriod] = React.useState<TimePeriodKey>("today");

  return (
    <div className="w-full px-4 py-6 md:px-8">
      <div
        className={[
          "rounded-2xl border border-gray-200 dark:border-gray-800",
          "bg-white dark:bg-gray-900",
          "p-4 sm:p-6",
        ].join(" ")}
      >
        <ProductReportsTopBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          period={period}
          onPeriodChange={setPeriod}
        />

        {activeTab === "dashboard" ? (
          <ProductReportsDashboard period={period} />
        ) : (
          <ProductReportsReport period={period} />
        )}
      </div>
    </div>
  );
};

export default ProductReportsPage;
