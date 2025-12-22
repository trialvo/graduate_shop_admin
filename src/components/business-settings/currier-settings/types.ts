export type CurrierProviderType = "STEADFAST" | "REDX" | "PATHAO" | "PAPERFLY";

export type PathaoApiConfig = {
  type: "PATHAO";
  apiBaseUrl: string;
  storeId: string;
  clientId: string;
  clientSecret: string;
  clientEmail: string;
  clientPassword: string;
};

export type SteadfastApiConfig = {
  type: "STEADFAST";
  apiBaseUrl: string;
  apiKey: string;
  secretKey: string;
};

export type RedxApiConfig = {
  type: "REDX";
  apiBaseUrl: string;
  storeId: string;
  apiToken: string;
};

export type PaperflyApiConfig = {
  type: "PAPERFLY";
  apiBaseUrl: string;
  username: string;
  password: string;
  apiKey: string;
};

export type CurrierApiConfig =
  | PathaoApiConfig
  | SteadfastApiConfig
  | RedxApiConfig
  | PaperflyApiConfig;

export interface CurrierRow {
  id: number;

  name: string;
  description: string;
  type: CurrierProviderType;

  logoUrl?: string; // preview only
  active: boolean;

  defaultNote: string;

  /** Discriminated union (type-safe per provider) */
  api: CurrierApiConfig;

  createdAt: string; // display
  updatedAt: string; // display
}
