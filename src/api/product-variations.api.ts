// src/api/product-variations.api.ts
import { api } from "./client";

export type ProductVariationPayload = {
  product_id: number;
  color_id: number;
  variant_id: number;
  buying_price?: number;
  selling_price: number;
  discount?: number;
  stock?: number;
  sku?: string;
};

export type ProductVariationEntity = {
  id: number;
  product_id: number;
  color_id: number;
  variant_id: number;
  sku: string;
  buying_price: number;
  selling_price: number;
  discount: number;
  stock: number;
  status: 1 | 0;
};

export async function createProductVariation(payload: ProductVariationPayload) {
  const res = await api.post("/product/variation", payload);
  return res.data as { success: true; skuId: number };
}

export async function getProductVariation(id: number) {
  const res = await api.get(`/product/variation/${id}`);
  return res.data as ProductVariationEntity;
}

export async function updateProductVariation(id: number, payload: ProductVariationPayload) {
  const res = await api.put(`/product/variation/${id}`, payload);
  return res.data as { success: true };
}

export async function deleteProductVariation(id: number) {
  const res = await api.delete(`/product/variation/${id}`);
  return res.data as { success: true };
}
