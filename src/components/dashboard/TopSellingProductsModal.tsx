import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { Modal } from "../ui/modal";
import PaginationFooter from "./PaginationFooter";
import TopViewedRangeFilter from "./TopViewedRangeFilter";

import {
  dashboardKeys,
  getDashboardTopSelling,
  type DashboardTopSellingItem,
  type DashboardTimeRange,
} from "@/api/dashboard.api";
import { toPublicUrl } from "@/utils/toPublicUrl";

interface Props {
  open: boolean;
  onClose: () => void;

  timeRange: DashboardTimeRange;
  onChangeTimeRange: (v: DashboardTimeRange) => void;
}

const PAGE_SIZE = 10;

function formatBDT(n: number): string {
  if (!Number.isFinite(n)) return "৳0";
  const formatted = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(n);
  return `৳${formatted}`;
}

function imageFallbackSvgDataUri(title: string) {
  const safe = title.replace(/</g, "").replace(/>/g, "").slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
    <rect width="100%" height="100%" rx="16" ry="16" fill="#E5E7EB"/>
    <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
      font-family="Arial" font-size="28" font-weight="700" fill="#6B7280">${safe}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function categoryLine(item: DashboardTopSellingItem): string {
  const parts = [item.main_category?.name, item.sub_category?.name, item.child_category?.name].filter(Boolean);
  return parts.length ? parts.join(" • ") : "—";
}

function bestVariationPrice(item: DashboardTopSellingItem): number {
  const prices = item.variations?.map((v) => v.selling_price).filter((v) => Number.isFinite(v)) ?? [];
  if (prices.length === 0) return 0;
  return Math.max(...prices);
}

function topVariation(item: DashboardTopSellingItem) {
  // highlight the variation with highest sell_count
  const vs = item.variations ?? [];
  if (vs.length === 0) return null;
  return [...vs].sort((a, b) => b.sell_count - a.sell_count)[0] ?? null;
}

const TopSellingProductsModal: React.FC<Props> = ({ open, onClose, timeRange, onChangeTimeRange }) => {
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [open, timeRange]);

  const offset = (page - 1) * PAGE_SIZE;

  const query = useQuery({
    queryKey: dashboardKeys.topSellingList({ timeRange, limit: PAGE_SIZE, offset }),
    queryFn: () => getDashboardTopSelling({ timeRange, limit: PAGE_SIZE, offset }),
    enabled: open,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const rows: DashboardTopSellingItem[] = query.data?.data ?? [];
  const total = query.data?.meta?.count ?? 0;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <Modal isOpen={open} onClose={onClose} className="w-full max-w-[980px] max-h-[720px] overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">Top Selling Products</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {query.isError ? "Failed to load data." : `Total ${total} items`}
            </p>
          </div>

          <TopViewedRangeFilter value={timeRange} onChange={onChangeTimeRange} />
        </div>
      </div>

      <div className="max-h-[calc(720px-72px)] overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-12 rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 dark:bg-white/[0.04] dark:text-gray-200">
          <div className="col-span-6">Product</div>
          <div className="col-span-2 text-center">Sold</div>
          <div className="col-span-2 text-center">Stock</div>
          <div className="col-span-2 text-right">Best SKU</div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {query.isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center gap-2 px-4 py-4">
                <div className="col-span-6 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gray-200 animate-pulse dark:bg-gray-800" />
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse dark:bg-gray-800" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 animate-pulse dark:bg-gray-800" />
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <div className="h-4 w-10 rounded bg-gray-200 animate-pulse dark:bg-gray-800" />
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <div className="h-4 w-10 rounded bg-gray-200 animate-pulse dark:bg-gray-800" />
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <div className="h-4 w-16 rounded bg-gray-200 animate-pulse dark:bg-gray-800" />
                </div>
              </div>
            ))
          ) : rows.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No data found.</div>
          ) : (
            rows.map((p) => {
              const img = p.first_image ? toPublicUrl(p.first_image) : imageFallbackSvgDataUri(p.product_name);
              const topSku = topVariation(p);
              const price = bestVariationPrice(p);

              return (
                <div key={p.product_id} className="grid grid-cols-12 items-center gap-2 px-4 py-4">
                  <div className="col-span-6 flex items-center gap-3">
                    <img
                      src={img}
                      alt={p.product_name}
                      className="h-11 w-11 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-gray-800"
                      loading="lazy"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white/90">
                        {p.product_name}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="truncate">{categoryLine(p)}</span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span>Max price: {formatBDT(price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-center text-sm font-semibold text-gray-900 dark:text-white/90">
                    {p.total_sell_count}
                  </div>

                  <div className="col-span-2 flex items-center justify-center text-sm text-gray-700 dark:text-gray-300">
                    {p.total_in_stock}
                  </div>

                  <div className="col-span-2 flex flex-col items-end">
                    <span className="truncate text-sm font-semibold text-brand-600 dark:text-brand-400">
                      {topSku?.sku ?? "—"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Sold: {topSku?.sell_count ?? 0}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <PaginationFooter total={total} page={page} pageSize={PAGE_SIZE} onPrev={onPrev} onNext={onNext} />
      </div>
    </Modal>
  );
};

export default TopSellingProductsModal;
