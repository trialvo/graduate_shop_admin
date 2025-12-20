export type ProductVariant = {
  id: string;
  name: string; // e.g. "Regular", "Combo", "500g"
};

export type ProductSize = {
  id: string;
  name: string; // e.g. "S", "M", "L"
};

export type SaleProduct = {
  id: string;
  title: string;
  sku: string;
  category: string;
  subCategory?: string;
  childCategory?: string;
  price: number;
  image: string;
  variants?: ProductVariant[];
  sizes?: ProductSize[];
};

export type CustomerAddress = {
  label: string; // e.g. "Home", "Office"
  addressLine: string;
  phone?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  addresses: CustomerAddress[];
};

export type CartItem = {
  key: string; // unique per product+variant+size
  productId: string;
  title: string;
  sku: string;
  image: string;
  unitPrice: number;
  qty: number;
  variant?: string;
  size?: string;
};
