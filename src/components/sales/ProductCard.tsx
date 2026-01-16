import React from "react";

import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/utils/toPublicUrl";
import type { SaleProduct } from "@/components/sales/types";

interface Props {
  product: SaleProduct;
  onClick: () => void;
}

function formatMoney(v: number) {
  const n = Number(v ?? 0);
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

function bestImage(product: SaleProduct) {
  const first = product.images?.[0]?.path ?? "";
  return first ? toPublicUrl(first) : "";
}

function minPrice(product: SaleProduct) {
  const vars = Array.isArray(product.variations) ? product.variations : [];
  if (!vars.length) return Number(product.price ?? 0);

  const prices = vars
    .map((v) => {
      const selling = Number(v.selling_price ?? 0);
      const discount = Number(v.discount ?? 0);
      const final = selling - discount;
      return Number.isFinite(final) ? final : 0;
    })
    .filter((n) => Number.isFinite(n));

  return prices.length ? Math.min(...prices) : 0;
}

const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  const title = product.name ?? product.title ?? "Untitled";
  const price = minPrice(product);
  const img = bestImage(product);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[4px] border border-gray-200 bg-white p-4 text-left shadow-theme-xs transition hover:shadow-theme-md",
        "dark:border-gray-800 dark:bg-white/[0.03]"
      )}
    >
      <div className="flex items-center justify-center">
        {img ? (
          <img src={img} alt={title} className="h-20 w-20 rounded-[4px] object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-[4px] bg-gray-100 dark:bg-white/5" />
        )}
      </div>

      <div className="mt-3">
        <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ID: {String(product.id)}
          {product.variations?.[0]?.sku ? ` • ${product.variations?.[0]?.sku}` : ""}
        </p>
        <p className="mt-1 text-sm font-semibold text-brand-500">{formatMoney(price)}</p>
      </div>
    </button>
  );
};

export default ProductCard;
