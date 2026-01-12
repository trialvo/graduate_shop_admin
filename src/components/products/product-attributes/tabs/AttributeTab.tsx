// src/components/products/product-attributes/tabs/AttributeTab.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Download, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { cn } from "@/lib/utils";

import type { AttributeRow, Option, VariantRow } from "../types";
import { safeNumber } from "../types";

import {
  createAttribute,
  deleteAttribute,
  getAttribute,
  getAttributes,
  updateAttribute,
  type Attribute,
} from "@/api/attributes.api";

import {
  createVariant,
  deleteVariant,
  getVariant,
  updateVariant,
  type Variant,
} from "@/api/variants.api";

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

// attribute + variant priority: 1 Normal, 2 Medium, 3 High
const PRIORITY_OPTIONS: Option[] = [
  { value: "all", label: "All Priority" },
  { value: "1", label: "Normal" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
];

function priorityLabel(p: number): string {
  if (p === 1) return "Normal";
  if (p === 2) return "Medium";
  if (p === 3) return "High";
  return String(p);
}

function parseApiError(err: any, fallback: string) {
  return err?.response?.data?.error ?? err?.response?.data?.message ?? fallback;
}

function normalizeAttribute(a: Attribute): AttributeRow {
  const variantsRaw = Array.isArray(a.variants) ? a.variants : [];
  const variants: VariantRow[] = variantsRaw
    .filter((v: any) => v && typeof v === "object" && typeof v.id === "number")
    .map((v: any) => ({
      id: v.id,
      attribute_id: v.attribute_id,
      name: v.name,
      priority: v.priority ?? 1,
      status: Boolean(v.status),
      created_at: v.created_at,
      updated_at: v.updated_at,
    }));

  return {
    id: a.id,
    name: a.name,
    priority: a.priority ?? 1,
    status: Boolean(a.status),
    created_at: a.created_at,
    updated_at: a.updated_at,
    variants,
  };
}

function exportCsv(rows: AttributeRow[]) {
  const headers = ["id", "name", "priority", "status", "variants_count"];
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.id,
        JSON.stringify(r.name),
        r.priority,
        r.status,
        r.variants?.length ?? 0,
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attributes_${new Date().toISOString().slice(0, 10)}.csv`;
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

/* ---------------------- Attribute Modal ---------------------- */

type AttributeModalMode = "create" | "edit";

type AttributeModalState = {
  open: boolean;
  mode: AttributeModalMode;
  id?: number;
  hydrated: boolean;

  name: string;
  status: boolean;
  priority: number;

  // only for create: comma separated variants
  variantsCsv: string;
};

function AttributeModal({
  state,
  setState,
  onSubmit,
  submitting,
  loadingSingle,
}: {
  state: AttributeModalState;
  setState: React.Dispatch<React.SetStateAction<AttributeModalState>>;
  onSubmit: () => void;
  submitting: boolean;
  loadingSingle: boolean;
}) {
  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[760px] overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {state.mode === "create" ? "Create Attribute" : "Update Attribute"}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Attribute is the parent group. Variants are values under it.
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
                    Attribute Name <span className="text-error-500">*</span>
                  </p>
                  <Input
                    placeholder="Weight / Size / Material"
                    value={state.name}
                    onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </p>
                  <Select
                    options={PRIORITY_OPTIONS.filter((x) => x.value !== "all")}
                    placeholder="Select priority"
                    defaultValue={String(state.priority)}
                    onChange={(v) =>
                      setState((p) => ({
                        ...p,
                        priority: safeNumber(String(v), 1),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                  <div className="flex h-11 items-center">
                    <Switch
                      key={`attr-modal-st-${state.status}`}
                      label=""
                      defaultChecked={state.status}
                      onChange={(checked) => setState((p) => ({ ...p, status: checked }))}
                    />
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                      {state.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {state.mode === "create" ? (
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Variants (optional, comma separated)
                    </p>
                    <Input
                      placeholder="S, M, L, XL"
                      value={state.variantsCsv}
                      onChange={(e) => setState((p) => ({ ...p, variantsCsv: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      These will be created under this attribute automatically.
                    </p>
                  </div>
                ) : null}
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
                  disabled={submitting || !state.name.trim()}
                  startIcon={state.mode === "create" ? <Plus size={16} /> : <Pencil size={16} />}
                >
                  {submitting ? "Saving..." : state.mode === "create" ? "Create" : "Update"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Variant Modal ---------------------- */

type VariantModalState = {
  open: boolean;
  id?: number;
  hydrated: boolean;

  attribute_id: number;
  name: string;
  status: boolean;
  priority: number;
};

function VariantModal({
  state,
  setState,
  attributeOptions,
  onSubmit,
  submitting,
  loadingSingle,
}: {
  state: VariantModalState;
  setState: React.Dispatch<React.SetStateAction<VariantModalState>>;
  attributeOptions: Option[];
  onSubmit: () => void;
  submitting: boolean;
  loadingSingle: boolean;
}) {
  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[720px] overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Update Variant
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Variant is a value under an attribute (e.g. XL under Size).
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
          {loadingSingle ? (
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
                    Attribute
                  </p>
                  <Select
                    options={attributeOptions}
                    placeholder="Select attribute"
                    defaultValue={String(state.attribute_id)}
                    onChange={(v) =>
                      setState((p) => ({
                        ...p,
                        attribute_id: safeNumber(String(v), p.attribute_id),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Variant Name <span className="text-error-500">*</span>
                  </p>
                  <Input
                    placeholder="XL / Extra Large"
                    value={state.name}
                    onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </p>
                  <Select
                    options={PRIORITY_OPTIONS.filter((x) => x.value !== "all")}
                    placeholder="Select priority"
                    defaultValue={String(state.priority)}
                    onChange={(v) =>
                      setState((p) => ({
                        ...p,
                        priority: safeNumber(String(v), 1),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                  <div className="flex h-11 items-center">
                    <Switch
                      key={`var-st-${state.status}`}
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
                  disabled={submitting || !state.name.trim()}
                  startIcon={<Pencil size={16} />}
                >
                  {submitting ? "Saving..." : "Update"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Main Tab ---------------------- */

export default function AttributeTab() {
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "true" | "false">("all");
  const [priority, setPriority] = useState<"all" | "1" | "2" | "3">("all");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  // inline variant draft per attribute
  const [variantDraftByAttrId, setVariantDraftByAttrId] = useState<Record<number, string>>({});

  // IMPORTANT: initial GET => only {limit:10}
  const params = useMemo(() => {
    return {
      limit,
      name: search.trim() ? search.trim() : undefined,
      status: status === "all" ? undefined : status === "true",
      priority: priority === "all" ? undefined : safeNumber(priority, 1),
      offset: page > 1 ? page : undefined,
    };
  }, [limit, search, status, priority, page]);

  const queryKey = useMemo(() => ["attributes", params] as const, [params]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () => getAttributes(params),
    staleTime: 30_000,
    retry: 1,
  });

  const rows: AttributeRow[] = useMemo(
    () => (data?.data ?? []).map(normalizeAttribute),
    [data?.data],
  );

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const attributeOptions: Option[] = useMemo(
    () => rows.map((r) => ({ value: String(r.id), label: r.name })),
    [rows],
  );

  /* ---------- Modals state ---------- */

  const [attrModal, setAttrModal] = useState<AttributeModalState>({
    open: false,
    mode: "create",
    hydrated: true,
    name: "",
    status: true,
    priority: 1,
    variantsCsv: "",
  });

  const [variantModal, setVariantModal] = useState<VariantModalState>({
    open: false,
    hydrated: true,
    attribute_id: 0,
    name: "",
    status: true,
    priority: 1,
  });

  /* ---------- Single loads for modals ---------- */

  const { data: singleAttr, isLoading: singleAttrLoading } = useQuery({
    queryKey: ["attribute", attrModal.id],
    queryFn: () => getAttribute(attrModal.id as number),
    enabled: attrModal.open && attrModal.mode === "edit" && Boolean(attrModal.id),
    staleTime: 0,
    retry: 1,
  });

  useEffect(() => {
    if (!attrModal.open || attrModal.mode !== "edit") return;
    if (!singleAttr) return;

    setAttrModal((p) => {
      if (p.hydrated && p.id === singleAttr.id) return p;
      return {
        ...p,
        id: singleAttr.id,
        name: singleAttr.name ?? "",
        status: Boolean(singleAttr.status),
        priority: singleAttr.priority ?? 1,
        hydrated: true,
      };
    });
  }, [attrModal.open, attrModal.mode, singleAttr]);

  const { data: singleVar, isLoading: singleVarLoading } = useQuery({
    queryKey: ["variant", variantModal.id],
    queryFn: () => getVariant(variantModal.id as number),
    enabled: variantModal.open && Boolean(variantModal.id),
    staleTime: 0,
    retry: 1,
  });

  useEffect(() => {
    if (!variantModal.open) return;
    if (!singleVar) return;

    setVariantModal((p) => {
      if (p.hydrated && p.id === singleVar.id) return p;
      return {
        ...p,
        id: singleVar.id,
        attribute_id: singleVar.attribute_id,
        name: singleVar.name ?? "",
        status: Boolean(singleVar.status),
        priority: singleVar.priority ?? 1,
        hydrated: true,
      };
    });
  }, [variantModal.open, singleVar]);

  /* ---------- Mutations ---------- */

  const createAttrMutation = useMutation({
    mutationFn: createAttribute,
    onSuccess: async (created) => {
      // optional: create variants from CSV
      const values = attrModal.variantsCsv
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (values.length) {
        // create sequentially
        for (const val of values) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await createVariant({
              attribute_id: created.id,
              name: val,
              status: true,
              priority: 1,
            });
          } catch (e: any) {
            toast.error(parseApiError(e, `Failed to create variant "${val}"`));
          }
        }
      }

      toast.success("Attribute created");
      qc.invalidateQueries({ queryKey: ["attributes"] });
      setAttrModal({
        open: false,
        mode: "create",
        hydrated: true,
        name: "",
        status: true,
        priority: 1,
        variantsCsv: "",
      });
    },
    onError: (err: any) => {
      toast.error(parseApiError(err, "Failed to create attribute"));
    },
  });

  const updateAttrMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateAttribute>[1] }) =>
      updateAttribute(id, payload),
    onSuccess: () => {
      toast.success("Attribute updated");
      qc.invalidateQueries({ queryKey: ["attributes"] });
      qc.invalidateQueries({ queryKey: ["attribute"] });
      setAttrModal((p) => ({ ...p, open: false }));
    },
    onError: (err: any) => {
      toast.error(parseApiError(err, "Failed to update attribute"));
    },
  });

  const deleteAttrMutation = useMutation({
    mutationFn: deleteAttribute,
    onSuccess: () => {
      toast.success("Attribute deleted");
      qc.invalidateQueries({ queryKey: ["attributes"] });
    },
    onError: (err: any) => {
      toast.error(parseApiError(err, "Failed to delete attribute"));
    },
  });

  const createVarMutation = useMutation({
    mutationFn: createVariant,
    onSuccess: () => {
      toast.success("Variant created");
      qc.invalidateQueries({ queryKey: ["attributes"] });
      qc.invalidateQueries({ queryKey: ["attribute"] });
    },
    onError: (err: any) => {
      toast.error(parseApiError(err, "Failed to create variant"));
    },
  });

  const updateVarMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateVariant>[1] }) =>
      updateVariant(id, payload),
    onSuccess: () => {
      toast.success("Variant updated");
      qc.invalidateQueries({ queryKey: ["attributes"] });
      qc.invalidateQueries({ queryKey: ["attribute"] });
      qc.invalidateQueries({ queryKey: ["variant"] });
      setVariantModal((p) => ({ ...p, open: false }));
    },
    onError: (err: any) => {
      toast.error(parseApiError(err, "Failed to update variant"));
    },
  });

  const deleteVarMutation = useMutation({
    mutationFn: deleteVariant,
    onSuccess: () => {
      toast.success("Variant deleted");
      qc.invalidateQueries({ queryKey: ["attributes"] });
      qc.invalidateQueries({ queryKey: ["attribute"] });
    },
    onError: (err: any) => {
      toast.error(parseApiError(err, "Failed to delete variant"));
    },
  });

  /* ---------- Actions ---------- */

  const openCreateAttribute = () => {
    setAttrModal({
      open: true,
      mode: "create",
      hydrated: true,
      name: "",
      status: true,
      priority: 1,
      variantsCsv: "",
    });
  };

  const openEditAttribute = (id: number) => {
    setAttrModal({
      open: true,
      mode: "edit",
      id,
      hydrated: false,
      name: "",
      status: true,
      priority: 1,
      variantsCsv: "",
    });
  };

  const submitAttrModal = () => {
    const trimmed = attrModal.name.trim();
    if (!trimmed) return;

    if (attrModal.mode === "create") {
      createAttrMutation.mutate({
        name: trimmed,
        status: attrModal.status,
        priority: attrModal.priority,
      });
      return;
    }

    if (!attrModal.id) return;
    updateAttrMutation.mutate({
      id: attrModal.id,
      payload: {
        name: trimmed,
        status: attrModal.status,
        priority: attrModal.priority,
      },
    });
  };

  const submitVariantModal = () => {
    const trimmed = variantModal.name.trim();
    if (!trimmed || !variantModal.id) return;

    updateVarMutation.mutate({
      id: variantModal.id,
      payload: {
        attribute_id: variantModal.attribute_id,
        name: trimmed,
        status: variantModal.status,
        priority: variantModal.priority,
      },
    });
  };

  const addVariantInline = (attributeId: number) => {
    const v = (variantDraftByAttrId[attributeId] ?? "").trim();
    if (!v) return;

    createVarMutation.mutate({
      attribute_id: attributeId,
      name: v,
      status: true,
      priority: 1,
    });

    setVariantDraftByAttrId((p) => ({ ...p, [attributeId]: "" }));
  };

  const toggleAttributeStatus = (row: AttributeRow, checked: boolean) => {
    updateAttrMutation.mutate({
      id: row.id,
      payload: { status: checked, name: row.name, priority: row.priority },
    });
  };

  const updateAttributePriority = (row: AttributeRow, p: number) => {
    updateAttrMutation.mutate({
      id: row.id,
      payload: { priority: p, name: row.name, status: row.status },
    });
  };

  const openEditVariant = (variantId: number) => {
    setVariantModal({
      open: true,
      id: variantId,
      hydrated: false,
      attribute_id: 0,
      name: "",
      status: true,
      priority: 1,
    });
  };

  const onExport = () => {
    if (!rows.length) {
      toast.error("Nothing to export");
      return;
    }
    exportCsv(rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Attribute & Variant
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Create attributes (parent) and manage variants (values) under each attribute.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button variant="outline" startIcon={<Download size={16} />} onClick={onExport}>
            Export CSV
          </Button>
          <Button startIcon={<Plus size={16} />} onClick={openCreateAttribute}>
            Create Attribute
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </p>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Search size={16} className="text-gray-400" />
              </div>
              <Input
                className="pl-9"
                placeholder="Search attribute name"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </p>
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
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </p>
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
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Limit
            </p>
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
            Total:{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {total}
            </span>
          </span>

          <span className={cn("flex items-center gap-2", isFetching ? "opacity-100" : "opacity-60")}>
            <span className={cn("h-2 w-2 rounded-full", isFetching ? "bg-brand-500" : "bg-gray-400")} />
            {isFetching ? "Updating..." : "Up to date"}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                    {["SL", "Id", "Attribute", "Variants", "Status", "Priority", "Action"].map(
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
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 dark:border-gray-800 align-top"
                    >
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {(page - 1) * limit + (idx + 1)}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {row.id}
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {row.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {row.variants?.length ?? 0} variants
                          </p>
                        </div>
                      </td>

                      {/* Variants */}
                      <td className="px-4 py-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {(row.variants ?? []).map((v) => (
                              <span
                                key={v.id}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                              >
                                {v.name}

                                <button
                                  type="button"
                                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                  onClick={() => openEditVariant(v.id)}
                                  aria-label="Edit variant"
                                  title="Edit"
                                >
                                  <Pencil size={12} />
                                </button>

                                <button
                                  type="button"
                                  className="text-error-500 hover:text-error-600"
                                  onClick={() => {
                                    const ok = window.confirm(`Delete variant "${v.name}"?`);
                                    if (!ok) return;
                                    deleteVarMutation.mutate(v.id);
                                  }}
                                  aria-label="Delete variant"
                                  title="Delete"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-[220px]">
                              <Input
                                placeholder="Add variant (e.g. XL)"
                                value={variantDraftByAttrId[row.id] ?? ""}
                                onChange={(e) =>
                                  setVariantDraftByAttrId((p) => ({
                                    ...p,
                                    [row.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") addVariantInline(row.id);
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                              onClick={() => addVariantInline(row.id)}
                              aria-label="Add variant"
                              disabled={createVarMutation.isPending}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <Switch
                          key={`attr-st-${row.id}-${row.status}`}
                          label=""
                          defaultChecked={row.status}
                          onChange={(checked) => toggleAttributeStatus(row, checked)}
                        />
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-4">
                        <div className="max-w-[180px]">
                          <Select
                            key={`attr-pr-${row.id}-${row.priority}`}
                            options={PRIORITY_OPTIONS.filter((x) => x.value !== "all")}
                            placeholder="Priority"
                            defaultValue={String(row.priority)}
                            onChange={(v) => updateAttributePriority(row, safeNumber(String(v), 1))}
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {priorityLabel(row.priority)}
                          </p>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                            onClick={() => openEditAttribute(row.id)}
                            aria-label="Edit attribute"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 disabled:opacity-60 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                            onClick={() => {
                              const ok = window.confirm(`Delete attribute "${row.name}"?`);
                              if (!ok) return;
                              deleteAttrMutation.mutate(row.id);
                            }}
                            aria-label="Delete attribute"
                            disabled={deleteAttrMutation.isPending}
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
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No attributes found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of{" "}
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

      {/* Attribute Modal */}
      <AttributeModal
        state={attrModal}
        setState={setAttrModal}
        onSubmit={submitAttrModal}
        submitting={createAttrMutation.isPending || updateAttrMutation.isPending}
        loadingSingle={singleAttrLoading}
      />

      {/* Variant Modal */}
      <VariantModal
        state={variantModal}
        setState={setVariantModal}
        attributeOptions={attributeOptions}
        onSubmit={submitVariantModal}
        submitting={updateVarMutation.isPending}
        loadingSingle={singleVarLoading}
      />
    </div>
  );
}
