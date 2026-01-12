// src/components/products/all-products/utils.ts
import type { ProductEntity } from "@/api/products.api";
import type { Product } from "./types";
import { api } from "@/api/client";

type LookupMaps = {
  mainNameById: Map<number, string>;
  subNameById: Map<number, string>;
  childNameById: Map<number, string>;
};

export function sumStock(variations: { stock: number }[]): number {
  return (variations ?? []).reduce((s, v) => s + Math.max(0, Number(v.stock ?? 0)), 0);
}

export function minSelling(variations: { selling_price: number }[]): number {
  if (!variations?.length) return 0;
  return Math.min(...variations.map((v) => Number(v.selling_price ?? 0)));
}

export function maxDiscount(variations: { discount: number }[]): number {
  if (!variations?.length) return 0;
  return Math.max(...variations.map((v) => Number(v.discount ?? 0)));
}

export function firstSku(variations: { sku: string }[]): string {
  return variations?.[0]?.sku ?? "-";
}

/**
 * API returns relative upload path like: "/uploads/products/xxx.png"
 * We convert it to full URL using axios baseURL origin (or window.origin fallback).
 */
export function resolveAssetUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  // only in browser
  if (typeof window === "undefined") return path;

  const base = api?.defaults?.baseURL ?? window.location.origin;
  try {
    const origin = new URL(base, window.location.origin).origin;
    return `${origin}${path}`;
  } catch {
    return path;
  }
}

export function toUiProduct(entity: ProductEntity, lookups: LookupMaps): Product {
  const variations = entity.variations ?? [];
  const stockQty = sumStock(variations);
  const variantCount = variations.length;

  const price = minSelling(variations);
  const discount = maxDiscount(variations);

  // backend discount looks like "amount", so sale = selling - discount
  const salePrice = Math.max(0, price - Math.max(0, discount));

  return {
    id: String(entity.id),
    name: entity.name,
    imageUrl: resolveAssetUrl(entity.images?.[0]?.path), // ✅ 0 index image

    positionNumber: entity.id,
    categoryPath: {
      category: lookups.mainNameById.get(entity.main_category_id) ?? `#${entity.main_category_id}`,
      subCategory: lookups.subNameById.get(entity.sub_category_id) ?? undefined,
      childCategory: lookups.childNameById.get(entity.child_category_id) ?? undefined,
    },

    stockQty,
    variantCount,

    price,
    discount,
    salePrice,

    status: entity.status ? "active" : "inactive",
    sku: firstSku(variations),
    createdAt: new Date(entity.created_at).toLocaleString(),
  };
}
