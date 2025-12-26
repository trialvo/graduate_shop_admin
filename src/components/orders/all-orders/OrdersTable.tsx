import { useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Eye,
  Pencil,
  Printer,
  MoreVertical,
} from "lucide-react";
import type { CourierProviderId, OrderRow } from "./types";
import SendCourierCell from "./SendCourierCell";
import OrderSelectDropdown from "@/components/ui/dropdown/OrderSelectDropdown";
import OrderInfoModal from "@/components/ui/modal/OrderInfoModal";

type Props = { rows: OrderRow[] };

function fraudIcon(level: OrderRow["fraudLevel"]) {
  if (level === "safe")
    return <CheckCircle2 size={16} className="text-success-500" />;
  if (level === "medium")
    return <AlertTriangle size={16} className="text-orange-500" />;
  return <ShieldAlert size={16} className="text-error-500" />;
}

const PAYMENT_OPTIONS = [
  { id: "paid", label: "paid" },
  { id: "unpaid", label: "unpaid" },
] as const;

const STATUS_OPTIONS = [
  { id: "new", label: "new" },
  { id: "approved", label: "approved" },
  { id: "processing", label: "processing" },
  { id: "packaging", label: "packaging" },
  { id: "shipped", label: "shipped" },
  { id: "out_of_delivery", label: "out of delivery" },
  { id: "delivered", label: "delivered" },
  { id: "returned", label: "returned" },
  { id: "cancelled", label: "cancelled" },
  { id: "on_hold", label: "on hold" },
  { id: "trash", label: "trash" },
] as const;

export default function OrdersTable({ rows }: Props) {
  const [paymentOverride, setPaymentOverride] = useState<
    Record<string, "paid" | "unpaid">
  >({});
  const [statusOverride, setStatusOverride] = useState<
    Record<string, OrderRow["status"]>
  >({});

  const [courierOverride, setCourierOverride] = useState<
    Record<string, { providerId?: CourierProviderId; memoNo?: string }>
  >({});

  const [viewOpen, setViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const mergedRows = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      paymentStatus: paymentOverride[r.id] ?? r.paymentStatus,
      status: statusOverride[r.id] ?? r.status,
    }));
  }, [rows, paymentOverride, statusOverride]);

  const openView = (order: OrderRow) => {
    setSelectedOrder(order);
    setViewOpen(true);
  };

  const updateCourier = (orderId: string, providerId: CourierProviderId, memoNo: string) => {
    setCourierOverride((prev) => ({
      ...prev,
      [orderId]: { providerId, memoNo },
    }));
  };

  const requestCourier = async (
    orderId: string,
    providerId: Exclude<CourierProviderId, "select">
  ) => {
    // TODO: Replace with real API call
    // eslint-disable-next-line no-console
    console.log("Request courier for:", orderId, "provider:", providerId);

    // After success you can update state from API response (tracking no etc.)
  };

  return (
    <>
      <div className="rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  Customer
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  Order Info
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  Product
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  Payment
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  Date Time
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  Send Currier
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  Order Note
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  Shipping Location
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {mergedRows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-4">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {r.customerImage ? (
                          <img
                            src={r.customerImage}
                            alt={r.customerName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-500">
                            IMG
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-brand-500">
                          {r.customerName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {r.customerPhone}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white ring-1 ring-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-600 dark:bg-gray-950 dark:ring-gray-800 dark:text-gray-300">
                            {fraudIcon(r.fraudLevel)}
                            Fraud Check
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Order Info */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {r.id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {r.orderDateLabel} • {r.orderTimeLabel}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {r.relativeTimeLabel}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-brand-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-white/[0.03]"
                          aria-label="View"
                          onClick={() => openView(r)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-brand-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-white/[0.03]"
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {r.currencySymbol}
                        {r.total}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Items: {r.itemsAmount} • Qty: {r.totalItems}
                      </p>
                      <p className="text-xs font-semibold text-brand-500">
                        {r.paymentMethod}
                      </p>
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-4">
                    <OrderSelectDropdown
                      value={r.paymentStatus}
                      onChange={(v) =>
                        setPaymentOverride((prev) => ({
                          ...prev,
                          [r.id]: v as "paid" | "unpaid",
                        }))
                      }
                      options={PAYMENT_OPTIONS as any}
                      variant="pill"
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <OrderSelectDropdown
                      value={r.status}
                      onChange={(v) =>
                        setStatusOverride((prev) => ({
                          ...prev,
                          [r.id]: v as OrderRow["status"],
                        }))
                      }
                      options={STATUS_OPTIONS as any}
                      variant="pill"
                    />
                  </td>

                  {/* Date Time */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {r.orderDateLabel}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {r.orderTimeLabel}
                    </p>
                  </td>

                  {/* Send Currier */}
                  <td className="px-4 py-4">
                    <SendCourierCell
                      order={r}
                      courierOverride={courierOverride[r.id]}
                      onUpdateCourier={updateCourier}
                      onRequestCourier={requestCourier}
                    />
                  </td>

                  {/* Order Note */}
                  <td className="px-4 py-4">
                    <p className="max-w-[220px] truncate text-sm text-gray-600 dark:text-gray-300">
                      {r.orderNote || "—"}
                    </p>
                  </td>

                  {/* Shipping Location */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {r.shippingLocation.split(" ")[0]}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {r.shippingLocation.split(" ").slice(1).join(" ")}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-brand-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-white/[0.03]"
                        aria-label="Print"
                        onClick={() => window.print()}
                      >
                        <Printer size={16} />
                      </button>

                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        aria-label="More"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!mergedRows.length ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <OrderInfoModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        order={selectedOrder}
      />
    </>
  );
}
