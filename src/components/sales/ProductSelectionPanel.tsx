import React from "react";
import { LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/utils/toPublicUrl";

import ProductCard from "@/components/sales/ProductCard";
import ProductAddModal from "@/components/sales/ProductAddModal";
import type {
  CartItem,
  SaleChildCategory,
  SaleProduct,
  SaleSubCategory,
} from "@/components/sales/types";
import ImageSelectDropdown, {
  type ImageSelectOption,
} from "@/components/ui/dropdown/ImageSelectDropdown";

import { getSubCategories, getChildCategories } from "@/api/categories.api";
import { getProducts } from "@/api/products.api";
import Pagination from "./Pagination";

function unwrapList<T>(payload: any, key?: string): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (key && Array.isArray(payload?.[key])) return payload[key] as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.rows)) return payload.rows as T[];
  return [];
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState<T>(value);
  React.useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

type Props = {
  onAddToCart: (item: CartItem) => void;
};

const DEFAULT_LIMIT = 6;

const ProductSelectionPanel: React.FC<Props> = ({ onAddToCart }) => {
  const [subCategoryId, setSubCategoryId] = React.useState<string>("all");
  const [childCategoryId, setChildCategoryId] = React.useState<string>("all");
  const [q, setQ] = React.useState<string>("");

  const [page, setPage] = React.useState(1);
  const limit = DEFAULT_LIMIT;
  const offset = (page - 1) * limit;

  const debouncedQ = useDebouncedValue(q, 450);

  const { data: subRes, isLoading: subLoading } = useQuery({
    queryKey: ["sale-subCategories"],
    queryFn: () => getSubCategories(),
    staleTime: 60_000,
  });

  const subCategories = React.useMemo(
    () => unwrapList<SaleSubCategory>(subRes),
    [subRes]
  );

  const subIdNum = React.useMemo(() => {
    const n = Number(subCategoryId);
    return Number.isFinite(n) ? n : null;
  }, [subCategoryId]);

  const { data: childRes, isLoading: childLoading } = useQuery({
    queryKey: ["sale-childCategories", { subCategoryId }],
    queryFn: () => {
      if (subCategoryId === "all" || subIdNum === null)
        return getChildCategories();
      return getChildCategories({ sub_category_id: subIdNum } as any);
    },
    staleTime: 60_000,
  });

  const childCategories = React.useMemo(
    () => unwrapList<SaleChildCategory>(childRes),
    [childRes]
  );

  const filteredChildCategories = React.useMemo(() => {
    if (subCategoryId === "all" || subIdNum === null) return childCategories;
    return childCategories.filter(
      (c) => Number(c.sub_category_id) === subIdNum
    );
  }, [childCategories, subCategoryId, subIdNum]);

  React.useEffect(() => {
    setChildCategoryId("all");
  }, [subCategoryId]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, subCategoryId, childCategoryId]);

  const productsQuery = useQuery({
    queryKey: [
      "sale-products",
      {
        search: debouncedQ.trim(),
        subCategoryId,
        childCategoryId,
        limit,
        offset,
      },
    ],
    queryFn: async () => {
      const params: any = { limit, offset };

      if (subCategoryId !== "all" && subIdNum !== null) {
        params.sub_category_id = subIdNum;
      }

      const childIdNum = Number.isFinite(Number(childCategoryId))
        ? Number(childCategoryId)
        : null;
      if (childCategoryId !== "all" && childIdNum !== null) {
        params.child_category_id = childIdNum;
      }

      const text = debouncedQ.trim();
      if (text) {
        params.search = text;
      }

      return getProducts(params);
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  const products = React.useMemo(() => {
    const list = unwrapList<SaleProduct>(productsQuery.data, "products");
    if (list.length) return list;
    return Array.isArray((productsQuery.data as any)?.products)
      ? ((productsQuery.data as any).products as SaleProduct[])
      : [];
  }, [productsQuery.data]);

  const total = React.useMemo(() => {
    const raw = productsQuery.data as any;
    const v = Number(raw?.total ?? raw?.count ?? raw?.pagination?.total ?? 0);
    return Number.isFinite(v) ? v : 0;
  }, [productsQuery.data]);

  const subOptions = React.useMemo<ImageSelectOption[]>(() => {
    return [
      { id: "all", label: "All Sub Categories" },
      ...subCategories.map((c) => ({
        id: String(c.id),
        label: c.name,
        image: c.img_path ? toPublicUrl(c.img_path) : undefined,
      })),
    ];
  }, [subCategories]);

  const childOptions = React.useMemo<ImageSelectOption[]>(() => {
    return [
      { id: "all", label: "All Child Categories" },
      ...filteredChildCategories.map((c) => ({
        id: String(c.id),
        label: c.name,
        image: c.img_path ? toPublicUrl(c.img_path) : undefined,
      })),
    ];
  }, [filteredChildCategories]);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<SaleProduct | null>(null);

  const loading = subLoading || childLoading || productsQuery.isLoading;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm",
        "dark:border-gray-800 dark:bg-gray-900"
      )}
    >
      {/* ── Panel Header ── */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-3.5 dark:border-gray-800 dark:from-white/[0.03] dark:to-white/[0.01]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Products</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Browse & add to cart</p>
          </div>
        </div>
        {total > 0 && (
          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
            {total} items
          </span>
        )}
      </div>

      {/* ── Scroll container ── */}
      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
        {/* Sticky Filters */}
        <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 p-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-12 md:col-span-6">
              <ImageSelectDropdown
                value={subCategoryId}
                onChange={(v) => {
                  setSubCategoryId(v);
                  setChildCategoryId("all");
                }}
                options={subOptions}
                placeholder="All Sub Categories"
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <ImageSelectDropdown
                value={childCategoryId}
                onChange={setChildCategoryId}
                options={childOptions}
                placeholder={
                  subCategoryId === "all"
                    ? "All Child Categories"
                    : "Select Child Category"
                }
                disabled={childOptions.length <= 1}
              />
            </div>

            <div className="col-span-12">
              <div
                className={cn(
                  "flex h-11 items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/80 px-4 transition-colors",
                  "focus-within:border-brand-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100",
                  "dark:border-gray-700 dark:bg-white/[0.03] dark:focus-within:border-brand-500 dark:focus-within:ring-brand-500/10"
                )}
              >
                <Search size={16} className="flex-shrink-0 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products by name, SKU..."
                  className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="p-3">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="space-y-2 rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
                  <div className="h-3 w-3/4 animate-pulse rounded-md bg-gray-100 dark:bg-white/[0.04]" />
                  <div className="h-3 w-1/2 animate-pulse rounded-md bg-gray-100 dark:bg-white/[0.04]" />
                  <div className="flex gap-2">
                    <div className="h-7 w-1/2 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
                    <div className="h-7 w-1/2 animate-pulse rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-14 dark:border-gray-700 dark:bg-white/[0.01]">
              <LayoutGrid className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No products found</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Try adjusting your filters or search</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <ProductCard
                  key={String(p.id)}
                  product={p}
                  onClick={() => {
                    setSelected(p);
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-3 pb-3">
          <Pagination
            page={page}
            pageSize={limit}
            total={total}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ProductAddModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selected}
        onAdd={onAddToCart}
      />
    </div>
  );
};

export default ProductSelectionPanel;
