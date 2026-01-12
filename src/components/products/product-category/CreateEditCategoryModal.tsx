"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

import type {
  CategoryEntity,
  CategoryFormValues,
  ChildCategoryFormValues,
  MainCategory,
  SubCategory,
  SubCategoryFormValues,
} from "@/components/products/product-category/types";

import { useCategorySingle } from "@/hooks/categories/useCategorySingle";
import ImagePickerSquare from "@/components/products/product-category/ImagePickerSquare";
import Select, { type Option } from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

export type EditModalState = {
  open: boolean;
  entity: CategoryEntity;
  mode: "create" | "edit";
  id: number | null;
};

type Props = {
  state: EditModalState;
  onClose: () => void;
  onSubmit: (
    entity: CategoryEntity,
    mode: "create" | "edit",
    id: number | null,
    values: any,
  ) => Promise<void>;
  mainOptions: MainCategory[];
  subOptions: SubCategory[];
  isSaving?: boolean;
};

const defaultValues: CategoryFormValues = {
  name: "",
  priority: 1,
  status: true,
  featured: true,
  category_img: null,
};

export default function CreateEditCategoryModal({
  state,
  onClose,
  onSubmit,
  mainOptions,
  subOptions,
  isSaving = false,
}: Props) {
  const { open, entity, mode, id } = state;

  const singleQ = useCategorySingle(entity, id, open && mode === "edit");

  const [values, setValues] = useState<any>(defaultValues);
  const [existingImg, setExistingImg] = useState<string | null>(null);

  const title = useMemo(() => {
    const name = entity === "main" ? "Main" : entity === "sub" ? "Sub" : "Child";
    return mode === "create" ? `Create ${name} Category` : `Edit ${name} Category`;
  }, [entity, mode]);

  // ✅ options for your Select component
  const mainSelectOptions: Option[] = useMemo(
    () => mainOptions.map((m) => ({ value: String(m.id), label: `#${m.id} — ${m.name}` })),
    [mainOptions],
  );

  const subSelectOptions: Option[] = useMemo(
    () => subOptions.map((s) => ({ value: String(s.id), label: `#${s.id} — ${s.name}` })),
    [subOptions],
  );

  const statusOptions: Option[] = useMemo(
    () => [
      { value: "true", label: "Enabled" },
      { value: "false", label: "Disabled" },
    ],
    [],
  );

  const featuredOptions: Option[] = useMemo(
    () => [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
    [],
  );

  // ✅ reset stale values when opening edit / switching target id
  useEffect(() => {
    if (!open) return;
    if (mode !== "edit") return;

    setValues({ ...defaultValues });
    setExistingImg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, entity, id]);

  // create mode defaults
  useEffect(() => {
    if (!open) return;
    if (mode !== "create") return;

    setExistingImg(null);

    setValues(() => {
      if (entity === "sub") {
        const first = mainOptions[0]?.id ?? 0;
        const v: SubCategoryFormValues = { ...defaultValues, main_category_id: first };
        return v;
      }
      if (entity === "child") {
        const first = subOptions[0]?.id ?? 0;
        const v: ChildCategoryFormValues = { ...defaultValues, sub_category_id: first };
        return v;
      }
      return { ...defaultValues };
    });
  }, [entity, mainOptions, mode, open, subOptions]);

  // edit mode fill
  useEffect(() => {
    if (!open) return;
    if (mode !== "edit") return;
    if (!singleQ.data) return;

    const d: any = singleQ.data;

    setExistingImg(d.img_path ?? null);

    setValues(() => {
      const base = {
        name: d.name ?? "",
        priority: Number(d.priority ?? 1),
        status: Boolean(d.status),
        featured: Boolean(d.featured),
        category_img: null,
      };

      if (entity === "sub") return { ...base, main_category_id: Number(d.main_category_id ?? 0) };
      if (entity === "child") return { ...base, sub_category_id: Number(d.sub_category_id ?? 0) };
      return base;
    });
  }, [entity, mode, open, singleQ.data]);

  if (!open) return null;

  const isBusy = singleQ.isFetching || singleQ.isLoading || isSaving;

  const submitDisabled =
    isBusy ||
    !values?.name?.trim() ||
    (entity === "sub" && !values?.main_category_id) ||
    (entity === "child" && !values?.sub_category_id);

  const inputClass = cn(
    "h-10 w-full rounded-lg px-3 text-sm outline-none",
    "bg-white text-gray-900 ring-1 ring-inset ring-gray-200 focus:ring-[3px] focus:ring-brand-500/30",
    "dark:bg-gray-950 dark:text-white dark:ring-gray-800 dark:focus:ring-brand-500/20",
    isBusy && "opacity-70",
  );

  const closeDisabled = isBusy; // keep like your UI

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-[820px] overflow-hidden rounded-2xl bg-white shadow-theme-xs ring-1 ring-inset ring-gray-200 dark:bg-gray-950 dark:ring-gray-800">
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mode === "edit" ? "Loaded via TanStack Query (single fetch + cache)" : "Create with multipart/form-data"}
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={onClose} disabled={closeDisabled}>
            Close
          </Button>
        </div>

        {/* body */}
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Left: image */}
            <div className="md:col-span-4">
              <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-inset ring-gray-200 dark:bg-gray-900/40 dark:ring-gray-800">
                <ImagePickerSquare
                  label="Category Image"
                  hint="png/jpg recommended"
                  value={values.category_img ?? null}
                  existingUrl={existingImg}
                  onChange={(file) => setValues((p: any) => ({ ...p, category_img: file }))}
                />
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Upload a new image to replace. If empty, backend may keep the previous image.
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div className="md:col-span-8">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-12">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    value={values.name}
                    onChange={(e) => setValues((p: any) => ({ ...p, name: e.target.value }))}
                    className={inputClass}
                    placeholder="Category name"
                    disabled={isBusy}
                  />
                </div>

                {entity === "sub" && (
                  <div className="md:col-span-12">
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                      Main category
                    </label>

                    <Select
                      options={mainSelectOptions}
                      placeholder={mainSelectOptions.length ? "Select main category" : "No main categories"}
                      value={values.main_category_id ? String(values.main_category_id) : ""}
                      onChange={(v) => setValues((p: any) => ({ ...p, main_category_id: Number(v) }))}
                      disabled={isBusy || mainSelectOptions.length === 0}
                    />
                  </div>
                )}

                {entity === "child" && (
                  <div className="md:col-span-12">
                    <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                      Sub category
                    </label>

                    <Select
                      options={subSelectOptions}
                      placeholder={subSelectOptions.length ? "Select sub category" : "No sub categories"}
                      value={values.sub_category_id ? String(values.sub_category_id) : ""}
                      onChange={(v) => setValues((p: any) => ({ ...p, sub_category_id: Number(v) }))}
                      disabled={isBusy || subSelectOptions.length === 0}
                    />
                  </div>
                )}

                <div className="md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Priority
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={String(values.priority)}
                    onChange={(e) =>
                      setValues((p: any) => ({ ...p, priority: Number(e.target.value || 1) }))
                    }
                    className={inputClass}
                    disabled={isBusy}
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Status
                  </label>
                  <Select
                    options={statusOptions}
                    value={values.status ? "true" : "false"}
                    onChange={(v) => setValues((p: any) => ({ ...p, status: v === "true" }))}
                    disabled={isBusy}
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Featured
                  </label>
                  <Select
                    options={featuredOptions}
                    value={values.featured ? "true" : "false"}
                    onChange={(v) => setValues((p: any) => ({ ...p, featured: v === "true" }))}
                    disabled={isBusy}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <Button variant="outline" onClick={onClose} disabled={isBusy}>
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  onClick={() => onSubmit(entity, mode, id, values)}
                  disabled={submitDisabled}
                  isLoading={isSaving}
                  loadingText="Saving..."
                >
                  {mode === "create" ? "Create" : "Update"}
                </Button>
              </div>

              {mode === "edit" && singleQ.isError ? (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20">
                  Failed to load category. Try again.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ✅ overlay loader (prevents click while fetching/saving) */}
        {isBusy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] dark:bg-black/40">
            <div className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs ring-1 ring-inset ring-gray-200 dark:bg-gray-950 dark:text-gray-200 dark:ring-gray-800">
              Loading...
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
