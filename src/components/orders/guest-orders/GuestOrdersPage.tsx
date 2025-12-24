"use client";

import React from "react";
import { RefreshCcw } from "lucide-react";

import type { GuestOrder, GuestOrderStatus, SortBy } from "./types";
import { demoGuestOrders } from "./data";

import GuestOrdersHeader from "./GuestOrdersHeader";
import GuestOrdersToolbar from "./GuestOrdersToolbar";
import GuestOrdersTable from "./GuestOrdersTable";

const statusTabs: Array<{ label: string; value: "all" | GuestOrderStatus }> = [
  { label: "Total", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Complete", value: "complete" },
  { label: "Cancelled", value: "cancelled" },
];

const sortOptions: Array<{ label: string; value: SortBy }> = [
  { label: "by: Date", value: "date_desc" },
  { label: "by: Date (Oldest)", value: "date_asc" },
  { label: "by: Total (High)", value: "total_desc" },
  { label: "by: Total (Low)", value: "total_asc" },
];

function refreshedLabel(d: Date) {
  const month = d.toLocaleString(undefined, { month: "long" });
  const day = d.getDate();
  const year = d.getFullYear();
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${month} ${day}, ${year} at ${time}`;
}

const normalize = (v: string) => v.trim().toLowerCase();

const matchesSearch = (order: GuestOrder, q: string) => {
  if (!q) return true;
  const query = normalize(q);
  return (
    normalize(order.customerName).includes(query) ||
    normalize(order.email).includes(query) ||
    normalize(order.phone).includes(query) ||
    normalize(order.tourPreference).includes(query) ||
    normalize(order.id).includes(query)
  );
};

const sortOrders = (orders: GuestOrder[], sortBy: SortBy) => {
  const copy = [...orders];

  const toNumber = (s: string) => {
    const n = Number(s.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  switch (sortBy) {
    case "date_desc":
      copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "date_asc":
      copy.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      break;
    case "total_desc":
      copy.sort((a, b) => toNumber(b.cartTotal) - toNumber(a.cartTotal));
      break;
    case "total_asc":
      copy.sort((a, b) => toNumber(a.cartTotal) - toNumber(b.cartTotal));
      break;
    default:
      break;
  }

  return copy;
};

const GuestOrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<"all" | GuestOrderStatus>("all");
  const [sortBy, setSortBy] = React.useState<SortBy>("date_desc");
  const [search, setSearch] = React.useState<string>("");
  const [refreshedAt, setRefreshedAt] = React.useState<Date>(new Date());

  const onClear = () => {
    setActiveTab("all");
    setSortBy("date_desc");
    setSearch("");
  };

  const counts = React.useMemo(() => {
    const all = demoGuestOrders.length;
    const pending = demoGuestOrders.filter((o: GuestOrder) => o.status === "pending").length;
    const complete = demoGuestOrders.filter((o: GuestOrder) => o.status === "complete").length;
    const cancelled = demoGuestOrders.filter((o: GuestOrder) => o.status === "cancelled").length;
    return { all, pending, complete, cancelled };
  }, []);

  const filtered = React.useMemo(() => {
    let list: GuestOrder[] = [...demoGuestOrders];

    if (activeTab !== "all") {
      list = list.filter((o: GuestOrder) => o.status === activeTab);
    }

    list = list.filter((o: GuestOrder) => matchesSearch(o, search));
    list = sortOrders(list, sortBy);

    return list;
  }, [activeTab, search, sortBy]);

  const tabBadges: Record<"all" | GuestOrderStatus, number> = {
    all: counts.all,
    pending: counts.pending,
    complete: counts.complete,
    cancelled: counts.cancelled,
  };

  const refreshedAtText = React.useMemo(() => refreshedLabel(refreshedAt), [refreshedAt]);

  return (
    <div className="space-y-4">
      {/* Title + Tabs + Refresh */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <GuestOrdersHeader
          title="Guest Orders"
          tabs={statusTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          badgeCounts={tabBadges}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">Data Refreshed</span>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              onClick={() => setRefreshedAt(new Date())}
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white">
            {refreshedAtText}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <GuestOrdersToolbar
          sortOptions={sortOptions}
          sortBy={sortBy}
          onSortChange={setSortBy}
          search={search}
          onSearchChange={setSearch}
          onClear={onClear}
        />
      </div>

      {/* Table */}
      <GuestOrdersTable orders={filtered} />
    </div>
  );
};

export default GuestOrdersPage;
export { GuestOrdersPage };
