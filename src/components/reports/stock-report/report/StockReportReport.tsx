// src/components/reports/stock-report/report/StockReportReport.tsx
"use client";

import React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Download, FileDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

import type { StockLevelStatus, StockReportRow, TimePeriodKey } from "../types";
import StockReportTable from "./StockReportTable";

// ✅ You said: category api already exists, don't recreate.
// We'll use them for dynamic main/sub/child selects:
import { getMainCategories, getSubCategories, getChildCategories } from "@/api/categories.api";

// ✅ Stock report API you already have
import {
  getItemMetricsCategoryStockSummery,
  type CategoryStockSummeryRes,
} from "@/api/item-metrics.api";

type Props = { period: TimePeriodKey };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toIsoRange(period: TimePeriodKey): { startDate: string; endDate: string } {
  const now = new Date();
  const end = new Date(now);

  if (period === "today") return { startDate: toISO(now), endDate: toISO(now) };

  if (period === "last7") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { startDate: toISO(start), endDate: toISO(end) };
  }

  if (period === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: toISO(start), endDate: toISO(end) };
  }

  const start = new Date(now.getFullYear(), 0, 1);
  return { startDate: toISO(start), endDate: toISO(end) };
}

const normalize = (s: string) => s.trim().toLowerCase();

const periodLabel = (p: TimePeriodKey) => {
  if (p === "today") return "Today";
  if (p === "last7") return "Last 7 Days";
  if (p === "thisMonth") return "This Month";
  return "This Year";
};

function buildCategoryPath(opts: { main?: string; sub?: string; child?: string }) {
  const parts = [opts.main, opts.sub, opts.child].filter(Boolean);
  return parts.length ? parts.join(" > ") : "-";
}

// We don't have an items-level report endpoint in your provided item-metrics.
// So: use category-stock-summery and show rows as "Category" lines.
// We still keep table shape as StockReportRow by mapping fields.
function mapToRows(res?: CategoryStockSummeryRes, params?: { mainId?: number; subId?: number; childId?: number }) {
  const mainId = params?.mainId;
  const subId = params?.subId;
  const childId = params?.childId;

  // Decide which level to show based on selected filters:
  // - if child selected => show only that child
  // - else if sub selected => show child categories under that sub (fallback to sub itself if none)
  // - else if main selected => show sub categories under that main (fallback to main itself if none)
  // - else => show main categories
  const mains = res?.data?.main_categories ?? [];
  const subs = res?.data?.sub_categories ?? [];
  const childs = res?.data?.child_categories ?? [];

  if (typeof childId === "number") {
    const c = childs.find((x) => Number(x.id) === childId);
    if (!c) return [];
    const stockQty = Number(c.metrics?.in_stock ?? 0) + Number(c.metrics?.low_stock ?? 0);
    const reorderLevel = Number(c.metrics?.low_stock ?? 0);
    const status: StockLevelStatus =
      Number(c.metrics?.out_of_stock ?? 0) > 0 ? "out_of_stock" : reorderLevel > 0 ? "low_stock" : "in_stock";

    return [
      {
        id: `child-${c.id}`,
        name: c.name,
        sku: `SKU: ${Number(c.metrics?.total_variations ?? 0)}`,
        categoryPath: buildCategoryPath({ child: c.name }),
        stockQty,
        reorderLevel,
        status,
        lastUpdated: "-",
      },
    ];
  }

  if (typeof subId === "number") {
    const list = childs.filter((x) => Number(x.sub_category_id) === subId);
    if (list.length) {
      return list.map((c) => {
        const stockQty = Number(c.metrics?.in_stock ?? 0) + Number(c.metrics?.low_stock ?? 0);
        const reorderLevel = Number(c.metrics?.low_stock ?? 0);
        const status: StockLevelStatus =
          Number(c.metrics?.out_of_stock ?? 0) > 0 ? "out_of_stock" : reorderLevel > 0 ? "low_stock" : "in_stock";
        return {
          id: `child-${c.id}`,
          name: c.name,
          sku: `SKU: ${Number(c.metrics?.total_variations ?? 0)}`,
          categoryPath: buildCategoryPath({ child: c.name }),
          stockQty,
          reorderLevel,
          status,
          lastUpdated: "-",
        };
      });
    }

    const s = subs.find((x) => Number(x.id) === subId);
    if (!s) return [];
    const stockQty = Number(s.metrics?.in_stock ?? 0) + Number(s.metrics?.low_stock ?? 0);
    const reorderLevel = Number(s.metrics?.low_stock ?? 0);
    const status: StockLevelStatus =
      Number(s.metrics?.out_of_stock ?? 0) > 0 ? "out_of_stock" : reorderLevel > 0 ? "low_stock" : "in_stock";

    return [
      {
        id: `sub-${s.id}`,
        name: s.name,
        sku: `SKU: ${Number(s.metrics?.total_variations ?? 0)}`,
        categoryPath: buildCategoryPath({ sub: s.name }),
        stockQty,
        reorderLevel,
        status,
        lastUpdated: "-",
      },
    ];
  }

  if (typeof mainId === "number") {
    const list = subs.filter((x) => Number(x.main_category_id) === mainId);
    if (list.length) {
      return list.map((s) => {
        const stockQty = Number(s.metrics?.in_stock ?? 0) + Number(s.metrics?.low_stock ?? 0);
        const reorderLevel = Number(s.metrics?.low_stock ?? 0);
        const status: StockLevelStatus =
          Number(s.metrics?.out_of_stock ?? 0) > 0 ? "out_of_stock" : reorderLevel > 0 ? "low_stock" : "in_stock";
        return {
          id: `sub-${s.id}`,
          name: s.name,
          sku: `SKU: ${Number(s.metrics?.total_variations ?? 0)}`,
          categoryPath: buildCategoryPath({ sub: s.name }),
          stockQty,
          reorderLevel,
          status,
          lastUpdated: "-",
        };
      });
    }

    const m = mains.find((x) => Number(x.id) === mainId);
    if (!m) return [];
    const stockQty = Number(m.metrics?.in_stock ?? 0) + Number(m.metrics?.low_stock ?? 0);
    const reorderLevel = Number(m.metrics?.low_stock ?? 0);
    const status: StockLevelStatus =
      Number(m.metrics?.out_of_stock ?? 0) > 0 ? "out_of_stock" : reorderLevel > 0 ? "low_stock" : "in_stock";

    return [
      {
        id: `main-${m.id}`,
        name: m.name,
        sku: `SKU: ${Number(m.metrics?.total_variations ?? 0)}`,
        categoryPath: buildCategoryPath({ main: m.name }),
        stockQty,
        reorderLevel,
        status,
        lastUpdated: "-",
      },
    ];
  }

  return mains.map((m) => {
    const stockQty = Number(m.metrics?.in_stock ?? 0) + Number(m.metrics?.low_stock ?? 0);
    const reorderLevel = Number(m.metrics?.low_stock ?? 0);
    const status: StockLevelStatus =
      Number(m.metrics?.out_of_stock ?? 0) > 0 ? "out_of_stock" : reorderLevel > 0 ? "low_stock" : "in_stock";

    return {
      id: `main-${m.id}`,
      name: m.name,
      sku: `SKU: ${Number(m.metrics?.total_variations ?? 0)}`,
      categoryPath: buildCategoryPath({ main: m.name }),
      stockQty,
      reorderLevel,
      status,
      lastUpdated: "-",
    };
  });
}

function unwrapList<T>(payload: any, key?: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (key && Array.isArray(payload?.[key])) return payload[key] as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.rows)) return payload.rows as T[];
  // your ListResponse sometimes has .result/.results; keep safe:
  if (Array.isArray(payload?.results)) return payload.results as T[];
  if (Array.isArray(payload?.result)) return payload.result as T[];
  return [];
}

export default function StockReportReport({ period }: Props) {
  const range = React.useMemo(() => toIsoRange(period), [period]);

  // Filters (initially empty => no query params)
  const [mainId, setMainId] = React.useState<string>(""); // "" means all
  const [subId, setSubId] = React.useState<string>("");
  const [childId, setChildId] = React.useState<string>("");

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | StockLevelStatus>("all");

  // When main changes, clear sub/child
  React.useEffect(() => {
    setSubId("");
    setChildId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainId]);

  // When sub changes, clear child
  React.useEffect(() => {
    setChildId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subId]);

  // Categories (dynamic)
  const mainQuery = useQuery({
    queryKey: ["categories", "main", "stock-report"],
    queryFn: () => getMainCategories({ limit: 500, offset: 0 } as any),
    staleTime: 60_000,
  });

  const subQuery = useQuery({
    queryKey: ["categories", "sub", "stock-report", mainId || "all"],
    queryFn: () => getSubCategories(mainId ? ({ main_category_id: Number(mainId), limit: 500, offset: 0 } as any) : ({ limit: 500, offset: 0 } as any)),
    enabled: true,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  const childQuery = useQuery({
    queryKey: ["categories", "child", "stock-report", subId || "all"],
    queryFn: () => getChildCategories(subId ? ({ sub_category_id: Number(subId), limit: 500, offset: 0 } as any) : ({ limit: 500, offset: 0 } as any)),
    enabled: true,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  // Stock category summary (this is the only stock endpoint you gave for report listing)
  const stockQuery = useQuery({
    queryKey: ["item-metrics", "category-stock-summery", range.startDate, range.endDate],
    queryFn: () =>
      getItemMetricsCategoryStockSummery({
        startDate: range.startDate,
        endDate: range.endDate,
        limit: 500,
        offset: 0,
      }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const mainList = React.useMemo(() => unwrapList<any>(mainQuery.data, "data"), [mainQuery.data]);
  const subList = React.useMemo(() => unwrapList<any>(subQuery.data, "data"), [subQuery.data]);
  const childList = React.useMemo(() => unwrapList<any>(childQuery.data, "data"), [childQuery.data]);

  const mainOptions = React.useMemo(() => {
    const opts = [{ value: "", label: "All Main Categories" }];
    mainList.forEach((m: any) => opts.push({ value: String(m.id), label: String(m.name) }));
    return opts;
  }, [mainList]);

  const subOptions = React.useMemo(() => {
    const opts = [{ value: "", label: "All Sub Categories" }];
    subList.forEach((s: any) => opts.push({ value: String(s.id), label: String(s.name) }));
    return opts;
  }, [subList]);

  const childOptions = React.useMemo(() => {
    const opts = [{ value: "", label: "All Child Categories" }];
    childList.forEach((c: any) => opts.push({ value: String(c.id), label: String(c.name) }));
    return opts;
  }, [childList]);

  const baseRows = React.useMemo(() => {
    const parsedMain = mainId ? Number(mainId) : undefined;
    const parsedSub = subId ? Number(subId) : undefined;
    const parsedChild = childId ? Number(childId) : undefined;

    return mapToRows(stockQuery.data, { mainId: parsedMain, subId: parsedSub, childId: parsedChild });
  }, [stockQuery.data, mainId, subId, childId]);

  const filtered = React.useMemo(() => {
    const q = normalize(query);

    return baseRows.filter((r) => {
      const matchQ =
        !q ||
        normalize(r.name).includes(q) ||
        normalize(r.sku).includes(q) ||
        normalize(r.categoryPath).includes(q) ||
        normalize(r.id).includes(q);

      const matchStatus = status === "all" ? true : r.status === status;
      return matchQ && matchStatus;
    });
  }, [baseRows, query, status]);

  const totals = React.useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.totalStock += Number(r.stockQty ?? 0);
        acc.lowCount += r.status === "low_stock" ? 1 : 0;
        acc.outCount += r.status === "out_of_stock" ? 1 : 0;
        return acc;
      },
      { totalStock: 0, lowCount: 0, outCount: 0 }
    );
  }, [filtered]);

  return (
    <div className="mt-6 space-y-5">
      {/* Toolbar */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
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
                placeholder="Search name / sku / category..."
                className="h-11 rounded-[4px] border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pr-10"
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Status */}
            <Select
              options={[
                { value: "all", label: "All Status" },
                { value: "in_stock", label: "In Stock" },
                { value: "low_stock", label: "Low Stock" },
                { value: "out_of_stock", label: "Out of Stock" },
              ]}
              defaultValue={status}
              onChange={(v) => setStatus(v as any)}
              className="h-11 rounded-[4px] border-gray-200 dark:border-gray-800"
            />

            {/* Category Filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select
                options={mainOptions}
                defaultValue={mainId}
                onChange={(v) => setMainId(String(v))}
                className="h-11 rounded-[4px] border-gray-200 dark:border-gray-800"
              />

              <Select
                options={subOptions}
                defaultValue={subId}
                onChange={(v) => setSubId(String(v))}
                className="h-11 rounded-[4px] border-gray-200 dark:border-gray-800"
              />

              <Select
                options={childOptions}
                defaultValue={childId}
                onChange={(v) => setChildId(String(v))}
                className="h-11 rounded-[4px] border-gray-200 dark:border-gray-800"
              />
            </div>

            {/* Export */}
            <Button
              variant="outline"
              className="h-11"
              startIcon={<Download className="h-4 w-4" />}
              // onClick={() => exportStockAsCsv(filtered)}
              type="button"
            >
              Export Excel
            </Button>

            <Button
              variant="outline"
              className="h-11"
              startIcon={<FileDown className="h-4 w-4" />}
              // onClick={() => exportStockAsPrintablePdf(filtered, "Stock Report")}
              type="button"
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Stock Qty</div>
            <div className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">
              {totals.totalStock.toLocaleString()}
            </div>
          </div>

          <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Low Stock Rows</div>
            <div className="mt-1 text-lg font-extrabold text-amber-600 dark:text-amber-400">
              {totals.lowCount}
            </div>
          </div>

          <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Out of Stock Rows</div>
            <div className="mt-1 text-lg font-extrabold text-error-600 dark:text-error-500">
              {totals.outCount}
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {(mainQuery.isLoading || stockQuery.isLoading) && (
          <div className="mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">Loading report...</div>
        )}

        {(mainQuery.isError || stockQuery.isError) && (
          <div className="mt-4 rounded-[4px] border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-300">
            {String((mainQuery.error as any)?.message || (stockQuery.error as any)?.message || "Failed to load report")}
          </div>
        )}
      </div>

      {/* Table */}
      <StockReportTable rows={filtered as StockReportRow[]} />
    </div>
  );
}
