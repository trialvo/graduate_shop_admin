// src/components/orders/order-editor/OrderEditorHeader.tsx

import type React from "react";
import { Package, Calendar, CreditCard, Shield } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import type { OrderStatus, PaymentStatus } from "./types";

interface OrderEditorHeaderProps {
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDateLabel: string;
  paymentLabel: string;
  statusLabel: string;
  customerIp?: string;
}

const statusToBadgeColor = (
  status: OrderStatus,
): "primary" | "success" | "error" | "warning" | "info" => {
  switch (status) {
    case "delivered":
      return "success";
    case "cancelled":
    case "returned":
    case "trash":
      return "error";
    case "on_hold":
      return "warning";
    default:
      return "info";
  }
};

const paymentToBadgeColor = (
  status: PaymentStatus,
): "success" | "error" | "warning" => {
  switch (status) {
    case "paid":
      return "success";
    case "partial_paid":
      return "warning";
    default:
      return "error";
  }
};

const OrderEditorHeader: React.FC<OrderEditorHeaderProps> = ({
  orderNumber,
  orderStatus,
  paymentStatus,
  orderDateLabel,
  paymentLabel,
  statusLabel,
  customerIp,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Package size={16} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Order Editor
            </span>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Order #{orderNumber}
            </h1>
            <span className="mb-0.5 text-sm text-gray-500 dark:text-gray-400">
              {paymentLabel}
            </span>
          </div>

          {customerIp ? (
            <div className="flex items-center gap-2">
              <Shield size={13} className="text-gray-400" />
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                IP: {customerIp}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-800/50">
            <Calendar size={14} className="text-gray-400" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                Order Date
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {orderDateLabel}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-gray-400" />
            <Badge
              variant="light"
              size="md"
              color={paymentToBadgeColor(paymentStatus)}
            >
              {paymentStatus.toUpperCase()}
            </Badge>
          </div>

          <Badge variant="light" size="md" color={statusToBadgeColor(orderStatus)}>
            {statusLabel}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default OrderEditorHeader;
