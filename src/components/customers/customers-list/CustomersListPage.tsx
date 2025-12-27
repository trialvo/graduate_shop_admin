// src/components/customers/customers-list/CustomersListPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  RefreshCcw,
  Search,
  Trash2,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/common/Pagination";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/utils/toPublicUrl";

import {
  deleteAdminUser,
  getAdminUsers,
  type AdminUserEntity,
} from "@/api/admin-users.api";

import EditCustomerModal from "./EditCustomerModal";
import type { CustomerRow, TabConfig, UserStatusTab } from "./types";

type Option = { value: string; label: string };

const TABS: TabConfig[] = [
  { key: "ALL", label: "ALL" },
  { key: "ACTIVE", label: "ACTIVE" },
  { key: "INACTIVE", label: "INACTIVE" },
  { key: "DELETED", label: "DELETED" },
];

const PAGE_SIZE_OPTIONS: Option[] = [
  { value: "10", label: "10" },
  { value: "20", label: "20" },
  { value: "50", label: "50" },
];

function formatBdt(n: number): string {
  const fixed = Number(n ?? 0).toFixed(2);
  const [i = "0", d = "00"] = fixed.split(".");
  const withComma = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${withComma}.${d}`;
}

function toCustomerRow(u: AdminUserEntity): CustomerRow {
  const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();

  const firstPhone = u.phones?.[0];
  const phone = firstPhone?.phone_number ?? null;

  const phone_verified = Boolean(firstPhone?.is_verified === true || firstPhone?.is_verified === 1);

  return {
    id: u.id,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    name: name || u.email,

    img_path: u.img_path ?? null,

    status: String(u.status ?? ""),
    gender: String(u.gender ?? "unspecified"),
    dob: u.dob ?? null,

    is_email_verified: Boolean(u.is_email_verified),
    is_fully_verified: Boolean(u.is_fully_verified),
    has_password: Boolean(u.has_password),

    total_spent: Number(u.total_spent ?? 0),

    phone,
    phone_verified,

    created_at: u.created_at,
    deleted_at: u.deleted_at ?? null,
  };
}

function statusBadgeColor(status: string): "success" | "dark" | "error" {
  const s = status.toLowerCase();
  if (s === "active") return "success";
  if (s === "inactive") return "dark";
  return "error";
}

function verifiedBadgeColor(v: boolean): "success" | "warning" {
  return v ? "success" : "warning";
}

export default function CustomersListPage() {
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<UserStatusTab>("ALL");
  const [search, setSearch] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());

  // delete confirm modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null);

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const usersQuery = useQuery({
    queryKey: ["adminUsers", { limit: pageSize, offset }],
    queryFn: () => getAdminUsers({ limit: pageSize, offset }),
    retry: 1,
  });

  const rows: CustomerRow[] = useMemo(() => {
    const list = usersQuery.data?.users ?? [];
    return list.map(toCustomerRow);
  }, [usersQuery.data]);

  const filtered: CustomerRow[] = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((r) => {
      if (activeTab === "ACTIVE" && r.status.toLowerCase() !== "active") return false;
      if (activeTab === "INACTIVE" && r.status.toLowerCase() !== "inactive") return false;
      if (activeTab === "DELETED" && !r.deleted_at) return false;
      if (activeTab === "ALL") {
        // show everything in this page
      }

      if (!q) return true;

      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.phone ?? "").toLowerCase().includes(q) ||
        String(r.id).includes(q)
      );
    });
  }, [rows, activeTab, search]);

  const counts = useMemo(() => {
    const map: Record<UserStatusTab, number> = {
      ALL: rows.length,
      ACTIVE: 0,
      INACTIVE: 0,
      DELETED: 0,
    };

    for (const r of rows) {
      if (r.status.toLowerCase() === "active") map.ACTIVE += 1;
      if (r.status.toLowerCase() === "inactive") map.INACTIVE += 1;
      if (r.deleted_at) map.DELETED += 1;
    }

    return map;
  }, [rows]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, pageSize]);

  const headerTime = useMemo(() => {
    const d = refreshedAt;
    const month = d.toLocaleString("en-US", { month: "long" });
    const day = d.getDate();
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${month} ${day}, ${year} at ${time}`;
  }, [refreshedAt]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminUser(id),
    onSuccess: () => {
      toast.success("Customer deleted");
      setDeleteOpen(false);
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ["adminUsers"] }).catch(() => undefined);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to delete customer";
      toast.error(msg);
    },
  });

  const openDelete = (row: CustomerRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  };

  const openEdit = (row: CustomerRow) => {
    setEditId(row.id);
    setEditOpen(true);
  };

  const totalItems = usersQuery.data?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Customers List" />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Customers
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Data from Admin Users API.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Data Refreshed</span>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              onClick={() => {
                setRefreshedAt(new Date());
                usersQuery.refetch().catch(() => undefined);
              }}
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
              className={cn(
                "inline-flex items-center gap-2 rounded-[4px] px-4 py-2 text-sm font-semibold transition",
                active
                  ? "bg-brand-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              )}
            >
              <span>{t.label}</span>
              <span className={cn(active ? "text-white/90" : "text-gray-500 dark:text-gray-400")}>
                ({counts[t.key] ?? 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Page Size</p>
          <Select
            key={`ps-${pageSize}`}
            options={PAGE_SIZE_OPTIONS}
            placeholder="Select"
            defaultValue={String(pageSize)}
            onChange={(v) => setPageSize(Number(v))}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Search</p>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Search size={16} className="text-gray-400" />
            </div>
            <Input
              className="pl-9"
              placeholder="Search name, email, phone, id..."
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
                  "CUSTOMER",
                  "STATUS",
                  "VERIFICATION",
                  "TOTAL SPENT",
                  "GENDER",
                  "DOB",
                  "CREATED",
                  "ACTIONS",
                ].map((h) => (
                  <TableCell key={h} isHeader className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {usersQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : filtered.map((row) => {
                const avatarLetter = (row.name.trim().slice(0, 1).toUpperCase() || "C");
                const imgUrl = row.img_path ? toPublicUrl(row.img_path) : null;

                return (
                  <TableRow key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-[4px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                          {imgUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgUrl} alt={row.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                              {avatarLetter}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-brand-500">
                            {row.name}
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Mail size={14} />
                            <span className="truncate">{row.email}</span>
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Phone size={14} />
                            <span className="truncate">{row.phone ?? "—"}</span>
                            {row.phone ? (
                              <Badge
                                variant="solid"
                                color={verifiedBadgeColor(row.phone_verified)}
                                size="sm"
                              >
                                {row.phone_verified ? "Verified" : "Unverified"}
                              </Badge>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <Badge variant="solid" color={statusBadgeColor(row.status)} size="sm">
                          {row.status}
                        </Badge>
                        {row.deleted_at ? (
                          <Badge variant="solid" color="error" size="sm">
                            Deleted
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="solid" color={verifiedBadgeColor(row.is_email_verified)} size="sm">
                          Email: {row.is_email_verified ? "Verified" : "Not Verified"}
                        </Badge>
                        <Badge variant="solid" color={verifiedBadgeColor(row.is_fully_verified)} size="sm">
                          Full: {row.is_fully_verified ? "Verified" : "Not Verified"}
                        </Badge>

                        <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          {row.has_password ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                          <span>{row.has_password ? "Has Password" : "No Password"}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatBdt(row.total_spent)}{" "}
                        <span className="text-xs text-gray-500 dark:text-gray-400">BDT</span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {row.gender}
                      </p>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {row.dob ? new Date(row.dob).toLocaleDateString() : "—"}
                      </p>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {new Date(row.created_at).toLocaleString()}
                      </p>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                          onClick={() => openEdit(row)}
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

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
                );
              })}

              {!usersQuery.isLoading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <Pagination
          totalItems={totalItems}
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
        <Button variant="outline" onClick={() => toast("Export not connected yet")}>
          Export
        </Button>
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Customer"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"?`
            : "Are you sure you want to delete this customer?"
        }
        confirmText={deleteMutation.isPending ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        tone="danger"
        onClose={() => {
          if (deleteMutation.isPending) return;
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      {/* Edit Modal */}
      <EditCustomerModal
        open={editOpen}
        userId={editId}
        onClose={() => {
          setEditOpen(false);
          setEditId(null);
        }}
        onUpdated={() => {
          qc.invalidateQueries({ queryKey: ["adminUsers"] }).catch(() => undefined);
        }}
      />
    </div>
  );
}
