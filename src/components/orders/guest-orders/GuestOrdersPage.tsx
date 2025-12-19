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

const formatBanglaTime = () => {
  const d = new Date();
  const opts: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return d.toLocaleString(undefined, opts);
};

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
  const [refreshedAt, setRefreshedAt] = React.useState<string>(formatBanglaTime());

  const onRefresh = () => setRefreshedAt(formatBanglaTime());

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

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-background text-foreground">
      <div className="w-full px-4 py-6 md:px-8">
        {/* Header */}
        <div className="rounded-2xl border border-border bg-gradient-to-b from-background to-background/60 p-4 md:p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <GuestOrdersHeader
              title="Guest Orders"
              tabs={statusTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              badgeCounts={tabBadges}
            />

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
              >
                Data Refreshed <RefreshCcw className="h-4 w-4" />
              </button>

              <div className="rounded-lg border border-border bg-background/30 px-3 py-2 text-xs md:text-sm text-foreground">
                {refreshedAt}
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-5">
            <GuestOrdersToolbar
              sortOptions={sortOptions}
              sortBy={sortBy}
              onSortChange={setSortBy}
              search={search}
              onSearchChange={setSearch}
              onClear={onClear}
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-5">
          <GuestOrdersTable orders={filtered} />
        </div>
      </div>
    </div>
  );
};

export default GuestOrdersPage;
export { GuestOrdersPage };
