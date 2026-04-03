// src/components/orders/all-orders/OrderFiltersBar.tsx

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/button/Button";
import type { OrderStatus } from "./types";
import { cn } from "@/lib/utils";

type Props = {
  status: OrderStatus;
  setStatus: (s: OrderStatus) => void;
  counts: Record<OrderStatus, number>;
  statusOptions: { id: OrderStatus; label: string }[];

  search: string;
  setSearch: (v: string) => void;

  orderType: "all" | "regular";
  setOrderType: (v: "all" | "regular") => void;

  paymentStatus: "all" | "unpaid" | "partial_paid" | "paid";
  setPaymentStatus: (v: "all" | "unpaid" | "partial_paid" | "paid") => void;

  paymentType: "all" | "gateway" | "cod" | "mixed";
  setPaymentType: (v: "all" | "gateway" | "cod" | "mixed") => void;

  paymentProvider:
  | "all"
  | "sslcommerz"
  | "bkash"
  | "nagad"
  | "shurjopay"
  | "rocket";
  setPaymentProvider: (
    v: "all" | "sslcommerz" | "bkash" | "nagad" | "shurjopay" | "rocket"
  ) => void;

  fraud: "all" | "0" | "1";
  setFraud: (v: "all" | "0" | "1") => void;

  minTotal: string;
  setMinTotal: (v: string) => void;

  maxTotal: string;
  setMaxTotal: (v: string) => void;

  dateFrom: string;
  setDateFrom: (v: string) => void;

  dateTo: string;
  setDateTo: (v: string) => void;

  limit: number;
  setLimit: (v: number) => void;

  onClear: () => void;

  assignedToMe: boolean;
  setAssignedToMe: (v: boolean) => void;

  uiOptions: {
    orderType: readonly { id: string; label: string }[];
    paymentStatus: readonly { id: string; label: string }[];
    paymentType: readonly { id: string; label: string }[];
    paymentProvider: readonly { id: string; label: string }[];
    fraud: readonly { id: string; label: string }[];
  };

  loading?: boolean;
};

const selectCls = cn(
  "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-600 outline-none transition",
  "focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10",
  "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-brand-500/20"
);

export default function OrderFiltersBar({
  status,
  setStatus,
  counts,
  statusOptions,

  search,
  setSearch,

  paymentStatus,
  setPaymentStatus,

  paymentProvider,
  setPaymentProvider,

  fraud,
  setFraud,

  dateFrom,
  setDateFrom,

  dateTo,
  setDateTo,

  onClear,
  uiOptions,
  loading,
  assignedToMe,
  setAssignedToMe,
}: Props) {
  const { t } = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* ─── Status tabs ─── */}
      <div className="border-b border-gray-200 bg-gray-50/60 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900/60">
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {statusOptions.map((opt) => {
            const active = status === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatus(opt.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition-all",
                  active
                    ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                    : "border-transparent text-gray-500 hover:border-gray-200 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                )}
              >
                {opt.label}
                <span
                  className={cn(
                    "inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-gray-200/70 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  )}
                >
                  {counts[opt.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Search + Controls row ─── */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search in ${statusOptions.find((o) => o.id === status)?.label ?? "All"} orders...`}
            className={cn(
              "h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[13px] text-gray-700 outline-none transition",
              "placeholder:text-gray-400",
              "focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10",
              "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:ring-brand-500/20"
            )}
          />
        </div>

        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition",
            filtersOpen
              ? "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          )}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
        </button>

        {/* Assigned to Me toggle */}
        <button
          type="button"
          onClick={() => setAssignedToMe(!assignedToMe)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold transition",
            assignedToMe
              ? "border-brand-500 bg-brand-500 text-white shadow-sm"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          )}
          title="Show only orders assigned to me"
        >
          <span className="text-[11px]">👤</span>
          <span className="hidden sm:inline">Assigned to Me</span>
        </button>

        {/* Clear */}
        <Button
          variant="outline"
          onClick={onClear}
          className="h-9 px-3 text-[13px]"
          disabled={loading}
        >
          {loading ? t("orders.filters.loading") : t("orders.filters.clear")}
        </Button>
      </div>

      {/* ─── Collapsible advanced filters ─── */}
      {filtersOpen && (
        <div className="border-t border-gray-200 bg-gray-50/40 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/40">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className={selectCls}
            >
              {uiOptions.paymentStatus.map((x) => (
                <option key={x.id} value={x.id}>
                  {t("orders.filters.payPrefix")}: {x.label}
                </option>
              ))}
            </select>

            <select
              value={paymentProvider}
              onChange={(e) => setPaymentProvider(e.target.value as any)}
              className={selectCls}
            >
              {uiOptions.paymentProvider.map((x) => (
                <option key={x.id} value={x.id}>
                  {t("orders.filters.providerPrefix")}: {x.label}
                </option>
              ))}
            </select>

            <select
              value={fraud}
              onChange={(e) => setFraud(e.target.value as any)}
              className={selectCls}
            >
              {uiOptions.fraud.map((x) => (
                <option key={x.id} value={x.id}>
                  {t("orders.filters.fraudPrefix")}: {x.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
