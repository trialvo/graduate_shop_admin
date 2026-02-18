import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
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
  const { t } = useTranslation();
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
        label: `${n} ${t("pagination.perPage")}`,
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
          {t("pagination.of")}{" "}
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
          <Button
            variant="outline"
            size="xs"
            onClick={() => go(safePage - 1)}
            disabled={safePage <= 1}
            startIcon={<ChevronLeft size={14} />}
            ariaLabel={t("pagination.previousPage")}
          />

          {/* Page pills — desktop */}
          <div className="hidden items-center gap-1 sm:flex">
            {items.map((it, idx) => {
              if (it === "ellipsis") {
                return (
                  <span
                    key={`el-${idx}`}
                    className="inline-flex h-7 w-7 items-center justify-center text-gray-400 dark:text-gray-500"
                  >
                    <MoreHorizontal size={14} />
                  </span>
                );
              }

              const active = it === safePage;
              return (
                <Button
                  key={it}
                  variant={active ? "primary" : "outline"}
                  size="xs"
                  onClick={() => go(it)}
                  className="min-w-[28px] px-1.5"
                  ariaLabel={t("pagination.page", { page: it })}
                >
                  {it}
                </Button>
              );
            })}
          </div>

          {/* Compact mobile indicator */}
          <span className="inline-flex h-7 items-center rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:hidden">
            {safePage}/{totalPages}
          </span>

          {/* Next button */}
          <Button
            variant="outline"
            size="xs"
            onClick={() => go(safePage + 1)}
            disabled={safePage >= totalPages}
            startIcon={<ChevronRight size={14} />}
            ariaLabel={t("pagination.nextPage")}
          />
        </div>
      </div>
    </div>
  );
}
