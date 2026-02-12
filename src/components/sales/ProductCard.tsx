import React from "react";
import { Star, Tag, Truck } from "lucide-react";
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
  const variationCount = Number(
    stockSummary?.variation_count ?? (p?.variations?.length ?? 0)
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-gray-200/80 bg-white text-left",
        "shadow-sm transition-all duration-200",
        "hover:border-brand-200 hover:shadow-md hover:ring-1 hover:ring-brand-100",
        "dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/30 dark:hover:ring-brand-500/10"
      )}
    >
      {/* ── Image Area ── */}
      <div className="relative overflow-hidden">
        <div className="aspect-[4/3] w-full bg-gray-50 dark:bg-white/[0.03]">
          <img
            src={cover}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            loading="lazy"
            onError={(event) => {
              const target = event.currentTarget;
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
        </div>

        {/* Gradient overlay on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top-left badges row */}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {p?.featured ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Star className="h-2.5 w-2.5" /> Featured
            </span>
          ) : null}
          {p?.best_deal ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Best Deal
            </span>
          ) : null}
          {p?.free_delivery ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-gray-900/75 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
              <Truck className="h-2.5 w-2.5" /> Free
            </span>
          ) : null}
        </div>

        {/* Top-right stock badge */}
        <div className="absolute right-2.5 top-2.5">
          <span
            className={cn(
              "rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-sm",
              inStock
                ? "bg-emerald-50/90 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                : "bg-red-50/90 text-red-700 dark:bg-red-500/20 dark:text-red-300"
            )}
          >
            {inStock ? "In Stock" : "Out"}
          </span>
        </div>

        {/* Discount chip */}
        {discount ? (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <Tag className="h-2.5 w-2.5" /> Sale
            </span>
          </div>
        ) : null}
      </div>

      {/* ── Content ── */}
      <div className="p-3">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-gray-900 dark:text-white">
              {name}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
              ID: {String(p?.id)}
            </p>
          </div>

          <div className="flex-shrink-0 text-right">
            <p className="text-[13px] font-extrabold text-brand-600 dark:text-brand-400">
              {range
                ? range.min === range.max
                  ? formatBdt(range.min)
                  : `${formatBdt(range.min)} – ${formatBdt(range.max)}`
                : "—"}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <div className="flex flex-col items-center rounded-lg border border-gray-100 bg-gray-50/60 py-1.5 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">
              {variationCount}
            </span>
            <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500">
              Variants
            </span>
          </div>

          <div className="flex flex-col items-center rounded-lg border border-gray-100 bg-gray-50/60 py-1.5 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className={cn("text-[13px] font-bold", inStock ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400")}>
              {Number.isFinite(totalStock) ? totalStock : 0}
            </span>
            <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500">
              Stock
            </span>
          </div>

          <div className="flex flex-col items-center rounded-lg border border-gray-100 bg-gray-50/60 py-1.5 dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200">
              {String(p?.sub_category_id ?? "–")}
            </span>
            <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500">
              Sub Cat
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
