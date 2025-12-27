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

// Mock data support types
export type Category = {
  id: number;
  name: string;
};

export type SubCategory = {
  id: number;
  categoryId: number;
  name: string;
};

export type ChildCategory = {
  id: number;
  subCategoryId: number;
  name: string;
};

export type BrandRow = {
  id: number;
  name: string;
  status: boolean;
  priority: "Normal" | "Medium" | "High";
};

export type ColorRow = {
  id: number;
  name: string;
  hex: string;
  status: boolean;
  priority: "Normal" | "Medium" | "High";
};

export type AttributeDefinition = {
  id: number;
  name: string;
  type: "size" | "material" | "color" | "custom";
  required: boolean;
  status: boolean;
  priority: "Normal" | "Medium" | "High";
  values: string[];
};
