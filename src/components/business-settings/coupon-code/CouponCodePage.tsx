import React, { useMemo, useState } from "react";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import CouponModal from "./CouponModal";
import { INITIAL_COUPONS, INITIAL_CUSTOMERS, INITIAL_PRODUCTS } from "./mockData";
import type { CouponRow, DiscountType, Option } from "./types";
import { normalizeCode } from "./types";

const DISCOUNT_TYPE_OPTIONS: Option[] = [
  { value: "flat", label: "Flat (৳)" },
  { value: "percent", label: "Percent (%)" },
];

export default function CouponCodePage() {
  const [rows, setRows] = useState<CouponRow[]>(INITIAL_COUPONS);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<CouponRow | null>(null);

  const products = INITIAL_PRODUCTS;
  const customers = INITIAL_CUSTOMERS;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.discountType.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const openCreate = () => {
    setModalMode("create");
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: CouponRow) => {
    setModalMode("edit");
    setEditing(row);
    setModalOpen(true);
  };

  const saveCoupon = (payload: Omit<CouponRow, "id" | "totalUses">) => {
    if (modalMode === "create") {
      const nextId = Math.max(0, ...rows.map((r) => r.id)) + 1;
      setRows((prev) => [
        { id: nextId, totalUses: 0, ...payload, code: normalizeCode(payload.code) },
        ...prev,
      ]);
      setModalOpen(false);
      return;
    }

    if (!editing) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === editing.id ? { ...r, ...payload, code: normalizeCode(payload.code) } : r
      )
    );
    setModalOpen(false);
  };

  const remove = (id: number) => {
    // later: confirm modal like your admin list
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleStatus = (id: number, checked: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: checked } : r)));
  };

  const getProductScopeLabel = (r: CouponRow) =>
    r.productScope === "all" ? "All Products" : `${r.productIds.length} Products`;

  const getCustomerScopeLabel = (r: CouponRow) =>
    r.customerScope === "all" ? "All Customers" : `${r.customerIds.length} Customers`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Coupon Code
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create & manage advanced coupons (scope by products/customers)
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button onClick={openCreate} startIcon={<Plus size={16} />}>
          Add New Coupon
        </Button>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          <div className="relative w-full sm:w-[320px]">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Search size={16} className="text-gray-400" />
            </div>
            <Input
              className="pl-9"
              placeholder="Search by title or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

      {/* List */}
      <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Coupon List</h3>
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {filtered.length}
            </span>
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
                  "Discount",
                  "Min Purchase",
                  "Max Discount",
                  "Products",
                  "Customers",
                  "Start",
                  "Expire",
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
              {filtered.map((r, idx) => (
                <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{idx + 1}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {r.title}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{r.code}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {r.discountType === "flat" ? "Flat" : "Percent"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {r.discountType === "flat" ? `৳ ${r.discountValue}` : `${r.discountValue}%`}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    ৳ {r.minPurchase}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {r.discountType === "percent" ? `৳ ${r.maxDiscount}` : "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {getProductScopeLabel(r)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {getCustomerScopeLabel(r)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{r.startDate}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{r.expireDate}</td>
                  <td className="px-4 py-4">
                    <Switch
                      label=""
                      defaultChecked={r.status}
                      onChange={(checked) => toggleStatus(r.id, checked)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        onClick={() => openEdit(r)}
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                        onClick={() => remove(r.id)}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No coupons found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <CouponModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        products={products}
        customers={customers}
        onClose={() => setModalOpen(false)}
        onSave={saveCoupon}
      />
    </div>
  );
}
