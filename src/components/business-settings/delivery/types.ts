export type DeliveryZoneType =
  | "OUTSIDE_DHAKA"
  | "INSIDE_DHAKA"
  | "INSIDE_CHITTAGONG"
  | "OUTSIDE_CHITTAGONG"
  | "FREE_DELIVERY";

export interface CourierChargeCard {
  id: number;
  title: string; // e.g. Outside Dhaka
  type: DeliveryZoneType;

  /** Customer pays this amount at checkout */
  customerChargeBdt: number;

  /** Our internal courier cost (profit calculation ready) */
  ownChargeBdt: number;

  active: boolean;

  logoUrl?: string; // preview only
  createdAt: string; // display-only
  updatedAt: string; // display-only
}

export interface DeliveryNameRow {
  id: number;
  name: string;
}
