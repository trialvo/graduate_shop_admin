export type CustomerType =
  | "ALL"
  | "LOYAL"
  | "VIP"
  | "NEW"
  | "ACTIVE"
  | "FAKE"
  | "RISKY"
  | "INACTIVE"
  | "BLOCKED";

export type SalesPeriod =
  | "ALL_TIME"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_YEAR";

export type CustomerBehavior = "REGULAR" | "FRAUD" | "RISKY";

export interface CustomerRow {
  id: number;
  name: string;
  phone: string;
  avatarLetter: string;

  totalOrderAmountBdt: number;

  customerType: Exclude<CustomerType, "ALL">;

  behavior: CustomerBehavior; // ✅ NEW
  ipAddress: string; // ✅ already
  ipBlocked: boolean; // ✅ NEW

  rating: number; // 0-5
  lastOrderDate: string; // DD/MM/YYYY

  totalOrders: number;
  acceptedOrders: number;

  city?: string;
  subCity?: string;
}

export type TabConfig = {
  key: CustomerType;
  label: string;
};
