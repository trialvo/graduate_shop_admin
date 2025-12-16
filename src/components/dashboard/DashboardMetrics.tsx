import { useState } from "react";
import { ShoppingCart, DollarSign, XCircle, Users } from "lucide-react";

import MetricsFilter from "./MetricsFilter";
import { MetricsRange } from "../../pages/Dashboard/dashboardMetricsData";
import MetricCard from "./MetricCard";

const DashboardMetrics = () => {
  const [range, setRange] = useState<MetricsRange>("month");

  return (
    <section className="mb-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
          Overview
        </h2>

        <MetricsFilter value={range} onChange={setRange} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          title="Total Orders"
          value="248k"
          changePercent={24}
          weeklyText="2.5k+ this week"
          trendUp
          icon={<ShoppingCart size={16} />}
        />

        <MetricCard
          title="Total Sales"
          value="৳47.6k"
          changePercent={14}
          weeklyText="1.7k+ this week"
          trendUp
          icon={<DollarSign size={16} />}
        />

        <MetricCard
          title="Cancelled Orders"
          value="1.2k"
          changePercent={8}
          weeklyText="1k+ this week"
          trendUp={false}
          icon={<XCircle size={16} />}
        />

        <MetricCard
          title="Total Visitor"
          value="89k"
          changePercent={6}
          weeklyText="5.4k+ this week"
          trendUp
          icon={<Users size={16} />}
        />
      </div>
    </section>
  );
};

export default DashboardMetrics;
