export type Priority = "Low" | "Normal" | "Medium" | "High";

export type Option = { value: string; label: string };

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

/**
 * productId -> { attributeDefinitionId -> selected values[] }
 */
export type ProductAttributeSelection = Record<number, string[]>;

export interface VariantRow {
  id: number;
  productId: number;
  name: string; // generated label e.g. "Color: Red / Size: M"
  sku: string;
  price: number;
  stock: number;
  active: boolean;

  /**
   * attributes map in display order.
   * Example: { Brand: "Nike", Color: "Red", Size: "M" }
   */
  attributes: Record<string, string>;
}

export function safeNumber(input: string, fallback: number): number {
  const n = Number(input);
  return Number.isFinite(n) ? n : fallback;
}

export function makeSkuBase(base: string): string {
  return base.trim().toUpperCase().replace(/\s+/g, "-");
}

export function cartesian<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]]
  );
}
