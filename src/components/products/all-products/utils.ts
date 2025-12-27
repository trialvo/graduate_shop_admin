// src/components/products/all-products/utils.ts
import type { ProductEntity } from "@/api/products.api";
import type { Product } from "./types";

type LookupMaps = {
  mainNameById: Map<number, string>;
  subNameById: Map<number, string>;
  childNameById: Map<number, string>;
};

export function sumStock(variations: { stock: number }[]): number {
  return variations.reduce((s, v) => s + Math.max(0, Number(v.stock ?? 0)), 0);
}

export function minSelling(variations: { selling_price: number }[]): number {
  if (!variations.length) return 0;
  return Math.min(...variations.map((v) => Number(v.selling_price ?? 0)));
}

export function maxDiscount(variations: { discount: number }[]): number {
  if (!variations.length) return 0;
  return Math.max(...variations.map((v) => Number(v.discount ?? 0)));
}

export function firstSku(variations: { sku: string }[]): string {
  return variations?.[0]?.sku ?? "-";
}

export function toUiProduct(entity: ProductEntity, lookups: LookupMaps): Product {
  const stockQty = sumStock(entity.variations ?? []);
  const price = minSelling(entity.variations ?? []);
  const discount = maxDiscount(entity.variations ?? []);
  const salePrice = Math.max(0, price - Math.max(0, discount));

  return {
    id: String(entity.id),
    name: entity.name,
    imageUrl: entity.images?.[0]?.path,

    positionNumber: entity.id,
    categoryPath: {
      category: lookups.mainNameById.get(entity.main_category_id) ?? `#${entity.main_category_id}`,
      subCategory: lookups.subNameById.get(entity.sub_category_id) ?? undefined,
      childCategory: lookups.childNameById.get(entity.child_category_id) ?? undefined,
    },

    stockQty,
    price,
    discount,
    salePrice,

    status: entity.status ? "active" : "inactive",
    sku: firstSku(entity.variations ?? []),
    createdAt: new Date(entity.created_at).toLocaleString(),
  };
}
