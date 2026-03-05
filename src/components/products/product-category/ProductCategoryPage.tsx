"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
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

const TABS: { id: CategoryEntity; labelKey: string; hintKey: string }[] = [
  { id: "main", labelKey: "products.categories.mainCategories", hintKey: "products.categories.mainHint" },
  { id: "sub", labelKey: "products.categories.subCategories", hintKey: "products.categories.subHint" },
  { id: "child", labelKey: "products.categories.childCategories", hintKey: "products.categories.childHint" },
];

function getApiErrorFromResponse(res: any) {
  if (typeof res?.error === "string" && res.error.trim()) return res.error.trim();
  if (typeof res?.message === "string" && res.message.trim()) return res.message.trim();
  if (Number.isFinite(Number(res?.flag)) && Number(res.flag) >= 400) return "products.categories.somethingWentWrong";
  return null;
}

export default function ProductCategoryPage() {
  const { t } = useTranslation();
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
    const ok = window.confirm(t("products.categories.confirmDelete"));
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

      toast.success(mode === "create" ? t("products.categories.categoryCreated") : t("products.categories.categoryUpdated"));
      await invalidateAll();
      setEditState((s) => ({ ...s, open: false }));
    } catch (e: any) {
      toast.error(e?.message || t("common.error"));
      throw e;
    }
  };

  const total = currentQuery.data?.total ?? 0;
  const isLoading = currentQuery.isLoading;
  const isRefreshing = currentQuery.isFetching && !currentQuery.isLoading;
  const rows = currentQuery.data?.data ?? [];

  return (
    <div className="w-full">
      {/* Combined header + tabs + filters */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Top bar: title + tabs + create */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800 md:flex-row md:items-center md:gap-4">
          <h1 className="shrink-0 text-base font-bold text-gray-900 dark:text-white">
            {t("products.categories.title")}
          </h1>

          {/* Tabs */}
          <div className="flex flex-1 flex-wrap gap-1.5">
            {TABS.map((tabItem) => {
              const active = tab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => { setTab(tabItem.id); setOffset(0); }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.03]",
                  )}
                >
                  {t(tabItem.labelKey)}
                  {active && total > 0 && (
                    <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
                      {total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Create button */}
          <Button variant="primary" size="sm" onClick={openCreate}>
            {tab === "main" ? t("products.categories.createMain") : tab === "sub" ? t("products.categories.createSub") : t("products.categories.createChild")}
          </Button>
        </div>

        {/* Filters + pagination */}
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
      </div>

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
