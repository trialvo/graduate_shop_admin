import React from "react";
import { BadgeCheck, Package, Tag, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { imageFallbackSvgDataUri } from "@/utils/imageFallback";
import { toPublicUrl } from "@/utils/toPublicUrl";
import type { SaleProduct } from "./types";

type Props = {
  product: SaleProduct;
  onClick?: () => void;
};

function formatBdt(n: number) {
  return `৳${Number.isFinite(n) ? n.toLocaleString("en-BD") : "0"}`;
}

function computePriceRange(p: any) {
  const vars = Array.isArray(p?.variations) ? p.variations : [];
  const prices = vars
    .map((v: any) => Number(v?.selling_price))
    .filter((n: number) => Number.isFinite(n));
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function hasAnyDiscount(p: any) {
  const vars = Array.isArray(p?.variations) ? p.variations : [];
  return vars.some((v: any) => Number(v?.discount ?? 0) > 0);
}

function getCoverImage(p: any) {
  const img = p?.images?.[0]?.path ?? p?.image ?? null;
  return img ? toPublicUrl(img) : null;
}

export default function ProductCard({ product, onClick }: Props) {
  const p: any = product;

  const name = String(p?.name ?? p?.title ?? "Untitled Product");
  const fallback = imageFallbackSvgDataUri(name);
  const cover = getCoverImage(p) ?? fallback;

  const range = computePriceRange(p);
  const discount = hasAnyDiscount(p);

  const stockSummary = p?.stock_summary ?? null;
  const inStock = stockSummary?.in_stock === true;
  const totalStock = Number(stockSummary?.total_stock ?? 0);
  const variationCount = Number(stockSummary?.variation_count ?? (p?.variations?.length ?? 0));

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-theme-xs transition",
        "hover:shadow-theme-md hover:ring-1 hover:ring-brand-500/20",
        "dark:border-gray-800 dark:bg-gray-950 dark:hover:ring-brand-400/20"
      )}
    >
      {/* Image */}
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50 dark:bg-white/[0.04]">
          <img
            src={cover}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            onError={(event) => {
              const target = event.currentTarget;
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
        </div>

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {p?.featured ? (
            <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              Featured
            </span>
          ) : null}
          {p?.best_deal ? (
            <span className="rounded-full bg-success-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              Best Deal
            </span>
          ) : null}
          {p?.free_delivery ? (
            <span className="rounded-full bg-gray-900/80 px-2.5 py-1 text-[11px] font-semibold text-white">
              Free Delivery
            </span>
          ) : null}
        </div>

        {/* Stock badge */}
        <div className="absolute right-3 top-3">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              inStock ? "bg-success-50 text-success-700" : "bg-error-50 text-error-700",
              "dark:bg-white/10 dark:text-white"
            )}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Discount chip */}
        {discount ? (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-500 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Tag size={12} />
              Discount
            </span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900 dark:text-white/90">
              {name}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ID: {String(p?.id)} • Brand ID: {String(p?.brand_id ?? "-")}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[11px] text-gray-500 dark:text-gray-400">Price</div>
            <div className="text-sm font-semibold text-brand-600 dark:text-brand-400">
              {range ? (range.min === range.max ? formatBdt(range.min) : `${formatBdt(range.min)} - ${formatBdt(range.max)}`) : "-"}
            </div>
          </div>
        </div>

        {/* meta row */}
        <div className="mt-3 grid grid-cols-12 gap-2">
          <div className="col-span-6 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <Package size={14} className="text-gray-400" />
              <span className="font-semibold">{variationCount}</span>
              <span>Variations</span>
            </div>
          </div>

          <div className="col-span-6 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <BadgeCheck size={14} className="text-gray-400" />
              <span className="font-semibold">{Number.isFinite(totalStock) ? totalStock : 0}</span>
              <span>Stock</span>
            </div>
          </div>

          <div className="col-span-12 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Truck size={14} className="text-gray-400" />
                <span>Category</span>
              </div>
              <div className="truncate text-gray-700 dark:text-gray-200">
                Sub: {String(p?.sub_category_id ?? "-")} • Child: {String(p?.child_category_id ?? "-")}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Updated: {p?.updated_at ? String(p.updated_at).slice(0, 10) : "-"}
        </div>
      </div>
    </button>
  );
}
