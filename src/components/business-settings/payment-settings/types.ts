export type PaymentProvider =
  | "bkash"
  | "sslcommerz"
  | "shurjopay"
  | "nagad"
  | "rocket";

export type GatewayCategory = "Mobile Banking" | "Payment Gateway" | "Bank Transfer";

export type GatewayFieldType = "text" | "password" | "url" | "email";

export type GatewayFieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  type: GatewayFieldType;
  required?: boolean;
  helperText?: string;
};

export type GatewayProviderDef = {
  provider: PaymentProvider;
  title: string;
  category: GatewayCategory;
  logoText: string; // (fallback if no image)
  fields: GatewayFieldDef[];
};

export type PaymentGatewayConfig = {
  id: number;
  provider: PaymentProvider;

  name: string; // display name
  category: GatewayCategory;

  status: boolean;
  sandbox: boolean;

  note?: string;
  createdAt: string;
  updatedAt: string;

  credentials: Record<string, string>;
};

export type Option = { value: string; label: string };
