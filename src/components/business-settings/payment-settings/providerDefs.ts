import type { GatewayProviderDef } from "./types";

export const PAYMENT_PROVIDER_DEFS: GatewayProviderDef[] = [
  {
    provider: "bkash",
    title: "bKash",
    category: "Mobile Banking",
    logoText: "bK",
    fields: [
      { key: "baseUrl", label: "Base URL", placeholder: "https://tokenized.sandbox.bka.sh/v1.2.0-beta", type: "url", required: true },
      { key: "username", label: "Username", placeholder: "sandboxTestUser", type: "text", required: true },
      { key: "password", label: "Password", placeholder: "••••••••", type: "password", required: true },
      { key: "appKey", label: "App Key", placeholder: "Your app key", type: "text", required: true },
      { key: "appSecret", label: "App Secret", placeholder: "Your app secret", type: "password", required: true },
    ],
  },
  {
    provider: "sslcommerz",
    title: "SSLCommerz",
    category: "Payment Gateway",
    logoText: "SC",
    fields: [
      { key: "storeId", label: "Store ID", placeholder: "Your Store ID", type: "text", required: true },
      { key: "storePassword", label: "Store Password", placeholder: "••••••••", type: "password", required: true },
      { key: "apiBaseUrl", label: "API Base URL", placeholder: "https://sandbox.sslcommerz.com", type: "url", required: true },
      { key: "successUrl", label: "Success URL", placeholder: "https://your-site.com/payment/success", type: "url" },
      { key: "failUrl", label: "Fail URL", placeholder: "https://your-site.com/payment/fail", type: "url" },
      { key: "cancelUrl", label: "Cancel URL", placeholder: "https://your-site.com/payment/cancel", type: "url" },
    ],
  },
  {
    provider: "shurjopay",
    title: "ShurjoPay",
    category: "Payment Gateway",
    logoText: "SP",
    fields: [
      { key: "endpoint", label: "Endpoint / Base URL", placeholder: "https://engine.shurjopayment.com", type: "url", required: true },
      { key: "username", label: "Username", placeholder: "Your username", type: "text", required: true },
      { key: "password", label: "Password", placeholder: "••••••••", type: "password", required: true },
      { key: "prefix", label: "Prefix", placeholder: "SP", type: "text", required: true },
      { key: "clientIp", label: "Client IP", placeholder: "127.0.0.1", type: "text" },
    ],
  },
  {
    provider: "nagad",
    title: "Nagad",
    category: "Mobile Banking",
    logoText: "N",
    fields: [
      { key: "baseUrl", label: "API Base URL", placeholder: "https://sandbox.mynagad.com", type: "url", required: true },
      { key: "merchantId", label: "Merchant ID", placeholder: "Merchant ID", type: "text", required: true },
      { key: "merchantPrivateKey", label: "Merchant Private Key", placeholder: "••••••••", type: "password", required: true },
      { key: "merchantPublicKey", label: "Merchant Public Key", placeholder: "••••••••", type: "text", required: true },
    ],
  },
  {
    provider: "rocket",
    title: "Rocket",
    category: "Mobile Banking",
    logoText: "R",
    fields: [
      { key: "accountNo", label: "Rocket Account No", placeholder: "01XXXXXXXXX", type: "text", required: true },
      { key: "accountName", label: "Account Name", placeholder: "Your Business Name", type: "text", required: true },
      { key: "bankName", label: "Bank Name", placeholder: "Dutch-Bangla Bank", type: "text" },
      { key: "note", label: "Payment Note (Optional)", placeholder: "e.g. Send money and keep trx id", type: "text" },
    ],
  },
];
