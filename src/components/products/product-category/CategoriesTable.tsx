"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import Button from "@/components/ui/button/Button";
import { toPublicUrl } from "@/config/env";
import type { CategoryEntity, MainCategory, SubCategory, ChildCategory } from "./types";

type Props = {
  tab: CategoryEntity;
  rows: (MainCategory | SubCategory | ChildCategory)[];
  loading: boolean;
  isRefreshing: boolean;
  onEdit: (entity: CategoryEntity, id: number) => void;
  onDelete: (entity: CategoryEntity, id: number) => void;
};

function Badge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "green" | "red" | "blue";
}) {
  const cls =
    tone === "green"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-200 dark:border-green-500/20"
      : tone === "red"
        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/20"
        : tone === "blue"
          ? "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-200 dark:border-brand-500/20"
          : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-gray-200 dark:border-gray-800";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold", cls)}>
      {children}
    </span>
  );
}

function ImageThumb({ src, alt }: { src?: string | null; alt: string }) {
  const full = src ? toPublicUrl(src) : "";
  if (!full) return <span className="text-xs text-gray-400">No image</span>;

  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 overflow-hidden rounded-[4px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={full} alt={alt} className="h-full w-full object-cover" />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">Has image</span>
    </div>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-white/10" />
        </td>
      ))}
    </tr>
  );
}

function Actions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Pencil size={14} className="mr-1" />
        Edit
      </Button>
      <Button variant="danger" size="sm" onClick={onDelete}>
        <Trash2 size={14} className="mr-1" />
        Delete
      </Button>
    </div>
  );
}

/** =========================
 *  MAIN hierarchy (Main -> Sub -> Child)
 *  ========================= */
function MainHierarchy({
  rows,
  loading,
  onEdit,
  onDelete,
}: Pick<Props, "rows" | "loading" | "onEdit" | "onDelete">) {
  const mains = rows as MainCategory[];
  const [openMain, setOpenMain] = useState<Record<number, boolean>>({});
  const [openSub, setOpenSub] = useState<Record<number, boolean>>({});

  const cols = 8;

  return (
    <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Main categories (hierarchy)</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Expand to view sub + child categories loaded from <span className="font-medium">mainCategories</span> API.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
            <tr>
              <th className="p-3"> </th>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Image</th>
              <th className="p-3">Status</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Priority</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-800 dark:text-gray-200">
            {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={cols} />)}

            {!loading && mains.length === 0 && (
              <tr>
                <td colSpan={cols} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No categories found for current filters.
                </td>
              </tr>
            )}

            {!loading &&
              mains.map((m) => {
                const subList = Array.isArray(m.sub_categories) ? m.sub_categories : [];
                const isOpen = Boolean(openMain[m.id]);

                return (
                  <React.Fragment key={m.id}>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-3">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                          onClick={() => setOpenMain((p) => ({ ...p, [m.id]: !p[m.id] }))}
                          aria-label={isOpen ? "Collapse" : "Expand"}
                        >
                          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>

                      <td className="p-3 font-semibold text-gray-900 dark:text-white">#{m.id}</td>

                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-semibold">{m.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {subList.length} sub category{subList.length === 1 ? "" : "ies"}
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <ImageThumb src={m.img_path} alt={m.name} />
                      </td>

                      <td className="p-3">
                        {m.status ? <Badge tone="green">Enabled</Badge> : <Badge tone="red">Disabled</Badge>}
                      </td>

                      <td className="p-3">{m.featured ? <Badge tone="green">Yes</Badge> : <Badge tone="gray">No</Badge>}</td>

                      <td className="p-3">
                        <Badge tone="gray">{m.priority}</Badge>
                      </td>

                      <td className="p-3">
                        <Actions
                          onEdit={() => onEdit("main", m.id)}
                          onDelete={() => onDelete("main", m.id)}
                        />
                      </td>
                    </tr>

                    {isOpen ? (
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td colSpan={cols} className="bg-gray-50/60 p-0 dark:bg-white/[0.03]">
                          <div className="p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                Sub categories
                              </div>
                              <Badge tone="blue">{subList.length} total</Badge>
                            </div>

                            {subList.length === 0 ? (
                              <div className="rounded-[4px] border border-gray-200 bg-white p-4 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                                No sub categories for this main category.
                              </div>
                            ) : (
                              <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-gray-50 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                                    <tr>
                                      <th className="p-3"> </th>
                                      <th className="p-3">ID</th>
                                      <th className="p-3">Name</th>
                                      <th className="p-3">Image</th>
                                      <th className="p-3">Status</th>
                                      <th className="p-3">Featured</th>
                                      <th className="p-3">Priority</th>
                                      <th className="p-3 text-right">Actions</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {subList.map((s) => {
                                      const childList = Array.isArray(s.child_categories) ? s.child_categories : [];
                                      const subOpenKey = s.id;
                                      const subIsOpen = Boolean(openSub[subOpenKey]);

                                      return (
                                        <React.Fragment key={s.id}>
                                          <tr className="border-t border-gray-100 dark:border-gray-800">
                                            <td className="p-3">
                                              <button
                                                type="button"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                                                onClick={() => setOpenSub((p) => ({ ...p, [subOpenKey]: !p[subOpenKey] }))}
                                                aria-label={subIsOpen ? "Collapse" : "Expand"}
                                              >
                                                {subIsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                              </button>
                                            </td>

                                            <td className="p-3 font-semibold text-gray-900 dark:text-white">#{s.id}</td>

                                            <td className="p-3">
                                              <div className="flex flex-col">
                                                <span className="font-semibold">{s.name}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                  main #{s.main_category_id} • {childList.length} child
                                                </span>
                                              </div>
                                            </td>

                                            <td className="p-3">
                                              <ImageThumb src={s.img_path} alt={s.name} />
                                            </td>

                                            <td className="p-3">
                                              {s.status ? <Badge tone="green">Enabled</Badge> : <Badge tone="red">Disabled</Badge>}
                                            </td>

                                            <td className="p-3">{s.featured ? <Badge tone="green">Yes</Badge> : <Badge tone="gray">No</Badge>}</td>

                                            <td className="p-3">
                                              <Badge tone="gray">{s.priority}</Badge>
                                            </td>

                                            <td className="p-3">
                                              <Actions
                                                onEdit={() => onEdit("sub", s.id)}
                                                onDelete={() => onDelete("sub", s.id)}
                                              />
                                            </td>
                                          </tr>

                                          {subIsOpen ? (
                                            <tr className="border-t border-gray-100 dark:border-gray-800">
                                              <td colSpan={8} className="bg-gray-50/60 p-0 dark:bg-white/[0.03]">
                                                <div className="p-4">
                                                  <div className="mb-3 flex items-center justify-between">
                                                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                      Child categories
                                                    </div>
                                                    <Badge tone="blue">{childList.length} total</Badge>
                                                  </div>

                                                  {childList.length === 0 ? (
                                                    <div className="rounded-[4px] border border-gray-200 bg-white p-4 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                                                      No child categories for this sub category.
                                                    </div>
                                                  ) : (
                                                    <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                                      <table className="w-full text-left text-sm">
                                                        <thead className="bg-gray-50 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                                                          <tr>
                                                            <th className="p-3">ID</th>
                                                            <th className="p-3">Name</th>
                                                            <th className="p-3">Image</th>
                                                            <th className="p-3">Status</th>
                                                            <th className="p-3">Featured</th>
                                                            <th className="p-3">Priority</th>
                                                            <th className="p-3 text-right">Actions</th>
                                                          </tr>
                                                        </thead>
                                                        <tbody>
                                                          {childList.map((c) => (
                                                            <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800">
                                                              <td className="p-3 font-semibold text-gray-900 dark:text-white">
                                                                #{c.id}
                                                              </td>
                                                              <td className="p-3">
                                                                <div className="flex flex-col">
                                                                  <span className="font-semibold">{c.name}</span>
                                                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    sub #{c.sub_category_id}
                                                                  </span>
                                                                </div>
                                                              </td>
                                                              <td className="p-3">
                                                                <ImageThumb src={c.img_path} alt={c.name} />
                                                              </td>
                                                              <td className="p-3">
                                                                {c.status ? <Badge tone="green">Enabled</Badge> : <Badge tone="red">Disabled</Badge>}
                                                              </td>
                                                              <td className="p-3">
                                                                {c.featured ? <Badge tone="green">Yes</Badge> : <Badge tone="gray">No</Badge>}
                                                              </td>
                                                              <td className="p-3">
                                                                <Badge tone="gray">{c.priority}</Badge>
                                                              </td>
                                                              <td className="p-3">
                                                                <Actions
                                                                  onEdit={() => onEdit("child", c.id)}
                                                                  onDelete={() => onDelete("child", c.id)}
                                                                />
                                                              </td>
                                                            </tr>
                                                          ))}
                                                        </tbody>
                                                      </table>
                                                    </div>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          ) : null}
                                        </React.Fragment>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** =========================
 *  SUB hierarchy (Sub -> Child)  ✅ NEW
 *  ========================= */
function SubHierarchy({
  rows,
  loading,
  isRefreshing,
  onEdit,
  onDelete,
}: Pick<Props, "rows" | "loading" | "isRefreshing" | "onEdit" | "onDelete">) {
  const subs = rows as SubCategory[];
  const [openSub, setOpenSub] = useState<Record<number, boolean>>({});

  const cols = 8;

  return (
    <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Sub categories (nested)</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Expand any sub category to view its child categories (from <span className="font-medium">subCategories</span> API).
          </p>
        </div>

        {isRefreshing ? (
          <div className="text-xs font-medium text-brand-600 dark:text-brand-200">Refreshing…</div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
            <tr>
              <th className="p-3"> </th>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Image</th>
              <th className="p-3">Main ID</th>
              <th className="p-3">Status</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Priority</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-800 dark:text-gray-200">
            {(loading || (isRefreshing && subs.length === 0)) &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={9} />)}

            {!loading && subs.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No sub categories found for current filters.
                </td>
              </tr>
            )}

            {!loading &&
              subs.map((s) => {
                const childList = Array.isArray(s.child_categories) ? s.child_categories : [];
                const isOpen = Boolean(openSub[s.id]);

                return (
                  <React.Fragment key={s.id}>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-3">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                          onClick={() => setOpenSub((p) => ({ ...p, [s.id]: !p[s.id] }))}
                          aria-label={isOpen ? "Collapse" : "Expand"}
                        >
                          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>

                      <td className="p-3 font-semibold text-gray-900 dark:text-white">#{s.id}</td>

                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-semibold">{s.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            main #{s.main_category_id} • {childList.length} child
                          </span>
                        </div>
                      </td>

                      <td className="p-3">
                        <ImageThumb src={s.img_path} alt={s.name} />
                      </td>

                      <td className="p-3">
                        <Badge tone="blue">main: {s.main_category_id}</Badge>
                      </td>

                      <td className="p-3">
                        {s.status ? <Badge tone="green">Enabled</Badge> : <Badge tone="red">Disabled</Badge>}
                      </td>

                      <td className="p-3">
                        {s.featured ? <Badge tone="green">Yes</Badge> : <Badge tone="gray">No</Badge>}
                      </td>

                      <td className="p-3">
                        <Badge tone="gray">{s.priority}</Badge>
                      </td>

                      <td className="p-3">
                        <Actions
                          onEdit={() => onEdit("sub", s.id)}
                          onDelete={() => onDelete("sub", s.id)}
                        />
                      </td>
                    </tr>

                    {isOpen ? (
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        <td colSpan={9} className="bg-gray-50/60 p-0 dark:bg-white/[0.03]">
                          <div className="p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                Child categories
                              </div>
                              <Badge tone="blue">{childList.length} total</Badge>
                            </div>

                            {childList.length === 0 ? (
                              <div className="rounded-[4px] border border-gray-200 bg-white p-4 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                                No child categories for this sub category.
                              </div>
                            ) : (
                              <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                <table className="w-full text-left text-sm">
                                  <thead className="bg-gray-50 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                                    <tr>
                                      <th className="p-3">ID</th>
                                      <th className="p-3">Name</th>
                                      <th className="p-3">Image</th>
                                      <th className="p-3">Sub ID</th>
                                      <th className="p-3">Status</th>
                                      <th className="p-3">Featured</th>
                                      <th className="p-3">Priority</th>
                                      <th className="p-3 text-right">Actions</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {childList.map((c) => (
                                      <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800">
                                        <td className="p-3 font-semibold text-gray-900 dark:text-white">#{c.id}</td>

                                        <td className="p-3">
                                          <div className="flex flex-col">
                                            <span className="font-semibold">{c.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              sub #{c.sub_category_id}
                                            </span>
                                          </div>
                                        </td>

                                        <td className="p-3">
                                          <ImageThumb src={c.img_path} alt={c.name} />
                                        </td>

                                        <td className="p-3">
                                          <Badge tone="blue">sub: {c.sub_category_id}</Badge>
                                        </td>

                                        <td className="p-3">
                                          {c.status ? <Badge tone="green">Enabled</Badge> : <Badge tone="red">Disabled</Badge>}
                                        </td>

                                        <td className="p-3">
                                          {c.featured ? <Badge tone="green">Yes</Badge> : <Badge tone="gray">No</Badge>}
                                        </td>

                                        <td className="p-3">
                                          <Badge tone="gray">{c.priority}</Badge>
                                        </td>

                                        <td className="p-3">
                                          <Actions
                                            onEdit={() => onEdit("child", c.id)}
                                            onDelete={() => onDelete("child", c.id)}
                                          />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** =========================
 *  DEFAULT flat tables (Child tab uses flat list)
 *  ========================= */
export default function CategoriesTable({ tab, rows, loading, isRefreshing, onEdit, onDelete }: Props) {
  const headerTitle = useMemo(() => {
    if (tab === "main") return "Main categories";
    if (tab === "sub") return "Sub categories";
    return "Child categories";
  }, [tab]);

  // MAIN
  if (tab === "main") {
    return <MainHierarchy rows={rows} loading={loading} onEdit={onEdit} onDelete={onDelete} />;
  }

  // ✅ SUB nested
  if (tab === "sub") {
    return (
      <SubHierarchy
        rows={rows}
        loading={loading}
        isRefreshing={isRefreshing}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  // CHILD flat list
  const cols = 8;

  return (
    <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{headerTitle}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Edit opens single item in modal (cached), delete uses TanStack mutation.
          </p>
        </div>

        {isRefreshing ? (
          <div className="text-xs font-medium text-brand-600 dark:text-brand-200">Refreshing…</div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Image</th>
              <th className="p-3">Sub ID</th>
              <th className="p-3">Status</th>
              <th className="p-3">Featured</th>
              <th className="p-3">Priority</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-800 dark:text-gray-200">
            {(loading || (isRefreshing && rows.length === 0)) &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={cols} />)}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={cols} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No categories found for current filters.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((r: any) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-b-0 dark:border-gray-800">
                  <td className="p-3 font-semibold text-gray-900 dark:text-white">#{r.id}</td>

                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-semibold">{r.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {r.updated_at ? `Updated: ${new Date(r.updated_at).toLocaleString()}` : ""}
                      </span>
                    </div>
                  </td>

                  <td className="p-3">
                    <ImageThumb src={r.img_path} alt={r.name} />
                  </td>

                  <td className="p-3">
                    <Badge tone="blue">sub: {r.sub_category_id}</Badge>
                  </td>

                  <td className="p-3">
                    {r.status ? <Badge tone="green">Enabled</Badge> : <Badge tone="red">Disabled</Badge>}
                  </td>

                  <td className="p-3">
                    {r.featured ? <Badge tone="green">Yes</Badge> : <Badge tone="gray">No</Badge>}
                  </td>

                  <td className="p-3">
                    <Badge tone="gray">{r.priority}</Badge>
                  </td>

                  <td className="p-3">
                    <Actions
                      onEdit={() => onEdit("child", r.id)}
                      onDelete={() => onDelete("child", r.id)}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
