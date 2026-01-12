import { useMemo, useState } from "react";
import { topSellingProducts } from "../../pages/Dashboard/dashboardSection5Data";
import TopSellingProductsModal from "./TopSellingProductsModal";

const PAGE_SIZE = 10;

const TopSellingProductsCard = () => {
  const [open, setOpen] = useState(false);
  const preview = useMemo(() => topSellingProducts.slice(0, PAGE_SIZE), []);

  return (
    <div className="h-full w-full rounded-[4px] border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Top Selling Products
        </h3>

        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          View All
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 rounded-lg bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:bg-white/[0.04] dark:text-gray-200">
        <div className="col-span-2">Image</div>
        <div className="col-span-6">Name</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Body */}
      <div className="flex-1">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {preview.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-12 items-center px-4 py-4"
            >
              <div className="col-span-2">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-11 w-11 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-800"
                />
              </div>

              <div className="col-span-6 min-w-0">
                <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {p.title}
                </p>
                <p className="text-xs text-gray-400">
                  Order: {p.id} • SKU: {p.sku}
                </p>
                <p className="text-xs text-brand-500">
                  {p.category} • Category total: {p.totalByCategory}
                </p>
              </div>

              <div className="col-span-2 text-center text-sm text-gray-600 dark:text-gray-300">
                {p.qty}
              </div>

              <div className="col-span-2 text-right text-sm text-gray-600 dark:text-gray-300">
                {p.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TopSellingProductsModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default TopSellingProductsCard;
