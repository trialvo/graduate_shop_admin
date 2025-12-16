import { Truck, CreditCard, Package, XCircle } from "lucide-react";

export interface StatusItem {
  id: number;
  title: string;
  icon: React.ReactNode;
  iconBg: string; // tailwind class
  stats: { label: string; value: number }[];
}

export const dashboardStatusData: StatusItem[] = [
  {
    id: 1,
    title: "Delivery",
    icon: <Truck size={18} />,
    iconBg: "bg-brand-500",
    stats: [
      { label: "Processing", value: 210 },
      { label: "Processed", value: 14 },
    ],
  },
  {
    id: 2,
    title: "Payment",
    icon: <CreditCard size={18} />,
    iconBg: "bg-brand-600",
    stats: [
      { label: "Not yet paid", value: 50 },
      { label: "Paid", value: 10 },
    ],
  },
  {
    id: 3,
    title: "Product",
    icon: <Package size={18} />,
    iconBg: "bg-success-500",
    stats: [
      { label: "Product Block", value: 6 },
      { label: "Sold-out", value: 4 },
    ],
  },
  {
    id: 4,
    title: "Cancel",
    icon: <XCircle size={18} />,
    iconBg: "bg-success-500",
    stats: [
      { label: "Cancellation", value: 40 },
      { label: "Return", value: 4 },
    ],
  },
];
