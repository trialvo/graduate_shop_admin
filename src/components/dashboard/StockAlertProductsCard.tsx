"use client";

import React from "react";
import { Plus } from "lucide-react";

import Button from "@/components/ui/button/Button";
import StockUpdateModal, {
  StockUpdateModalProduct,
  StockUpdatePayload,
} from "./StockUpdateModal";

type StockAlertItem = {
  id: string;
  name: string;
  stockQty: number;
  sku?: string;
};

type Props = {
  /** ✅ required: dashboard must pass items */
  items: StockAlertItem[];

  /** ✅ professional payload */
  onApplyStock?: (payload: StockUpdatePayload) => void;
};

const StockAlertProductsCard: React.FC<Props> = ({ items, onApplyStock }) => {
  const [open, setOpen] = React.useState(false);
  const [product, setProduct] = React.useState<StockUpdateModalProduct | null>(null);

  const openModal = (it: StockAlertItem) => {
    setProduct({
      id: it.id,
      name: it.name,
      currentStock: it.stockQty,
    });
    setOpen(true);
  };

  const onApply = (payload: StockUpdatePayload) => {
    onApplyStock?.(payload);
  };

  return (
    <div className="rounded-[4px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Stock Alert Products
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Quickly update stock for low inventory items.
        </p>
      </div>

      <div className="p-4 space-y-3">
        {items.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No low stock products.
          </div>
        )}

        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between gap-3 rounded-[4px] border border-gray-200 dark:border-gray-800 px-3 py-3"
          >
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {it.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {it.sku ? it.sku : it.id} • Stock:{" "}
                <span className="font-semibold text-red-600 dark:text-red-300">
                  {it.stockQty}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => openModal(it)}
              startIcon={<Plus className="h-4 w-4" />}
              className="bg-brand-500 hover:bg-brand-600 shrink-0"
              type="button"
            >
              Update
            </Button>
          </div>
        ))}
      </div>

      {/* ✅ Common Stock Modal */}
      <StockUpdateModal
        open={open}
        product={product}
        onClose={() => setOpen(false)}
        onApply={onApply}
        minStockAfterUpdate={0}
      />
    </div>
  );
};

export default StockAlertProductsCard;
