import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { stockAlertProducts } from "../../pages/Dashboard/dashboardSection5Data";
import StockAlertProductsModal from "./StockAlertProductsModal";

const PAGE_SIZE = 10;

const StockAlertProductsCard = () => {
  const [open, setOpen] = useState(false);

  // local editable state (ready for API hookup later)
  const [rows, setRows] = useState(stockAlertProducts);

  const preview = useMemo(() => rows.slice(0, PAGE_SIZE), [rows]);

  const updateStock = (id: string, delta: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, stock: Math.max(0, r.stock + delta) } : r
      )
    );
  };

  return (
    <div className="h-full w-full rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Stock Alert Products
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
        <div className="col-span-2 text-center">Price</div>
        <div className="col-span-2 text-right">Stock</div>
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
              </div>

              <div className="col-span-2 text-center text-sm text-gray-600 dark:text-gray-300">
                {p.price}
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => updateStock(p.id, -1)}
                  disabled={p.stock <= 0}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.04]"
                >
                  <Minus size={14} />
                </button>

                <span className="min-w-[24px] text-right text-sm font-medium text-gray-700 dark:text-gray-200">
                  {p.stock}
                </span>

                <button
                  onClick={() => updateStock(p.id, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-500 text-white hover:bg-brand-600"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <StockAlertProductsModal
        open={open}
        onClose={() => setOpen(false)}
        rows={rows}
        setRows={setRows}
      />
    </div>
  );
};

export default StockAlertProductsCard;
