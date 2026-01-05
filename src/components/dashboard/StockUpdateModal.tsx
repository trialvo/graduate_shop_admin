"use client";

import React from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";

export type StockActionType = "increase" | "decrease" | "set";

export type StockUpdatePayload = {
  productId: string;

  /** stock operation */
  type: StockActionType;

  /** qty used for increase/decrease, or new qty for set */
  qty: number;

  /** business reason: e.g. "purchase", "damage", "return", "adjustment" */
  reason: string;

  /** optional note for audit/history */
  note?: string;

  /** for server-side idempotency / tracing */
  clientRequestId?: string;

  /** ISO timestamp (client side); server can override */
  occurredAt?: string;
};

export type StockUpdateModalProduct = {
  id: string;
  name: string;
  currentStock: number;
};

type Props = {
  open: boolean;
  product: StockUpdateModalProduct | null;
  onClose: () => void;

  /** ✅ professional payload */
  onApply: (payload: StockUpdatePayload) => void;

  /** optional validation guard */
  minStockAfterUpdate?: number;
};

const REASONS = [
  { label: "Purchase / Stock In", value: "purchase" },
  { label: "Sale / Stock Out", value: "sale" },
  { label: "Return", value: "return" },
  { label: "Damage / Lost", value: "damage" },
  { label: "Adjustment", value: "adjustment" },
];

const StockUpdateModal: React.FC<Props> = ({
  open,
  product,
  onClose,
  onApply,
  minStockAfterUpdate = 0,
}) => {
  const [type, setType] = React.useState<StockActionType>("increase");
  const [qty, setQty] = React.useState<number>(1);
  const [reason, setReason] = React.useState<string>(REASONS[0].value);
  const [note, setNote] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    // reset per open to avoid stale values
    setType("increase");
    setQty(1);
    setReason(REASONS[0].value);
    setNote("");
  }, [open]);

  if (!open || !product) return null;

  const current = product.currentStock;

  const nextStockPreview = (() => {
    if (type === "increase") return current + Math.max(0, qty);
    if (type === "decrease") return current - Math.max(0, qty);
    return Math.max(0, qty); // set
  })();

  const stockAfter = Math.max(0, nextStockPreview);
  const violatesMin = stockAfter < minStockAfterUpdate;

  const canApply =
    Number.isFinite(qty) &&
    qty >= 0 &&
    reason.trim().length > 0 &&
    !violatesMin;

  const handleApply = () => {
    if (!canApply) return;

    onApply({
      productId: product.id,
      type,
      qty: Math.floor(qty),
      reason: reason.trim(),
      note: note.trim() ? note.trim() : undefined,
      clientRequestId:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `req_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      occurredAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal */}
      <div className="relative w-[94%] max-w-xl rounded-[4px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                Update Stock
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {product.name} • Current:{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {current}
                </span>
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={onClose}
              className="rounded-[4px]"
            >
              Close
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("increase")}
                className={[
                  "h-11 rounded-[4px] border text-sm font-semibold",
                  type === "increase"
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-gray-800"
                    : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200",
                ].join(" ")}
              >
                Increase
              </button>
              <button
                type="button"
                onClick={() => setType("decrease")}
                className={[
                  "h-11 rounded-[4px] border text-sm font-semibold",
                  type === "decrease"
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-gray-800"
                    : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200",
                ].join(" ")}
              >
                Decrease
              </button>
              <button
                type="button"
                onClick={() => setType("set")}
                className={[
                  "h-11 rounded-[4px] border text-sm font-semibold",
                  type === "set"
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-gray-800"
                    : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200",
                ].join(" ")}
              >
                Set
              </button>
            </div>
          </div>

          {/* qty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {type === "set" ? "New Stock Qty" : "Qty"}
            </label>
            <Input
              value={String(qty)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQty(Number(e.target.value))
              }
              className="h-11 rounded-[4px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              placeholder={type === "set" ? "e.g. 120" : "e.g. 10"}
              type="number"
              min={0}
            />

            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Preview:{" "}
              <span
                className={[
                  "font-semibold",
                  violatesMin ? "text-red-600 dark:text-red-300" : "text-gray-900 dark:text-gray-100",
                ].join(" ")}
              >
                {stockAfter}
              </span>
              {violatesMin && (
                <span className="ml-2 text-xs text-red-600 dark:text-red-300">
                  (Must be ≥ {minStockAfterUpdate})
                </span>
              )}
            </div>
          </div>

          {/* reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-11 w-full rounded-[4px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm text-gray-900 dark:text-gray-100"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[96px] w-full rounded-[4px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              placeholder="Add details for audit/history..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose} className="rounded-[4px]">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            className="rounded-[4px] bg-brand-500 hover:bg-brand-600"
          >
            Apply Update
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StockUpdateModal;
