import { useEffect, useMemo, useState } from "react";
import {
  Lock,
  LockOpen,
  MoreVertical,
  Pencil,
  RefreshCcw,
  Search,
  Star,
  Trash2,
  User,
} from "lucide-react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/common/Pagination";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

import { CUSTOMER_ROWS } from "./mockData";
import EditCustomerModal from "./EditCustomerModal";
import type { CustomerBehavior, CustomerRow, CustomerType, SalesPeriod, TabConfig } from "./types";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

type Option = { value: string; label: string };

const TABS: TabConfig[] = [
  { key: "ALL", label: "ALL" },
  { key: "LOYAL", label: "LOYAL" },
  { key: "VIP", label: "VIP" },
  { key: "NEW", label: "NEW" },
  { key: "ACTIVE", label: "ACTIVE" },
  { key: "FAKE", label: "FAKE" },
  { key: "RISKY", label: "RISKY" },
  { key: "INACTIVE", label: "INACTIVE" },
  { key: "BLOCKED", label: "BLOCKED" },
];

const SALES_PERIOD_OPTIONS: Option[] = [
  { value: "ALL_TIME", label: "All Time" },
  { value: "LAST_7_DAYS", label: "Last 7 days" },
  { value: "LAST_30_DAYS", label: "Last 30 days" },
  { value: "THIS_YEAR", label: "This year" },
];

function formatBdt(n: number): string {
  const fixed = n.toFixed(2);
  const [i = "0", d = "00"] = fixed.split(".");
  const withComma = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${withComma}.${d}`;
}

function badgeColor(
  type: Exclude<CustomerType, "ALL">
): "success" | "warning" | "info" | "error" | "primary" | "dark" {
  switch (type) {
    case "LOYAL":
      return "success";
    case "VIP":
      return "warning";
    case "NEW":
      return "info";
    case "ACTIVE":
      return "primary";
    case "FAKE":
      return "error";
    case "RISKY":
      return "error";
    case "INACTIVE":
      return "dark";
    case "BLOCKED":
      return "error";
    default:
      return "primary";
  }
}

function behaviorBadgeColor(
  behavior: CustomerBehavior
): "success" | "warning" | "error" {
  switch (behavior) {
    case "REGULAR":
      return "success";
    case "RISKY":
      return "warning";
    case "FRAUD":
      return "error";
    default:
      return "success";
  }
}

function isCustomerType(row: CustomerRow, tab: CustomerType): boolean {
  if (tab === "ALL") return true;
  return row.customerType === tab;
}

function StarRating({
  min,
  onChange,
}: {
  min: number;
  onChange: (min: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const activeMin = star <= min;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            aria-label={`Set minimum rating ${star}`}
            title={`Minimum rating ${star}`}
          >
            <Star
              size={16}
              className={activeMin ? "text-warning-500" : "text-gray-300 dark:text-gray-700"}
              fill={activeMin ? "currentColor" : "none"}
            />
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(0)}
        className="ml-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        Clear
      </button>
    </div>
  );
}

export default function CustomersListPage() {
  const [rows, setRows] = useState<CustomerRow[]>(CUSTOMER_ROWS);

  const [activeTab, setActiveTab] = useState<CustomerType>("ALL");
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>("ALL_TIME");
  const [minRating, setMinRating] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());

  // ✅ delete confirm modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null);

  // ✅ edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerRow | null>(null);

  const counts = useMemo(() => {
    const map: Record<CustomerType, number> = {
      ALL: rows.length,
      LOYAL: 0,
      VIP: 0,
      NEW: 0,
      ACTIVE: 0,
      FAKE: 0,
      RISKY: 0,
      INACTIVE: 0,
      BLOCKED: 0,
    };
    for (const r of rows) map[r.customerType] += 1;
    return map;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (!isCustomerType(row, activeTab)) return false;
      if (minRating > 0 && row.rating < minRating) return false;

      if (salesPeriod !== "ALL_TIME") {
        // demo noop
      }

      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q) ||
        row.ipAddress.toLowerCase().includes(q)
      );
    });
  }, [rows, activeTab, minRating, salesPeriod, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, salesPeriod, minRating, search, pageSize]);

  const headerTime = useMemo(() => {
    const d = refreshedAt;
    const month = d.toLocaleString("en-US", { month: "long" });
    const day = d.getDate();
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${month} ${day}, ${year} at ${time}`;
  }, [refreshedAt]);

  const toggleIpBlocked = (id: number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ipBlocked: !r.ipBlocked } : r))
    );
  };

  const openDelete = (row: CustomerRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const openEdit = (row: CustomerRow) => {
    setEditTarget(row);
    setEditOpen(true);
  };

  const saveEdit = (next: CustomerRow) => {
    setRows((prev) => prev.map((r) => (r.id === next.id ? next : r)));
    setEditOpen(false);
    setEditTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Customers List" />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Customers Analysis
          </h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Data Refreshed</span>
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

          <div className="rounded-[4px] border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white">
            {headerTime}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={[
                "inline-flex items-center gap-2 rounded-[4px] px-4 py-2 text-sm font-semibold transition",
                active
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              ].join(" ")}
            >
              <span>{t.label}</span>
              <span className={active ? "text-white/90" : "text-gray-500 dark:text-gray-400"}>
                ({counts[t.key] ?? 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Sales Period</p>
          <Select
            key={`period-${salesPeriod}`}
            options={SALES_PERIOD_OPTIONS}
            placeholder="Select"
            defaultValue={salesPeriod}
            onChange={(v) => setSalesPeriod(v as SalesPeriod)}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Minimum Rating</p>
          <StarRating min={minRating} onChange={setMinRating} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Search Customer</p>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Search size={16} className="text-gray-400" />
            </div>
            <Input
              className="pl-9"
              placeholder="Search name, phone, ip..."
              value={search}
              onChange={(e) => setSearch(String(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="min-w-[1400px] border-collapse">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {[
                  "CUSTOMERS",
                  "BEHAVIOR",
                  "TOTAL ORDER",
                  "CUSTOMER TYPE",
                  "RATINGS",
                  "LAST ORDER DATE",
                  "IP ADDRESS",
                  "ACTIONS",
                ].map((h) => (
                  <TableCell
                    key={h}
                    isHeader
                    className="px-4 py-4 text-left text-xs font-semibold text-brand-500"
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {paged.map((row) => (
                <TableRow key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        {row.avatarLetter}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-500">{row.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{row.phone}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="solid" color={behaviorBadgeColor(row.behavior)} size="sm">
                        {row.behavior === "REGULAR"
                          ? "Regular"
                          : row.behavior === "FRAUD"
                          ? "Fraud"
                          : "Risky"}
                      </Badge>

                      <Badge variant="solid" color={row.ipBlocked ? "error" : "success"} size="sm">
                        {row.ipBlocked ? "IP Blocked" : "IP Unblocked"}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatBdt(row.totalOrderAmountBdt)}{" "}
                      <span className="text-xs text-gray-500 dark:text-gray-400">BDT</span>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <Badge variant="solid" color={badgeColor(row.customerType)} size="sm">
                      {row.customerType}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => {
                        const star = i + 1;
                        const filled = star <= row.rating;
                        return (
                          <Star
                            key={star}
                            size={16}
                            className={filled ? "text-warning-500" : "text-gray-300 dark:text-gray-700"}
                            fill={filled ? "currentColor" : "none"}
                          />
                        );
                      })}
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {row.lastOrderDate}
                    </p>
                  </TableCell>



                  <TableCell className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {row.ipAddress}
                    </p>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* IP block/unblock */}
                      <button
                        type="button"
                        className={[
                          "inline-flex h-10 items-center justify-center gap-2 rounded-[4px] px-4 text-sm font-semibold shadow-theme-xs transition",
                          row.ipBlocked
                            ? "border border-success-200 bg-success-50 text-success-700 hover:bg-success-100 dark:border-success-900/40 dark:bg-success-500/10 dark:text-success-300 dark:hover:bg-success-500/20"
                            : "border border-error-200 bg-error-50 text-error-700 hover:bg-error-100 dark:border-error-900/40 dark:bg-error-500/10 dark:text-error-300 dark:hover:bg-error-500/20",
                        ].join(" ")}
                        onClick={() => toggleIpBlocked(row.id)}
                        aria-label={row.ipBlocked ? "Unblock IP" : "Block IP"}
                        title={row.ipBlocked ? "Unblock IP" : "Block IP"}
                      >
                        {row.ipBlocked ? <LockOpen size={16} /> : <Lock size={16} />}
                        {row.ipBlocked ? "Unblock IP" : "Block IP"}
                      </button>

                      {/* ✅ Edit icon */}
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        onClick={() => openEdit(row)}
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* ✅ Delete icon */}
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-300 dark:hover:bg-error-500/10"
                        onClick={() => openDelete(row)}
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <Pagination
          totalItems={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(1);
          }}
        />
      </div>

      <div className="flex items-center justify-end">
        <Button variant="outline" onClick={() => console.log("Export customers")}>
          Export
        </Button>
      </div>

      {/* ✅ Delete Confirm Modal */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Customer"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"?`
            : "Are you sure you want to delete this customer?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        tone="danger"
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      {/* ✅ Edit Modal */}
      <EditCustomerModal
        open={editOpen}
        customer={editTarget}
        onClose={() => {
          setEditOpen(false);
          setEditTarget(null);
        }}
        onSave={saveEdit}
      />
    </div>
  );
}
