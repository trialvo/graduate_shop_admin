import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

import { getProduct } from "@/api/products.api";
import { toPublicUrl } from "@/utils/toPublicUrl";

import type {
  CartItem,
  ProductSingle,
  ProductVariation,
} from "./types";

/* =========================
 * Swiper
 * ========================= */
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";


interface Props {
  open: boolean;
  productId: number | null;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}

export default function ProductAddModal({
  open,
  productId,
  onClose,
  onAdd,
}: Props) {
  /* =========================
   * Fetch product
   * ========================= */
  const { data, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId as number),
    enabled: Boolean(open && productId),
  });

  const product = data?.product as ProductSingle | undefined;

  /* =========================
   * UI state
   * ========================= */
  const [qty, setQty] = useState(1);
  const [colorId, setColorId] = useState<number | null>(null);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [thumbs, setThumbs] = useState<any>(null);
  const safeThumbs =
    thumbs && !thumbs.destroyed ? { swiper: thumbs } : undefined;

  useEffect(() => {
    if (!product) return;
    setQty(1);
    setColorId(product.available_colors?.[0]?.id ?? null);
    setVariantId(product.available_variants?.[0]?.id ?? null);
  }, [product]);

  useEffect(() => {
    if (!open) {
      setThumbs(null);
    }
  }, [open]);

  /* =========================
   * Resolve variation
   * ========================= */
  const selectedVariation = useMemo<ProductVariation | null>(() => {
    if (!product || !colorId || !variantId) return null;

    return (
      product.variations.find(
        (v) =>
          v.color.id === colorId &&
          v.variant.id === variantId &&
          v.status
      ) ?? null
    );
  }, [product, colorId, variantId]);

  const canAdd =
    !!selectedVariation &&
    selectedVariation.in_stock &&
    qty > 0 &&
    qty <= selectedVariation.stock;

  if (!open) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      className="w-full max-w-[950px] overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Add Product
        </h3>
      </div>

      {/* Body */}
      <div className="grid max-h-[75vh] grid-cols-12 gap-6 overflow-y-auto px-6 py-6">
        {isLoading || !product ? (
          <div className="col-span-12 text-center text-sm text-gray-500">
            Loading product…
          </div>
        ) : (
          <>
            {/* =========================
             * Image Slider
             * ========================= */}
            <div className="col-span-12 md:col-span-5">
              <Swiper
                modules={[Navigation, Thumbs]}
                navigation
                thumbs={safeThumbs}
                className="rounded-lg border border-gray-200 dark:border-gray-800"
              >
                {product.images.length ? (
                  product.images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={toPublicUrl(img.path)}
                        className="h-72 w-full object-cover"
                      />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide>
                    <div className="flex h-72 items-center justify-center text-gray-400">
                      No Image
                    </div>
                  </SwiperSlide>
                )}
              </Swiper>

              {/* Thumbs */}
              {product.images.length > 1 && (
                <Swiper
                  modules={[Thumbs]}
                  watchSlidesProgress
                  onSwiper={setThumbs}
                  slidesPerView={5}
                  spaceBetween={8}
                  className="mt-3"
                >
                  {product.images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={toPublicUrl(img.path)}
                        className="h-16 w-full cursor-pointer rounded object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>

            {/* =========================
             * Product Info
             * ========================= */}
            <div className="col-span-12 md:col-span-7">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                {product.name}
              </h4>

              <p className="mt-1 text-sm text-gray-500">
                {product.brand?.name} •{" "}
                {product.main_category?.name} /{" "}
                {product.sub_category?.name} /{" "}
                {product.child_category?.name}
              </p>

              {product.attribute?.name && (
                <p className="mt-1 text-sm text-gray-500">
                  Attribute: {product.attribute.name}
                </p>
              )}

              {/* Price */}
              {selectedVariation && (
                <div className="mt-4">
                  <p className="text-2xl font-semibold text-brand-500">
                    ৳ {selectedVariation.final_price}
                  </p>
                  {selectedVariation.discount > 0 && (
                    <p className="text-sm text-gray-500 line-through">
                      ৳ {selectedVariation.selling_price}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    SKU: {selectedVariation.sku} • Stock:{" "}
                    {selectedVariation.stock}
                  </p>
                </div>
              )}

              {/* Colors */}
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color
                </p>
                <div className="flex gap-2">
                  {product.available_colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColorId(c.id)}
                      title={c.name}
                      className={`h-9 w-9 rounded-full ring-2 ${
                        colorId === c.id
                          ? "ring-brand-500"
                          : "ring-gray-300 dark:ring-gray-700"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Variants */}
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Variant
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.available_variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      className={`rounded-lg px-4 py-2 text-sm ring-1 ${
                        variantId === v.id
                          ? "bg-brand-500 text-white ring-brand-500"
                          : "bg-white text-gray-700 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-6 flex items-center gap-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border"
                >
                  <Minus size={16} />
                </button>

                <input
                  type="number"
                  min={1}
                  max={selectedVariation?.stock ?? 1}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Number(e.target.value)))
                  }
                  className="h-10 w-20 rounded-lg border text-center"
                />

                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            disabled={!canAdd}
            onClick={() => {
              if (!product || !selectedVariation) return;

              onAdd({
                key: `${product.id}_${selectedVariation.id}`,
                productId: product.id,
                productVariationId: selectedVariation.id,
                title: product.name,
                sku: selectedVariation.sku,
                unitPrice: selectedVariation.final_price,
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
}
