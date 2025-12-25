"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import type { StockLevelStatus, StockReportRow } from "../types";

type Props = { rows: StockReportRow[] };

const statusBadge = (s: StockLevelStatus) => {
  if (s === "in_stock") {
    return (
      <Badge size="sm" color="success" variant="light">
        In Stock
      </Badge>
    );
  }
  if (s === "low_stock") {
    return (
      <Badge size="sm" color="warning" variant="light">
        Low Stock
      </Badge>
    );
  }
  return (
    <Badge size="sm" color="error" variant="light">
      Out of Stock
    </Badge>
  );
};

const StockReportTable: React.FC<Props> = ({ rows }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="w-full overflow-hidden rounded-2xl">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-950">
                <TableCell isHeader className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[80px]")}>
                  Sl
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[320px]">
                  Product
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[160px]">
                  SKU
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[280px]">
                  Category
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[120px] text-right">
                  Stock
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[140px] text-right">
                  Reorder
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[140px]">
                  Status
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[140px]">
                  Updated
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((r, idx) => {
                const isLow = r.status === "low_stock";
                const isOut = r.status === "out_of_stock";
                return (
                  <TableRow
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
                  >
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {idx + 1}
                    </TableCell>

                    <TableCell className="px-4 py-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[360px]">
                          {r.name}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{r.id}</div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {r.sku}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {r.categoryPath}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "text-sm font-extrabold",
                          isOut
                            ? "text-error-600 dark:text-error-500"
                            : isLow
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-gray-900 dark:text-white"
                        )}
                      >
                        {r.stockQty}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {r.reorderLevel}
                    </TableCell>

                    <TableCell className="px-4 py-3">{statusBadge(r.status)}</TableCell>

                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {r.lastUpdated}
                    </TableCell>
                  </TableRow>
                );
              })}

              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    No stock data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default StockReportTable;
