"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Download, FileDown, Search } from "lucide-react";

import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

import type { OrderReportRow, TimePeriodKey } from "../types";
import { ORDER_REPORT_ROWS } from "../mockData";
import { exportOrdersAsCsv, exportOrdersAsPrintablePdf } from "../exportUtils";
import OrderReportTable from "./OrderReportTable";

type Props = { period: TimePeriodKey };

const normalize = (s: string) => s.trim().toLowerCase();

const periodLabel = (p: TimePeriodKey) => {
  if (p === "today") return "Today";
  if (p === "last7") return "Last 7 Days";
  if (p === "thisMonth") return "This Month";
  return "This Year";
};

const OrderReportReport: React.FC<Props> = ({ period }) => {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | OrderReportRow["status"]>("all");

  const filtered = React.useMemo(() => {
    const q = normalize(query);
    return ORDER_REPORT_ROWS.filter((r) => {
      const matchQ =
        !q ||
        normalize(r.id).includes(q) ||
        normalize(r.customerName).includes(q) ||
        normalize(r.phone).includes(q);

      const matchStatus = status === "all" ? true : r.status === status;
      return matchQ && matchStatus;
    });
  }, [query, status]);

  const totals = React.useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.amount += r.orderAmount;
        acc.cost += r.orderCost;
        return acc;
      },
      { amount: 0, cost: 0 }
    );
  }, [filtered]);

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">All Reports</div>
            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Period: {periodLabel(period)} • Rows: {filtered.length}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <div className="relative w-full lg:w-[320px]">
              <Input
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                placeholder="Search order id, customer, phone..."
                className="h-11 rounded-[4px] border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pr-10"
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className={cn(
                "h-11 rounded-[4px] border border-gray-200 dark:border-gray-800",
                "bg-white dark:bg-gray-950 text-sm text-gray-900 dark:text-white",
                "px-3 outline-none focus:ring-2 focus:ring-brand-500/30"
              )}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <Button
              variant="outline"
              className="h-11"
              startIcon={<Download className="h-4 w-4" />}
              onClick={() => exportOrdersAsCsv(filtered)}
              type="button"
            >
              Export Excel
            </Button>

            <Button
              variant="outline"
              className="h-11"
              startIcon={<FileDown className="h-4 w-4" />}
              onClick={() => exportOrdersAsPrintablePdf(filtered, "Order Report")}
              type="button"
            >
              Export PDF
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Amount</div>
            <div className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">
              {totals.amount.toLocaleString()}৳
            </div>
          </div>

          <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Cost</div>
            <div className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">
              {totals.cost.toLocaleString()}৳
            </div>
          </div>
        </div>
      </div>

      <OrderReportTable rows={filtered} />
    </div>
  );
};

export default OrderReportReport;
