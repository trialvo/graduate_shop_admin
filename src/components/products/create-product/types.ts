// src/components/products/product-create/types.ts
export type Option = { value: string; label: string };

export type DiscountType = "percent" | "flat";

export type ProductStatusFlags = {
  status: boolean;
  featured: boolean;
  freeDelivery: boolean;
  bestDeal: boolean;
};

export type SeoMeta = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  robots: string;
};

export type VariantMatrixRow = {
  key: string; // `${colorId}__${variantId}`
  colorId: number;
  variantId: number;

  buyingPrice: number;
  sellingPrice: number;
  discount: number;
  stock: number;

  sku: string;
  active: boolean;
};

export type ExistingImage = {
  id: number;
  path: string; // backend path
};
