"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Select, { type Option } from "@/components/form/Select";
import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/config/env";

import type {
  CategoryEntity,
  CategoryFormValues,
  ChildCategoryFormValues,
  MainCategory,
  SubCategory,
  SubCategoryFormValues,
} from "./types";
import { useCategorySingle } from "@/hooks/categories/useCategorySingle";
import ImagePickerSquare from "./ImagePickerSquare";

export type EditModalState = {
  open: boolean;
  entity: CategoryEntity;
  mode: "create" | "edit";
  id: number | null;
};

type Props = {
  state: EditModalState;
  onClose: () => void;
  onSubmit: (entity: CategoryEntity, mode: "create" | "edit", id: number | null, values: any) => Promise<void>;
  mainOptions: MainCategory[];
  subOptions: SubCategory[];
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
}: Props) {
  const { open, entity, mode, id } = state;

  const singleQ = useCategorySingle(entity, id, open && mode === "edit");

  const [values, setValues] = useState<any>(defaultValues);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const title = useMemo(() => {
    const name = entity === "main" ? "Main" : entity === "sub" ? "Sub" : "Child";
    return mode === "create" ? `Create ${name} Category` : `Edit ${name} Category`;
  }, [entity, mode]);

  const statusOptions: Option[] = useMemo(
    () => [
      { label: "Enabled", value: "true" },
      { label: "Disabled", value: "false" },
    ],
    [],
  );

  const featuredOptions: Option[] = useMemo(
    () => [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
    [],
  );

  const mainSelectOptions: Option[] = useMemo(() => {
    return mainOptions.map((m) => ({
      value: String(m.id),
      label: `#${m.id} - ${m.name}`,
    }));
  }, [mainOptions]);

  const subSelectOptions: Option[] = useMemo(() => {
    return subOptions.map((s) => ({
      value: String(s.id),
      label: `#${s.id} - ${s.name}`,
    }));
  }, [subOptions]);

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      setValues(() => {
        if (entity === "sub") {
          const v: SubCategoryFormValues = {
            ...defaultValues,
            main_category_id: mainOptions[0]?.id ?? 0,
          };
          return v;
        }
        if (entity === "child") {
          const v: ChildCategoryFormValues = {
            ...defaultValues,
            sub_category_id: subOptions[0]?.id ?? 0,
          };
          return v;
        }
        return { ...defaultValues };
      });
      setExistingImageUrl(null);
      return;
    }

    // edit mode: clear any previous form state while loading the new single
    setValues(() => {
      if (entity === "sub") {
        const v: SubCategoryFormValues = {
          ...defaultValues,
          main_category_id: mainOptions[0]?.id ?? 0,
        };
        return v;
      }
      if (entity === "child") {
        const v: ChildCategoryFormValues = {
          ...defaultValues,
          sub_category_id: subOptions[0]?.id ?? 0,
        };
        return v;
      }
      return { ...defaultValues };
    });
    setExistingImageUrl(null);
  }, [entity, mainOptions, mode, open, subOptions, id]);

  useEffect(() => {
    if (!open) return;
    if (mode !== "edit") return;
    if (!singleQ.data) return;

    const d: any = singleQ.data;

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

    setExistingImageUrl(d.img_path ? toPublicUrl(d.img_path) : null);
  }, [entity, mode, open, singleQ.data]);

  const submitDisabled =
    isSaving ||
    !values?.name?.trim() ||
    (entity === "sub" && !values?.main_category_id) ||
    (entity === "child" && !values?.sub_category_id);

  const busyText = mode === "create" ? "Creating..." : "Updating...";

  const onSave = async () => {
    if (submitDisabled) return;
    setIsSaving(true);
    try {
      await onSubmit(entity, mode, id, values);
    } catch {
      // toast + message handled in parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-[860px] overflow-hidden rounded-[4px] bg-white shadow-theme-lg dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {mode === "edit" ? "Single item loads from TanStack query (cached)." : "Create category using form-data."}
            </p>
          </div>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Close
          </Button>
        </div>

        {/* Body */}
        <div className="p-5">
          {mode === "edit" && singleQ.isFetching ? (
            <div className="mb-4 rounded-[4px] border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-200">
              Loading category details...
            </div>
          ) : null}

          {mode === "edit" && singleQ.isError ? (
            <div className="mb-4 rounded-[4px] border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
              Failed to load category details.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
            {/* Image */}
            <div className="md:col-span-4">
              <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <ImagePickerSquare
                  label="Category image"
                  hint="(optional)"
                  value={values.category_img ?? null}
                  existingUrl={existingImageUrl}
                  onChange={(file) => setValues((p: any) => ({ ...p, category_img: file }))}
                />
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  If you don&apos;t upload a new image, the existing image will remain.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="md:col-span-12">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    value={values.name}
                    onChange={(e) => setValues((p: any) => ({ ...p, name: e.target.value }))}
                    placeholder="Category name"
                    className={cn(
                      "h-11 w-full rounded-[4px] border bg-white px-3 text-sm text-gray-900 outline-none",
                      "border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20",
                      "dark:border-gray-800 dark:bg-gray-900 dark:text-white",
                    )}
                  />
                </div>

                {entity === "sub" ? (
                  <div className="md:col-span-12">
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Main category
                    </label>
                    <Select
                      value={String(values.main_category_id ?? "")}
                      options={mainSelectOptions}
                      onChange={(v) => setValues((p: any) => ({ ...p, main_category_id: Number(v) }))}
                    />
                  </div>
                ) : null}

                {entity === "child" ? (
                  <div className="md:col-span-12">
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sub category
                    </label>
                    <Select
                      value={String(values.sub_category_id ?? "")}
                      options={subSelectOptions}
                      onChange={(v) => setValues((p: any) => ({ ...p, sub_category_id: Number(v) }))}
                    />
                  </div>
                ) : null}

                <div className="md:col-span-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                  <input
                    type="number"
                    min={1}
                    value={String(values.priority ?? 1)}
                    onChange={(e) =>
                      setValues((p: any) => ({
                        ...p,
                        priority: Number(e.target.value || 1),
                      }))
                    }
                    className={cn(
                      "h-11 w-full rounded-[4px] border bg-white px-3 text-sm text-gray-900 outline-none",
                      "border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20",
                      "dark:border-gray-800 dark:bg-gray-900 dark:text-white",
                    )}
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <Select
                    value={values.status ? "true" : "false"}
                    options={statusOptions}
                    onChange={(v) => setValues((p: any) => ({ ...p, status: v === "true" }))}
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Featured
                  </label>
                  <Select
                    value={values.featured ? "true" : "false"}
                    options={featuredOptions}
                    onChange={(v) => setValues((p: any) => ({ ...p, featured: v === "true" }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={submitDisabled}
            isLoading={isSaving}
            loadingText={busyText}
          >
            {mode === "create" ? "Create" : "Update"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
