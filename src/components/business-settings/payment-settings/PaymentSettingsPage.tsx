import React, { useMemo, useState } from "react";
import { Plus, RefreshCw, Search, Settings, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";

import PaymentGatewayModal from "./PaymentGatewayModal";
import { INITIAL_PAYMENT_GATEWAYS } from "./mockData";
import { PAYMENT_PROVIDER_DEFS } from "./providerDefs";
import type { PaymentGatewayConfig, PaymentProvider } from "./types";

function stampNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  let hh = d.getHours();
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi} ${ampm}`;
}

function providerMeta(provider: PaymentProvider) {
  return PAYMENT_PROVIDER_DEFS.find((d) => d.provider === provider);
}

export default function PaymentSettingsPage() {
  const [items, setItems] = useState<PaymentGatewayConfig[]>(INITIAL_PAYMENT_GATEWAYS);

  const [search, setSearch] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(stampNow());

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<PaymentGatewayConfig | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => {
      const meta = providerMeta(x.provider);
      return (
        x.name.toLowerCase().includes(q) ||
        x.provider.toLowerCase().includes(q) ||
        x.category.toLowerCase().includes(q) ||
        (meta?.title.toLowerCase().includes(q) ?? false)
      );
    });
  }, [items, search]);

  const openCreate = () => {
    setModalMode("create");
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: PaymentGatewayConfig) => {
    setModalMode("edit");
    setEditing(row);
    setModalOpen(true);
  };

  const saveFromModal = (payload: Omit<PaymentGatewayConfig, "id" | "createdAt" | "updatedAt">) => {
    if (modalMode === "create") {
      const nextId = Math.max(0, ...items.map((x) => x.id)) + 1;
      const now = stampNow();
      setItems((prev) => [
        {
          id: nextId,
          createdAt: now,
          updatedAt: now,
          ...payload,
        },
        ...prev,
      ]);
      setModalOpen(false);
      return;
    }

    // edit
    if (!editing) return;
    const now = stampNow();
    setItems((prev) =>
      prev.map((x) =>
        x.id === editing.id
          ? {
              ...x,
              ...payload,
              updatedAt: now,
            }
          : x
      )
    );
    setModalOpen(false);
  };

  const toggleActive = (id: number, checked: boolean) => {
    const now = stampNow();
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: checked, updatedAt: now } : x))
    );
  };

  const remove = (id: number) => {
    // (UI demo) — later show confirm modal like your other pages
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const doRefresh = () => {
    setRefreshedAt(stampNow());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Payment Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add & configure payment gateways for Bangladesh (bKash, SSLCommerz, ShurjoPay, Nagad, Rocket)
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Data Refreshed</span>
            <button
              type="button"
              onClick={doRefresh}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>

            <span className="inline-flex items-center rounded-[4px] border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              {refreshedAt}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button onClick={openCreate} startIcon={<Plus size={16} />}>
          Add Payment Gateway
        </Button>

        <div className="relative w-full md:w-[320px]">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <Search size={16} className="text-gray-400" />
          </div>
          <Input
            className="pl-9"
            placeholder="Search gateway..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {filtered.map((g) => {
          const meta = providerMeta(g.provider);
          const logo = meta?.logoText ?? "PG";
          return (
            <div
              key={g.id}
              className="rounded-[4px] border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-sm font-extrabold text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
                    {logo}
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {g.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Type : <span className="font-semibold">{g.category}</span>
                    </p>
                  </div>
                </div>

                <Switch
                  label=""
                  defaultChecked={g.status}
                  onChange={(checked) => toggleActive(g.id, checked)}
                />
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Environment :{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {g.sandbox ? "Sandbox" : "Live"}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Updated : {g.updatedAt}
                </p>
                {g.note ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {g.note}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600"
                  onClick={() => openEdit(g)}
                >
                  <Settings size={16} />
                  View Settings
                </button>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                  onClick={() => remove(g.id)}
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 ? (
          <div className="col-span-full rounded-[4px] border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            No payment gateway found.
          </div>
        ) : null}
      </div>

      <PaymentGatewayModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={saveFromModal}
      />
    </div>
  );
}
