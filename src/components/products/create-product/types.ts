export type Option = { value: string; label: string };

export type Priority = "Low" | "Normal" | "Medium" | "High";

export type DiscountType = "percent" | "flat";

export type ProductStatusFlags = {
  status: boolean;
  featured: boolean;
  freeDelivery: boolean;
  bestDeal: boolean;
};

export interface Category {
  id: number;
  name: string;
}

export interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
}

export interface ChildCategory {
  id: number;
  subCategoryId: number;
  name: string;
}

export interface BrandRow {
  id: number;
  name: string;
  status: boolean;
  priority: Priority;
}

export interface ColorRow {
  id: number;
  name: string;
  hex: string;
  status: boolean;
  priority: Priority;
}

export type AttributeType = "text" | "size" | "material" | "custom";

export interface AttributeDefinition {
  id: number;
  name: string;
  type: AttributeType;
  required: boolean;
  status: boolean;
  priority: Priority;
  values: string[];
}

export type ProductAttributeSelection = Record<number, string[]>;

export type SeoMeta = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  robots: string;
};

export type VariantMatrixKey = string; // `${colorId}__${value}`

export interface VariantMatrixRow {
  key: VariantMatrixKey;
  colorId: number;
  value: string; // e.g. "M"
  buyPrice: number;
  oldPrice: number;
  newPrice: number;
  stock: number;
  available: boolean;
}
