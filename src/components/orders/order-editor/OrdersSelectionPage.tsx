import type React from "react";
import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";

import {
  getAdminOrders,
  ordersKeys,
  type ApiOrder,
  type OrdersListParams,
} from "@/api/orders.api";

type Props = {
  params: OrdersListParams;
  onChangeParams: (patch: Partial<OrdersListParams>) => void;
  onApply: () => void;
  onReset: () => void;
  onSelectOrder: (orderId: number) => void;
};

function formatBDT(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function dateLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badgeClass(kind: "success" | "warning" | "error" | "info") {
  switch (kind) {
    case "success":
      return "bg-success-500/10 text-success-700 dark:text-success-300";
    case "warning":
      return "bg-warning-500/10 text-warning-700 dark:text-warning-300";
    case "error":
      return "bg-error-500/10 text-error-700 dark:text-error-300";
    default:
      return "bg-gray-900/5 text-gray-700 dark:bg-white/5 dark:text-gray-200";
  }
}

function paymentKind(s: ApiOrder["payment_status"]) {
  if (s === "paid") return "success";
  if (s === "partial_paid") return "warning";
  return "error";
}

function statusKind(s: ApiOrder["order_status"]) {
  if (s === "delivered") return "success";
  if (s === "cancelled" || s === "returned" || s === "trash") return "error";
  if (s === "on_hold") return "warning";
  return "info";
}

export default function OrdersSelectionPage({
  params,
  onChangeParams,
  onApply,
  onReset,
  onSelectOrder,
}: Props) {
  const [local, setLocal] = useState<OrdersListParams>(params);

  // Keep local inputs until user clicks Apply (professional UX)
  const syncFromUrl = () => setLocal(params);

  const queryParams = useMemo(() => params, [params]);

  const listQuery = useQuery({
    queryKey: ordersKeys.list(queryParams),
    queryFn: () => getAdminOrders(queryParams),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const data = listQuery.data;
  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  const canPrev = Boolean(pagination) && (pagination?.offset ?? 0) > 0;
  const canNext =
    Boolean(pagination) &&
    (pagination?.offset ?? 0) + (pagination?.limit ?? 0) < (pagination?.total ?? 0);

  const courierProviders =
    data?.courierOption?.available_providers?.map((p) => p.provider) ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pb-10 dark:bg-gray-950">
      <div className="mx-auto w-full space-y-6 px-4 pt-6 md:px-6">
        <div className="rounded-[4px] border border-gray-200 bg-white/70 p-5 shadow-theme-xs backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Orders
              </div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Select an Order to Edit
              </h1>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Click any row to open the editor. Filters are applied via{" "}
                <span className="font-semibold">/admin/orders</span>.
              </div>

              {courierProviders.length ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Courier providers (from API):
                  </span>
                  {courierProviders.slice(0, 6).map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    >
                      {p}
                    </span>
                  ))}
                  {courierProviders.length > 6 ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{courierProviders.length - 6} more
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  syncFromUrl();
                  toast("Inputs synced from current filters");
                }}
              >
                Sync
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onReset();
                  toast.success("Filters reset");
                }}
              >
                Reset
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onChangeParams({
                    ...local,
                    offset: 0,
                    limit: Number(local.limit ?? 10) || 10,
                  });
                  onApply();
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-[4px] border border-gray-200 bg-white/70 p-5 shadow-theme-xs backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-2">
              <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Order Type
              </div>
              <Select
                options={[
                  { value: "", label: "Any" },
                  { value: "regular", label: "Regular" },
                ]}
                defaultValue={local.order_type ?? ""}
                onChange={(v) => setLocal((p) => ({ ...p, order_type: v || undefined }))}
                className="bg-white dark:bg-gray-900"
              />
            </div>

            <div className="lg:col-span-2">
              <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Order Status
              </div>
              <Select
                options={[
                  { value: "", label: "Any" },
                  { value: "new", label: "New" },
                  { value: "approved", label: "Approved" },
                  { value: "processing", label: "Processing" },
                  { value: "packaging", label: "Packaging" },
                  { value: "shipped", label: "Shipped" },
                  { value: "out_for_delivery", label: "Out for delivery" },
                  { value: "delivered", label: "Delivered" },
                  { value: "returned", label: "Returned" },
                  { value: "cancelled", label: "Cancelled" },
                  { value: "on_hold", label: "On hold" },
                  { value: "trash", label: "Trash" },
                ]}
                defaultValue={local.order_status ?? ""}
                onChange={(v) =>
                  setLocal((p) => ({ ...p, order_status: v || undefined }))
                }
                className="bg-white dark:bg-gray-900"
              />
            </div>

            <div className="lg:col-span-2">
              <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Payment Status
              </div>
              <Select
                options={[
                  { value: "", label: "Any" },
                  { value: "paid", label: "Paid" },
                  { value: "partial_paid", label: "Partial paid" },
                  { value: "unpaid", label: "Unpaid" },
                ]}
                defaultValue={local.payment_status ?? ""}
                onChange={(v) =>
                  setLocal((p) => ({ ...p, payment_status: v || undefined }))
                }
                className="bg-white dark:bg-gray-900"
              />
            </div>

            <div className="lg:col-span-2">
              <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Payment Type
              </div>
              <Select
                options={[
                  { value: "", label: "Any" },
                  { value: "gateway", label: "Gateway" },
                  { value: "cod", label: "COD" },
                  { value: "mixed", label: "Mixed" },
                ]}
                defaultValue={local.payment_type ?? ""}
                onChange={(v) =>
                  setLocal((p) => ({ ...p, payment_type: v || undefined }))
                }
                className="bg-white dark:bg-gray-900"
              />
            </div>

            <div className="lg:col-span-2">
              <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Phone
              </div>
              <Input
                value={local.customer_phone ?? ""}
                onChange={(e) =>
                  setLocal((p) => ({ ...p, customer_phone: e.target.value || undefined }))
                }
                placeholder="Search phone"
                className="bg-white dark:bg-gray-900"
              />
            </div>

            <div className="lg:col-span-2">
              <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Email
              </div>
              <Input
                value={local.customer_email ?? ""}
                onChange={(e) =>
                  setLocal((p) => ({ ...p, customer_email: e.target.value || undefined }))
                }
                placeholder="Search email"
                className="bg-white dark:bg-gray-900"
              />
            </div>

            <div className="lg:col-span-3">
              <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Date From
              </div>
              <Input
                type="date"
                value={local.date_from ?? ""}
                onChange={(e) =>
                  setLocal((p) => ({ ...p, date_from: e.target.value || undefined }))
                }
                className="bg-white dark:bg-gray-900"
              />
            </div>

            <div className="lg:col-span-3">
              <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Date To
              </div>
              <Input
                type="date"
                value={local.date_to ?? ""}
                onChange={(e) =>
                  setLocal((p) => ({ ...p, date_to: e.target.value || undefined }))
                }
                className="bg-white dark:bg-gray-900"
              />
            </div>

            <div className="lg:col-span-2">
              <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Limit
              </div>
              <Select
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "20", label: "20" },
                  { value: "50", label: "50" },
                ]}
                defaultValue={String(local.limit ?? params.limit ?? 10)}
                onChange={(v) => setLocal((p) => ({ ...p, limit: Number(v) }))}
                className="bg-white dark:bg-gray-900"
              />
            </div>

            <div className="lg:col-span-2">
              <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                Offset
              </div>
              <Input
                type="number"
                value={String(local.offset ?? params.offset ?? 0)}
                onChange={(e) =>
                  setLocal((p) => ({ ...p, offset: Number(e.target.value) || 0 }))
                }
                className="bg-white dark:bg-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-[4px] border border-gray-200 bg-white/70 p-5 shadow-theme-xs backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
              Orders List
            </div>

            {pagination ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {pagination.offset + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.min(pagination.offset + pagination.limit, pagination.total)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {pagination.total}
                </span>
              </div>
            ) : null}
          </div>

          {listQuery.isLoading ? (
            <div className="rounded-[4px] border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              Loading orders...
            </div>
          ) : listQuery.isError ? (
            <div className="rounded-[4px] border border-gray-200 bg-white p-6 text-sm text-red-600 dark:border-gray-800 dark:bg-gray-900 dark:text-red-400">
              {(listQuery.error as any)?.message ?? "Failed to load orders"}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-[4px] border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              No orders found for current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Total</th>
                    <th className="pb-3">Created</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-gray-200 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/40"
                    >
                      <td className="py-4 pr-3 align-top">
                        <div className="font-extrabold text-gray-900 dark:text-white">
                          #{o.id}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {o.order_type} • {o.payment_type}
                        </div>
                      </td>

                      <td className="py-4 pr-3 align-top">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {o.customer_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {o.customer_email}
                        </div>
                      </td>

                      <td className="py-4 pr-3 align-top text-gray-700 dark:text-gray-200">
                        {o.customer_phone}
                      </td>

                      <td className="py-4 pr-3 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${badgeClass(
                            paymentKind(o.payment_status)
                          )}`}
                        >
                          {o.payment_status}
                        </span>
                      </td>

                      <td className="py-4 pr-3 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${badgeClass(
                            statusKind(o.order_status)
                          )}`}
                        >
                          {o.order_status}
                        </span>
                      </td>

                      <td className="py-4 pr-3 align-top text-right">
                        <div className="font-extrabold text-gray-900 dark:text-white">
                          {formatBDT(o.grand_total)}৳
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {formatBDT(o.due_amount)}৳
                        </div>
                      </td>

                      <td className="py-4 pr-3 align-top text-gray-700 dark:text-gray-200">
                        {dateLabel(o.created_at)}
                      </td>

                      <td className="py-4 align-top text-right">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onSelectOrder(o.id)}
                        >
                          Edit Order
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Offset: <span className="font-semibold">{pagination.offset}</span> •
                Limit: <span className="font-semibold">{pagination.limit}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canPrev || listQuery.isFetching}
                  onClick={() => {
                    onChangeParams({
                      offset: Math.max(0, (pagination.offset ?? 0) - (pagination.limit ?? 10)),
                      limit: pagination.limit,
                    });
                    onApply();
                  }}
                >
                  Prev
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canNext || listQuery.isFetching}
                  onClick={() => {
                    onChangeParams({
                      offset: (pagination.offset ?? 0) + (pagination.limit ?? 10),
                      limit: pagination.limit,
                    });
                    onApply();
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
