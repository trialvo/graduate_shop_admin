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
  | "steadfast"
  | "redx"
  | "pathao"
  | "paperfly"
  | "sa_paribahan"
  | "delivery_tiger"
  | "sundarban";

export type OrderItemRow = {
  id: string;

  productId?: number;
  skuId?: number;

  name: string;
  image?: string | null;

  brandName?: string | null;

  colorName?: string | null;
  colorHex?: string | null;

  size?: string | null; // variant_name
  code?: string | null; // sku

  qty: number;

  price: number; // final_unit_price
  total: number; // line_total
};

export type OrderRow = {
  id: string;

  customerName: string;
  customerPhone: string;
  customerImage?: string;

  fraudLevel: "safe" | "medium" | "high";

  paymentMethod: "COD" | "BKASH" | "NAGAD" | "ROCKET" | "CARD";
  paymentStatus: "unpaid" | "partial_paid" | "paid";

  status: Exclude<OrderStatus, "all">;

  itemsAmount: number; // number of line items
  totalItems: number; // total qty across items
  total: number;

  currencySymbol: string;

  orderDateLabel: string;
  orderTimeLabel: string;
  relativeTimeLabel: string;

  orderNote?: string;
  shippingLocation: string;

  email?: string;

  paidAmount: number;
  shippingCost: number;
  discount: number;

  paymentType: "gateway" | "cod" | "mixed";
  paymentProvider?: string;

  // ✅ IMPORTANT: items used by modal
  items: OrderItemRow[];

  // optional extra modal fields
  shippingAddress?: string;
  shippingArea?: string;
  qrValue?: string;

  courier: {
    providerId: CourierProviderId;
    providerName?: string;
    memoNo?: string;
    trackingNo?: string;

    apiConfigured: boolean;
    apiConnected: boolean;

    preview?: {
      receiverName?: string;
      receiverPhone?: string;
      address?: string;
      area?: string;
      codAmount?: number;
      weightKg?: number;
    };
    autoDetected?: boolean;
    lastMessage?: string;

    availableAutoCouriers: {
      providerId: Exclude<CourierProviderId, "select" | "manual">;
      providerName: string;
      connected: boolean;
      isDefault?: boolean;
    }[];
  };
};
