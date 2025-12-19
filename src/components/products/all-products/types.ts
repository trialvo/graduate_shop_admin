export type ProductStatus = "active" | "inactive";

export type CategoryPath = {
  category: string;
  subCategory?: string;
  childCategory?: string;
};

export type Product = {
  id: string;
  name: string;
  imageUrl?: string;

  // requested
  positionNumber: number;
  categoryPath: CategoryPath;
  stockQty: number;

  price: number;
  discount?: number; // percentage (0-100)
  salePrice?: number;

  status: ProductStatus;

  // professional extras
  sku: string;
  createdAt: string; // display string
};
