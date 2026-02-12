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
    <div className={cn("flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5 dark:border-gray-800 dark:bg-white/[0.02]", className)}>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Page <span className="font-semibold text-gray-800 dark:text-white">{safePage}</span> of{" "}
        <span className="font-semibold text-gray-800 dark:text-white">{totalPages}</span> •{" "}
        <span className="font-semibold text-gray-800 dark:text-white">{total}</span> items
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className={cn(
            "h-8 rounded-lg border px-3 text-xs font-medium transition",
            "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
            "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
            safePage === 1 && "cursor-not-allowed opacity-50"
          )}
        >
          Prev
        </button>

        <div className="flex items-center gap-1">
          {items.map((it, idx) => {
            if (it === "…") {
              return (
                <span key={`dots-${idx}`} className="px-1.5 text-xs text-gray-400">
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
                  "h-8 min-w-[32px] rounded-lg px-2 text-xs font-medium transition",
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

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className={cn(
            "h-8 rounded-lg border px-3 text-xs font-medium transition",
            "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
            "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700",
            safePage === totalPages && "cursor-not-allowed opacity-50"
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
