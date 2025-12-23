import type { BannerRow, CategoryLite, ProductLite } from "./types";
import { nowISO } from "./types";

export const ZONES = [
  "Home Top",
  "Home Middle",
  "Home Bottom",
  "Category Page",
  "Product Page",
  "Campaign",
] as const;

export const CATEGORIES: CategoryLite[] = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Fashion" },
  { id: 3, name: "Groceries" },
];

export const PRODUCTS: ProductLite[] = [
  { id: 9001, name: "Men T-shirt", sku: "TSHIRT-001" },
  { id: 9002, name: "Ladies Bag", sku: "BAG-001" },
  { id: 9003, name: "Sandal", sku: "SANDAL-001" },
];

export const INITIAL_BANNERS: BannerRow[] = [
  {
    id: 1,
    title: "Offer Banner",
    zone: "Home Top",
    type: "default",
    imageUrl: null,
    imageFileName: null,
    featured: false,
    status: true,
    createdAt: nowISO(),
  },
  {
    id: 2,
    title: "Winter Campaign",
    zone: "Home Middle",
    type: "category_wise",
    categoryId: 2,
    imageUrl: null,
    imageFileName: null,
    featured: true,
    status: true,
    createdAt: nowISO(),
  },
];
