import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import type { CartItem, SaleProduct } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  product: SaleProduct | null;
  onAdd: (item: CartItem) => void;
}

const ProductAddModal = ({ open, onClose, product, onAdd }: Props) => {
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<string>("");
  const [size, setSize] = useState<string>("");

  useEffect(() => {
    if (!open || !product) return;
    setQty(1);
    setVariant(product.variants?.[0]?.name ?? "");
    setSize(product.sizes?.[0]?.name ?? "");
  }, [open, product]);

  const key = useMemo(() => {
    if (!product) return "";
    return [product.id, variant || "-", size || "-"].join("__");
  }, [product, variant, size]);

  if (!product) return null;

  const canAdd = qty > 0;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      className="w-full max-w-[700px] max-h-[700px] overflow-hidden"
    >
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Add to Cart
        </h3>
      </div>

      <div className="max-h-[calc(700px-72px)] overflow-y-auto px-6 py-5">
        <div className="flex items-start gap-4">
          <img
            src={product.image}
            alt={product.title}
            className="h-20 w-20 rounded-2xl object-cover ring-1 ring-gray-200 dark:ring-gray-800"
          />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-gray-800 dark:text-white/90">
              {product.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.id} • {product.sku}
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-500">
              ${product.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Variant */}
        {product.variants?.length ? (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Variant
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const active = variant === v.name;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVariant(v.name)}
                    className={`rounded-lg px-3 py-2 text-sm ring-1 transition ${
                      active
                        ? "bg-brand-500 text-white ring-brand-500"
                        : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Size */}
        {product.sizes?.length ? (
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const active = size === s.name;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.name)}
                    className={`rounded-lg px-3 py-2 text-sm ring-1 transition ${
                      active
                        ? "bg-brand-500 text-white ring-brand-500"
                        : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Qty */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity
          </label>
          <div className="flex items-center gap-2">
            <button
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
            onClick={() => {
              if (!canAdd) return;
              onAdd({
                key,
                productId: product.id,
                title: product.title,
                sku: product.sku,
                image: product.image,
                unitPrice: product.price,
                qty,
                variant: variant || undefined,
                size: size || undefined,
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
