"use client";

import React, { useMemo } from "react";
import Select, { type Option } from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import type { CategoryEntity, MainCategory, SubCategory } from "./types";

type Props = {
  tab: CategoryEntity;

  name: string;
  setName: (v: string) => void;

  status: boolean | "all";
  setStatus: (v: boolean | "all") => void;

  featured: boolean | "all";
  setFeatured: (v: boolean | "all") => void;

  priority: number | "all";
  setPriority: (v: number | "all") => void;

  limit: number;
  setLimit: (v: number) => void;

  offset: number;
  setOffset: (v: number) => void;

  total: number;

  mainCategoryId: number | "all";
  setMainCategoryId: (v: number | "all") => void;

  subCategoryId: number | "all";
  setSubCategoryId: (v: number | "all") => void;

  mainOptions: MainCategory[];
  subOptions: SubCategory[];
  loadingMainOptions: boolean;
  loadingSubOptions: boolean;
};

export default function CategoryFiltersBar({
  tab,
  name,
  setName,
  status,
  setStatus,
  featured,
  setFeatured,
  priority,
  setPriority,
  limit,
  setLimit,
  offset,
  setOffset,
  total,
  mainCategoryId,
  setMainCategoryId,
  subCategoryId,
  setSubCategoryId,
  mainOptions,
  subOptions,
  loadingMainOptions,
  loadingSubOptions,
}: Props) {
  const pageFrom = total === 0 ? 0 : offset + 1;
  const pageTo = Math.min(offset + limit, total);

  const priorityOptions = useMemo(() => [1, 2, 3, 4, 5], []);

  const statusSelectOptions: Option[] = [
    { label: "All", value: "all" },
    { label: "Enabled", value: "true" },
    { label: "Disabled", value: "false" },
  ];

  const featuredSelectOptions: Option[] = [
    { label: "All", value: "all" },
    { label: "Featured", value: "true" },
    { label: "Not featured", value: "false" },
  ];

  const prioritySelectOptions: Option[] = [
    { label: "All", value: "all" },
    ...priorityOptions.map((p) => ({ label: String(p), value: String(p) })),
  ];

  const limitSelectOptions: Option[] = [5, 10, 20, 50].map((n) => ({
    label: String(n),
    value: String(n),
  }));

  const mainSelectOptions: Option[] = [
    { label: loadingMainOptions ? "Loading..." : "All main categories", value: "all" },
    ...mainOptions.map((m) => ({ label: `#${m.id} — ${m.name}`, value: String(m.id) })),
  ];

  const subSelectOptions: Option[] = [
    { label: loadingSubOptions ? "Loading..." : "All sub categories", value: "all" },
    ...subOptions.map((s) => ({ label: `#${s.id} — ${s.name}`, value: String(s.id) })),
  ];

  return (
    <div className="mb-4 rounded-[4px] border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Search */}
        <div className="md:col-span-4">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Search name</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setOffset(0);
            }}
            placeholder="Type category name..."
            className={cn(
              "h-11 w-full rounded-[4px] border bg-white px-3 text-sm text-gray-900 outline-none",
              "border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20",
              "dark:border-gray-800 dark:bg-gray-900 dark:text-white",
            )}
          />
        </div>

        {tab === "sub" ? (
          <div className="md:col-span-3">
            <Select
              label="Main category"
              value={mainCategoryId === "all" ? "all" : String(mainCategoryId)}
              options={mainSelectOptions}
              onChange={(v) => {
                setMainCategoryId(v === "all" ? "all" : Number(v));
                setOffset(0);
              }}
            />
          </div>
        ) : null}

        {tab === "child" ? (
          <div className="md:col-span-3">
            <Select
              label="Sub category"
              value={subCategoryId === "all" ? "all" : String(subCategoryId)}
              options={subSelectOptions}
              onChange={(v) => {
                setSubCategoryId(v === "all" ? "all" : Number(v));
                setOffset(0);
              }}
            />
          </div>
        ) : null}

        <div className="md:col-span-2">
          <Select
            label="Status"
            value={status === "all" ? "all" : status ? "true" : "false"}
            options={statusSelectOptions}
            onChange={(v) => {
              setStatus(v === "all" ? "all" : v === "true");
              setOffset(0);
            }}
          />
        </div>

        <div className="md:col-span-2">
          <Select
            label="Featured"
            value={featured === "all" ? "all" : featured ? "true" : "false"}
            options={featuredSelectOptions}
            onChange={(v) => {
              setFeatured(v === "all" ? "all" : v === "true");
              setOffset(0);
            }}
          />
        </div>

        <div className="md:col-span-1">
          <Select
            label="Priority"
            value={priority === "all" ? "all" : String(priority)}
            options={prioritySelectOptions}
            onChange={(v) => {
              setPriority(v === "all" ? "all" : Number(v));
              setOffset(0);
            }}
          />
        </div>

        <div className="md:col-span-2">
          <Select
            label="Per page"
            value={String(limit)}
            options={limitSelectOptions}
            onChange={(v) => {
              setLimit(Number(v));
              setOffset(0);
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300 md:flex-row md:items-center md:justify-between">
        <div>
          Showing <span className="font-semibold text-gray-900 dark:text-white">{pageFrom}</span>–{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{pageTo}</span> of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
