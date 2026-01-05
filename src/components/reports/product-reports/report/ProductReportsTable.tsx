"use client";

import React from "react";

import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

import type { ProductReportRow } from "../types";

type Props = {
  rows: ProductReportRow[];
};

const money = (n: number) => n.toLocaleString();

const statusBadge = (status: ProductReportRow["status"]) => {
  return status === "active" ? (
    <Badge size="sm" color="success" variant="light">
      Active
    </Badge>
  ) : (
    <Badge size="sm" color="error" variant="light">
      Inactive
    </Badge>
  );
};

const ProductReportsTable: React.FC<Props> = ({ rows }) => {
  return (
    <div className="rounded-[4px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="w-full overflow-hidden rounded-[4px]">
        {/*
          IMPORTANT:
          - Keep the X scroll INSIDE the table area
          - Prevent the whole page from getting an X scrollbar
        */}
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-950">
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[80px]"
                >
                  Sl
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[280px]"
                >
                  Product
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[160px]"
                >
                  SKU
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[260px]"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[120px] text-right"
                >
                  Stock
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[120px] text-right"
                >
                  Sold
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[140px] text-right"
                >
                  Revenue
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[140px] text-right"
                >
                  Cost
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[140px] text-right"
                >
                  Profit
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[120px]"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[140px]"
                >
                  Updated
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((r, idx) => {
                const lowStock = r.stockQty <= 10;
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
                        <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[320px]">
                          {r.name}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{r.id}</div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {r.sku}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {r.categoryPath}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right">
                      <span
                        className={[
                          "font-semibold",
                          lowStock
                            ? "text-error-600 dark:text-error-500"
                            : "text-gray-900 dark:text-white",
                        ].join(" ")}
                      >
                        {r.stockQty}
                      </span>
                      {lowStock && (
                        <span className="ml-2 rounded-full border border-error-100 bg-error-50 px-2 py-0.5 text-xs font-semibold text-error-600 dark:border-error-500/20 dark:bg-error-500/15 dark:text-error-400">
                          Low
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {r.soldQty}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-200">
                      {money(r.revenue)}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-200">
                      {money(r.cost)}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {money(r.profit)}
                    </TableCell>

                    <TableCell className="px-4 py-3">{statusBadge(r.status)}</TableCell>

                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {r.updatedAt}
                    </TableCell>
                  </TableRow>
                );
              })}

              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={11}
                    className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    No report data found.
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

export default ProductReportsTable;
