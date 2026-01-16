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
    date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
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

function upperOrDash(v?: string | null) {
  const s = (v ?? "").trim();
  return s ? s.toUpperCase() : "—";
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
    return items.map((it, idx) => {
      const name = (it.product_name ?? "").trim() || "—";
      const qty = safeNumber(it.quantity);
      const unit = safeNumber(it.final_unit_price ?? it.selling_price);
      const total = safeNumber(it.line_total ?? unit * qty);
      const img = it.product_image ? toPublicUrl(it.product_image) : null;

      const variant = (it.variant_name ?? "").trim();
      const color = (it.color_name ?? "").trim();
      const brand = (it.brand_name ?? "").trim();
      const sku = (it.sku ?? "").trim();
      const meta = [brand, color, variant, sku ? `SKU: ${sku}` : ""]
        .filter(Boolean)
        .reduce((acc, s) => (acc ? `${acc} • ${s}` : s), "");

      return { sl: idx + 1, id: it.id, name, qty, unit, total, img, meta };
    });
  }, [order]);

  const invoiceMeta = useMemo(() => {
    const orderNo = order?.id ? `#${order.id}` : "—";
    const payMethod = order ? paymentMethodLabel(order) : "—";
    const payStatus = upperOrDash(order?.payment_status);
    const ordStatus = upperOrDash(order?.order_status);
    const dueDate = "—";
    return { orderNo, payMethod, payStatus, ordStatus, dueDate };
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

  const totals = useMemo(() => {
    return {
      subtotal: safeNumber(order?.subtotal),
      discount: safeNumber(order?.discount_total),
      delivery: safeNumber(order?.delivery_charge),
      total: safeNumber(order?.grand_total),
      paid: safeNumber(order?.paid_amount),
      due: safeNumber(order?.due_amount),
    };
  }, [order]);

  const billedBy = useMemo(() => {
    const name = (branding.appName || "").trim() || "—";
    const email = (branding.supportEmail || "").trim();
    const phone = (branding.supportPhone || "").trim();
    const address = (branding.addressLine || "").trim();
    return { name, email: email || "—", phone: phone || "—", address: address || "—" };
  }, [branding]);

  const billedTo = useMemo(() => {
    const name = (order?.customer_name ?? "").trim() || "—";
    const email = (order?.customer_email ?? "").trim() || "—";
    const phone = (order?.customer_phone ?? "").trim() || "—";
    return { name, email, phone, address: addressLine };
  }, [order, addressLine]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950 print:bg-white print:px-0 print:py-0">
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          html, body { background: #fff !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          .invoice-sheet {
            width: 190mm !important;
            max-width: 190mm !important;
            margin: 0 auto !important;
          }

          /* ✅ make Billed By / Billed To always side-by-side in print */
          .invoice-billing-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }

          /* prevent breaking those cards into next line/page */
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          table, tr, td, th { break-inside: avoid; page-break-inside: avoid; }

          .print-shadow-none { box-shadow: none !important; }
          .print-border-0 { border: 0 !important; }
          .print-m-0 { margin: 0 !important; }
          .print-p-0 { padding: 0 !important; }

          /* a bit tighter in print */
          .print-tight { padding: 12px !important; }
          .print-tight-y { padding-top: 12px !important; padding-bottom: 12px !important; }
        }
      `}</style>

      <div
        className={cn(
          "invoice-sheet mx-auto w-full max-w-[980px] overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-theme-xs",
          "dark:border-gray-800 dark:bg-gray-900",
          "print-border-0 print-shadow-none print-m-0"
        )}
      >
        {/* Top Header */}
        <div className={cn("px-8 py-7 border-b border-gray-200 dark:border-gray-800", "print-tight-y avoid-break")}>
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-white">
                INVOICE
              </h1>

              <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-200">
                <div className="grid grid-cols-12 gap-2">
                  <p className="col-span-5 text-gray-500 dark:text-gray-400">Invoice Number #</p>
                  <p className="col-span-7 font-semibold">{invoiceMeta.orderNo}</p>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <p className="col-span-5 text-gray-500 dark:text-gray-400">Invoice Date</p>
                  <p className="col-span-7 font-semibold">{created?.date || "—"}</p>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <p className="col-span-5 text-gray-500 dark:text-gray-400">Due Date</p>
                  <p className="col-span-7 font-semibold">{invoiceMeta.dueDate}</p>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <p className="col-span-5 text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p className="col-span-7 font-semibold">{invoiceMeta.payMethod}</p>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <p className="col-span-5 text-gray-500 dark:text-gray-400">Payment Status</p>
                  <p className="col-span-7 font-semibold">{invoiceMeta.payStatus}</p>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <p className="col-span-5 text-gray-500 dark:text-gray-400">Order Status</p>
                  <p className="col-span-7 font-semibold">{invoiceMeta.ordStatus}</p>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="flex h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-[10px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                <BrandLogo variant="icon" className="h-10 w-10" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">{branding.appName}</p>
            </div>
          </div>
        </div>

        {/* ✅ Billed By / Billed To (always side-by-side in print) */}
        <div className={cn("px-8 py-6", "avoid-break print-tight")}>
          <div className={cn("invoice-billing-grid grid grid-cols-1 gap-4 md:grid-cols-2")}>
            <div className="rounded-[10px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Billed By</p>

              <div className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                <p className="font-semibold">{billedBy.name}</p>
                <p className="text-gray-600 dark:text-gray-300">{billedBy.address}</p>
                <p>
                  <span className="font-semibold">Email:</span> {billedBy.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {billedBy.phone}
                </p>
              </div>
            </div>

            <div className="rounded-[10px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Billed To</p>

              <div className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                <p className="font-semibold">{billedTo.name}</p>
                <p className="text-gray-600 dark:text-gray-300">{billedTo.address}</p>
                <p>
                  <span className="font-semibold">Email:</span> {billedTo.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {billedTo.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className={cn("px-8 pb-6", "avoid-break print-tight")}>
          <div className="overflow-hidden rounded-[10px] border border-gray-200 dark:border-gray-800">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-950 dark:text-gray-300">
                  <th className="px-4 py-3 w-[60px]">#</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 w-[90px]">Qty</th>
                  <th className="px-4 py-3 w-[140px]">Unit</th>
                  <th className="px-4 py-3 w-[160px] text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {orderQuery.isLoading || orderQuery.isFetching ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : productRows.length ? (
                  productRows.map((p) => (
                    <tr key={p.id} className="border-t border-gray-200 dark:border-gray-800">
                      <td className="px-4 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {p.sl}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[10px] bg-gray-50 dark:bg-gray-950">
                            {p.img ? (
                              <img src={p.img} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-gray-100 dark:bg-gray-800" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {p.name}
                            </p>
                            {p.meta ? (
                              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                                {p.meta}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {p.qty}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">
                        {formatBDT(p.unit)}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {formatBDT(p.total)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      No items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className={cn("px-8 pb-8", "avoid-break print-tight")}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="rounded-[10px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Additional Notes</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {order?.note?.trim() || "—"}
                </p>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-[10px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatBDT(totals.subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span>Discount</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatBDT(totals.discount)}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                    <span>Delivery</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatBDT(totals.delivery)}</span>
                  </div>

                  <div className="my-3 h-px bg-gray-200 dark:bg-gray-800" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">Total (BDT)</span>
                    <span className="text-xl font-extrabold text-gray-900 dark:text-white">{formatBDT(totals.total)}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <div className="rounded-[10px] border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                      <p>Paid</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatBDT(totals.paid)}</p>
                    </div>
                    <div className="rounded-[10px] border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                      <p>Due</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatBDT(totals.due)}</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-800">
                    <div className="flex flex-col items-end">
                      <div className="h-10 w-[180px] border-b border-gray-300 dark:border-gray-700" />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Authorised Signatory</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[10px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Total (in words)</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{formatBDT(totals.total)} only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-5 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
          <p className="font-semibold text-gray-900 dark:text-white">Thank you for your business!</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
