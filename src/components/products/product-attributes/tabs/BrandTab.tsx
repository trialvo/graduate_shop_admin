// src/components/products/product-attributes/tabs/BrandTab.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Download, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Pagination from "@/components/common/Pagination";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/utils/toPublicUrl";

import type { BrandRow, Option, PriorityValue } from "../types";
import { safeNumber } from "../types";
import {
  createBrand,
  deleteBrand,
  getBrand,
  getBrands,
  updateBrand,
  type Brand,
} from "@/api/brands.api";

const STATUS_OPTIONS: Option[] = [
  { value: "all", label: "All Status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const PRIORITY_OPTIONS: Option[] = [
  { value: "all", label: "All Priority" },
  { value: "1", label: "Low" },
  { value: "2", label: "Normal" },
  { value: "3", label: "Medium" },
  { value: "4", label: "High" },
];

function getApiErrorFromResponse(res: any) {
  if (typeof res?.error === "string" && res.error.trim()) return res.error.trim();
  if (typeof res?.message === "string" && res.message.trim()) return res.message.trim();
  if (Number.isFinite(Number(res?.flag)) && Number(res.flag) >= 400) return "Something went wrong";
  return null;
}

function priorityLabel(p: number): string {
  if (p === 1) return "Low";
  if (p === 2) return "Normal";
  if (p === 3) return "Medium";
  if (p === 4) return "High";
  return String(p);
}

function toRow(b: Brand): BrandRow {
  return {
    id: b.id,
    name: b.name,
    img_path: b.img_path ?? null,
    priority: (b.priority ?? 1) as PriorityValue,
    status: Boolean(b.status),
    created_at: b.created_at,
    updated_at: b.updated_at,
  };
}

function exportCsv(rows: BrandRow[]) {
  const headers = ["id", "name", "img_path", "priority", "status", "created_at", "updated_at"];
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.id,
        JSON.stringify(r.name),
        JSON.stringify(r.img_path ?? ""),
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
  a.download = `brands_${new Date().toISOString().slice(0, 10)}.csv`;
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

type BrandModalMode = "create" | "edit";

type BrandModalState = {
  open: boolean;
  mode: BrandModalMode;
  id?: number;
  hydrated: boolean;

  name: string;
  priority: PriorityValue;
  status: boolean;

  file: File | null;
  previewUrl: string | null;

  existingImgPath: string | null; // from API
};

function BrandModal({
  state,
  setState,
  onSubmit,
  submitting,
  loadingSingle,
}: {
  state: BrandModalState;
  setState: React.Dispatch<React.SetStateAction<BrandModalState>>;
  onSubmit: () => void;
  submitting: boolean;
  loadingSingle: boolean;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement | null>(null);

  if (!state.open) return null;

  const existingUrl = toPublicUrl(state.existingImgPath);
  const preview = state.previewUrl ?? existingUrl;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[720px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {state.mode === "create" ? t("products.attributes.createBrand") : t("products.attributes.updateBrand")}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {state.mode === "create"
                ? t("products.attributes.addBrandDesc")
                : t("products.attributes.updateBrandDesc")}
            </p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setState((p) => ({ ...p, open: false }))}
            ariaLabel="Close"
            startIcon={<X size={16} />}
          />
        </div>

        <div className="p-5">
          {state.mode === "edit" && loadingSingle ? (
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
              <div className="h-10 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
              <div className="h-10 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
              <div className="h-20 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("products.attributes.brandName")} <span className="text-error-500">*</span>
                  </p>
                  <Input
                    placeholder="e.g. Trialvo"
                    value={state.name}
                    onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("products.attributes.priority")}
                  </p>
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
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("common.status")}</p>
                  <div className="flex h-11 items-center">
                    <Switch
                      key={`modal-status-${state.status}`}
                      label=""
                      defaultChecked={state.status}
                      onChange={(checked) => setState((p) => ({ ...p, status: checked }))}
                    />
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                      {state.status ? t("common.active") : t("common.inactive")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("products.attributes.brandImage")}
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setState((p) => {
                          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
                          return {
                            ...p,
                            file: f,
                            previewUrl: f ? URL.createObjectURL(f) : null,
                          };
                        });
                      }}
                    />

                    <Button
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                      startIcon={<Upload size={16} />}
                    >
                      {t("common.upload")}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        if (fileRef.current) fileRef.current.value = "";
                        setState((p) => {
                          if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
                          return { ...p, file: null, previewUrl: null };
                        });
                      }}
                      disabled={!state.file && !state.previewUrl}
                      startIcon={<Trash2 size={16} />}
                    >
                      {t("products.attributes.clearNew")}
                    </Button>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                          {t("products.attributes.noImage")}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("products.attributes.existingImageInfo")}
                      </p>
                      {state.mode === "edit" && state.existingImgPath ? (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Current: {state.existingImgPath}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setState((p) => ({ ...p, open: false }))}
                  disabled={submitting}
                >
                  {t("common.cancel")}
                </Button>

                <Button
                  onClick={onSubmit}
                  disabled={submitting || !state.name.trim()}
                  startIcon={state.mode === "create" ? <Plus size={16} /> : <Pencil size={16} />}
                >
                  {submitting ? t("common.saving") : state.mode === "create" ? t("products.attributes.createBrand") : t("products.attributes.updateBrand")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrandTab({ tabsHeader }: { tabsHeader?: React.ReactNode }) {
  const { t } = useTranslation();
  const qc = useQueryClient();

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "true" | "false">("all");
  const [priority, setPriority] = useState<"all" | "1" | "2" | "3" | "4">("all");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1); // UI page number

  // IMPORTANT: initial fetch should be ONLY ?limit=10
  const params = useMemo(() => {
    const hasFilters =
      Boolean(search.trim()) || status !== "all" || priority !== "all" || page !== 1;

    return {
      limit,
      name: search.trim() ? search.trim() : undefined,
      status: status === "all" ? undefined : status === "true",
      priority: priority === "all" ? undefined : safeNumber(priority, 1),
      offset: page > 1 ? (page - 1) * limit : undefined, // empty initially
      // if no filters and page=1 => this becomes {limit:10} only
    };
  }, [limit, search, status, priority, page]);

  const queryKey = useMemo(() => ["brands", params] as const, [params]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () => getBrands(params),
    staleTime: 30_000,
    retry: 1,
  });

  const rows: BrandRow[] = useMemo(() => (data?.data ?? []).map(toRow), [data?.data]);
  const total = data?.total ?? 0;

  const [modal, setModal] = useState<BrandModalState>({
    open: false,
    mode: "create",
    hydrated: true,
    name: "",
    priority: 2,
    status: true,
    file: null,
    previewUrl: null,
    existingImgPath: null,
  });

  // single brand load on edit modal open
  const {
    data: singleBrand,
    isLoading: singleLoading,
  } = useQuery({
    queryKey: ["brand", modal.id],
    queryFn: () => getBrand(modal.id as number),
    enabled: modal.open && modal.mode === "edit" && Boolean(modal.id),
    staleTime: 0,
    retry: 1,
  });

  useEffect(() => {
    if (!modal.open || modal.mode !== "edit") return;
    if (!singleBrand) return;

    setModal((p) => {
      // avoid rehydrating if already set for this id
      if (p.hydrated && p.id === singleBrand.id) return p;

      return {
        ...p,
        id: singleBrand.id,
        name: singleBrand.name ?? "",
        priority: (singleBrand.priority ?? 1) as PriorityValue,
        status: Boolean(singleBrand.status),
        existingImgPath: singleBrand.img_path ?? null,
        hydrated: true,
      };
    });
  }, [modal.open, modal.mode, singleBrand]);

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      toast.success(t("products.attributes.brandCreated"));
      qc.invalidateQueries({ queryKey: ["brands"] });
      setModal((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        return {
          open: false,
          mode: "create",
          hydrated: true,
          name: "",
          priority: 2,
          status: true,
          file: null,
          previewUrl: null,
          existingImgPath: null,
        };
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? t("products.attributes.failedCreateBrand");
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateBrand>[1] }) =>
      updateBrand(id, payload),
    onSuccess: () => {
      toast.success(t("products.attributes.brandUpdated"));
      qc.invalidateQueries({ queryKey: ["brands"] });
      qc.invalidateQueries({ queryKey: ["brand"] });

      setModal((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        return { ...p, open: false, file: null, previewUrl: null };
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? t("products.attributes.failedUpdateBrand");
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: (res: any) => {
      const apiError = getApiErrorFromResponse(res);
      if (apiError) {
        toast.error(apiError);
        return;
      }

      toast.success(t("products.attributes.brandDeleted"));
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? t("products.attributes.failedDeleteBrand");
      toast.error(msg);
    },
  });

  const openCreate = () => {
    setModal((p) => {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      return {
        open: true,
        mode: "create",
        hydrated: true,
        name: "",
        priority: 2,
        status: true,
        file: null,
        previewUrl: null,
        existingImgPath: null,
      };
    });
  };

  const openEdit = (id: number) => {
    setModal((p) => {
      if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      return {
        open: true,
        mode: "edit",
        id,
        hydrated: false,
        name: "",
        priority: 2,
        status: true,
        file: null,
        previewUrl: null,
        existingImgPath: null,
      };
    });
  };

  const submitModal = () => {
    const trimmed = modal.name.trim();
    if (!trimmed) return;

    if (modal.mode === "create") {
      createMutation.mutate({
        name: trimmed,
        priority: modal.priority,
        status: modal.status,
        brand_img: modal.file,
      });
      return;
    }

    if (!modal.id) return;
    updateMutation.mutate({
      id: modal.id,
      payload: {
        name: trimmed,
        priority: modal.priority,
        status: modal.status,
        brand_img: modal.file ?? undefined,
      },
    });
  };

  const toggleStatus = (row: BrandRow, checked: boolean) => {
    updateMutation.mutate({
      id: row.id,
      payload: {
        name: row.name,
        priority: row.priority,
        status: checked,
      },
    });
  };

  const onExport = () => {
    if (!rows.length) {
      toast.error(t("products.attributes.nothingToExport"));
      return;
    }
    exportCsv(rows);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Header + Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">{tabsHeader}</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button variant="outline" startIcon={<Download size={16} />} onClick={onExport}>
                {t("common.export")} CSV
              </Button>
              <Button startIcon={<Plus size={16} />} onClick={openCreate}>
                {t("products.attributes.createBrand")}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("common.search")}
            </p>
            <div className="relative">
              <Input
                startIcon={<Search size={16} className="text-gray-400" />}
                className="pl-9"
                placeholder="Search by brand name"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t("common.status")}</p>
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
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{t("products.attributes.priority")}</p>
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
              {t("common.reset")}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Total: <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span>
          </span>
          <span className={cn("flex items-center gap-2", isFetching ? "opacity-100" : "opacity-60")}>
            <span className={cn("h-2 w-2 rounded-full", isFetching ? "bg-brand-500" : "bg-gray-400")} />
            {isFetching ? t("products.attributes.updating") : t("products.attributes.upToDate")}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                    {["SL", "Id", "Image", "Brand", "Status", "Priority", "Action"].map((h) => (
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
                  {rows.map((row, idx) => {
                    const imgUrl = toPublicUrl(row.img_path);

                    return (
                      <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {(page - 1) * limit + (idx + 1)}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {row.id}
                        </td>

                        <td className="px-4 py-4">
                          <div className="h-10 w-10 overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                            {imgUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imgUrl} alt={row.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
                                N/A
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {row.name}
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
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEdit(row.id)}
                              ariaLabel="Edit"
                              startIcon={<Pencil size={16} />}
                            />

                            <Button
                              variant="danger"
                              size="icon"
                              onClick={() => {
                                const ok = window.confirm(`Delete brand "${row.name}"?`);
                                if (!ok) return;
                                deleteMutation.mutate(row.id);
                              }}
                              ariaLabel="Delete"
                              disabled={deleteMutation.isPending}
                              startIcon={<Trash2 size={16} />}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!rows.length ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        {t("products.attributes.noBrands")}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <Pagination
              totalItems={total}
              page={page}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(next) => {
                setLimit(next);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      <BrandModal
        state={modal}
        setState={setModal}
        onSubmit={submitModal}
        submitting={createMutation.isPending || updateMutation.isPending}
        loadingSingle={singleLoading}
      />
    </div>
  );
}
