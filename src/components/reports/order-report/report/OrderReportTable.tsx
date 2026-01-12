"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import type { OrderReportRow } from "../types";

type Props = { rows: OrderReportRow[] };

const money = (n: number) => `${n.toLocaleString()}৳`;

const statusBadge = (s: OrderReportRow["status"]) => {
  if (s === "completed") {
    return (
      <Badge size="sm" color="success" variant="light">
        Completed
      </Badge>
    );
  }
  if (s === "pending") {
    return (
      <Badge size="sm" color="warning" variant="light">
        Pending
      </Badge>
    );
  }
  return (
    <Badge size="sm" color="error" variant="light">
      Cancelled
    </Badge>
  );
};

const OrderReportTable: React.FC<Props> = ({ rows }) => {
  return (
    <div className="rounded-[4px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="w-full overflow-hidden rounded-[4px]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-950">
                <TableCell isHeader className={cn("px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[80px]")}>
                  Sl
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[160px]">
                  Order ID
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[220px]">
                  Customer
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[160px]">
                  Phone
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[110px] text-right">
                  Items
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[150px] text-right">
                  Amount
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[150px] text-right">
                  Cost
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[140px]">
                  Status
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[140px]">
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((r, idx) => (
                <TableRow
                  key={r.id}
                  className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
                >
                  <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                    {r.id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {r.customerName}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                    {r.phone}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 text-right">
                    {r.items}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                    {money(r.orderAmount)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 text-right">
                    {money(r.orderCost)}
                  </TableCell>
                  <TableCell className="px-4 py-3">{statusBadge(r.status)}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {r.createdAt}
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={9} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
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

export default OrderReportTable;
