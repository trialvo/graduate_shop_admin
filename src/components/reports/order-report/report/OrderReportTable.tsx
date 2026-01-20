"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

import type { OrderReportRow } from "../types";

type Props = { rows: OrderReportRow[]; isLoading?: boolean };

const money = (n: number) => `${Number(n || 0).toLocaleString()}৳`;

function orderStatusBadge(s: OrderReportRow["orderStatus"]) {
  if (s === "delivered") {
    return (
      <Badge size="sm" color="success" variant="light">
        Delivered
      </Badge>
    );
  }
  if (s === "cancelled" || s === "trash") {
    return (
      <Badge size="sm" color="error" variant="light">
        {s === "trash" ? "Trash" : "Cancelled"}
      </Badge>
    );
  }
  if (s === "returned") {
    return (
      <Badge size="sm" color="warning" variant="light">
        Returned
      </Badge>
    );
  }
  if (s === "on_hold") {
    return (
      <Badge size="sm" color="warning" variant="light">
        On Hold
      </Badge>
    );
  }
  return (
    <Badge size="sm" color="info" variant="light">
      {s.replace(/_/g, " ")}
    </Badge>
  );
}

function paymentStatusBadge(s: OrderReportRow["paymentStatus"]) {
  if (s === "paid") {
    return (
      <Badge size="sm" color="success" variant="light">
        Paid
      </Badge>
    );
  }
  if (s === "partial_paid") {
    return (
      <Badge size="sm" color="warning" variant="light">
        Partial Paid
      </Badge>
    );
  }
  return (
    <Badge size="sm" color="error" variant="light">
      Unpaid
    </Badge>
  );
}

function paymentTypeBadge(s: OrderReportRow["paymentType"]) {
  if (s === "gateway") {
    return (
      <Badge size="sm" color="primary" variant="light">
        Gateway
      </Badge>
    );
  }
  if (s === "mixed") {
    return (
      <Badge size="sm" color="warning" variant="light">
        Mixed
      </Badge>
    );
  }
  return (
    <Badge size="sm" color="info" variant="light">
      COD
    </Badge>
  );
}

const OrderReportTable: React.FC<Props> = ({ rows, isLoading }) => {
  const skeletonRows = React.useMemo(() => Array.from({ length: 10 }), []);

  return (
    <div className="rounded-[4px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="w-full overflow-hidden rounded-[4px]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table className="min-w-[1400px]">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-950">
                <TableCell
                  isHeader
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-[70px]"
                  )}
                >
                  Sl
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[140px]"
                >
                  Order ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[110px]"
                >
                  Type
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[220px]"
                >
                  Customer
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[160px]"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[100px] text-right"
                >
                  Items
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[150px] text-right"
                >
                  Total
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[150px] text-right"
                >
                  Cost
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[150px] text-right"
                >
                  Profit
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[150px]"
                >
                  Order Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[160px]"
                >
                  Payment
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[150px]"
                >
                  Method
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[200px]"
                >
                  Placed At
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading
                ? skeletonRows.map((_, idx) => (
                    <TableRow key={`sk-${idx}`} className="border-t border-gray-100 dark:border-gray-800">
                      {Array.from({ length: 13 }).map((__, cidx) => (
                        <TableCell key={`skc-${idx}-${cidx}`} className="px-4 py-3">
                          <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : rows.map((r, idx) => (
                    <TableRow
                      key={`${r.orderId}-${idx}`}
                      className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]"
                    >
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{idx + 1}</TableCell>
                      <TableCell className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {r.orderId}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {String(r.orderType ?? "-").toUpperCase()}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {r.customerName}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{r.phone}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 text-right">
                        {r.items}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                        {money(r.grandTotal)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 text-right">
                        {money(r.totalCost)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "px-4 py-3 text-sm text-right",
                          r.profit < 0 ? "text-error-600 dark:text-error-400" : "text-gray-700 dark:text-gray-200"
                        )}
                      >
                        {money(r.profit)}
                      </TableCell>
                      <TableCell className="px-4 py-3">{orderStatusBadge(r.orderStatus)}</TableCell>
                      <TableCell className="px-4 py-3">{paymentStatusBadge(r.paymentStatus)}</TableCell>
                      <TableCell className="px-4 py-3">{paymentTypeBadge(r.paymentType)}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{r.placedAt}</TableCell>
                    </TableRow>
                  ))}

              {!isLoading && rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={13} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    No report data found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default OrderReportTable;
