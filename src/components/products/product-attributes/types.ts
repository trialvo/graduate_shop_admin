export type Priority = "Low" | "Normal" | "Medium" | "High";

export type Option = {
  value: string;
  label: string;
};

export interface BrandRow {
  id: number;
  name: string;
  status: boolean;
  priority: Priority;
}

export interface ColorRow {
  id: number;
  name: string;
  hex: string; // #RRGGBB
  status: boolean;
  priority: Priority;
}

export type AttributeType = "text" | "size" | "material" | "custom";

export interface AttributeDefinition {
  id: number;
  name: string; // e.g. Size, Material, Weight
  type: AttributeType;
  required: boolean;
  status: boolean;
  priority: Priority;
  values: string[]; // e.g. ["S","M","L"]
}

export interface ProductLite {
  id: number;
  name: string;
  sku: string;
}

export type ProductAttributeSelection = Record<number, string[]>;
// key: attributeDefinitionId, value: selected values for this product

export interface VariantRow {
  id: number;
  productId: number;
  name: string; // generated label e.g. "Color: Red / Size: M"
  sku: string;
  price: number;
  stock: number;
  active: boolean;
  attributes: Record<string, string>; // e.g. { Brand: "Nike", Color: "Red", Size: "M" }
}
