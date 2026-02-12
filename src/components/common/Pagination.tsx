import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useMemo } from "react";

import Select from "@/components/form/Select";
import { cn } from "@/lib/utils";

type PageItem = number | "ellipsis";

export type PaginationProps = {
  totalItems: number;
  page: number; // 1-based
  pageSize: number;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange?: (nextPageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function buildPageItems(totalPages: number, page: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PageItem[] = [];
  const showLeft = page > 3;
  const showRight = page < totalPages - 2;

  items.push(1);

  if (showLeft) items.push("ellipsis");

  const start = clamp(page - 1, 2, totalPages - 1);
  const end = clamp(page + 1, 2, totalPages - 1);

  for (let p = start; p <= end; p += 1) {
    if (p !== 1 && p !== totalPages) items.push(p);
  }

  if (showRight) items.push("ellipsis");

  items.push(totalPages);

  return items.filter((x, idx) => idx === 0 || x !== items[idx - 1]);
}

export default function Pagination({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: PaginationProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / Math.max(1, pageSize))
  );
  const safePage = clamp(page, 1, totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);

  const items = useMemo(
    () => buildPageItems(totalPages, safePage),
    [totalPages, safePage]
  );

  const pageSizeSelectOptions = useMemo(
    () =>
      pageSizeOptions.map((n) => ({
        value: String(n),
        label: `${n} / page`,
      })),
    [pageSizeOptions]
  );

  const go = (p: number) => onPageChange(clamp(p, 1, totalPages));

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200/80 bg-white px-3 py-2.5 shadow-sm",
        "dark:border-gray-800 dark:bg-gray-900",
        className
      )}
    >
      {/* Row — always flex-wrap so it never overflows */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Summary text */}
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {start}–{end}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {totalItems}
          </span>
        </p>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Page size select */}
          {onPageSizeChange ? (
            <div className="w-[110px]">
              <Select
                key={`pageSize-${pageSize}`}
                options={pageSizeSelectOptions}
                placeholder="Size"
                defaultValue={String(pageSize)}
                onChange={(v) => {
                  const next = Number(v);
                  if (!Number.isFinite(next) || next <= 0) return;
                  onPageSizeChange(next);
                }}
              />
            </div>
          ) : null}

          {/* Prev button */}
          <button
            type="button"
            onClick={() => go(safePage - 1)}
            disabled={safePage <= 1}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition",
              "hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Page pills — desktop */}
          <div className="hidden items-center gap-1 sm:flex">
            {items.map((it, idx) => {
              if (it === "ellipsis") {
                return (
                  <span
                    key={`el-${idx}`}
                    className="inline-flex h-8 w-8 items-center justify-center text-gray-400 dark:text-gray-500"
                  >
                    <MoreHorizontal size={14} />
                  </span>
                );
              }

              const active = it === safePage;
              return (
                <button
                  key={it}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => go(it)}
                  className={cn(
                    "inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-semibold transition",
                    active
                      ? "bg-brand-500 text-white shadow-sm"
                      : cn(
                        "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                        "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      )
                  )}
                >
                  {it}
                </button>
              );
            })}
          </div>

          {/* Compact mobile indicator */}
          <span className="inline-flex h-8 items-center rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:hidden">
            {safePage}/{totalPages}
          </span>

          {/* Next button */}
          <button
            type="button"
            onClick={() => go(safePage + 1)}
            disabled={safePage >= totalPages}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition",
              "hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
