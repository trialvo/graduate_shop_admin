import type { CourierChargeCard, DeliveryNameRow } from "./types";

export const INITIAL_COURIER_CARDS: CourierChargeCard[] = [
  {
    id: 1,
    title: "Outside Dhaka",
    type: "OUTSIDE_DHAKA",
    customerChargeBdt: 60,
    ownChargeBdt: 45,
    active: true,
    createdAt: "9/24/2025, 11:34:36 AM",
    updatedAt: "3/26/2025, 03:54:14 PM",
  },
  {
    id: 2,
    title: "Inside Dhaka",
    type: "INSIDE_DHAKA",
    customerChargeBdt: 120,
    ownChargeBdt: 90,
    active: true,
    createdAt: "9/24/2025, 11:34:36 AM",
    updatedAt: "3/26/2025, 03:54:14 PM",
  },
  {
    id: 3,
    title: "Inside Chittagong",
    type: "INSIDE_CHITTAGONG",
    customerChargeBdt: 70,
    ownChargeBdt: 55,
    active: true,
    createdAt: "9/24/2025, 11:34:36 AM",
    updatedAt: "3/26/2025, 03:54:14 PM",
  },
  {
    id: 4,
    title: "Outside Chittagong",
    type: "OUTSIDE_CHITTAGONG",
    customerChargeBdt: 130,
    ownChargeBdt: 105,
    active: true,
    createdAt: "9/24/2025, 11:34:36 AM",
    updatedAt: "3/26/2025, 03:54:14 PM",
  },
];

export const INITIAL_DELIVERY_NAMES: DeliveryNameRow[] = [
  { id: 1, name: "ঢাকার ভিতরে ডেলিভারি চার্জ ৬০ টাকা" },
  { id: 2, name: "ঢাকার বাইরে ডেলিভারি চার্জ ১২০ টাকা" },
  { id: 10, name: "Free delivery charge" },
];
