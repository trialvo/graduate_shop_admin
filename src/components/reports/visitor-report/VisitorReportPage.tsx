"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { VISITOR_LAST_30_DAYS, VISITOR_METRICS, DEVICE_SHARE, TOP_PAGES, TRAFFIC_SOURCES } from "./mockData";
import MetricCard from "./MetricCard";
import VisitorsAreaChart from "./VisitorsAreaChart";
import TopPagesCard from "./TopPagesCard";
import TrafficSourcesCard from "./TrafficSourcesCard";
import DeviceShareCard from "./DeviceShareCard";


const VisitorReportPage: React.FC = () => {
  return (
    <div className="w-full px-4 py-6 md:px-8">
      <div
        className={cn(
          "rounded-[4px] border border-gray-200 dark:border-gray-800",
          "bg-white dark:bg-gray-900",
          "p-4 sm:p-6"
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Website Visitor Reports
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitor visitor activity, traffic sources, and engagement trends.
            </p>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Updated: <span className="font-semibold">{new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VISITOR_METRICS.map((m) => (
            <MetricCard key={m.key} metric={m} />
          ))}
        </div>

        {/* Chart */}
        <div className="mt-6">
          <VisitorsAreaChart title="Last 30 days sales reports" legend="Visitors" points={VISITOR_LAST_30_DAYS} />
        </div>

        {/* Advanced insight blocks */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <TopPagesCard rows={TOP_PAGES} />
          </div>

          <div className="lg:col-span-3">
            <TrafficSourcesCard rows={TRAFFIC_SOURCES} />
          </div>

          <div className="lg:col-span-3">
            <DeviceShareCard rows={DEVICE_SHARE} />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end text-xs text-gray-400">
          © Sell Pixer <span className="text-brand-500 font-semibold ml-1">Websolution IT</span>
        </div>
      </div>
    </div>
  );
};

export default VisitorReportPage;
