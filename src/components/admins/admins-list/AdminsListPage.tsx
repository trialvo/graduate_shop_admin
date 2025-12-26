import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCcw, Search, Trash2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/common/Pagination";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

import EditAdminModal from "./EditAdminModal";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import { AdminRole, AdminListRow, ROLE_ID_BY_LABEL } from "../types";
import { toPublicUrl } from "@/config/env";
import { useAdminById, useAdmins, useUpdateAdmin } from "@/hooks/useAdmins";
import type { AdminByIdResponse, AdminListResponse } from "@/api/admin.api";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "A";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

const ROLE_LABELS: Record<string, AdminRole> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  ORDER_MANAGER: "Order Manager",
  CATALOG_MANAGER: "Catalog Manager",
  READ_ONLY_ADMIN: "Read Only Admin",
};

const normalizeRoleLabel = (role?: string | null): AdminRole => {
  if (!role) return "Admin";
  if (ROLE_LABELS[role]) return ROLE_LABELS[role];
  const label = role
    .toLowerCase()
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return (label as AdminRole) ?? "Admin";
};

const toJoinDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB");
};

export default function AdminsListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminListRow[]>([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminListRow | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminListRow | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const params = useMemo(
    () => ({
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    [page, pageSize]
  );

  const { data, isLoading, isError, refetch } = useAdmins(params);
  const { data: editAdmin, isError: isEditError } = useAdminById(editId);

  const updateMutation = useUpdateAdmin();

  const toListRow = (
    admin: AdminListResponse["data"][number] | AdminByIdResponse
  ): AdminListRow => {
    const name =
      [admin.first_name, admin.last_name].filter(Boolean).join(" ") ||
      admin.email.split("@")[0] ||
      "Admin";

    return {
      id: admin.id,
      name,
      email: admin.email,
      role: normalizeRoleLabel(admin.roles?.[0]),
      joinDate: toJoinDate(admin.created_at),
      phone: admin.phone ?? "",
      status: admin.is_active ? "ACTIVE" : "INACTIVE",
      address: admin.address ?? "",
      avatarUrl: toPublicUrl(admin.profile_img_path) ?? undefined,
      passwordMasked: "************",
    };
  };

  useEffect(() => {
    if (!data?.data) return;
    setRows(data.data.map((admin) => toListRow(admin)));
  }, [data]);

  useEffect(() => {
    if (!editAdmin) return;
    setEditTarget(toListRow(editAdmin));
  }, [editAdmin]);

  useEffect(() => {
    if (!isEditError || !editId) return;
    toast.error("Failed to load admin details");
  }, [isEditError, editId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  const paged = filtered;

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const headerTime = useMemo(() => {
    const d = refreshedAt;
    const month = d.toLocaleString("en-US", { month: "long" });
    const day = d.getDate();
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${month} ${day}, ${year} at ${time}`;
  }, [refreshedAt]);

  const openDelete = (row: AdminListRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const openEdit = (row: AdminListRow) => {
    setEditTarget(null);
    setEditId(row.id);
    setEditOpen(true);
  };

  const saveEdit = async (
    next: AdminListRow,
    newPassword?: string,
    newAvatar?: File | null
  ) => {
    try {
      const nameParts = next.name.trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ") || null;

      await updateMutation.mutateAsync({
        id: next.id,
        body: {
          email: next.email.trim(),
          first_name: firstName || null,
          last_name: lastName,
          phone: next.phone.trim() || null,
          address: next.address.trim() || null,
          role_id: ROLE_ID_BY_LABEL[next.role],
          is_active: next.status === "ACTIVE",
          password: newPassword || undefined,
        },
      });

      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== next.id) return r;
          return {
            ...next,
            passwordMasked: newPassword ? "************" : r.passwordMasked,
            avatarUrl: next.avatarUrl || r.avatarUrl,
          };
        })
      );

      toast.success("Admin updated successfully");
      setEditOpen(false);
      setEditTarget(null);
      setEditId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to update admin";
      toast.error(msg);
    } finally {
      void newAvatar;
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Admins List" />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Role Management
          </h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Data Refreshed</span>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              onClick={async () => {
                await refetch();
                setRefreshedAt(new Date());
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

      {/* Top actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
     
          <Button startIcon={<UserPlus size={16} />} onClick={() => navigate("/create-admin")}>
            Create User
          </Button>
    

        <div className="relative w-full md:max-w-sm">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <Search size={16} className="text-gray-400" />
          </div>
          <Input
            className="pl-9"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(String(e.target.value))}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px] border-collapse">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {[
                  "SN NO",
                  "USER",
                  "ROLE",
                  "EMAIL",
                  "PASS",
                  "JOIN DATE",
                  "PHONE",
                  "STATUS",
                  "ADDRESS",
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
              {paged.map((row, idx) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {(page - 1) * pageSize + idx + 1}
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {row.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.avatarUrl}
                            alt={row.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials(row.name)
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {row.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.role}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.email}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm font-semibold text-brand-500">
                    {row.passwordMasked}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.joinDate}
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.phone || "-"}
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <Badge
                      variant="solid"
                      color={row.status === "ACTIVE" ? "success" : "error"}
                      size="sm"
                    >
                      {row.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="line-clamp-1">{row.address || "-"}</span>
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-2">
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
              ))}

              {paged.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {isError ? "Failed to load admins." : "No admins found."}
                  </TableCell>
                </TableRow>
              ) : null}

              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Loading admins...
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <Pagination
          totalItems={search ? filtered.length : data?.total ?? filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setPageSize(n);
            setPage(1);
          }}
        />
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Admin"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"?`
            : "Are you sure you want to delete this admin?"
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

      {/* Edit Modal */}
      <EditAdminModal
        open={editOpen}
        admin={editTarget}
        loading={Boolean(editId) && !editTarget}
        onClose={() => {
          setEditOpen(false);
          setEditTarget(null);
          setEditId(null);
        }}
        onSave={saveEdit}
      />
    </div>
  );
}
