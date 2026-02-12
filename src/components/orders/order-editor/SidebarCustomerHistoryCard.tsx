import type React from "react";
import { Clock, MessageSquare, Download } from "lucide-react";
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
  const rows = [
    { label: "Order ID", value: orderId },
    { label: "Shipping", value: shipping },
    { label: "Order Date", value: orderDateLabel },
    { label: "Total Amount", value: `${formatBDT(totalAmount)} BDT`, bold: true },
    { label: "Time", value: timeAgo },
    { label: "Order Status", value: statusLabel(orderStatus) },
    { label: "Sent by", value: sentBy === "auto" ? "Auto" : "Manually" },
    { label: "Alt. Phone", value: altPhone || "—" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
          <Clock size={18} />
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
            History
          </div>
          <div className="text-base font-semibold text-gray-900 dark:text-white">
            Customer Timeline
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map(({ label, value, bold }) => (
          <div key={label} className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span
              className={`text-right ${bold ? "font-extrabold" : "font-semibold"} text-gray-900 dark:text-white`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
        <MessageSquare size={14} className="mt-0.5 shrink-0 text-gray-400" />
        <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
          {additionalNotes || "No notes"}
        </div>
      </div>

      <div className="mt-4">
        <Button
          onClick={onDownloadInvoice}
          size="sm"
          variant="primary"
          startIcon={<Download size={14} />}
        >
          Download Invoice
        </Button>
      </div>
    </div>
  );
};

export default SidebarCustomerHistoryCard;
