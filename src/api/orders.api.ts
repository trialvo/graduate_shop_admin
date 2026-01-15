import { api } from "./client";

export type OrdersListParams = {
  order_type?: string;
  customer_phone?: string;
  customer_email?: string;

  order_status?: string;
  payment_status?: string;

  payment_provider?: string;
  payment_type?: string;

  is_fraud?: string;
  min_total?: number;
  max_total?: number;

  date_from?: string;
  date_to?: string;

  limit?: number;
  offset?: number;
};

/** Courier provider ids (match UI types) */
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

export type DispatchCourierProvider =
  | "paperfly"
  | "redx"
  | "pathao"
  | "steadfast";

export const ordersKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersKeys.all, "list"] as const,
  list: (params: OrdersListParams) => [...ordersKeys.lists(), params] as const,
  details: () => [...ordersKeys.all, "detail"] as const,
  detail: (orderId: number | string) =>
    [...ordersKeys.details(), String(orderId)] as const,
};

export type CourierOption = {
  any_auto_available: boolean;
  available_providers: { provider: string; is_auto_available: number }[];
};

export type ApiOrderPayment = {
  id: number;
  order_id: number;
  provider: string;
  transaction_ref: string | null;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
};

export type ApiOrderCourier = {
  id: number;
  order_id: number;
  courier_provider: string | null;
  type: string | null;
  is_auto_available: number | null;
  delivery_charge_id: number | null;
  delivery_title: string | null;
  customer_charge: number | null;
  our_charge: number | null;
  weight: number | null;
  tracking_number: string | null;
  courier_phone: string | null;
  note: string | null;
  memo: string | null;
  created_at: string;
  reference_id: number | null;
  raw_response: string | null;
};

export type ApiOrderCoupon = {
  id: number;
  order_id: number;
  coupon_id: number;
  coupon_code: string;
  coupon_title: string;
  discount_type: number;
  discount_value: number;
  discount_amount: number;
  applied_on: string;
  created_at: string;
};

export type ApiOrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product_sku_id: number;
  product_name: string;
  product_image: string | null;
  color_id: number | null;
  color_name: string | null;
  color_hex: string | null;
  attribute_id: number | null;
  variant_id: number | null;
  variant_name: string | null;
  quantity: number;
  buying_price: number;
  selling_price: number;
  discount: number;
  discount_type: number;
  coupon_code: string | null;
  coupon_discount: number;
  final_unit_price: number;
  line_total: number;
  created_at: string;
  stock_adjusted: number;
  sell_count_adjusted: number;
  sku?: string | null;
  attribute_name?: string | null;
  brand_name?: string | null;
};

export type ApiOrder = {
  id: number;
  customer_name: string;
  customer_image?: string | null;
  customer_email: string;
  customer_phone: string;

  order_type: string;
  is_fraud: number;

  payment_type: "gateway" | "cod" | "mixed";
  payment_status: "unpaid" | "partial_paid" | "paid";

  subtotal: number;
  discount_total: number;
  delivery_charge: number;
  grand_total: number;

  paid_amount: number;
  due_amount: number;

  order_status:
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

  note: string | null;
  created_at: string;

  full_address: string;
  city: string;
  zip_code: string;

  items: ApiOrderItem[];
  payments: ApiOrderPayment[];
  couriers: ApiOrderCourier[];
  coupons: ApiOrderCoupon[];
};

export type OrdersListResponse = {
  success: boolean;
  courierOption: CourierOption;
  data: ApiOrder[];
  pagination: { limit: number; offset: number; total: number };
  summary?: {
    total: number;
    new: number;
    delivered: number;
    cancelled: number;
    others: number;
  };
};

export type OrderDetailResponse = {
  success: boolean;
  courierOption: CourierOption;
  data: ApiOrder;
};

export type DispatchCourierRequest = {
  courier_provider: DispatchCourierProvider;
  weight?: number; // kg
};

export type DispatchCourierResponse = {
  success: boolean;
  message: string;
  courier: string;
  tracking_number: string;
  response?: any;
};

export type ManualDispatchRequest = {
  courier_provider: DispatchCourierProvider;
  tracking_number?: string;
  reference_id?: string;
  memo?: string;
  weight?: number; // kg
};

export type ManualDispatchResponse = {
  success: boolean;
  message: string;
  courier: string;
  tracking_number?: string;
  reference_id?: string;
  memo?: string;
  weight?: number;
};

function cleanParams(params: Record<string, any>) {
  const out: Record<string, any> = {};
  Object.keys(params).forEach((k) => {
    const v = params[k];
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    out[k] = v;
  });
  return out;
}

function getErrMessage(err: any, fallback: string) {
  return (
    err?.response?.data?.error ??
    err?.response?.data?.message ??
    err?.message ??
    fallback
  );
}

export async function getAdminOrders(params: OrdersListParams) {
  try {
    const res = await api.get<OrdersListResponse>("/admin/orders", {
      params: cleanParams(params),
    });
    return res.data;
  } catch (err: any) {
    throw new Error(getErrMessage(err, "Failed to load orders"));
  }
}

export async function getAdminOrderById(orderId: number) {
  try {
    const res = await api.get<OrderDetailResponse>(`/admin/order/${orderId}`);
    return res.data;
  } catch (err: any) {
    // Handles: { flag: 404, error: "Order not found" }
    const msg = getErrMessage(err, "Failed to load order");
    throw new Error(msg);
  }
}

export async function patchOrderPaymentStatus(
  orderId: number,
  newPaymentStatus: "unpaid" | "partial_paid" | "paid"
) {
  try {
    const res = await api.patch(`/admin/order/paymentstatus/${orderId}`, {
      new_payment_status: newPaymentStatus,
    });
    return res.data;
  } catch (err: any) {
    throw new Error(getErrMessage(err, "Failed to update payment status"));
  }
}

export async function patchOrderStatus(
  orderId: number,
  newStatus: ApiOrder["order_status"]
) {
  try {
    const res = await api.patch(`/admin/order/status/${orderId}`, {
      new_status: newStatus,
    });
    const data: any = res.data;
    if (Number.isFinite(Number(data?.flag)) && Number(data.flag) >= 400) {
      const message =
        data?.error || data?.message || "Failed to update order status";
      throw new Error(message);
    }
    return data;
  } catch (err: any) {
    throw new Error(getErrMessage(err, "Failed to update order status"));
  }
}

/** Auto dispatch via API: POST /admin/order/dispatch/:id */
export async function dispatchOrderCourier(
  orderId: number,
  payload: DispatchCourierRequest
) {
  try {
    const res = await api.post<DispatchCourierResponse>(
      `/admin/order/dispatch/${orderId}`,
      payload
    );
    return res.data;
  } catch (err: any) {
    throw new Error(getErrMessage(err, "Failed to dispatch courier"));
  }
}

/** Manual dispatch via API: POST /admin/order/manualDispatchOrder/:id */
export async function manualDispatchOrder(
  orderId: number,
  payload: ManualDispatchRequest
) {
  try {
    const res = await api.post<ManualDispatchResponse>(
      `/admin/order/manualDispatchOrder/${orderId}`,
      payload
    );
    return res.data;
  } catch (err: any) {
    throw new Error(getErrMessage(err, "Failed to manual dispatch courier"));
  }
}
