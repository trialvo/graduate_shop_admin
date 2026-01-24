// src/components/contact-messages/ContactMessagesFiltersBar.tsx
"use client";

import React from "react";
import { Search, RefreshCw } from "lucide-react";

import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { cn } from "@/lib/utils";

import type { ContactMessageCountsData, ContactMessageFilters, ContactTabKey } from "./types";
import type { ContactMessageBoolFilter, ContactMessageStatusFilter } from "@/api/contact-messages.api";

type Props = {
  counts: ContactMessageCountsData | null;
  filters: ContactMessageFilters;
  onChange: (patch: Partial<ContactMessageFilters>) => void;
  onRefetch: () => void;
  isRefetching?: boolean;
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

const boolOptions = [
  { value: "all", label: "All" },
  { value: "false", label: "No" },
  { value: "true", label: "Yes" },
];

function StatCard({
  title,
  value,
  active,
  onClick,
}: {
  title: string;
  value: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[4px] border px-4 py-3 text-left shadow-theme-xs transition",
        "border-gray-200 bg-white hover:bg-gray-50",
        "dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-white/[0.03]",
        active ? "ring-2 ring-brand-500/30" : "ring-0"
      )}
    >
      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{title}</p>
      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    </button>
  );
}

export default function ContactMessagesFiltersBar({
  counts,
  filters,
  onChange,
  onRefetch,
  isRefetching,
}: Props) {
  const c = counts ?? {
    total: 0,
    unread: 0,
    unreplied: 0,
    read_but_not_replied: 0,
  };

  const setTab = (tab: ContactTabKey) => {
    // The backend supports only is_read/is_replied + status filters, so we map tabs to those.
    if (tab === "unread") {
      onChange({ tab, status: "active", is_read: "false", is_replied: "all" });
      return;
    }
    if (tab === "unreplied") {
      onChange({ tab, status: "active", is_read: "all", is_replied: "false" });
      return;
    }
    if (tab === "read_but_not_replied") {
      onChange({ tab, status: "active", is_read: "true", is_replied: "false" });
      return;
    }
    if (tab === "archived") {
      onChange({ tab, status: "archived", is_read: "all", is_replied: "all" });
      return;
    }
    onChange({ tab, status: "active", is_read: "all", is_replied: "all" });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard
          title="Total"
          value={c.total}
          active={filters.tab === "all"}
          onClick={() => setTab("all")}
        />
        <StatCard
          title="Unread"
          value={c.unread}
          active={filters.tab === "unread"}
          onClick={() => setTab("unread")}
        />
        <StatCard
          title="Unreplied"
          value={c.unreplied}
          active={filters.tab === "unreplied"}
          onClick={() => setTab("unreplied")}
        />
        <StatCard
          title="Read but not replied"
          value={c.read_but_not_replied}
          active={filters.tab === "read_but_not_replied"}
          onClick={() => setTab("read_but_not_replied")}
        />
        <StatCard
          title="Archived"
          value={Math.max(0, c.total - (filters.status === "archived" ? 0 : 0))}
          active={filters.tab === "archived"}
          onClick={() => setTab("archived")}
        />
      </div>

      <div
        className={cn(
          "rounded-[4px] border border-gray-200 bg-white p-4 shadow-theme-xs",
          "dark:border-gray-800 dark:bg-gray-900"
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-[760px] lg:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Search</p>
              <InputField
                value={filters.search}
                onChange={(e) => onChange({ search: e.target.value })}
                placeholder="Name / Email / Phone"
                startIcon={<Search size={16} />}
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Subject</p>
              <InputField
                value={filters.subject}
                onChange={(e) => onChange({ subject: e.target.value })}
                placeholder="Subject keyword"
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Status</p>
              <Select
                options={statusOptions}
                placeholder="Status"
                value={filters.status}
                onChange={(v) => onChange({ status: v as ContactMessageStatusFilter, tab: "all" })}
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Read</p>
              <Select
                options={boolOptions}
                placeholder="Read"
                value={filters.is_read}
                onChange={(v) => onChange({ is_read: v as ContactMessageBoolFilter, tab: "all" })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[360px]">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Replied</p>
              <Select
                options={boolOptions}
                placeholder="Replied"
                value={filters.is_replied}
                onChange={(v) => onChange({ is_replied: v as ContactMessageBoolFilter, tab: "all" })}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={onRefetch}
                startIcon={<RefreshCw size={16} />}
                disabled={isRefetching}
              >
                {isRefetching ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
