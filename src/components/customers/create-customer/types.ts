export type CustomerType =
  | "LOYAL"
  | "VIP"
  | "NEW"
  | "ACTIVE"
  | "FAKE"
  | "RISKY"
  | "INACTIVE"
  | "BLOCKED";

export type CustomerBehavior = "REGULAR" | "FRAUD" | "RISKY";

export interface CreateCustomerForm {
  name: string;
  phone: string;
  ipAddress: string;

  customerType: CustomerType;
  behavior: CustomerBehavior;

  rating: number; // 0-5
  city: string;
  subCity: string;

  totalOrderAmountBdt: number;
  totalOrders: number;
  acceptedOrders: number;

  lastOrderDate: string; // DD/MM/YYYY (demo)
  ipBlocked: boolean;

  note: string;
}
