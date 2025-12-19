export type GuestOrderStatus = "pending" | "complete" | "cancelled";

export type SortBy = "date_desc" | "date_asc" | "total_desc" | "total_asc";

export type GuestOrder = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  createdAt: Date;
  timeLabel: string;
  cartTotal: string;
  status: GuestOrderStatus;
  tourPreference: string;
};
