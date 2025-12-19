import { Search } from "lucide-react";
import Button from "@/components/ui/button/Button";
import type { OrderStatus } from "./types";

type Props = {
  status: OrderStatus;
  setStatus: (s: OrderStatus) => void;
  counts: Record<OrderStatus, number>;
  statusOptions: { id: OrderStatus; label: string }[];
  sortBy: "date" | "total";
  setSortBy: (v: "date" | "total") => void;
  orderType: "all" | "cod" | "paid";
  setOrderType: (v: "all" | "cod" | "paid") => void;
  search: string;
  setSearch: (v: string) => void;
  onClear: () => void;
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
  sortBy,
  setSortBy,
  orderType,
  setOrderType,
  search,
  setSearch,
  onClear,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
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
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
          >
            <option value="date">by: Date</option>
            <option value="total">by: Total</option>
          </select>
        </div>

        <div className="col-span-12 md:col-span-2">
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as any)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
          >
            <option value="all">Order Type</option>
            <option value="cod">COD</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="col-span-12 md:col-span-6">
          <div className="flex h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-950">
            <Search size={18} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-sm text-gray-700 outline-none dark:text-gray-200"
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-2 flex md:justify-end">
          <Button
            variant="outline"
            onClick={onClear}
            className="h-11 w-full md:w-auto"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
