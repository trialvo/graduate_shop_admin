"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Download, FileDown, Search } from "lucide-react";

import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

import type { StockLevelStatus, StockReportRow, TimePeriodKey } from "../types";
import { STOCK_REPORT_ROWS } from "../mockData";
import { exportStockAsCsv, exportStockAsPrintablePdf } from "../exportUtils";
import StockReportTable from "./StockReportTable";

type Props = { period: TimePeriodKey };

const normalize = (s: string) => s.trim().toLowerCase();

const periodLabel = (p: TimePeriodKey) => {
  if (p === "today") return "Today";
  if (p === "last7") return "Last 7 Days";
  if (p === "thisMonth") return "This Month";
  return "This Year";
};

const StockReportReport: React.FC<Props> = ({ period }) => {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | StockLevelStatus>("all");
  const [category, setCategory] = React.useState<string>("all");

  const categoryOptions = React.useMemo(() => {
    const set = new Set<string>();
    STOCK_REPORT_ROWS.forEach((r) => set.add(r.categoryPath.split(">")[0].trim()));
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "all", label: "All Categories" }, ...list.map((x) => ({ value: x, label: x }))];
  }, []);

  const filtered = React.useMemo(() => {
    const q = normalize(query);

    return STOCK_REPORT_ROWS.filter((r) => {
      const matchQ =
        !q ||
        normalize(r.name).includes(q) ||
        normalize(r.sku).includes(q) ||
        normalize(r.categoryPath).includes(q) ||
        normalize(r.id).includes(q);

      const matchStatus = status === "all" ? true : r.status === status;
      const rootCategory = r.categoryPath.split(">")[0].trim();
      const matchCategory = category === "all" ? true : rootCategory === category;

      return matchQ && matchStatus && matchCategory;
    });
  }, [query, status, category]);

  const totals = React.useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.totalStock += r.stockQty;
        acc.lowCount += r.status === "low_stock" ? 1 : 0;
        acc.outCount += r.status === "out_of_stock" ? 1 : 0;
        return acc;
      },
      { totalStock: 0, lowCount: 0, outCount: 0 }
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
                placeholder="Search product, sku, category..."
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
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={cn(
                "h-11 rounded-[4px] border border-gray-200 dark:border-gray-800",
                "bg-white dark:bg-gray-950 text-sm text-gray-900 dark:text-white",
                "px-3 outline-none focus:ring-2 focus:ring-brand-500/30"
              )}
            >
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-white dark:bg-gray-950">
                  {o.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              className="h-11"
              startIcon={<Download className="h-4 w-4" />}
              onClick={() => exportStockAsCsv(filtered)}
              type="button"
            >
              Export Excel
            </Button>

            <Button
              variant="outline"
              className="h-11"
              startIcon={<FileDown className="h-4 w-4" />}
              onClick={() => exportStockAsPrintablePdf(filtered, "Stock Report")}
              type="button"
            >
              Export PDF
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Stock Qty</div>
            <div className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">
              {totals.totalStock.toLocaleString()}
            </div>
          </div>

          <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Low Stock Items</div>
            <div className="mt-1 text-lg font-extrabold text-amber-600 dark:text-amber-400">
              {totals.lowCount}
            </div>
          </div>

          <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Out of Stock Items</div>
            <div className="mt-1 text-lg font-extrabold text-error-600 dark:text-error-500">
              {totals.outCount}
            </div>
          </div>
        </div>
      </div>

      <StockReportTable rows={filtered} />
    </div>
  );
};

export default StockReportReport;
