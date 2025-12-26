import React, { useMemo, useState } from "react";
import { Plus, RefreshCcw, Search, Trash2 } from "lucide-react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";

import AddCourierModal from "./AddCourierModal";
import { INITIAL_COURIER_CARDS, INITIAL_DELIVERY_NAMES } from "./mockData";
import type { CourierChargeCard, DeliveryNameRow } from "./types";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

function formatHeaderTime(d: Date): string {
  const month = d.toLocaleString("en-US", { month: "long" });
  const day = d.getDate();
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${month} ${day}, ${year} at ${time}`;
}

export default function DeliverySettingsPage() {
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());
  const [search, setSearch] = useState("");

  const [cards, setCards] = useState<CourierChargeCard[]>(INITIAL_COURIER_CARDS);
  const [names] = useState<DeliveryNameRow[]>(INITIAL_DELIVERY_NAMES);

  const [addOpen, setAddOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CourierChargeCard | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => {
      return (
        c.title.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        String(c.customerChargeBdt).includes(q) ||
        String(c.ownChargeBdt).includes(q)
      );
    });
  }, [cards, search]);

  const toggleActive = (id: number, checked: boolean) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, active: checked, updatedAt: new Date().toLocaleString() }
          : c
      )
    );
  };

  const openDelete = (row: CourierChargeCard) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setCards((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Delivery Settings" />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
            Delivery Charge
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

          <div className="rounded-[4px] border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white">
            {formatHeaderTime(refreshedAt)}
          </div>
        </div>
      </div>

      {/* Top actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
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

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((card) => (
          <div
            key={card.id}
            className="rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-[4px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40 flex items-center justify-center">
                    {card.logoUrl ? (
                      <img
                        src={card.logoUrl}
                        alt={card.title}
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
                      {card.title}
                    </p>
                  </div>
                </div>

                <Switch
                  label=""
                  defaultChecked={card.active}
                  onChange={(checked) => toggleActive(card.id, checked)}
                />
              </div>

              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Type :{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {card.type}
                </span>
              </p>

              {/* Customer Charge */}
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {card.customerChargeBdt}{" "}
                <span className="text-base font-semibold text-gray-700 dark:text-gray-200">
                  BDT
                </span>
              </p>

              {/* Own Charge */}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Our Cost:{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {card.ownChargeBdt} BDT
                </span>
              </p>

              <div className="mt-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <p>Create : {card.createdAt}</p>
                <p>Update : {card.updatedAt}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-600"
                onClick={() => console.log("View settings", card.id)}
              >
                View Settings
              </button>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-300 dark:hover:bg-error-500/10"
                onClick={() => openDelete(card)}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-4 rounded-[4px] border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            No delivery charge cards found.
          </div>
        ) : null}
      </div>

      {/* Bottom Name Table */}
      <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Delivery Names
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Simple list (demo) like your screenshot.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[560px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {["#", "Name"].map((h) => (
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
              {names.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {r.id}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    {r.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AddCourierModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={(newCard) => setCards((prev) => [newCard, ...prev])}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Delivery Charge"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"?`
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
