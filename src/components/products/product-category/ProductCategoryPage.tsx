"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import {
  createChildCategory,
  createMainCategory,
  createSubCategory,
  updateChildCategory,
  updateMainCategory,
  updateSubCategory,
} from "@/api/categories.api";
import { categoriesKeys } from "@/hooks/categories/categories.keys";
import {
  useChildCategories,
  useDeleteChildCategory,
  useDeleteMainCategory,
  useDeleteSubCategory,
  useMainCategories,
  useMainCategoryOptions,
  useSubCategories,
  useSubCategoryOptions,
} from "@/hooks/categories/useCategories";
import type {
  CategoryEntity,
  ChildCategoryFormValues,
  ChildListParams,
  MainListParams,
  SubCategoryFormValues,
  SubListParams,
} from "./types";
import CreateEditCategoryModal, { type EditModalState } from "./CreateEditCategoryModal";
import CategoryFiltersBar from "./CategoryFiltersBar";
import CategoriesTable from "./CategoriesTable";

const TABS: { id: CategoryEntity; label: string; hint: string }[] = [
  { id: "main", label: "Main Categories", hint: "Top-level categories (includes sub & child hierarchy)" },
  { id: "sub", label: "Sub Categories", hint: "Second-level categories under a main category" },
  { id: "child", label: "Child Categories", hint: "Third-level categories under a sub category" },
];

function getApiErrorFromResponse(res: any) {
  if (typeof res?.error === "string" && res.error.trim()) return res.error.trim();
  if (typeof res?.message === "string" && res.message.trim()) return res.message.trim();
  if (Number.isFinite(Number(res?.flag)) && Number(res.flag) >= 400) return "Something went wrong";
  return null;
}

export default function ProductCategoryPage() {
  const qc = useQueryClient();

  const [tab, setTab] = useState<CategoryEntity>("main");

  // common filters
  const [name, setName] = useState("");
  const [status, setStatus] = useState<boolean | "all">("all");
  const [featured, setFeatured] = useState<boolean | "all">("all");
  const [priority, setPriority] = useState<number | "all">("all");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  // parent filters for sub / child
  const [mainCategoryId, setMainCategoryId] = useState<number | "all">("all");
  const [subCategoryId, setSubCategoryId] = useState<number | "all">("all");

  const baseParams = useMemo(() => {
    const p: Record<string, any> = {
      limit,
      offset,
    };
    if (name.trim()) p.name = name.trim();
    if (status !== "all") p.status = status;
    if (featured !== "all") p.featured = featured;
    if (priority !== "all") p.priority = priority;
    return p;
  }, [featured, limit, name, offset, priority, status]);

  const mainParams = useMemo(() => baseParams as MainListParams, [baseParams]);

  const subParams = useMemo(() => {
    const p = { ...baseParams } as SubListParams;
    if (mainCategoryId !== "all") p.main_category_id = mainCategoryId;
    return p;
  }, [baseParams, mainCategoryId]);

  const childParams = useMemo(() => {
    const p = { ...baseParams } as ChildListParams;
    if (subCategoryId !== "all") p.sub_category_id = subCategoryId;
    return p;
  }, [baseParams, subCategoryId]);

  // data
  const mainQ = useMainCategories(mainParams);
  const subQ = useSubCategories(subParams);
  const childQ = useChildCategories(childParams);

  // options
  const mainOptionsQ = useMainCategoryOptions();
  const subOptionsQ = useSubCategoryOptions(
    tab === "child" && mainCategoryId !== "all" ? mainCategoryId : undefined,
  );

  const delMain = useDeleteMainCategory();
  const delSub = useDeleteSubCategory();
  const delChild = useDeleteChildCategory();

  const [editState, setEditState] = useState<EditModalState>({
    open: false,
    entity: "main",
    mode: "create",
    id: null,
  });

  const currentQuery = tab === "main" ? mainQ : tab === "sub" ? subQ : childQ;

  const openCreate = () => setEditState({ open: true, entity: tab, mode: "create", id: null });
  const openEdit = (entity: CategoryEntity, id: number) =>
    setEditState({ open: true, entity, mode: "edit", id });

  const onDelete = (entity: CategoryEntity, id: number) => {
    const ok = window.confirm("Are you sure you want to delete this category?");
    if (!ok) return;

    if (entity === "main") delMain.mutate(id);
    if (entity === "sub") delSub.mutate(id);
    if (entity === "child") delChild.mutate(id);
  };

  const invalidateAll = async () => {
    await qc.invalidateQueries({ queryKey: categoriesKeys.all });
  };

  const handleSubmitCreateUpdate = async (
    entity: CategoryEntity,
    mode: "create" | "edit",
    id: number | null,
    values: any,
  ) => {
    try {
      let res: any;

      if (entity === "main") {
        if (mode === "create") res = await createMainCategory(values);
        else res = await updateMainCategory(id as number, values);
      }

      if (entity === "sub") {
        const v = values as SubCategoryFormValues;
        if (mode === "create") res = await createSubCategory(v);
        else res = await updateSubCategory(id as number, v);
      }

      if (entity === "child") {
        const v = values as ChildCategoryFormValues;
        if (mode === "create") res = await createChildCategory(v);
        else res = await updateChildCategory(id as number, v);
      }

      const apiError = getApiErrorFromResponse(res);
      if (apiError) {
        toast.error(apiError);
        return;
      }

      toast.success(mode === "create" ? "Category created" : "Category updated");
      await invalidateAll();
      setEditState((s) => ({ ...s, open: false }));
    } catch (e: any) {
      toast.error(e?.message || "Failed");
      throw e;
    }
  };

  const total = currentQuery.data?.total ?? 0;
  const isLoading = currentQuery.isLoading;
  const isRefreshing = currentQuery.isFetching && !currentQuery.isLoading;
  const rows = currentQuery.data?.data ?? [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 rounded-[4px] border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Product Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and manage main, sub, and child categories (TanStack caching + instant edits).
          </p>
        </div>

        {/* Tabs + create */}
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-wrap gap-2">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    setOffset(0);
                  }}
                  className={cn(
                    "inline-flex items-center rounded-[4px] border px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 md:mr-2">
              {TABS.find((x) => x.id === tab)?.hint}
            </div>

            <Button variant="primary" onClick={openCreate}>
              + Create {tab === "main" ? "Main" : tab === "sub" ? "Sub" : "Child"} Category
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <CategoryFiltersBar
        tab={tab}
        name={name}
        setName={setName}
        status={status}
        setStatus={setStatus}
        featured={featured}
        setFeatured={setFeatured}
        priority={priority}
        setPriority={setPriority}
        limit={limit}
        setLimit={setLimit}
        offset={offset}
        setOffset={setOffset}
        total={total}
        mainCategoryId={mainCategoryId}
        setMainCategoryId={setMainCategoryId}
        subCategoryId={subCategoryId}
        setSubCategoryId={setSubCategoryId}
        mainOptions={mainOptionsQ.data?.data ?? []}
        subOptions={subOptionsQ.data?.data ?? []}
        loadingMainOptions={mainOptionsQ.isLoading}
        loadingSubOptions={subOptionsQ.isLoading}
      />

      {/* Table */}
      <CategoriesTable
        tab={tab}
        rows={rows as any[]}
        loading={isLoading}
        isRefreshing={isRefreshing}
        onEdit={openEdit}
        onDelete={onDelete}
      />

      {/* Create/Edit Modal */}
      <CreateEditCategoryModal
        state={editState}
        onClose={() => setEditState((s) => ({ ...s, open: false }))}
        onSubmit={handleSubmitCreateUpdate}
        mainOptions={mainOptionsQ.data?.data ?? []}
        subOptions={subOptionsQ.data?.data ?? []}
      />
    </div>
  );
}
