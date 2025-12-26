// src/api/product-variations.api.ts
import { api } from "./client";

export type ProductVariation = {
  id: number;
  product_id: number;
  color_id: number;
  variant_id: number;
  sku: string;
  buying_price: number;
  selling_price: number;
  discount: number;
  stock: number;
  status: number; // 1/0
};

export type CreateProductVariationPayload = {
  product_id: number;
  color_id: number;
  variant_id: number;
  buying_price?: number;
  selling_price: number;
  discount?: number;
  stock?: number;
  sku?: string;
};

export type UpdateProductVariationPayload = CreateProductVariationPayload;

function unwrapVariations(payload: any): ProductVariation[] {
  if (payload?.variations && Array.isArray(payload.variations)) return payload.variations;
  if (Array.isArray(payload)) return payload;
  return [];
}

export async function createProductVariation(payload: CreateProductVariationPayload): Promise<{ success: true; skuId: number }> {
  const res = await api.post("/product/variation", payload);
  return res.data;
}

export async function getProductVariations(params: {
  productId: number;
  limit: number;
  offset?: number;
  name?: string;
  status?: boolean;
  priority?: number;
}) {
  const { productId, ...rest } = params;
  const res = await api.get(`/product/getvariations/${productId}`, { params: rest });
  return { variations: unwrapVariations(res.data) };
}

export async function getProductVariation(id: number): Promise<ProductVariation> {
  const res = await api.get(`/product/variation/${id}`);
  return res.data;
}

export async function updateProductVariation(id: number, payload: UpdateProductVariationPayload): Promise<{ success: true }> {
  const res = await api.put(`/product/variation/${id}`, payload);
  return res.data;
}

export async function deleteProductVariation(id: number): Promise<void> {
  await api.delete(`/product/variation/${id}`);
}
