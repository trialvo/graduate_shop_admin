// src/components/products/product-attributes/tabs/ColorTab.tsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Download, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { cn } from "@/lib/utils";

import type { ColorRow, Option, PriorityValue } from "../types";
import { safeNumber } from "../types";
import {
  createColor,
  deleteColor,
  getColor,
  getColors,
  updateColor,
  type Color,
} from "@/api/colors.api";

const STATUS_OPTIONS: Option[] = [
  { value: "all", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const LIMIT_OPTIONS: Option[] = [
  { value: "10", label: "10 / page" },
  { value: "20", label: "20 / page" },
  { value: "50", label: "50 / page" },
  { value: "100", label: "100 / page" },
];

const PRIORITY_OPTIONS: Option[] = [
  { value: "all", label: "All Priority" },
  { value: "1", label: "Low" },
  { value: "2", label: "Normal" },
  { value: "3", label: "Medium" },
  { value: "4", label: "High" },
];

function priorityLabel(p: number): string {
  if (p === 1) return "Low";
  if (p === 2) return "Normal";
  if (p === 3) return "Medium";
  if (p === 4) return "High";
  return String(p);
}

function isHexColor(v: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(v.trim());
}

function toRow(c: Color): ColorRow {
  return {
    id: c.id,
    name: c.name,
    hex: c.hex,
    priority: (c.priority ?? 1) as PriorityValue,
    status: Boolean(c.status),
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

function exportCsv(rows: ColorRow[]) {
  const headers = ["id", "name", "hex", "priority", "status", "created_at", "updated_at"];
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.id,
        JSON.stringify(r.name),
        JSON.stringify(r.hex),
        r.priority,
        r.status,
        JSON.stringify(r.created_at ?? ""),
        JSON.stringify(r.updated_at ?? ""),
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `colors_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

function TableSkeleton() {
  return (
    <div className="p-4">
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    </div>
  );
}

type ColorModalMode = "create" | "edit";

type ColorModalState = {
  open: boolean;
  mode: ColorModalMode;
  id?: number;
  hydrated: boolean;

  name: string;
  hex: string;
  priority: PriorityValue;
  status: boolean;
};

function ColorModal({
  state,
  setState,
  onSubmit,
  submitting,
  loadingSingle,
}: {
  state: ColorModalState;
  setState: React.Dispatch<React.SetStateAction<ColorModalState>>;
  onSubmit: () => void;
  submitting: boolean;
  loadingSingle: boolean;
}) {
  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[680px] overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {state.mode === "create" ? "Create Color" : "Update Color"}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Set name, hex code, status and priority.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            onClick={() => setState((p) => ({ ...p, open: false }))}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {state.mode === "edit" && loadingSingle ? (
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
              <div className="h-10 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
              <div className="h-10 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Color Name <span className="text-error-500">*</span>
                  </p>
                  <Input
                    placeholder="Crimson Red"
                    value={state.name}
                    onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    HEX <span className="text-error-500">*</span>
                  </p>

                  <div className="flex gap-3">
                    <div
                      className="h-11 w-11 rounded-lg border border-gray-200 dark:border-gray-800"
                      style={{ backgroundColor: isHexColor(state.hex) ? state.hex : "#000000" }}
                      aria-hidden
                    />
                    <Input
                      placeholder="#DC143C"
                      value={state.hex}
                      onChange={(e) => setState((p) => ({ ...p, hex: e.target.value }))}
                    />
                  </div>

                  {!isHexColor(state.hex) ? (
                    <p className="text-xs text-error-500">Invalid hex. Example: #EF4444</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</p>
                  <Select
                    options={PRIORITY_OPTIONS.filter((x) => x.value !== "all")}
                    placeholder="Select priority"
                    defaultValue={String(state.priority)}
                    onChange={(v) =>
                      setState((p) => ({
                        ...p,
                        priority: safeNumber(String(v), 1) as PriorityValue,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                  <div className="flex h-11 items-center">
                    <Switch
                      key={`modal-color-status-${state.status}`}
                      label=""
                      defaultChecked={state.status}
                      onChange={(checked) => setState((p) => ({ ...p, status: checked }))}
                    />
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                      {state.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setState((p) => ({ ...p, open: false }))}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <Button
                  onClick={onSubmit}
                  disabled={submitting || !state.name.trim() || !isHexColor(state.hex)}
                  startIcon={state.mode === "create" ? <Plus size={16} /> : <Pencil size={16} />}
                >
                  {submitting ? "Saving..." : state.mode === "create" ? "Create Color" : "Update Color"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ColorTab() {
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "true" | "false">("all");
  const [priority, setPriority] = useState<"all" | "1" | "2" | "3" | "4">("all");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  // IMPORTANT: initial fetch should be ONLY ?limit=10 (no offset)
  const params = useMemo(() => {
    return {
      limit,
      name: search.trim() ? search.trim() : undefined,
      status: status === "all" ? undefined : status === "true",
      priority: priority === "all" ? undefined : safeNumber(priority, 1),
      offset: page > 1 ? page : undefined,
    };
  }, [limit, search, status, priority, page]);

  const queryKey = useMemo(() => ["colors", params] as const, [params]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () => getColors(params),
    staleTime: 30_000,
    retry: 1,
  });

  const rows: ColorRow[] = useMemo(() => (data?.data ?? []).map(toRow), [data?.data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [modal, setModal] = useState<ColorModalState>({
    open: false,
    mode: "create",
    id: undefined,
    hydrated: true,
    name: "",
    hex: "#111827",
    priority: 2,
    status: true,
  });

  // single color load on edit modal open
  const {
    data: singleColor,
    isLoading: singleLoading,
  } = useQuery({
    queryKey: ["color", modal.id],
    queryFn: () => getColor(modal.id as number),
    enabled: modal.open && modal.mode === "edit" && Boolean(modal.id),
    staleTime: 0,
    retry: 1,
  });

  useEffect(() => {
    if (!modal.open || modal.mode !== "edit") return;
    if (!singleColor) return;

    setModal((p) => {
      if (p.hydrated && p.id === singleColor.id) return p;

      return {
        ...p,
        id: singleColor.id,
        name: singleColor.name ?? "",
        hex: singleColor.hex ?? "#111827",
        priority: (singleColor.priority ?? 1) as PriorityValue,
        status: Boolean(singleColor.status),
        hydrated: true,
      };
    });
  }, [modal.open, modal.mode, singleColor]);

  const createMutation = useMutation({
    mutationFn: createColor,
    onSuccess: () => {
      toast.success("Color created");
      qc.invalidateQueries({ queryKey: ["colors"] });
      setModal({
        open: false,
        mode: "create",
        hydrated: true,
        name: "",
        hex: "#111827",
        priority: 2,
        status: true,
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to create color";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateColor>[1] }) =>
      updateColor(id, payload),
    onSuccess: () => {
      toast.success("Color updated");
      qc.invalidateQueries({ queryKey: ["colors"] });
      qc.invalidateQueries({ queryKey: ["color"] });
      setModal((p) => ({ ...p, open: false }));
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to update color";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteColor,
    onSuccess: () => {
      toast.success("Color deleted");
      qc.invalidateQueries({ queryKey: ["colors"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to delete color";
      toast.error(msg);
    },
  });

  const openCreate = () => {
    setModal({
      open: true,
      mode: "create",
      hydrated: true,
      name: "",
      hex: "#111827",
      priority: 2,
      status: true,
    });
  };

  const openEdit = (id: number) => {
    setModal({
      open: true,
      mode: "edit",
      id,
      hydrated: false,
      name: "",
      hex: "#111827",
      priority: 2,
      status: true,
    });
  };

  const submitModal = () => {
    const trimmed = modal.name.trim();
    if (!trimmed || !isHexColor(modal.hex)) return;

    const payload = {
      name: trimmed,
      hex: modal.hex.trim(),
      status: modal.status,
      priority: modal.priority,
    };

    if (modal.mode === "create") {
      createMutation.mutate(payload);
      return;
    }

    if (!modal.id) return;
    updateMutation.mutate({ id: modal.id, payload });
  };

  const toggleStatus = (row: ColorRow, checked: boolean) => {
    updateMutation.mutate({
      id: row.id,
      payload: {
        name: row.name,
        hex: row.hex,
        priority: row.priority,
        status: checked,
      },
    });
  };

  const onExport = () => {
    if (!rows.length) {
      toast.error("Nothing to export");
      return;
    }
    exportCsv(rows);
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="space-y-6">
      {/* Top actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Color</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Create and manage product colors with HEX code.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" startIcon={<Download size={16} />} onClick={onExport}>
            Export CSV
          </Button>
          <Button startIcon={<Plus size={16} />} onClick={openCreate}>
            Create Color
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Search</p>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Search size={16} className="text-gray-400" />
              </div>
              <Input
                className="pl-9"
                placeholder="Search by name or hex"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
            <Select
              options={STATUS_OPTIONS}
              placeholder="Status"
              defaultValue={status}
              onChange={(v) => {
                setPage(1);
                setStatus(v as any);
              }}
            />
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Priority</p>
            <Select
              options={PRIORITY_OPTIONS}
              placeholder="Priority"
              defaultValue={priority}
              onChange={(v) => {
                setPage(1);
                setPriority(v as any);
              }}
            />
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Limit</p>
            <Select
              options={LIMIT_OPTIONS}
              placeholder="Limit"
              defaultValue={String(limit)}
              onChange={(v) => {
                setPage(1);
                setLimit(safeNumber(String(v), 10));
              }}
            />
          </div>

          <div className="md:col-span-1">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setPriority("all");
                setLimit(10);
                setPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Total: <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span>
          </span>
          <span className={cn("flex items-center gap-2", isFetching ? "opacity-100" : "opacity-60")}>
            <span className={cn("h-2 w-2 rounded-full", isFetching ? "bg-brand-500" : "bg-gray-400")} />
            {isFetching ? "Updating..." : "Up to date"}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[1040px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                    {["SL", "Id", "Color", "HEX", "Preview", "Status", "Priority", "Action"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-4 text-left text-xs font-semibold text-brand-500"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {(page - 1) * limit + (idx + 1)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {row.id}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {row.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {row.hex}
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="h-6 w-10 rounded-md border border-gray-200 dark:border-gray-800"
                          style={{ backgroundColor: row.hex }}
                          aria-hidden
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Switch
                          key={`st-${row.id}-${row.status}`}
                          label=""
                          defaultChecked={row.status}
                          onChange={(checked) => toggleStatus(row, checked)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                          {priorityLabel(row.priority)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                            onClick={() => openEdit(row.id)}
                            aria-label="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 disabled:opacity-60 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                            onClick={() => {
                              const ok = window.confirm(`Delete color "${row.name}"?`);
                              if (!ok) return;
                              deleteMutation.mutate(row.id);
                            }}
                            aria-label="Delete"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!rows.length ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No colors found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold shadow-theme-xs",
                    canPrev
                      ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                      : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-600",
                  )}
                  onClick={() => canPrev && setPage((p) => Math.max(1, p - 1))}
                  disabled={!canPrev}
                >
                  Prev
                </button>

                <button
                  type="button"
                  className={cn(
                    "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold shadow-theme-xs",
                    canNext
                      ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                      : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-600",
                  )}
                  onClick={() => canNext && setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!canNext}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ColorModal
        state={modal}
        setState={setModal}
        onSubmit={submitModal}
        submitting={createMutation.isPending || updateMutation.isPending}
        loadingSingle={singleLoading}
      />
    </div>
  );
}
