import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ALL_ORDERS, STATUS_OPTIONS } from "./orderData";
import type { OrderRow, OrderStatus } from "./types";
import OrderFiltersBar from "./OrderFiltersBar";
import OrdersTable from "./OrdersTable";

function nowLabel() {
  const d = new Date();
  const date = d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} at ${time}`;
}

export default function AllOrdersView() {
  const [status, setStatus] = useState<OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "total">("date");
  const [orderType, setOrderType] = useState<"all" | "cod" | "paid">("all");
  const [refreshedAt, setRefreshedAt] = useState(nowLabel());

  const counts = useMemo(() => {
    const map: Record<OrderStatus, number> = {
      all: ALL_ORDERS.length,
      new: 0,
      approved: 0,
      processing: 0,
      packaging: 0,
      shipped: 0,
      out_of_delivery: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
      on_hold: 0,
      trash: 0,
    };
    ALL_ORDERS.forEach((o) => {
      map[o.status] += 1;
    });
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows: OrderRow[] = [...ALL_ORDERS];

    if (status !== "all") rows = rows.filter((r) => r.status === status);

    if (orderType !== "all") {
      rows = rows.filter((r) => {
        if (orderType === "cod") return r.paymentMethod === "COD";
        if (orderType === "paid") return r.paymentStatus === "paid";
        return true;
      });
    }

    if (q) {
      rows = rows.filter((r) => {
        return (
          r.customerName.toLowerCase().includes(q) ||
          r.customerPhone.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.shippingLocation.toLowerCase().includes(q)
        );
      });
    }

    if (sortBy === "total") rows.sort((a, b) => b.total - a.total);

    return rows;
  }, [status, search, sortBy, orderType]);

  const onClear = () => {
    setStatus("all");
    setSearch("");
    setSortBy("date");
    setOrderType("all");
  };

  return (
    <div className="space-y-4">
      {/* Title bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Order Management
          </h1>

          <div className="mt-2 flex flex-wrap gap-5 text-sm">
            {(
              [
                { label: "Total", value: counts.all },
                {
                  label: "Pending",
                  value:
                    counts.new +
                    counts.approved +
                    counts.processing +
                    counts.packaging +
                    counts.shipped +
                    counts.out_of_delivery,
                },
                { label: "Complete", value: counts.delivered },
                { label: "Cancelled", value: counts.cancelled },
              ] as const
            ).map((x) => (
              <span key={x.label} className="text-gray-500 dark:text-gray-400">
                <span className="text-brand-500 font-semibold">{x.label}</span>{" "}
                <span className="text-gray-900 dark:text-white">
                  ({x.value})
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">Data Refreshed</span>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              onClick={() => setRefreshedAt(nowLabel())}
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {refreshedAt}
          </div>
        </div>
      </div>

      {/* Filters */}
      <OrderFiltersBar
        status={status}
        setStatus={setStatus}
        counts={counts}
        statusOptions={STATUS_OPTIONS}
        sortBy={sortBy}
        setSortBy={setSortBy}
        orderType={orderType}
        setOrderType={setOrderType}
        search={search}
        setSearch={setSearch}
        onClear={onClear}
      />

      {/* Table */}
      <OrdersTable rows={filtered} />
    </div>
  );
}
