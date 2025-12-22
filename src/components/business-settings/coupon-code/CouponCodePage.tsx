import React, { useMemo, useState } from "react";
import { Download, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";

import CouponModal from "./CouponModal";
import { INITIAL_COUPONS } from "./mockData";
import type { CouponRow } from "./types";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

function badge(text: string) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
      {text}
    </span>
  );
}

function typeLabel(t: CouponRow["type"]): string {
  if (t === "GENERAL") return "General";
  if (t === "CUSTOMER") return "Customer";
  if (t === "FREE_DELIVERY") return "Free Delivery";
  if (t === "CATEGORY") return "Category";
  return "Product";
}

function discountLabel(row: CouponRow): string {
  if (row.discountType === "FREE_DELIVERY") return "Free Delivery";
  if (row.discountType === "PERCENT") return `${row.discountValue}%`;
  return `${row.discountValue}`;
}

export default function CouponCodePage() {
  const [items, setItems] = useState<CouponRow[]>(INITIAL_COUPONS);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [active, setActive] = useState<CouponRow | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CouponRow | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((c) => {
      const title = c.titles.default.toLowerCase();
      const code = c.code.toLowerCase();
      return title.includes(q) || code.includes(q) || typeLabel(c.type).toLowerCase().includes(q);
    });
  }, [items, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const openCreate = () => {
    setModalMode("create");
    setActive(null);
    setModalOpen(true);
  };

  const openView = (row: CouponRow) => {
    setModalMode("view");
    setActive(row);
    setModalOpen(true);
  };

  const openEdit = (row: CouponRow) => {
    setModalMode("edit");
    setActive(row);
    setModalOpen(true);
  };

  const upsert = (payload: CouponRow) => {
    setItems((prev) => {
      const exists = prev.some((x) => x.id === payload.id);
      if (!exists) return [payload, ...prev];
      return prev.map((x) => (x.id === payload.id ? payload : x));
    });
  };

  const toggleStatus = (id: number, checked: boolean) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: checked } : x)));
  };

  const askDelete = (row: CouponRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  // reset page when filter changes
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Coupon Code" />

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Coupon Code
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage advanced coupon campaigns (no Store field).
          </p>
        </div>

        <Button startIcon={<Plus size={16} />} onClick={openCreate}>
          Add New Coupon
        </Button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Coupon List
            </h3>
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {filtered.length}
            </span>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
            <div className="relative w-full sm:w-[320px]">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Search size={16} className="text-gray-400" />
              </div>
              <Input
                className="pl-9"
                placeholder="Ex: Coupon Title Or Code"
                value={search}
                onChange={(e) => setSearch(String(e.target.value))}
              />
            </div>

            <Button
              variant="outline"
              startIcon={<Download size={16} />}
              onClick={() => console.log("Export coupons")}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {[
                  "SL",
                  "Title",
                  "Code",
                  "Type",
                  "Target",
                  "Total Uses",
                  "Min Purchase",
                  "Max Discount",
                  "Discount",
                  "Discount Type",
                  "Start Date",
                  "Expire Date",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-4 text-left text-xs font-semibold text-brand-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paged.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {(page - 1) * pageSize + idx + 1}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {row.titles.default}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.code}
                  </td>

                  <td className="px-4 py-4">{badge(typeLabel(row.type))}</td>

                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.target.kind === "ALL"
                      ? "All"
                      : row.target.kind === "CUSTOMERS"
                      ? `Customers (${row.target.customerIds.length})`
                      : row.target.kind === "CATEGORIES"
                      ? `Categories (${row.target.categoryIds.length})`
                      : `Products (${row.target.productIds.length})`}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.totalUses}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.minPurchase}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.maxDiscount}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {discountLabel(row)}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.discountType === "FREE_DELIVERY"
                      ? "Free Delivery"
                      : row.discountType === "PERCENT"
                      ? "Percent %"
                      : "Amount"}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.startDate}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.expireDate}
                  </td>

                  <td className="px-4 py-4">
                    <Switch
                      label=""
                      defaultChecked={row.status}
                      onChange={(checked) => toggleStatus(row.id, checked)}
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 bg-white text-orange-600 shadow-theme-xs hover:bg-orange-50 dark:border-orange-900/40 dark:bg-gray-900 dark:text-orange-300 dark:hover:bg-orange-500/10"
                        onClick={() => openView(row)}
                        aria-label="View"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        onClick={() => openEdit(row)}
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                        onClick={() => askDelete(row)}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No coupons found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="p-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Modal */}
      <CouponModal
        open={modalOpen}
        mode={modalMode}
        initial={active}
        onClose={() => setModalOpen(false)}
        onSubmit={upsert}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Coupon"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.titles.default}"?`
            : "Are you sure you want to delete this item?"
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
    </div>
  );
}
