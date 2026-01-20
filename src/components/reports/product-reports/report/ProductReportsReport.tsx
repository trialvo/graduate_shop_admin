"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

import { getPeriodRange, parseMoney, formatIsoDateTimeToDate } from "../reportUtils";
import type { SelectOption, TimePeriodKey, ProductReportRow, ReportStatus } from "../types";

import { exportProductReportAsCsv, exportProductReportAsPrintablePdf } from "../exportUtils";
import ProductReportsTable from "./ProductReportsTable";

import { getProductMetricsReport } from "@/api/product-metrics.api";
import { getChildCategories, getMainCategories, getSubCategories } from "@/api/categories.api";

type Props = { period: TimePeriodKey };

const LIMIT_OPTIONS: SelectOption[] = [
  { value: "10", label: "10 rows" },
  { value: "20", label: "20 rows" },
  { value: "50", label: "50 rows" },
  { value: "100", label: "100 rows" },
];

const statusOptions: SelectOption[] = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function toRow(apiRow: any): ProductReportRow {
  const buying = parseMoney(apiRow.metrics?.total_buying_price);
  const selling = parseMoney(apiRow.metrics?.total_selling_price);
  const discount = parseMoney(apiRow.metrics?.total_item_discount);
  const netRevenue = parseMoney(apiRow.metrics?.net_revenue);
  const profit = netRevenue - buying;

  const main = apiRow.categories?.main?.name ? String(apiRow.categories.main.name) : "";
  const sub = apiRow.categories?.sub?.name ? String(apiRow.categories.sub.name) : "";
  const child = apiRow.categories?.child?.name ? String(apiRow.categories.child.name) : "";

  const categoryPath = [main, sub, child].filter(Boolean).join(" > ") || "-";

  return {
    id: String(apiRow.id),
    name: String(apiRow.name ?? "-"),
    slug: String(apiRow.slug ?? "-"),
    categoryPath,
    soldQty: Number(apiRow.metrics?.quantity_sold ?? 0),
    buying,
    selling,
    discount,
    netRevenue,
    profit,
    status: apiRow.is_active ? "active" : "inactive",
    updatedAt: formatIsoDateTimeToDate(apiRow.last_updated),
  };
}

const ProductReportsReport: React.FC<Props> = ({ period }) => {
  const range = React.useMemo(() => getPeriodRange(period), [period]);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | ReportStatus>("all");

  const [mainId, setMainId] = React.useState<string>("all");
  const [subId, setSubId] = React.useState<string>("all");
  const [childId, setChildId] = React.useState<string>("all");

  const [limit, setLimit] = React.useState<number>(20);
  const [offset, setOffset] = React.useState<number>(0);

  // When main changes -> reset sub + child
  React.useEffect(() => {
    setSubId("all");
    setChildId("all");
    setOffset(0);
  }, [mainId]);

  // When sub changes -> reset child
  React.useEffect(() => {
    setChildId("all");
    setOffset(0);
  }, [subId]);

  React.useEffect(() => {
    setOffset(0);
  }, [status, search, limit, childId]);

  // Categories (dynamic)
  const mainCategoriesQuery = useQuery({
    queryKey: ["categories-lite", "main"],
    queryFn: () => getMainCategories(),
  });

  const subCategoriesQuery = useQuery({
    queryKey: ["categories-lite", "sub", mainId],
    queryFn: () => getSubCategories({ main_category_id: Number(mainId) }),
    enabled: mainId !== "all",
  });

  const childCategoriesQuery = useQuery({
    queryKey: ["categories-lite", "child", subId],
    queryFn: () => getChildCategories({ sub_category_id: Number(subId) }),
    enabled: subId !== "all",
  });

  const mainOptions: SelectOption[] = React.useMemo(() => {
    const items = mainCategoriesQuery.data?.data ?? [];
    return [
      { value: "all", label: "All Main Categories" },
      ...items.map((c) => ({ value: String(c.id), label: c.name })),
    ];
  }, [mainCategoriesQuery.data]);

  const subOptions: SelectOption[] = React.useMemo(() => {
    const items = subCategoriesQuery.data?.data ?? [];
    return [
      { value: "all", label: "All Sub Categories" },
      ...items.map((c) => ({ value: String(c.id), label: c.name })),
    ];
  }, [subCategoriesQuery.data]);

  const childOptions: SelectOption[] = React.useMemo(() => {
    const items = childCategoriesQuery.data?.data ?? [];
    return [
      { value: "all", label: "All Child Categories" },
      ...items.map((c) => ({ value: String(c.id), label: c.name })),
    ];
  }, [childCategoriesQuery.data]);

  const reportQuery = useQuery({
    queryKey: [
      "product-metrics",
      "report",
      range.startDate,
      range.endDate,
      search,
      status,
      mainId,
      subId,
      childId,
      limit,
      offset,
    ],
    queryFn: async () => {
      const params: any = {
        startDate: range.startDate,
        endDate: range.endDate,
        limit,
        offset,
      };

      if (search.trim()) params.search = search.trim();
      if (status !== "all") params.status = status === "active";
      if (mainId !== "all") params.main_category_id = Number(mainId);
      if (subId !== "all") params.sub_category_id = Number(subId);
      if (childId !== "all") params.child_category_id = Number(childId);

      return getProductMetricsReport(params);
    },
  });

  const rows: ProductReportRow[] = React.useMemo(() => {
    const data = reportQuery.data?.data ?? [];
    return data.map(toRow);
  }, [reportQuery.data]);

  const meta = reportQuery.data?.meta;
  const note = reportQuery.data?.note;

  const totals = React.useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.buying += r.buying;
        acc.selling += r.selling;
        acc.discount += r.discount;
        acc.net += r.netRevenue;
        acc.profit += r.profit;
        return acc;
      },
      { buying: 0, selling: 0, discount: 0, net: 0, profit: 0 }
    );
  }, [rows]);

  const total = meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const currentPage = Math.floor(offset / Math.max(1, limit)) + 1;

  async function handleExportCsv() {
    const params: any = {
      startDate: range.startDate,
      endDate: range.endDate,
      limit: 5000,
      offset: 0,
    };

    if (search.trim()) params.search = search.trim();
    if (status !== "all") params.status = status === "active";
    if (mainId !== "all") params.main_category_id = Number(mainId);
    if (subId !== "all") params.sub_category_id = Number(subId);
    if (childId !== "all") params.child_category_id = Number(childId);

    const all = await getProductMetricsReport(params);
    const allRows = (all.data ?? []).map(toRow);
    exportProductReportAsCsv(allRows);
  }

  async function handleExportPdf() {
    const params: any = {
      startDate: range.startDate,
      endDate: range.endDate,
      limit: 5000,
      offset: 0,
    };

    if (search.trim()) params.search = search.trim();
    if (status !== "all") params.status = status === "active";
    if (mainId !== "all") params.main_category_id = Number(mainId);
    if (subId !== "all") params.sub_category_id = Number(subId);
    if (childId !== "all") params.child_category_id = Number(childId);

    const all = await getProductMetricsReport(params);
    const allRows = (all.data ?? []).map(toRow);
    exportProductReportAsPrintablePdf(allRows, "Product Report");
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">All Reports</div>
            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Range: {range.startDate} → {range.endDate} • Total: {total}
            </div>
            {note ? (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">{note}</div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <div className="relative w-full lg:w-[320px]">
              <Input
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                placeholder="Search product name..."
                className="h-11 rounded-[4px] border-gray-200 bg-white pr-10 dark:border-gray-800 dark:bg-gray-950"
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <Select
              options={statusOptions}
              defaultValue={status}
              onChange={(v) => setStatus(v as any)}
              className="h-11 rounded-[4px] border-gray-200 dark:border-gray-800"
            />

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
              className={cn("h-11 rounded-[4px] border-gray-200 dark:border-gray-800", mainId === "all" && "opacity-60")}
            />

            <Select
              options={childOptions}
              defaultValue={childId}
              onChange={(v) => setChildId(String(v))}
              className={cn("h-11 rounded-[4px] border-gray-200 dark:border-gray-800", subId === "all" && "opacity-60")}
            />

            <Select
              options={LIMIT_OPTIONS}
              defaultValue={String(limit)}
              onChange={(v) => setLimit(Number(v))}
              className="h-11 rounded-[4px] border-gray-200 dark:border-gray-800"
            />

            <Button
              variant="outline"
              className="h-11"
              startIcon={<Download className="h-4 w-4" />}
              onClick={handleExportCsv}
              type="button"
            >
              Export CSV
            </Button>

            <Button
              variant="outline"
              className="h-11"
              startIcon={<FileDown className="h-4 w-4" />}
              onClick={handleExportPdf}
              type="button"
            >
              Export PDF
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
          <SummaryBox label="Buying Total" value={totals.buying} />
          <SummaryBox label="Selling Total" value={totals.selling} />
          <SummaryBox label="Discount Total" value={totals.discount} />
          <SummaryBox label="Net Revenue" value={totals.net} />
          <SummaryBox label="Profit" value={totals.profit} tone="success" />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-9"
              disabled={currentPage <= 1}
              onClick={() => setOffset(Math.max(0, offset - limit))}
              type="button"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              className="h-9"
              disabled={currentPage >= totalPages}
              onClick={() => setOffset(offset + limit)}
              type="button"
            >
              Next
            </Button>
          </div>
        </div>

        {reportQuery.isError ? (
          <div className="mt-4 rounded-[4px] border border-error-500/30 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/20 dark:bg-error-500/10 dark:text-error-300">
            Failed to load report data. Please try again.
          </div>
        ) : null}
      </div>

      <ProductReportsTable rows={rows} isLoading={reportQuery.isLoading} />
    </div>
  );
};

function SummaryBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "default";
}) {
  const textClass =
    tone === "success"
      ? "text-success-700 dark:text-success-400"
      : "text-gray-900 dark:text-white";

  return (
    <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</div>
      <div className={cn("mt-1 text-lg font-extrabold", textClass)}>
        {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BDT
      </div>
    </div>
  );
}

export default ProductReportsReport;
