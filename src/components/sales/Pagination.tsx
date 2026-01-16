import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i += 1) out.push(i);
  return out;
}

function buildPages(page: number, totalPages: number) {
  if (totalPages <= 7) return range(1, totalPages);

  const pages: (number | "…")[] = [];
  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  pages.push(1);

  if (left > 2) pages.push("…");
  for (const p of range(left, right)) pages.push(p);
  if (right < totalPages - 1) pages.push("…");

  pages.push(totalPages);
  return pages;
}

const Pagination: React.FC<Props> = ({ page, pageSize, total, onPageChange, className }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = clamp(page, 1, totalPages);
  const items = buildPages(safePage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Page <span className="font-semibold text-gray-800 dark:text-white/90">{safePage}</span> of{" "}
        <span className="font-semibold text-gray-800 dark:text-white/90">{totalPages}</span> •{" "}
        <span className="font-semibold text-gray-800 dark:text-white/90">{total}</span> items
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className={cn(
            "h-9 rounded-lg border px-3 text-sm transition",
            "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
            "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]",
            safePage === 1 && "cursor-not-allowed opacity-60"
          )}
        >
          Prev
        </button>

        <div className="flex items-center gap-1">
          {items.map((it, idx) => {
            if (it === "…") {
              return (
                <span key={`dots-${idx}`} className="px-2 text-sm text-gray-400">
                  …
                </span>
              );
            }

            const active = it === safePage;
            return (
              <button
                key={it}
                type="button"
                onClick={() => onPageChange(it)}
                className={cn(
                  "h-9 min-w-[36px] rounded-lg px-2 text-sm transition",
                  active
                    ? "bg-brand-500 text-white"
                    : cn(
                        "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                        "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                      )
                )}
              >
                {it}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className={cn(
            "h-9 rounded-lg border px-3 text-sm transition",
            "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
            "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]",
            safePage === totalPages && "cursor-not-allowed opacity-60"
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
