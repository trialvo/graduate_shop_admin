import React, { useMemo, useState } from "react";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";

import BannerModal from "./BannerModal";
import { CATEGORIES, INITIAL_BANNERS, PRODUCTS, ZONES } from "./mockData";
import type { BannerRow } from "./types";
import { nowISO } from "./types";

function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close overlay"
      />
      <div className="relative w-[92vw] max-w-md rounded-[4px] border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

export default function BannersSettingsPage() {
  const [rows, setRows] = useState<BannerRow[]>(INITIAL_BANNERS);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<BannerRow | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((b) => {
      const t = (b.title ?? "").toLowerCase();
      const zone = b.zone.toLowerCase();
      const type = b.type.toLowerCase();
      return t.includes(q) || zone.includes(q) || type.includes(q);
    });
  }, [rows, search]);

  const openCreate = () => {
    setModalMode("create");
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: BannerRow) => {
    setModalMode("edit");
    setEditing(row);
    setModalOpen(true);
  };

  const save = (payload: Omit<BannerRow, "id" | "createdAt">) => {
    if (modalMode === "create") {
      const nextId = Math.max(0, ...rows.map((r) => r.id)) + 1;
      setRows((prev) => [{ id: nextId, createdAt: nowISO(), ...payload }, ...prev]);
      setModalOpen(false);
      return;
    }

    if (!editing) return;
    setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...payload } : r)));
    setModalOpen(false);
  };

  const requestDelete = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setRows((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const toggleFeatured = (id: number, checked: boolean) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, featured: checked } : r))
    );
  };

  const toggleStatus = (id: number, checked: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: checked } : r)));
  };

  const typeLabel = (t: BannerRow["type"]) => {
    if (t === "default") return "Default";
    if (t === "category_wise") return "Category wise";
    if (t === "product_wise") return "Product wise";
    return "Custom URL";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Banner Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add banners by zone and type, manage featured & status.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button onClick={openCreate} startIcon={<Plus size={16} />}>
          Add New Banner
        </Button>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
          <div className="relative w-full sm:w-[320px]">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Search size={16} className="text-gray-400" />
            </div>
            <Input
              className="pl-9"
              placeholder="Search by title / zone / type"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            startIcon={<Download size={16} />}
            onClick={() => console.log("Export banners")}
          >
            Export
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Banner List
            </h3>
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {filtered.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {["SL", "Title", "Zone", "Type", "Featured", "Status", "Action"].map((h) => (
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
              {filtered.map((row, idx) => (
                <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {idx + 1}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                        {row.imageUrl ? (
                          <img
                            src={row.imageUrl}
                            alt="banner"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {row.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          #{row.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.zone}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {typeLabel(row.type)}
                  </td>

                  <td className="px-4 py-4">
                    <Switch
                      label=""
                      defaultChecked={row.featured}
                      onChange={(checked) => toggleFeatured(row.id, checked)}
                    />
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
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        onClick={() => openEdit(row)}
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                        onClick={() => requestDelete(row.id)}
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
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No banners found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BannerModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        zones={[...ZONES]}
        categories={CATEGORIES}
        products={PRODUCTS}
        onClose={() => setModalOpen(false)}
        onSave={save}
      />

      <ConfirmModal
        open={deleteOpen}
        title="Are you sure to delete?"
        description="This action cannot be undone."
        confirmText="Yes, Delete"
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
