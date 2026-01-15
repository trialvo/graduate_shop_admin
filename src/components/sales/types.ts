/* =========================
 * Cart
 * ========================= */

export type CartItem = {
  key: string;
  productId: number;
  productVariationId: number;
  title: string;
  sku: string;
  unitPrice: number;
  qty: number;
};

/* =========================
 * Customer & Address
 * ========================= */

export type CustomerAddress = {
  id: number;
  name: string;
  address_type: "home" | "office" | "n/a";
  full_address: string;
  city?: string | null;
  zip_code?: string | null;
  phone_id?: number;
};

export type CustomerPhone = {
  id: number;
  phone_number: string;
  is_verified: boolean;
};

export type Customer = {
  id: number;
  email: string | null;
  first_name: string;
  last_name: string;
  img_path?: string | null;
  status: "active" | "inactive" | "suspended";

  default_phone?: number | null;
  phones?: CustomerPhone[];

  default_address?: number | null;
  addresses?: CustomerAddress[];

  created_at?: string;
};

/* =========================
 * Product (Single Product API)
 * ========================= */

export type ProductColor = {
  id: number;
  name: string;
  hex: string;
  priority?: number;
};

export type ProductVariant = {
  id: number;
  name: string;
  attribute_id?: number;
  attribute_name?: string;
};

export type ProductVariation = {
  id: number;
  color: ProductColor;
  variant: ProductVariant;

  selling_price: number;
  discount: number;
  discount_type?: number;
  final_price: number;

  stock: number;
  sku: string;
  status: boolean;
  in_stock: boolean;
};

export type ProductImage = {
  path: string;
};

export type ProductSingle = {
  id: number;
  name: string;

  brand?: { id: number; name: string; image?: string };
  main_category?: { id: number; name: string };
  sub_category?: { id: number; name: string };
  child_category?: { id: number; name: string };
  attribute?: { id: number; name: string };

  short_description?: string;
  long_description?: string;

  images: ProductImage[];

  variations: ProductVariation[];
  available_colors: ProductColor[];
  available_variants: ProductVariant[];

  summary?: {
    min_price: number;
    max_price: number;
    total_stock: number;
  };
};
