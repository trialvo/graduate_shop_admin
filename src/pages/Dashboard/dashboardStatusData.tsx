import type React from "react";
import { Truck, CreditCard, Package, XCircle } from "lucide-react";

export interface StatusItem {
  id: number;
  titleKey: string;
  icon: React.ReactNode;
  iconBg: string; // tailwind class
  stats: { labelKey: string; value: number }[];
}

export const dashboardStatusData: StatusItem[] = [
  {
    id: 1,
    titleKey: "dashboard.status.delivery",
    icon: <Truck size={18} />,
    iconBg: "bg-brand-500",
    stats: [
      { labelKey: "dashboard.status.processing", value: 210 },
      { labelKey: "dashboard.status.processed", value: 14 },
    ],
  },
  {
    id: 2,
    titleKey: "dashboard.status.payment",
    icon: <CreditCard size={18} />,
    iconBg: "bg-brand-600",
    stats: [
      { labelKey: "dashboard.status.notPaid", value: 50 },
      { labelKey: "dashboard.status.paid", value: 10 },
    ],
  },
  {
    id: 3,
    titleKey: "dashboard.status.product",
    icon: <Package size={18} />,
    iconBg: "bg-success-500",
    stats: [
      { labelKey: "dashboard.status.productBlock", value: 6 },
      { labelKey: "dashboard.status.soldOut", value: 4 },
    ],
  },
  {
    id: 4,
    titleKey: "dashboard.status.cancel",
    icon: <XCircle size={18} />,
    iconBg: "bg-success-500",
    stats: [
      { labelKey: "dashboard.status.cancellation", value: 40 },
      { labelKey: "dashboard.status.return", value: 4 },
    ],
  },
];
