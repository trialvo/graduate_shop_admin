"use client";

import React from "react";
import { Download, FileDown, Search } from "lucide-react";

import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

import { PRODUCT_REPORT_ROWS } from "../mockData";
import { exportReportAsCsv, exportReportAsPrintablePdf } from "../exportUtils";
import type { ProductReportRow, TimePeriodKey } from "../types";
import ProductReportsTable from "./ProductReportsTable";

type Props = {
  period: TimePeriodKey;
};

const normalize = (s: string) => s.trim().toLowerCase();

const periodLabel = (p: TimePeriodKey) => {
  if (p === "today") return "Today";
  if (p === "last7") return "Last 7 Days";
  if (p === "thisMonth") return "This Month";
  return "This Year";
};

const ProductReportsReport: React.FC<Props> = ({ period }) => {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | ProductReportRow["status"]>("all");
  const [category, setCategory] = React.useState<string>("all");

  const categoryOptions = React.useMemo(() => {
    const set = new Set<string>();
    PRODUCT_REPORT_ROWS.forEach((r) => set.add(r.categoryPath.split(">")[0].trim()));
    const list = Array.from(set).sort((a, b) => a.localeCompare(b));
    return [{ value: "all", label: "All Categories" }, ...list.map((x) => ({ value: x, label: x }))];
  }, []);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const filtered = React.useMemo(() => {
    const q = normalize(query);

    return PRODUCT_REPORT_ROWS.filter((r) => {
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
        acc.revenue += r.revenue;
        acc.cost += r.cost;
        acc.profit += r.profit;
        return acc;
      },
      { revenue: 0, cost: 0, profit: 0 }
    );
  }, [filtered]);

  return (
    <div className="mt-6 space-y-5">
      {/* Toolbar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">All Reports</div>
            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Period: {periodLabel(period)} • Rows: {filtered.length}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            {/* Search */}
            <div className="relative w-full lg:w-[320px]">
              <Input
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                placeholder="Search product, sku, category..."
                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pr-10"
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                options={statusOptions}
                defaultValue={status}
                onChange={(v) => setStatus(v as typeof status)}
                className="h-11 rounded-xl border-gray-200 dark:border-gray-800"
              />

              <Select
                options={categoryOptions}
                defaultValue={category}
                onChange={(v) => setCategory(String(v))}
                className="h-11 rounded-xl border-gray-200 dark:border-gray-800"
              />
            </div>

            {/* Export */}
            <Button
              variant="outline"
              className="h-11"
              startIcon={<Download className="h-4 w-4" />}
              onClick={() => exportReportAsCsv(filtered)}
              type="button"
            >
              Export Excel
            </Button>

            <Button
              variant="outline"
              className="h-11"
              startIcon={<FileDown className="h-4 w-4" />}
              onClick={() => exportReportAsPrintablePdf(filtered, "Product Report")}
              type="button"
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Revenue</div>
            <div className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">
              {totals.revenue.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Cost</div>
            <div className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">
              {totals.cost.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Profit</div>
            <div className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">
              {totals.profit.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <ProductReportsTable rows={filtered} />
    </div>
  );
};

export default ProductReportsReport;
