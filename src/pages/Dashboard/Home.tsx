import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import PageMeta from "../../components/common/PageMeta";
import QuickAccess from "../../components/dashboard/QuickAccess";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import OrderStatusGrid from "@/components/dashboard/OrderStatusGrid";
import TopViewProductsCard from "@/components/dashboard/TopViewProductsCard";
import TopSellingDistrictCard from "@/components/dashboard/TopSellingDistrictCard";
import TopSellingProductsCard from "@/components/dashboard/TopSellingProductsCard";
import StockAlertProductsCard from "@/components/dashboard/StockAlertProductsCard";
import { useAppBranding } from "@/context/AppBrandingContext";

// ✅ adjust this import to your real data file if different
import { stockAlertProducts } from "./dashboardSection5Data";

export default function Home() {
  const { branding } = useAppBranding();
  const appName = branding.appShortName ?? branding.appName;

  return (
    <>
      <PageMeta
        title={`Dashboard | ${appName}`}
        description="This is React.js Ecommerce Dashboard page for Trialvo - React.js Tailwind CSS Admin Dashboard Template"
      />

      {/* Section 1 */}
      <QuickAccess />

      {/* Section 2 */}
      <DashboardMetrics />

      {/* Section 3 */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-7">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <OrderStatusGrid />
        </div>
      </div>

      {/* Section 4 */}
      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-6 flex">
          <TopViewProductsCard />
        </div>

        <div className="col-span-12 xl:col-span-6 flex">
          <TopSellingDistrictCard />
        </div>
      </div>

      {/* Section 5 */}
      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-6 flex">
          <TopSellingProductsCard />
        </div>

        <div className="col-span-12 xl:col-span-6 flex">
          <StockAlertProductsCard />
        </div>
      </div>
    </>
  );
}
