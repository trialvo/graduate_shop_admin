import React from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/utils/toPublicUrl";

import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import type { CartItem, SaleProduct, SaleProductVariation } from "@/components/sales/types";

interface Props {
  open: boolean;
  onClose: () => void;
  product: SaleProduct | null;
  onAdd: (item: CartItem) => void;
}

function money(n: number) {
  const v = Number(n ?? 0);
  return `$${(Number.isFinite(v) ? v : 0).toFixed(2)}`;
}

function bestProductImage(product: SaleProduct) {
  const p = product.images?.[0]?.path ?? "";
  return p ? toPublicUrl(p) : "";
}

function getFinalPrice(v: SaleProductVariation) {
  const selling = Number(v.selling_price ?? 0);
  const discount = Number(v.discount ?? 0);
  const final = selling - discount;
  return Number.isFinite(final) ? final : 0;
}

const ProductAddModal: React.FC<Props> = ({ open, onClose, product, onAdd }) => {
  const [qty, setQty] = React.useState(1);
  const [variationId, setVariationId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!open || !product) return;
    setQty(1);
    const first = product.variations?.[0]?.id ?? null;
    setVariationId(first);
  }, [open, product]);

  const variation = React.useMemo(() => {
    if (!product || !variationId) return null;
    return (product.variations ?? []).find((v) => v.id === variationId) ?? null;
  }, [product, variationId]);

  const key = React.useMemo(() => {
    if (!product || !variationId) return "";
    return `${String(product.id)}__${variationId}`;
  }, [product, variationId]);

  if (!product) return null;

  const title = product.name ?? product.title ?? "Untitled";
  const img = bestProductImage(product);
  const canAdd = qty > 0 && Boolean(variationId);

  return (
    <Modal isOpen={open} onClose={onClose} className="w-full max-w-[760px] max-h-[760px] overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Add to Cart</h3>
      </div>

      <div className="max-h-[calc(760px-72px)] overflow-y-auto px-6 py-5">
        <div className="flex items-start gap-4">
          {img ? (
            <img
              src={img}
              alt={title}
              className="h-20 w-20 rounded-[4px] object-cover ring-1 ring-gray-200 dark:ring-gray-800"
            />
          ) : (
            <div className="h-20 w-20 rounded-[4px] bg-gray-100 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-gray-800" />
          )}

          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-800 dark:text-white/90">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {String(product.id)}</p>
          </div>
        </div>

        {/* Variation list (required for manual-order item => product_variation_id) */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Variation
          </label>

          {product.variations?.length ? (
            <div className="flex flex-wrap gap-2">
              {product.variations.map((v) => {
                const active = v.id === variationId;
                const price = getFinalPrice(v);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariationId(v.id)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm ring-1 transition",
                      active
                        ? "bg-brand-500 text-white ring-brand-500"
                        : cn(
                            "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50",
                            "dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                          )
                    )}
                  >
                    <span className="font-medium">{v.sku}</span>
                    <span className="ml-2 opacity-90">{money(price)}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[4px] border border-dashed border-gray-200 p-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              No variations found. (Required: product_variation_id)
            </div>
          )}
        </div>

        {/* Qty */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.03]"
            >
              <Minus size={16} />
            </button>

            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="h-10 w-20 rounded-lg border border-gray-200 px-3 text-center text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />

            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            disabled={!canAdd}
            onClick={() => {
              if (!canAdd || !variation || !variationId) return;

              const unitPrice = getFinalPrice(variation);

              onAdd({
                key,
                productId: product.id,
                productVariationId: variationId,
                title,
                sku: variation.sku,
                image: img,
                unitPrice,
                qty,
              });

              onClose();
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductAddModal;
