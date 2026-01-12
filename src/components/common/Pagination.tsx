import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useMemo } from "react";

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

  const PagePill = ({
    active,
    children,
    onClick,
    disabled,
    ariaCurrent,
  }: {
    active?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    ariaCurrent?: "page";
  }) => {
    if (!onClick) {
      return (
        <span
          className={cn(
            "inline-flex h-9 min-w-[40px] items-center justify-center rounded-[4px] px-3 text-sm font-semibold",
            "border border-transparent text-gray-500 dark:text-gray-400"
          )}
        >
          {children}
        </span>
      );
    }

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-current={ariaCurrent}
        className={cn(
          "inline-flex h-9 min-w-[40px] items-center justify-center rounded-[4px] px-3 text-sm font-semibold",
          "transition outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/30",
          active
            ? "bg-brand-500 text-white shadow-theme-xs"
            : cn(
                "border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50",
                "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]"
              ),
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {children}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "rounded-[4px] border border-gray-200 bg-white px-4 py-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900",
        "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      {/* Left summary */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Showing <span className="font-semibold">{start}</span>–{" "}
          <span className="font-semibold">{end}</span> of{" "}
          <span className="font-semibold">{totalItems}</span>
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>
            Page <span className="font-semibold text-gray-700 dark:text-gray-200">{safePage}</span>{" "}
            /{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">{totalPages}</span>
          </span>

          <span className="hidden h-3 w-px bg-gray-200 dark:bg-gray-800 sm:inline-block" />

          {/* Quick jump (nice on long lists) */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Jump:</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => go(1)}
                disabled={safePage <= 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => go(totalPages)}
                disabled={safePage >= totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {onPageSizeChange ? (
          <div className="min-w-[170px]">
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

          {/* Pages (desktop) */}
          <div className="hidden items-center gap-1 md:flex">
            {items.map((it, idx) => {
              if (it === "ellipsis") {
                return (
                  <PagePill key={`el-${idx}`}>
                    <MoreHorizontal size={16} />
                  </PagePill>
                );
              }

              const active = it === safePage;
              return (
                <PagePill
                  key={it}
                  active={active}
                  ariaCurrent={active ? "page" : undefined}
                  onClick={() => go(it)}
                >
                  {it}
                </PagePill>
              );
            })}
          </div>

          {/* Compact mobile indicator */}
          <div className="flex items-center rounded-[4px] border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 md:hidden">
            {safePage} / {totalPages}
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
