import type React from "react";
import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  Pencil,
} from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";

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
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "warning":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    case "error":
      return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
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
    (pagination?.offset ?? 0) + (pagination?.limit ?? 0) <
    (pagination?.total ?? 0);

  return (
    <div className="mx-auto w-full space-y-6">
      {/* ─── Header ───────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Search size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Select an Order to Edit
              </h1>
              {pagination ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {pagination.total} orders found
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                syncFromUrl();
                toast("Inputs synced from current filters");
              }}
              startIcon={<RotateCcw size={14} />}
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
              startIcon={<SlidersHorizontal size={14} />}
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
              startIcon={<Filter size={14} />}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Filters ──────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center gap-2">
          <Filter size={13} className="text-gray-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
            Filters
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7">
          {/* Search — first */}
          <Input
            value={local.customer_phone ?? local.customer_email ?? ""}
            onChange={(e) =>
              setLocal((p) => ({
                ...p,
                customer_phone: e.target.value || undefined,
                customer_email: e.target.value || undefined,
              }))
            }
            placeholder="Search phone or email"
            className="bg-gray-50 dark:bg-gray-800/50"
          />

          <Select
            options={[
              { value: "", label: "Type: Any" },
              { value: "regular", label: "Type: Regular" },
            ]}
            defaultValue={local.order_type ?? ""}
            onChange={(v) =>
              setLocal((p) => ({ ...p, order_type: v || undefined }))
            }
            className="bg-gray-50 dark:bg-gray-800/50"
          />

          <Select
            options={[
              { value: "", label: "Status: Any" },
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
            className="bg-gray-50 dark:bg-gray-800/50"
          />

          <Select
            options={[
              { value: "", label: "Payment: Any" },
              { value: "paid", label: "Paid" },
              { value: "partial_paid", label: "Partial" },
              { value: "unpaid", label: "Unpaid" },
            ]}
            defaultValue={local.payment_status ?? ""}
            onChange={(v) =>
              setLocal((p) => ({ ...p, payment_status: v || undefined }))
            }
            className="bg-gray-50 dark:bg-gray-800/50"
          />

          <Select
            options={[
              { value: "", label: "Pay Type: Any" },
              { value: "gateway", label: "Gateway" },
              { value: "cod", label: "COD" },
              { value: "mixed", label: "Mixed" },
            ]}
            defaultValue={local.payment_type ?? ""}
            onChange={(v) =>
              setLocal((p) => ({ ...p, payment_type: v || undefined }))
            }
            className="bg-gray-50 dark:bg-gray-800/50"
          />

          <DatePicker
            placeholder="Start"
            value={local.date_from ?? ""}
            onChange={(v) =>
              setLocal((p) => ({ ...p, date_from: v || undefined }))
            }
            showToday={false}
          />

          <DatePicker
            placeholder="End"
            value={local.date_to ?? ""}
            onChange={(v) =>
              setLocal((p) => ({ ...p, date_to: v || undefined }))
            }
            showToday={false}
          />
        </div>
      </div>

      {/* ─── Table ────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-gray-400" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
              Orders List
            </span>
          </div>

          {pagination ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {pagination.offset + 1}
              </span>{" "}
              –{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total,
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {pagination.total}
              </span>
            </div>
          ) : null}
        </div>

        {listQuery.isLoading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : listQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/5 dark:text-red-400">
            {(listQuery.error as any)?.message ?? "Failed to load orders"}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-800/30 dark:text-gray-400">
            No orders found for current filters.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-[980px] w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t border-gray-100 text-sm transition-colors hover:bg-blue-50/40 dark:border-gray-800 dark:hover:bg-blue-500/5"
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="font-bold text-gray-900 dark:text-white">
                        #{o.id}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {o.order_type} | {o.payment_type}
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {o.customer_name}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {o.customer_email}
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top text-gray-600 dark:text-gray-300">
                      {o.customer_phone}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${badgeClass(
                          paymentKind(o.payment_status),
                        )}`}
                      >
                        {o.payment_status}
                      </span>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${badgeClass(
                          statusKind(o.order_status),
                        )}`}
                      >
                        {o.order_status}
                      </span>
                    </td>

                    <td className="px-4 py-4 align-top text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {formatBDT(o.grand_total)} BDT
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Due: {formatBDT(o.due_amount)} BDT
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top text-gray-600 dark:text-gray-300">
                      {dateLabel(o.created_at)}
                    </td>

                    <td className="px-4 py-4 align-top text-right">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onSelectOrder(o.id)}
                        startIcon={<Pencil size={13} />}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Pagination ─────────────────────────────── */}
        {pagination ? (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span>
                Offset:{" "}
                <span className="font-semibold text-gray-600 dark:text-gray-300">
                  {pagination.offset}
                </span>
              </span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span>
                Limit:{" "}
                <span className="font-semibold text-gray-600 dark:text-gray-300">
                  {pagination.limit}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!canPrev || listQuery.isFetching}
                onClick={() => {
                  onChangeParams({
                    offset: Math.max(
                      0,
                      (pagination.offset ?? 0) - (pagination.limit ?? 10),
                    ),
                    limit: pagination.limit,
                  });
                  onApply();
                }}
                startIcon={<ChevronLeft size={14} />}
              >
                Prev
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={!canNext || listQuery.isFetching}
                onClick={() => {
                  onChangeParams({
                    offset:
                      (pagination.offset ?? 0) + (pagination.limit ?? 10),
                    limit: pagination.limit,
                  });
                  onApply();
                }}
                startIcon={<ChevronRight size={14} />}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
