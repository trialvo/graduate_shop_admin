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
    case "partial":
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
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-theme-xs backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Order Status:
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Editor
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              ORDER #{orderNumber}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{paymentLabel}</span>
            {customerIp ? (
              <>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <span>Customer IP: {customerIp}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Order Date:{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {orderDateLabel}
            </span>
          </div>

          <Badge
            variant="light"
            size="md"
            color={paymentToBadgeColor(paymentStatus)}
          >
            {paymentStatus.toUpperCase()}
          </Badge>

          <Badge
            variant="light"
            size="md"
            color={statusToBadgeColor(orderStatus)}
          >
            {statusLabel}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-[260px] rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="h-12 w-full rounded-lg bg-gray-900/5 dark:bg-white/5">
            <div className="flex h-full w-full items-center justify-center gap-1">
              {Array.from({ length: 44 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-8 ${i % 3 === 0 ? "w-[2px]" : "w-[1px]"} bg-gray-900 dark:bg-white`}
                  style={{ opacity: i % 7 === 0 ? 0.6 : 0.95 }}
                />
              ))}
            </div>
          </div>
          <div className="mt-2 text-center text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {orderNumber}
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Update billing/shipping + product line items and click{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            Update
          </span>{" "}
          to save.
        </div>
      </div>
    </div>
  );
};

export default OrderEditorHeader;
