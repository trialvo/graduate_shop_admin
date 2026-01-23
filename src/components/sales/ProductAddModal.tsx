import React from "react";
import { Minus, Plus, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/utils/toPublicUrl";
import { Modal } from "@/components/ui/modal";

import RichTextPreview from "@/components/ui/editor/RichTextPreview";

import type { CartItem, SaleProduct } from "./types";
import {
  getProduct,
  type ProductSingleResponseEntity,
  type ProductSingleVariation,
} from "@/api/products.api";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

type Props = {
  open: boolean;
  onClose: () => void;
  product: SaleProduct | null;
  onAdd: (item: CartItem) => void;
};

function formatBdt(n: number) {
  return `৳${Number.isFinite(n) ? n.toLocaleString("en-BD") : "0"}`;
}

function discountLabel(v: ProductSingleVariation) {
  const d = Number(v.discount ?? 0);
  if (!Number.isFinite(d) || d <= 0) return "-";
  return v.discount_type === 1 ? `${d}%` : formatBdt(d);
}

function getCoverImage(single: ProductSingleResponseEntity) {
  const img = single.images?.[0]?.path ?? null;
  return img ? toPublicUrl(img) : null;
}

export default function ProductAddModal({
  open,
  onClose,
  product,
  onAdd,
}: Props) {
  const productId = React.useMemo(() => {
    const raw = product?.id;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [product?.id]);

  const [qty, setQty] = React.useState(1);

  const [colorId, setColorId] = React.useState<number | null>(null);
  const [variantId, setVariantId] = React.useState<number | null>(null);

  const singleQuery = useQuery({
    queryKey: ["sale-single-product", productId],
    queryFn: () => {
      if (!productId) throw new Error("Missing product id");
      return getProduct(productId);
    },
    enabled: open && Boolean(productId),
    staleTime: 30_000,
  });

  const single = singleQuery.data?.product ?? null;

  React.useEffect(() => {
    if (!open || !single) return;
    setQty(1);

    const initColor =
      single.available_colors?.[0]?.id ??
      single.variations?.[0]?.color?.id ??
      null;
    const initVariant =
      single.available_variants?.[0]?.id ??
      single.variations?.[0]?.variant?.id ??
      null;

    setColorId(initColor);
    setVariantId(initVariant);
  }, [open, single]);

  const selectedVariation = React.useMemo(() => {
    if (!single || !colorId || !variantId) return null;
    return (
      single.variations?.find(
        (v) => v.color?.id === colorId && v.variant?.id === variantId
      ) ?? null
    );
  }, [single, colorId, variantId]);

  const images = React.useMemo(() => {
    if (!single) return [];
    const list = Array.isArray(single.images) ? single.images : [];
    return list.map((i) => ({ ...i, path: toPublicUrl(i.path) }));
  }, [single]);

  const canAdd =
    Boolean(selectedVariation?.id) &&
    qty > 0 &&
    selectedVariation?.in_stock !== false;

  const key = React.useMemo(() => {
    if (!single || !selectedVariation) return "";
    return `p:${single.id}__pv:${selectedVariation.id}`;
  }, [single, selectedVariation]);

  const unitPrice = Number(
    selectedVariation?.final_price ?? selectedVariation?.selling_price ?? 0
  );
  const sku = String(selectedVariation?.sku ?? "");

  const buyingPrice = Number(selectedVariation?.buying_price ?? 0);
  const sellingPrice = Number(selectedVariation?.selling_price ?? 0);
  const finalPrice = Number(selectedVariation?.final_price ?? sellingPrice);
  const profit = Number.isFinite(finalPrice - buyingPrice)
    ? finalPrice - buyingPrice
    : 0;

  const title =
    single?.name ?? String(product?.name ?? product?.title ?? "Product");

  const brandImg = single?.brand?.image
    ? toPublicUrl(single.brand.image)
    : null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      className="w-full max-w-[1100px] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white/90">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select color & variant then add to cart (BDT).
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.06]"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body scroll */}
      <div className="max-h-[calc(100dvh-220px)] overflow-auto custom-scrollbar px-6 py-6">
        {singleQuery.isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
            Loading product...
          </div>
        ) : singleQuery.isError ? (
          <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-950/30 dark:text-error-200">
            Failed to load product.
          </div>
        ) : single ? (
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT: Images + Brand */}
            <div className="col-span-12 lg:col-span-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                {images.length > 0 ? (
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                  >
                    {images.map((img) => (
                      <SwiperSlide key={img.id}>
                        <img
                          src={img.path}
                          alt={title}
                          className="h-[340px] w-full rounded-xl object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="flex h-[340px] items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500 dark:bg-white/[0.04] dark:text-gray-400">
                    No images
                  </div>
                )}

                <div className="mt-3 grid grid-cols-12 gap-2 text-xs">
                  <div className="col-span-6 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-white/[0.04]">
                    <div className="text-gray-500 dark:text-gray-400">SKU</div>
                    <div className="mt-1 truncate font-semibold text-gray-800 dark:text-gray-200">
                      {sku || "-"}
                    </div>
                  </div>
                  <div className="col-span-6 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-white/[0.04]">
                    <div className="text-gray-500 dark:text-gray-400">
                      Stock
                    </div>
                    <div
                      className={cn(
                        "mt-1 font-semibold",
                        selectedVariation?.in_stock
                          ? "text-success-700 dark:text-success-300"
                          : "text-error-700 dark:text-error-300"
                      )}
                    >
                      {selectedVariation ? `${selectedVariation.stock}` : "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand + Category + Attribute */}
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center gap-3">
                  {brandImg ? (
                    <img
                      src={brandImg}
                      alt=""
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-white/[0.05]" />
                  )}

                  <div className="min-w-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Brand
                    </div>
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white/90">
                      {single.brand?.name ?? "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-12 gap-3 text-sm">
                  <div className="col-span-12 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/[0.04]">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Category
                    </div>
                    <div className="mt-1 font-semibold text-gray-900 dark:text-white/90">
                      {single.main_category?.name ?? "-"} •{" "}
                      {single.sub_category?.name ?? "-"} •{" "}
                      {single.child_category?.name ?? "-"}
                    </div>
                  </div>

                  <div className="col-span-12 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/[0.04]">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Attribute
                    </div>
                    <div className="mt-1 font-semibold text-gray-900 dark:text-white/90">
                      {single.attribute?.name ?? "-"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {single.status ? (
                    <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700 dark:bg-white/10 dark:text-success-200">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-error-50 px-3 py-1 text-xs font-semibold text-error-700 dark:bg-white/10 dark:text-error-200">
                      Inactive
                    </span>
                  )}
                  {single.featured ? (
                    <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                      Featured
                    </span>
                  ) : null}
                  {single.best_deal ? (
                    <span className="rounded-full bg-warning-500 px-3 py-1 text-xs font-semibold text-white">
                      Best Deal
                    </span>
                  ) : null}
                  {single.free_delivery ? (
                    <span className="rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white">
                      Free Delivery
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* RIGHT: Selectors + Pricing + Variations */}
            <div className="col-span-12 lg:col-span-7">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                {/* Colors */}
                <div>
                  <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white/90">
                    Colors
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(single.available_colors ?? []).map((c) => {
                      const active = c.id === colorId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setColorId(c.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-xl px-3 py-2 text-sm ring-1 transition",
                            active
                              ? "bg-brand-500 text-white ring-brand-500"
                              : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                          )}
                          title={c.name}
                        >
                          <span
                            className="h-4 w-4 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                            style={{ backgroundColor: c.hex ?? "#E5E7EB" }}
                          />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Variants */}
                <div className="mt-5">
                  <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white/90">
                    Variants
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(single.available_variants ?? []).map((v) => {
                      const active = v.id === variantId;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setVariantId(v.id)}
                          className={cn(
                            "rounded-xl px-3 py-2 text-sm ring-1 transition",
                            active
                              ? "bg-brand-500 text-white ring-brand-500"
                              : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
                          )}
                          title={v.attribute_name}
                        >
                          {v.name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {single.available_variants?.[0]?.attribute_name ?? ""}
                  </div>
                </div>

                {/* Pricing summary */}
                <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.04]">
                  <div className="grid grid-cols-12 gap-3 text-sm">
                    <div className="col-span-12 md:col-span-5">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Selected
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white/90">
                        {selectedVariation
                          ? `${selectedVariation.color.name} • ${selectedVariation.variant.name}`
                          : "Select color & variant"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Discount:{" "}
                        {selectedVariation
                          ? discountLabel(selectedVariation)
                          : "-"}
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Buying
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white/90">
                        {formatBdt(buyingPrice)}
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Selling
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white/90">
                        {formatBdt(sellingPrice)}
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Final
                      </div>
                      <div className="font-semibold text-brand-600 dark:text-brand-400">
                        {formatBdt(finalPrice)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Profit:{" "}
                        <span
                          className={cn(
                            "font-semibold",
                            profit >= 0
                              ? "text-success-700 dark:text-success-300"
                              : "text-error-700 dark:text-error-300"
                          )}
                        >
                          {formatBdt(profit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qty */}
                <div className="mt-5">
                  <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white/90">
                    Quantity
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty((x) => Math.max(1, x - 1))}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                    >
                      <Minus size={16} />
                    </button>

                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(1, Number(e.target.value)))
                      }
                      className="h-11 w-24 rounded-xl border border-gray-200 px-3 text-center text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() => setQty((x) => x + 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                    onClick={onClose}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={!canAdd}
                    className={cn(
                      "h-11 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600",
                      !canAdd && "cursor-not-allowed opacity-60"
                    )}
                    onClick={() => {
                      if (!single || !selectedVariation) return;
                      if (!selectedVariation.in_stock) {
                        toast.error("Out of stock");
                        return;
                      }

                      const img =
                        getCoverImage(single) ?? images[0]?.path ?? "";

                      const item: CartItem = {
                        key,
                        productId: single.id,
                        productVariationId: selectedVariation.id,
                        title: single.name,
                        sku: selectedVariation.sku,
                        image: img || "",
                        unitPrice,
                        qty,

                        // legacy optional fields
                        variant: selectedVariation.color.name,
                        size: selectedVariation.variant.name,
                      };

                      onAdd(item);
                      onClose();
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* ✅ Rich preview for HTML short_description */}
              <div className="mt-4 space-y-4">
                {/* <div>
                  <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white/90">
                    Short Description
                  </div>
                  <RichTextPreview html={single.short_description ?? ""} />
                </div> */}

                <div>
                  <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white/90">
                    Long Description
                  </div>
                  <RichTextPreview html={single.long_description ?? ""} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
