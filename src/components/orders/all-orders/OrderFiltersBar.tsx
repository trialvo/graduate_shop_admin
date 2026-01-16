// src/components/orders/all-orders/OrderFiltersBar.tsx

import { Search } from "lucide-react";
import Button from "@/components/ui/button/Button";
import type { OrderStatus } from "./types";

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

  uiOptions: {
    orderType: readonly { id: string; label: string }[];
    paymentStatus: readonly { id: string; label: string }[];
    paymentType: readonly { id: string; label: string }[];
    paymentProvider: readonly { id: string; label: string }[];
    fraud: readonly { id: string; label: string }[];
  };

  loading?: boolean;
};

function statusPillClasses(active: boolean) {
  if (active) return "bg-brand-500 text-white border-brand-500";
  return "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-white/[0.03]";
}

export default function OrderFiltersBar({
  status,
  setStatus,
  counts,
  statusOptions,

  search,
  setSearch,

  orderType,
  setOrderType,

  paymentStatus,
  setPaymentStatus,

  paymentType,
  setPaymentType,

  paymentProvider,
  setPaymentProvider,

  fraud,
  setFraud,

  minTotal,
  setMinTotal,

  maxTotal,
  setMaxTotal,

  dateFrom,
  setDateFrom,

  dateTo,
  setDateTo,

  limit,
  setLimit,

  onClear,
  uiOptions,
  loading,
}: Props) {
  return (
    <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      {/* Status strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {statusOptions.map((opt) => {
          const active = status === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatus(opt.id)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${statusPillClasses(
                active
              )}`}
            >
              {opt.label}{" "}
              <span className={active ? "text-white/90" : "text-gray-400"}>
                ({counts[opt.id] ?? 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="mt-4 grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-2">
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as any)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
          >
            {uiOptions.paymentStatus.map((x) => (
              <option key={x.id} value={x.id}>
                Pay: {x.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-2">
          <select
            value={paymentProvider}
            onChange={(e) => setPaymentProvider(e.target.value as any)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
          >
            {uiOptions.paymentProvider.map((x) => (
              <option key={x.id} value={x.id}>
                Provider: {x.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-2">
          <select
            value={fraud}
            onChange={(e) => setFraud(e.target.value as any)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
          >
            {uiOptions.fraud.map((x) => (
              <option key={x.id} value={x.id}>
                Fraud: {x.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-6">
          <div className="flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-950">
            <Search size={18} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone or email"
              className="w-full bg-transparent text-sm text-gray-700 outline-none dark:text-gray-200"
            />
          </div>
        </div>



        <div className="col-span-6 md:col-span-3">
          <input
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            type="date"
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
          />
        </div>

        <div className="col-span-6 md:col-span-3">
          <input
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            type="date"
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
          />
        </div>

        <div className="col-span-12 md:col-span-2 flex md:justify-end">
          <Button
            variant="outline"
            onClick={onClear}
            className="h-11 w-full md:w-auto"
            disabled={loading}
          >
            {loading ? "Loading..." : "Clear"}
          </Button>
        </div>
      </div>
    </div>
  );
}
