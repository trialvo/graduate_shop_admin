import { useMemo, useState } from "react";
import TopViewProductsModal from "./TopViewProductsModal";
import { topViewProducts } from "../../pages/Dashboard/dashboardSection4Data";

const PAGE_SIZE = 10;

const TopViewProductsCard = () => {
  const [open, setOpen] = useState(false);

  const preview = useMemo(() => topViewProducts.slice(0, PAGE_SIZE), []);

  return (
    <div className="h-full w-full rounded-[4px] border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top View Products
        </h3>

        <button
          onClick={() => setOpen(true)}
          className="text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          View More
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:bg-white/[0.04] dark:text-gray-200">
        <div className="col-span-6">Product</div>
        <div className="col-span-2 text-center">View</div>
        <div className="col-span-4 text-right">Last visit at</div>
      </div>

      {/* Body (stretch) */}
      <div className="flex-1">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {preview.map((p) => (
            <div key={p.id} className="grid grid-cols-12 gap-2 px-4 py-4">
              <div className="col-span-6 flex items-center gap-3">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-800"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-500">
                    {p.title}
                  </p>
                  <p className="text-xs text-brand-500">SKU: {p.sku}</p>
                  <p className="text-xs text-gray-400">Order: {p.id}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-center text-sm font-medium text-gray-800 dark:text-white/90">
                {p.views}
              </div>

              <div className="col-span-4 flex items-center justify-end text-sm text-gray-700 dark:text-gray-300">
                {p.lastVisit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer (pinned bottom) */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>Showing {topViewProducts.length} Entries</span>
        <span className="text-gray-400">→</span>
      </div>

      <TopViewProductsModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default TopViewProductsCard;
