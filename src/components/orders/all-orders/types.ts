export type OrderPaymentStatus = "paid" | "unpaid";

export type OrderPaymentMethod = "COD" | "BKASH" | "NAGAD" | "CARD";

export type OrderStatus =
  | "all"
  | "new"
  | "approved"
  | "processing"
  | "packaging"
  | "shipped"
  | "out_of_delivery"
  | "delivered"
  | "returned"
  | "cancelled"
  | "on_hold"
  | "trash";

export type FraudLevel = "safe" | "medium" | "high";

export type CourierProviderId =
  | "select"
  | "sa_paribahan"
  | "pathao"
  | "redx"
  | "delivery_tiger"
  | "sundarban"
  | "steadfast";

export type CourierPreview = {
  receiverName?: string;
  receiverPhone?: string;
  address?: string;
  area?: string;
  codAmount?: number;
  weightKg?: number;
};

export type AutoCourierItem = {
  providerId: Exclude<CourierProviderId, "select">;
  providerName: string;
  connected: boolean;
  // optional: set as "default"
  isDefault?: boolean;
};

export type CourierInfo = {
  providerId?: CourierProviderId;
  providerName?: string;

  memoNo?: string;
  trackingNo?: string;
  requestedAt?: string;

  apiConfigured?: boolean;
  apiConnected?: boolean;

  // API connected courier list (for Auto tab)
  availableAutoCouriers?: AutoCourierItem[];

  autoDetected?: boolean;
  lastMessage?: string;

  preview?: CourierPreview;
};

export type OrderItemRow = {
  id: string;
  name: string;
  image?: string;
  size?: string;
  code?: string;
  qty: number;
  price: number;
  total: number;
};

export type OrderRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerImage?: string;

  fraudLevel: FraudLevel;

  paymentMethod: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;

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

  email?: string;
  billingName?: string;
  billingPhone?: string;

  shippingAddress?: string;
  shippingArea?: string;

  qrValue?: string;
  products?: OrderItemRow[];

  discount?: number;
  paidAmount?: number;
  shippingCost?: number;

  courier?: CourierInfo;
};
