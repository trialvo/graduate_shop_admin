import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

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
  if (totalPages <= 7) {
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

  // de-dup (edge cases)
  return items.filter((x, idx) => idx === 0 || x !== items[idx - 1]);
}

export default function Pagination({
  totalItems,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
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
      className={`flex flex-col gap-3 border-t border-gray-200 px-4 py-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between ${className}`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Showing <span className="font-semibold">{start}</span> -{" "}
          <span className="font-semibold">{end}</span> of{" "}
          <span className="font-semibold">{totalItems}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Page {safePage} / {totalPages}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {onPageSizeChange ? (
          <div className="min-w-[160px]">
            <Select
              key={`pageSize-${pageSize}`}
              options={pageSizeSelectOptions}
              placeholder="Page size"
              defaultValue={String(pageSize)}
              onChange={(v) => {
                const next = Number(v);
                if (!Number.isFinite(next) || next <= 0) return;
                onPageSizeChange(next);
              }}
            />
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => go(safePage - 1)}
            disabled={safePage <= 1}
            startIcon={<ChevronLeft size={16} />}
          >
            Prev
          </Button>

          <div className="hidden items-center gap-1 md:flex">
            {items.map((it, idx) => {
              if (it === "ellipsis") {
                return (
                  <span
                    key={`el-${idx}`}
                    className="px-2 text-sm font-semibold text-gray-500 dark:text-gray-400"
                  >
                    …
                  </span>
                );
              }

              const active = it === safePage;
              return (
                <button
                  key={it}
                  type="button"
                  onClick={() => go(it)}
                  className={[
                    "h-9 min-w-[36px] rounded-lg px-3 text-sm font-semibold transition",
                    active
                      ? "bg-brand-500 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {it}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => go(safePage + 1)}
            disabled={safePage >= totalPages}
            endIcon={<ChevronRight size={16} />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
