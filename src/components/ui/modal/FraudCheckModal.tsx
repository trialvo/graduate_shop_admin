import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { FraudLevel, OrderRow } from "@/components/orders/all-orders/types";

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderRow | null;
};

function formatPercent(value: number | null, digits = 1) {
  if (value === null || Number.isNaN(value)) return "0%";
  return `${(value * 100).toFixed(digits)}%`;
}

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function statusLabel(status: FraudLevel) {
  switch (status) {
    case "safe":
      return "Safe";
    case "medium":
      return "Medium";
    case "high":
      return "Fraud";
    case "not_found":
      return "Not Found";
    default:
      return "Unknown";
  }
}

function statusIcon(status: FraudLevel) {
  if (status === "safe") return <CheckCircle2 size={18} />;
  if (status === "medium") return <AlertTriangle size={18} />;
  if (status === "high") return <ShieldAlert size={18} />;
  return <HelpCircle size={18} />;
}

function statusColors(status: FraudLevel) {
  switch (status) {
    case "safe":
      return "text-success-600 bg-success-50 ring-success-200";
    case "medium":
      return "text-orange-600 bg-orange-50 ring-orange-200";
    case "high":
      return "text-error-600 bg-error-50 ring-error-200";
    case "not_found":
    default:
      return "text-gray-600 bg-gray-100 ring-gray-200";
  }
}

function ringColor(status: FraudLevel) {
  switch (status) {
    case "safe":
      return "text-success-500";
    case "medium":
      return "text-orange-500";
    case "high":
      return "text-error-500";
    default:
      return "text-gray-300";
  }
}

function RatioRing({
  value,
  status,
}: {
  value: number | null;
  status: FraudLevel;
}) {
  const size = 160;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = clamp01(value ?? 0);
  const dash = `${progress * circumference} ${circumference}`;

  return (
    <div className="relative">
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dash}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={ringColor(status)}
        />
      </svg>
    </div>
  );
}

export default function FraudCheckModal({ open, onClose, order }: Props) {
  const titleId = "fraud-check-modal-title";
  if (!order) return null;

  const fraud = order.fraudCheck;

  const deliveryRatio = fraud?.deliveryRatio ?? null;
  const deliveryRatioLabel = formatPercent(deliveryRatio, 1);

  const summary = useMemo(() => {
    if (!fraud) {
      return {
        total: 0,
        delivered: 0,
        cancelled: 0,
        ratioLabel: "0%",
      };
    }
    return {
      total: fraud.totalParcels,
      delivered: fraud.totalDelivered,
      cancelled: fraud.totalCancel,
      ratioLabel: formatPercent(fraud.deliveryRatio, 1),
    };
  }, [fraud]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      titleId={titleId}
      className="w-full max-w-[1100px] overflow-hidden"
      showCloseButton={false}
    >
      <div className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white flex flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3 min-w-0">
            <h3
              id={titleId}
              className="truncate text-xl sm:text-2xl font-extrabold tracking-wide"
            >
              Fraud Checker
            </h3>
            {fraud ? (
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1",
                  statusColors(fraud.status)
                )}
              >
                {statusIcon(fraud.status)}
                {statusLabel(fraud.status)}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-error-600 text-white hover:bg-error-700"
          >
            X
          </button>
        </div>

        <div className="max-h-[620px] overflow-y-auto px-6 py-6 custom-scrollbar">
          {!fraud ? (
            <div className="rounded-[4px] border border-gray-200 bg-gray-50 p-6 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
              Fraud check data is not available for this order.
            </div>
          ) : (
            <div className="space-y-6">
              {!fraud.success ? (
                <div className="rounded-[4px] border border-error-200 bg-error-50 p-4 text-sm text-error-700">
                  {fraud.systemNote ||
                    "Fraud check service was unavailable for this order."}
                </div>
              ) : null}

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4">
                  <div className="rounded-[4px] border border-blue-100 bg-blue-50 p-5 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-500 shadow-theme-xs dark:bg-gray-950">
                        {statusIcon(fraud.status)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Delivery Success Ratio
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Checked {formatDateTime(fraud.checkedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col items-center">
                      <RatioRing value={deliveryRatio} status={fraud.status} />
                      <div className="mt-3 text-2xl font-bold">
                        {deliveryRatioLabel}
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-600 dark:text-gray-300">
                      Mobile: {fraud.mobileNumber || "-"}
                    </div>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-8 space-y-5">
                  <div className="grid grid-cols-12 gap-3">
                    {[
                      {
                        label: "Total Order",
                        value: summary.total,
                      },
                      {
                        label: "Total Delivered",
                        value: summary.delivered,
                      },
                      {
                        label: "Total Cancelled",
                        value: summary.cancelled,
                      },
                      {
                        label: "Delivery Rate",
                        value: summary.ratioLabel,
                      },
                    ].map((card) => (
                      <div
                        key={card.label}
                        className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
                      >
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {card.label}
                        </div>
                        <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                          {card.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                    <div className="overflow-x-auto">
                      <table className="min-w-[620px] w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                              Courier
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                              Orders
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                              Delivered
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                              Cancelled
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
                              Delivery %
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(fraud.providers ?? []).length ? (
                            fraud.providers.map((p) => {
                              const ratioLabel =
                                p.status === "notfound"
                                  ? "Not Found"
                                  : formatPercent(p.ratio, 0);
                              const barWidth =
                                p.status === "notfound"
                                  ? 0
                                  : Math.round((p.ratio ?? 0) * 100);

                              return (
                                <tr
                                  key={`${p.id}-${p.name}`}
                                  className="border-b border-gray-100 dark:border-gray-800"
                                >
                                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                    {p.name}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">
                                    {p.total}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">
                                    {p.delivered}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">
                                    {p.cancelled}
                                  </td>
                                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">
                                    <div className="flex items-center gap-3">
                                      <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-800">
                                        <div
                                          className="h-2 rounded-full bg-success-500"
                                          style={{ width: `${barWidth}%` }}
                                        />
                                      </div>
                                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        {ratioLabel}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                              >
                                No courier data available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {fraud.systemNote && fraud.success ? (
                    <div className="rounded-[4px] border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                      {fraud.systemNote}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-[4px] bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
