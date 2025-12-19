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

export type OrderItemRow = {
  id: string;

  // ✅ Product details table fields
  name: string;
  image?: string;
  size?: string; // e.g. XL, XXL
  code?: string; // e.g. 1552

  qty: number;
  price: number; // unit price
  total: number; // line total (qty * price)
};

export type OrderRow = {
  id: string; // e.g. #95101
  customerName: string;
  customerPhone: string;
  customerImage?: string;

  fraudLevel: FraudLevel;

  paymentMethod: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;

  status: Exclude<OrderStatus, "all">;

  itemsAmount: number; // distinct products
  totalItems: number; // total qty
  total: number; // numeric total
  currencySymbol: string; // "৳"

  orderDateLabel: string; // "14/11/2025"
  orderTimeLabel: string; // "2:30PM"
  relativeTimeLabel: string; // "2m ago"

  orderNote?: string;
  shippingLocation: string; // "Inside Dhaka" etc.

  // For View Modal
  email?: string;
  billingName?: string;
  billingPhone?: string;

  shippingAddress?: string;
  shippingArea?: string;

  qrValue?: string;
  products?: OrderItemRow[];

  // Optional totals (future)
  discount?: number;
  paidAmount?: number;
  shippingCost?: number;
};
