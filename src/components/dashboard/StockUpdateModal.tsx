"use client";

import React from "react";
import Button from "@/components/ui/button/Button";

export type StockUpdateModalProduct = {
  id: string;
  name: string;
  currentStock: number;
};

type Props = {
  open: boolean;
  product: StockUpdateModalProduct | null;

  title?: string;
  description?: string;

  onClose: () => void;

  /**
   * delta: positive = add stock, negative = remove stock
   */
  onApply: (payload: { productId: string; delta: number }) => void;

  /**
   * optional guard (example: prevent removing more than available)
   */
  minStockAfterUpdate?: number; // default 0
};

const StockUpdateModal: React.FC<Props> = ({
  open,
  product,
  title = "Update Stock",
  description = "Add or remove stock using a positive or negative number.",
  onClose,
  onApply,
  minStockAfterUpdate = 0,
}) => {
  const [value, setValue] = React.useState<string>("");

  React.useEffect(() => {
    if (open) setValue("");
  }, [open]);

  const parsed = Number(value);
  const hasValidNumber = Number.isFinite(parsed);
  const delta = hasValidNumber ? parsed : 0;

  const current = product?.currentStock ?? 0;
  const nextStock = current + delta;

  const isValid =
    open &&
    !!product &&
    hasValidNumber &&
    delta !== 0 &&
    nextStock >= minStockAfterUpdate;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
      {/* Backdrop */}
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close stock update modal"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>

            <Button variant="outline" size="icon" onClick={onClose} className="h-9 w-9">
              ✕
            </Button>
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Product:{" "}
              <span className="font-semibold">{product?.name ?? "—"}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current Stock: <span className="font-semibold">{current}</span>
            </p>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Stock Change (use negative to remove)
            </label>

            <input
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              placeholder="e.g. 10 or -5"
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-brand-500/30"
            />

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                Next Stock:{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {hasValidNumber ? nextStock : "—"}
                </span>
              </span>

              {hasValidNumber && nextStock < minStockAfterUpdate && (
                <span className="text-red-600 dark:text-red-300">
                  Stock can’t go below {minStockAfterUpdate}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="primary"
              disabled={!isValid}
              onClick={() => {
                if (!product) return;
                onApply({ productId: product.id, delta });
                onClose();
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockUpdateModal;
