import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import QuickAccess from "../../components/dashboard/QuickAccess";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import OrderStatusGrid from "@/components/dashboard/OrderStatusGrid";

export default function Home() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | Trialvo - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for Trialvo - React.js Tailwind CSS Admin Dashboard Template"
      />
      {/* Section 1 */}
      <QuickAccess />

      {/* Section 2 */}
      <DashboardMetrics />

      {/* Section 3 */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* 70% */}
        <div className="col-span-12 xl:col-span-7">
          <StatisticsChart />
        </div>

        {/* 40% */}
        <div className="col-span-12 xl:col-span-5">
          <OrderStatusGrid />
        </div>
      </div>

      {/* <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div> */}
    </>
  );
}
