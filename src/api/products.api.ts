// src/api/products.api.ts
import { api } from "./client";

export type ProductVariationPayload = {
  color_id: number;
  variant_id: number;
  buying_price: number;
  selling_price: number;
  discount: number;
  stock: number;
  sku: string;
};

export type CreateProductPayload = {
  product_images: File[];
  name: string;
  slug: string;

  main_category_id: number;
  sub_category_id: number;
  child_category_id: number;

  brand_id: number;
  attribute_id: number;

  video_path?: string;
  short_description?: string;
  long_description?: string;

  status: boolean;
  featured: boolean;
  free_delivery: boolean;
  best_deal: boolean;

  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  robots?: string;

  variations: ProductVariationPayload[];
};

export type UpdateProductPayload = CreateProductPayload & {
  delete_image_ids?: number[];
};

function appendIfDefined(fd: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return;
  fd.append(key, String(value));
}

function boolToStr(v: boolean) {
  return v ? "true" : "false";
}

function buildProductFormData(payload: CreateProductPayload | UpdateProductPayload) {
  const fd = new FormData();

  // multi images
  payload.product_images?.forEach((file) => {
    fd.append("product_images", file);
  });

  appendIfDefined(fd, "name", payload.name);
  appendIfDefined(fd, "slug", payload.slug);

  appendIfDefined(fd, "main_category_id", payload.main_category_id);
  appendIfDefined(fd, "sub_category_id", payload.sub_category_id);
  appendIfDefined(fd, "child_category_id", payload.child_category_id);

  appendIfDefined(fd, "brand_id", payload.brand_id);
  appendIfDefined(fd, "attribute_id", payload.attribute_id);

  appendIfDefined(fd, "video_path", payload.video_path);
  appendIfDefined(fd, "short_description", payload.short_description);
  appendIfDefined(fd, "long_description", payload.long_description);

  fd.append("status", boolToStr(payload.status));
  fd.append("featured", boolToStr(payload.featured));
  fd.append("free_delivery", boolToStr(payload.free_delivery));
  fd.append("best_deal", boolToStr(payload.best_deal));

  appendIfDefined(fd, "meta_title", payload.meta_title);
  appendIfDefined(fd, "meta_description", payload.meta_description);
  appendIfDefined(fd, "meta_keywords", payload.meta_keywords);
  appendIfDefined(fd, "canonical_url", payload.canonical_url);
  appendIfDefined(fd, "og_title", payload.og_title);
  appendIfDefined(fd, "og_description", payload.og_description);
  appendIfDefined(fd, "robots", payload.robots);

  // ✅ IMPORTANT: variations is JSON string in form-data
  fd.append("variations", JSON.stringify(payload.variations ?? []));

  const u = payload as UpdateProductPayload;
  if (Array.isArray(u.delete_image_ids) && u.delete_image_ids.length > 0) {
    fd.append("delete_image_ids", JSON.stringify(u.delete_image_ids));
  }

  return fd;
}

export async function createProduct(payload: CreateProductPayload): Promise<{ success: true; productId: number }> {
  const fd = buildProductFormData(payload);
  const res = await api.post("/product", fd, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data;
}

export async function updateProduct(id: number, payload: UpdateProductPayload): Promise<{ success: true }> {
  const fd = buildProductFormData(payload);
  const res = await api.put(`/product/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  return res.data;
}

export async function getProduct(id: number) {
  const res = await api.get(`/product/${id}`);
  return res.data;
}
