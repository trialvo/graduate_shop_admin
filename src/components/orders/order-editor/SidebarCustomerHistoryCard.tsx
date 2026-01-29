import type React from "react";
import Button from "@/components/ui/button/Button";

import type { OrderStatus } from "./types";

interface SidebarCustomerHistoryCardProps {
  orderId: string;
  shipping: string;
  orderDateLabel: string;
  totalAmount: number;
  timeAgo: string;
  orderStatus: OrderStatus;
  sentBy: "manually" | "auto";
  altPhone: string;
  additionalNotes: string;
  onDownloadInvoice: () => void;
}

const statusLabel = (status: OrderStatus): string => {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatBDT = (value: number): string =>
  value.toLocaleString(undefined, { maximumFractionDigits: 0 });

const SidebarCustomerHistoryCard: React.FC<SidebarCustomerHistoryCardProps> = ({
  orderId,
  shipping,
  orderDateLabel,
  totalAmount,
  timeAgo,
  orderStatus,
  sentBy,
  altPhone,
  additionalNotes,
  onDownloadInvoice,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.5)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
          History
        </div>
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          Customer timeline
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div className="text-gray-500 dark:text-gray-400">Order ID</div>
        <div className="text-right font-semibold text-gray-900 dark:text-white">
          {orderId}
        </div>

        <div className="text-gray-500 dark:text-gray-400">Shipping</div>
        <div className="text-right font-semibold text-gray-900 dark:text-white">
          {shipping}
        </div>

        <div className="text-gray-500 dark:text-gray-400">Order date</div>
        <div className="text-right font-semibold text-gray-900 dark:text-white">
          {orderDateLabel}
        </div>

        <div className="text-gray-500 dark:text-gray-400">Total Amount</div>
        <div className="text-right font-extrabold text-gray-900 dark:text-white">
          {formatBDT(totalAmount)} BDT
        </div>

        <div className="text-gray-500 dark:text-gray-400">Time</div>
        <div className="text-right font-semibold text-gray-900 dark:text-white">
          {timeAgo}
        </div>

        <div className="text-gray-500 dark:text-gray-400">Order Status</div>
        <div className="text-right font-semibold text-gray-900 dark:text-white">
          {statusLabel(orderStatus)}
        </div>

        <div className="text-gray-500 dark:text-gray-400">Sent by</div>
        <div className="text-right font-semibold text-gray-900 dark:text-white">
          {sentBy === "auto" ? "Auto" : "Manually"}
        </div>

        <div className="text-gray-500 dark:text-gray-400">Alternative Phone</div>
        <div className="text-right font-semibold text-gray-900 dark:text-white">
          {altPhone}
        </div>

        <div className="col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
          {additionalNotes}
        </div>

        <div className="col-span-2">
          <Button onClick={onDownloadInvoice} size="sm" variant="primary">
            Download Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SidebarCustomerHistoryCard;
