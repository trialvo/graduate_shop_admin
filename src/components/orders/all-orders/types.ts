// src/components/orders/all-orders/types.ts

export type OrderStatus =
  | "all"
  | "new"
  | "approved"
  | "processing"
  | "packaging"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "cancelled"
  | "on_hold"
  | "trash";

export type CourierProviderId =
  | "select"
  | "manual"
  | "sa_paribahan"
  | "pathao"
  | "redx"
  | "delivery_tiger"
  | "sundarban"
  | "steadfast"
  | "paperfly";

export type OrderItemRow = {
  id: string;

  productId?: number;
  productSkuId?: number;

  productName: string;
  productImage?: string;

  sku?: string;
  brandName?: string;

  colorName?: string;
  colorHex?: string;

  variantName?: string;
  attributeName?: string;

  quantity: number;

  buyingPrice?: number;
  sellingPrice?: number;

  discount?: number;
  couponCode?: string | null;
  couponDiscount?: number;

  finalUnitPrice: number;
  lineTotal: number;
};

export type OrderRow = {
  id: string;

  customerName: string;
  customerPhone: string;
  customerImage?: string;

  email?: string;

  fraudLevel: "safe" | "medium" | "high";

  paymentMethod: string;
  paymentStatus: "unpaid" | "partial_paid" | "paid";

  status: Exclude<OrderStatus, "all">;

  itemsAmount: number;
  totalItems: number;

  total: number;
  currencySymbol: string;

  orderDateLabel: string;
  orderTimeLabel: string;
  relativeTimeLabel: string;

  orderNote?: string;
  shippingLocation: string;

  paidAmount: number;
  shippingCost: number;
  discount: number;

  paymentType: string;
  paymentProvider: string;

  items?: OrderItemRow[];

  courier: {
    providerId: CourierProviderId;
    providerName?: string;
    memoNo?: string;
    trackingNo?: string;

    apiConfigured: boolean;
    apiConnected: boolean;

    availableAutoCouriers: Array<{
      providerId: CourierProviderId | string;
      providerName: string;
      connected: boolean;
    }>;
  };
};
