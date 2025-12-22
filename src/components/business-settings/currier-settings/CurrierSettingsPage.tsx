import React, { useMemo, useState } from "react";
import { Plus, RefreshCcw, Search, Trash2 } from "lucide-react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";

import { INITIAL_CURRIERS } from "./mockData";
import CurrierModal from "./CurrierModal";
import type { CurrierRow } from "./types";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

function formatHeaderTime(d: Date): string {
  const month = d.toLocaleString("en-US", { month: "long" });
  const day = d.getDate();
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${month} ${day}, ${year} at ${time}`;
}

export default function CurrierSettingsPage() {
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<CurrierRow[]>(INITIAL_CURRIERS);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeItem, setActiveItem] = useState<CurrierRow | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CurrierRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const openCreate = () => {
    setModalMode("create");
    setActiveItem(null);
    setModalOpen(true);
  };

  const openEdit = (row: CurrierRow) => {
    setModalMode("edit");
    setActiveItem(row);
    setModalOpen(true);
  };

  const upsert = (payload: CurrierRow) => {
    setItems((prev) => {
      const exists = prev.some((x) => x.id === payload.id);
      if (!exists) return [payload, ...prev];
      return prev.map((x) => (x.id === payload.id ? payload : x));
    });
  };

  const toggleActive = (id: number, checked: boolean) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, active: checked, updatedAt: new Date().toLocaleString() }
          : x
      )
    );
  };

  const openDelete = (row: CurrierRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Currier Settings" />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Currier Management
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
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white">
            {formatHeaderTime(refreshedAt)}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button startIcon={<Plus size={16} />} onClick={openCreate}>
          Add New Currier
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40 flex items-center justify-center">
                    {card.logoUrl ? (
                      <img
                        src={card.logoUrl}
                        alt={card.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Logo
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {card.name}
                    </p>
                  </div>
                </div>

                <Switch
                  label=""
                  defaultChecked={card.active}
                  onChange={(checked) => toggleActive(card.id, checked)}
                />
              </div>

              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                {card.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-600"
                onClick={() => openEdit(card)}
              >
                View Settings
              </button>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-300 dark:hover:bg-error-500/10"
                onClick={() => openDelete(card)}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            No curriers found.
          </div>
        ) : null}
      </div>

      <CurrierModal
        open={modalOpen}
        mode={modalMode}
        initial={activeItem}
        onClose={() => setModalOpen(false)}
        onSubmit={upsert}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Currier"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"?`
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
