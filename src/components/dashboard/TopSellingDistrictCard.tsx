import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import TopSellingDistrictModal from "./TopSellingDistrictModal";
import { topSellingDistricts } from "../../pages/Dashboard/dashboardSection4Data";

const PAGE_SIZE = 10;

const TopSellingDistrictCard = () => {
  const [open, setOpen] = useState(false);

  const preview = useMemo(() => topSellingDistricts.slice(0, PAGE_SIZE), []);

  const maxPercent = Math.max(...topSellingDistricts.map((d) => d.percent));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Selling by District
        </h3>

        <button
          onClick={() => setOpen(true)}
          className="text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          View More
        </button>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {preview.map((d) => (
          <div key={d.id} className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full ring-1 ring-gray-200 dark:ring-gray-800">
              <MapPin className="text-brand-500" size={18} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {d.name}
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: `${(d.percent / maxPercent) * 100}%` }}
                  />
                </div>

                <p className="w-[64px] text-right text-sm text-gray-600 dark:text-gray-300">
                  {d.percent.toFixed(2)}%
                </p>
              </div>
            </div>

            <p className="w-[44px] text-right text-sm font-semibold text-gray-800 dark:text-white/90">
              {d.amount}
            </p>
          </div>
        ))}
      </div>

      <TopSellingDistrictModal open={open} onClose={() => setOpen(false)} />

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>Showing {topSellingDistricts.length} Entries</span>
        <span className="text-gray-400">→</span>
      </div>
    </div>
  );
};

export default TopSellingDistrictCard;
