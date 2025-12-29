// src/components/delivery-settings/types.ts
export type DeliveryChargeType = string;

export interface DeliveryChargeCard {
  id: number;
  title: string;
  type: DeliveryChargeType;

  customer_charge: number;
  our_charge: number;

  // ✅ boolean everywhere
  status: boolean;

  img_path: string | null;

  created_at: string;
  updated_at: string;
}
