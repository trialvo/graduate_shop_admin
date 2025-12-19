import { useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Printer } from "lucide-react";
import { OrderRow } from "@/components/orders/all-orders/types";

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderRow | null;
};

function statusPill(status: OrderRow["status"]) {
  const base =
    "inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold";
  switch (status) {
    case "new":
      return `${base} bg-blue-light-500 text-white`;
    case "approved":
      return `${base} bg-brand-500 text-white`;
    case "processing":
      return `${base} bg-orange-500 text-white`;
    case "packaging":
      return `${base} bg-blue-light-700 text-white`;
    case "shipped":
      return `${base} bg-blue-light-600 text-white`;
    case "out_of_delivery":
      return `${base} bg-blue-light-800 text-white`;
    case "delivered":
      return `${base} bg-success-600 text-white`;
    case "returned":
      return `${base} bg-orange-600 text-white`;
    case "cancelled":
      return `${base} bg-error-600 text-white`;
    case "on_hold":
      return `${base} bg-gray-700 text-white`;
    case "trash":
      return `${base} bg-gray-600 text-white`;
    default:
      return `${base} bg-gray-700 text-white`;
  }
}

function paymentLabel(method: OrderRow["paymentMethod"]) {
  if (method === "COD") return "cash on delivery";
  return method.toLowerCase();
}

function formatStatusLabel(s: OrderRow["status"]) {
  // ✅ replaceAll removed for ES5
  return String(s).split("_").join(" ").toUpperCase();
}

export default function OrderInfoModal({ open, onClose, order }: Props) {
  const titleId = "order-info-modal-title";

  const items = order?.products ?? [];

  const subTotal = useMemo(() => {
    if (!order) return 0;
    if (!items.length) return order.total;
    return items.reduce((sum, it) => sum + (it.total || 0), 0);
  }, [order, items]);

  const discount = order?.discount ?? 0;
  const paid = order?.paidAmount ?? 0;
  const shippingCost = order?.shippingCost ?? 0;

  const amountDue = useMemo(() => {
    return Math.max(0, subTotal - discount - paid + shippingCost);
  }, [subTotal, discount, paid, shippingCost]);

  if (!order) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      titleId={titleId}
      className="w-full max-w-[980px] overflow-hidden"
      showCloseButton={false}
    >
      <div className="bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-4 min-w-0">
            <h3
              id={titleId}
              className="truncate text-xl sm:text-2xl font-extrabold tracking-wide"
            >
              ORDER {order.id}
            </h3>

            <span className={statusPill(order.status)}>{formatStatusLabel(order.status)}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-error-600 text-white hover:bg-error-700"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Top Details */}
          <div className="grid grid-cols-12 gap-6">
            {/* Billing */}
            <div className="col-span-12 md:col-span-6">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                Billing Details
              </h4>

              <div className="mt-3 space-y-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {order.billingName ?? order.customerName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {order.billingPhone ?? order.customerPhone}
                </p>
              </div>

              <h4 className="mt-6 text-base font-semibold text-gray-900 dark:text-white">
                Email
              </h4>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                {order.email ?? "—"}
              </p>

              <h4 className="mt-6 text-base font-semibold text-gray-900 dark:text-white">
                Payment Method
              </h4>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                {paymentLabel(order.paymentMethod)}
              </p>
            </div>

            {/* Shipping */}
            <div className="col-span-12 md:col-span-6">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                Shipping Address
              </h4>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                {order.shippingAddress ?? "—"}
              </p>

              <h4 className="mt-6 text-base font-semibold text-gray-900 dark:text-white">
                Shipping Area
              </h4>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                {order.shippingArea ?? order.shippingLocation}
              </p>

              {/* QR (themed card) */}
              <div className="mt-4 inline-flex rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                <div className="h-[120px] w-[120px] bg-white text-gray-900 flex items-center justify-center rounded-lg ring-1 ring-gray-200 dark:bg-gray-950 dark:text-white dark:ring-gray-800">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-brand-500">QR</div>
                    <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                      {order.qrValue ?? order.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Table (like your image) */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      #
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Product
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Image
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Size
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Code
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Qty
                    </th>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Price
                    </th>
                    <th className="px-5 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((it, idx) => (
                    <tr
                      key={it.id}
                      className="border-b border-gray-100 dark:border-gray-900"
                    >
                      <td className="px-5 py-5 text-sm text-gray-900 dark:text-white">
                        {idx + 1}
                      </td>

                      <td className="px-5 py-5 text-sm font-medium text-gray-900 dark:text-white">
                        {it.name}
                      </td>

                      <td className="px-5 py-5">
                        <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-900 dark:text-white">
                        {it.size ?? "—"}
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-900 dark:text-white">
                        {it.code ?? "—"}
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-900 dark:text-white">
                        {it.qty}
                      </td>

                      <td className="px-5 py-5 text-sm text-gray-900 dark:text-white">
                        {order.currencySymbol}
                        {it.price.toLocaleString()}
                      </td>

                      <td className="px-5 py-5 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {order.currencySymbol}
                        {it.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {/* Summary rows like your screenshot */}
                  <tr className="border-t border-gray-200 dark:border-gray-800">
                    <td className="px-5 py-4" colSpan={5} />
                    <td className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      = {items.reduce((s, x) => s + (x.qty || 0), 0)}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Sub Total
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {order.currencySymbol}
                      {subTotal.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="border-t border-gray-100 dark:border-gray-900">
                    <td className="px-5 py-4" colSpan={6} />
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      Discount
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-gray-900 dark:text-white">
                      {order.currencySymbol}
                      {discount.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="border-t border-gray-100 dark:border-gray-900">
                    <td className="px-5 py-4" colSpan={6} />
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      Paid
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-gray-900 dark:text-white">
                      {order.currencySymbol}
                      {paid.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="border-t border-gray-100 dark:border-gray-900">
                    <td className="px-5 py-4" colSpan={6} />
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">
                      Shipping Cost
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-gray-900 dark:text-white">
                      {order.currencySymbol}
                      {shippingCost.toLocaleString()}
                    </td>
                  </tr>

                  <tr className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <td className="px-5 py-4" colSpan={6} />
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Amount Due
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {order.currencySymbol}
                      {amountDue.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {order.orderDateLabel} {order.orderTimeLabel}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                aria-label="Print"
                onClick={() => window.print()}
              >
                <Printer size={18} />
              </button>

              <Button
                className="h-11"
                onClick={() => {
                  onClose();
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
