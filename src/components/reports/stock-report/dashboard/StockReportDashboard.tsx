"use client";

import React from "react";
import type { TimePeriodKey } from "../types";
import { LOW_STOCK_PRODUCTS, STOCK_CATEGORIES, STOCK_HEALTH, STOCK_REPORT_METRICS, STOCK_TREND } from "../mockData";
import MetricCard from "./MetricCard";
import StockHealthCard from "./StockHealthCard";
import LowStockCard from "./LowStockCard";
import CategoryStockCard from "./CategoryStockCard";
import StockTrendChart from "./StockTrendChart";


type Props = { period: TimePeriodKey };

const StockReportDashboard: React.FC<Props> = ({ period }) => {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STOCK_REPORT_METRICS.map((m) => (
          <MetricCard key={m.key} qty={m.qty} label={m.label} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <StockHealthCard summary={STOCK_HEALTH} />
        </div>

        <div className="lg:col-span-4">
          <LowStockCard items={LOW_STOCK_PRODUCTS} />
        </div>

        <div className="lg:col-span-4">
          <CategoryStockCard rows={STOCK_CATEGORIES} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <StockTrendChart period={period} points={STOCK_TREND} />
      </div>
    </div>
  );
};

export default StockReportDashboard;
