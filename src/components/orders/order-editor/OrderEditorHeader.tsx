// src/components/orders/order-editor/OrderEditorHeader.tsx

import type React from "react";
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
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.5)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            <span className="rounded-full border border-slate-200/70 bg-white px-2 py-1 text-[10px] dark:border-gray-800 dark:bg-gray-900">
              Order Status
            </span>
            <span className="text-gray-400 dark:text-gray-500">Editor</span>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <h1 className="text-3xl font-semibold font-serif tracking-tight text-gray-900 dark:text-white">
              Order #{orderNumber}
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {paymentLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {customerIp ? (
              <>
                <span className="rounded-full bg-gray-900/5 px-2 py-1 text-[11px] font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                  Customer IP: {customerIp}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-xs text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Order Date
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">{orderDateLabel}</div>
          </div>

          <Badge
            variant="light"
            size="md"
            color={paymentToBadgeColor(paymentStatus)}
          >
            {paymentStatus.toUpperCase()}
          </Badge>

          <Badge variant="light" size="md" color={statusToBadgeColor(orderStatus)}>
            {statusLabel}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default OrderEditorHeader;
