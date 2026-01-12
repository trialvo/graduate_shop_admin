"use client";

import React from "react";
import type { TimePeriodKey } from "../types";
import { DELIVERY_FLOW, ORDER_BAR_SERIES, ORDER_OVERALL, ORDER_REPORT_METRICS, TODAY_SUMMARY } from "../mockData";
import MetricCard from "./MetricCard";
import TodaySummaryCard from "./TodaySummaryCard";
import DeliveryFlowCard from "./DeliveryFlowCard";
import OverallCard from "./OverallCard";
import OrdersBarChart from "./OrdersBarChart";

type Props = { period: TimePeriodKey };

const OrderReportDashboard: React.FC<Props> = ({ period }) => {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ORDER_REPORT_METRICS.map((m) => (
          <MetricCard key={m.key} qty={m.qty} label={m.label} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <TodaySummaryCard summary={TODAY_SUMMARY} />
        </div>

        <div className="lg:col-span-8">
          <DeliveryFlowCard items={DELIVERY_FLOW} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <OverallCard overall={ORDER_OVERALL} />
        </div>

        <div className="lg:col-span-8">
          <OrdersBarChart period={period} series={ORDER_BAR_SERIES} />
        </div>
      </div>
    </div>
  );
};

export default OrderReportDashboard;
