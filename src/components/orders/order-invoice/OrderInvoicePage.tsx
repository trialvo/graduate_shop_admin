import { useEffect, useMemo, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import BrandLogo from "@/components/common/BrandLogo";
import { useAppBranding } from "@/context/AppBrandingContext";
import { getAdminOrderById, ordersKeys, type ApiOrder } from "@/api/orders.api";
import { toPublicUrl } from "@/utils/toPublicUrl";
import { cn } from "@/lib/utils";

function useSearchParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function safeNumber(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  return Number.isFinite(x) ? x : 0;
}

function formatBDT(n: unknown): string {
  const v = safeNumber(n);
  try {
    return `৳${v.toLocaleString(undefined)}`;
  } catch {
    return `৳${String(v)}`;
  }
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: "" };
  return {
    date: d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

function paymentMethodLabel(order: ApiOrder) {
  if (order.payment_type === "cod") return "COD";

  const provider = [...(order.payments ?? [])]
    .reverse()
    .find((p) => (p?.provider ?? "").trim())?.provider;

  const p = (provider ?? "").toLowerCase();
  if (p === "bkash") return "BKASH";
  if (p === "nagad") return "NAGAD";
  if (p === "rocket") return "ROCKET";
  if (p === "sslcommerz") return "SSLCOMMERZ";
  if (p === "shurjopay") return "SHURJOPAY";

  return order.payment_type === "gateway" ? "CARD" : "MIXED";
}

export default function OrderInvoicePage() {
  const { branding } = useAppBranding();
  const { orderId } = useParams();
  const searchParams = useSearchParams();

  const autoPrint = searchParams.get("print") === "1";
  const printedRef = useRef(false);

  const numericId = useMemo(() => {
    const n = Number(orderId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [orderId]);

  const orderQuery = useQuery({
    queryKey: numericId ? ordersKeys.detail(numericId) : ordersKeys.detail("invalid"),
    queryFn: () => {
      if (!numericId) throw new Error("Missing order id");
      return getAdminOrderById(numericId);
    },
    enabled: Boolean(numericId),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const order = orderQuery.data?.data;
  const courier = order?.couriers?.[0];
  const created = order?.created_at ? formatDateTime(order.created_at) : null;

  const addressLine = useMemo(() => {
    if (!order) return "—";
    const base = `${order.full_address ?? ""}`.trim();
    const city = `${order.city ?? ""}`.trim();
    const zip = `${order.zip_code ?? ""}`.trim();

    const parts = [base, city].filter(Boolean);
    const head = parts.reduce((acc, s) => (acc ? `${acc}, ${s}` : s), "");
    return zip ? `${head} - ${zip}` : head || "—";
  }, [order]);

  const productRows = useMemo(() => {
    const items = order?.items ?? [];
    return items.map((it) => {
      const name = (it.product_name ?? "").trim() || "—";
      const qty = safeNumber(it.quantity);
      const unit = safeNumber(it.final_unit_price ?? it.selling_price);
      const total = safeNumber(it.line_total ?? unit * qty);
      const img = it.product_image ? toPublicUrl(it.product_image) : null;
      return { id: it.id, name, qty, unit, total, img };
    });
  }, [order]);

  useEffect(() => {
    if (!autoPrint) return;
    if (!orderQuery.isSuccess) return;
    if (printedRef.current) return;
    printedRef.current = true;

    const t = window.setTimeout(() => {
      try {
        window.print();
      } catch {
        // ignore
      }
    }, 250);

    const onAfterPrint = () => {
      try {
        window.close();
      } catch {
        // ignore
      }
    };

    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, [autoPrint, orderQuery.isSuccess]);

  useEffect(() => {
    if (orderQuery.isError) {
      toast.error((orderQuery.error as Error)?.message || "Failed to load invoice");
    }
  }, [orderQuery.isError, orderQuery.error]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950 print:bg-white print:px-0 print:py-0">
      <style>{`
        @media print {
          html, body { background: #fff !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-0 { border: 0 !important; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:p-0 { padding: 0 !important; }
        }
      `}</style>

      <div
        className={cn(
          "mx-auto w-full max-w-[900px] overflow-hidden rounded-[6px] border border-gray-200 bg-white shadow-theme-xs",
          "dark:border-gray-800 dark:bg-gray-900",
          "print:border-0 print:shadow-none print:m-0"
        )}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-6 dark:border-gray-800 print:border-0">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[6px] bg-gray-50 dark:bg-gray-950">
                <BrandLogo variant="icon" className="h-9 w-9" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{branding.appName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Invoice</p>
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-2xl font-extrabold tracking-wide text-gray-900 dark:text-white">
                INVOICE
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Order #{order?.id ?? "—"}</p>
            </div>
          </div>

          {/* Billing + Shipping */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[6px] border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Billing Details</p>
              <div className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                <p>
                  <span className="font-semibold">Name:</span> {order?.customer_name?.trim() || "—"}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {order?.customer_phone || "—"}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {order?.customer_email || "—"}
                </p>
              </div>
            </div>

            <div className="rounded-[6px] border border-gray-200 p-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Shipping Address</p>
              <div className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                <p>
                  <span className="font-semibold">Address:</span> {addressLine}
                </p>
                <p>
                  <span className="font-semibold">Area:</span> {order?.city || "—"}
                </p>
                {courier?.delivery_title ? (
                  <p>
                    <span className="font-semibold">Delivery:</span> {courier.delivery_title}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Order Information */}
          <div className="rounded-[6px] border border-gray-200 p-4 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Order Information</p>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-gray-700 dark:text-gray-200 md:grid-cols-2">
              <p>
                <span className="font-semibold">Date:</span> {created?.date || "—"}{" "}
                {created?.time ? `${created.time}` : ""}
              </p>
              <p>
                <span className="font-semibold">Payment Method:</span> {order ? paymentMethodLabel(order) : "—"}
              </p>
              <p>
                <span className="font-semibold">Payment Status:</span>{" "}
                {(order?.payment_status || "—").toUpperCase()}
              </p>
              <p>
                <span className="font-semibold">Order Status:</span>{" "}
                {(order?.order_status || "—").toUpperCase()}
              </p>
            </div>
          </div>

          {/* Products */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Products</p>
            <div className="mt-3 overflow-hidden rounded-[6px] border border-gray-200 dark:border-gray-800">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 dark:bg-gray-950 dark:text-gray-300">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderQuery.isLoading || orderQuery.isFetching ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : productRows.length ? (
                    productRows.map((p) => (
                      <tr key={p.id} className="border-t border-gray-200 dark:border-gray-800">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[6px] bg-gray-50 dark:bg-gray-950">
                              {p.img ? <img src={p.img} alt={p.name} className="h-full w-full object-cover" /> : null}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{p.qty}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{formatBDT(p.unit)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{formatBDT(p.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="rounded-[6px] border border-gray-200 p-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300 md:max-w-[60%]">
              <p className="font-semibold text-gray-900 dark:text-white">Note</p>
              <p className="mt-2">{order?.note?.trim() || "—"}</p>
            </div>

            <div className="w-full max-w-[360px] rounded-[6px] border border-gray-200 p-4 dark:border-gray-800">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatBDT(order?.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span>Discount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatBDT(order?.discount_total)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span>Delivery</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatBDT(order?.delivery_charge)}</span>
                </div>

                <div className="my-3 h-px bg-gray-200 dark:bg-gray-800" />

                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">{formatBDT(order?.grand_total)}</span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="rounded-[6px] bg-gray-50 p-3 dark:bg-gray-950">
                    <p>Paid</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatBDT(order?.paid_amount)}</p>
                  </div>
                  <div className="rounded-[6px] bg-gray-50 p-3 dark:bg-gray-950">
                    <p>Due</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatBDT(order?.due_amount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-5 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
          <p className="font-semibold">Thank you for your business!</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Generated on {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
