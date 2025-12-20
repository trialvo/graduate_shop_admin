import type {
  AttributeDefinition,
  BrandRow,
  ColorRow,
  ProductLite,
  VariantRow,
} from "./types";

export const INITIAL_BRANDS: BrandRow[] = [
  { id: 1, name: "No Brand", status: true, priority: "Normal" },
  { id: 2, name: "Nike", status: true, priority: "High" },
  { id: 3, name: "Adidas", status: true, priority: "Medium" },
];

export const INITIAL_COLORS: ColorRow[] = [
  { id: 1, name: "Red", hex: "#EF4444", status: true, priority: "Normal" },
  { id: 2, name: "Black", hex: "#111827", status: true, priority: "High" },
  { id: 3, name: "White", hex: "#F9FAFB", status: true, priority: "Medium" },
];

export const INITIAL_ATTRIBUTES: AttributeDefinition[] = [
  {
    id: 101,
    name: "Size",
    type: "size",
    required: true,
    status: true,
    priority: "High",
    values: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 102,
    name: "Material",
    type: "material",
    required: false,
    status: true,
    priority: "Normal",
    values: ["Cotton", "Polyester", "Leather"],
  },
];

export const INITIAL_PRODUCTS: ProductLite[] = [
  { id: 9001, name: "Men T-shirt", sku: "TSHIRT-001" },
  { id: 9002, name: "Ladies Bag", sku: "BAG-001" },
  { id: 9003, name: "Sandal", sku: "SANDAL-001" },
];

export const INITIAL_VARIANTS: VariantRow[] = [];
