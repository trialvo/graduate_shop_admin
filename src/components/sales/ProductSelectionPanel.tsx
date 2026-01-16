import React from "react";
import { Search } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/utils/toPublicUrl";

import ProductCard from "@/components/sales/ProductCard";
import ProductAddModal from "@/components/sales/ProductAddModal";
import type { CartItem, SaleChildCategory, SaleProduct, SaleSubCategory } from "@/components/sales/types";
import ImageSelectDropdown, { type ImageSelectOption } from "@/components/ui/dropdown/ImageSelectDropdown";

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

const DEFAULT_LIMIT = 6; // ✅ max 6 per page

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

  const subCategories = React.useMemo(() => unwrapList<SaleSubCategory>(subRes), [subRes]);

  const subIdNum = React.useMemo(() => {
    const n = Number(subCategoryId);
    return Number.isFinite(n) ? n : null;
  }, [subCategoryId]);

  const { data: childRes, isLoading: childLoading } = useQuery({
    queryKey: ["sale-childCategories", { subCategoryId }],
    queryFn: () => {
      if (subCategoryId === "all" || subIdNum === null) return getChildCategories();
      return getChildCategories({ sub_category_id: subIdNum } as any);
    },
    staleTime: 60_000,
  });

  const childCategories = React.useMemo(() => unwrapList<SaleChildCategory>(childRes), [childRes]);

  const filteredChildCategories = React.useMemo(() => {
    if (subCategoryId === "all" || subIdNum === null) return childCategories;
    return childCategories.filter((c) => Number(c.sub_category_id) === subIdNum);
  }, [childCategories, subCategoryId, subIdNum]);

  React.useEffect(() => {
    setChildCategoryId("all");
  }, [subCategoryId]);

  // ✅ Reset pagination when filters/search change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, subCategoryId, childCategoryId]);

  /**
   * ✅ IMPORTANT (your rule):
   * - NO q= param
   * - search text must be in: search=<value>
   * - If empty -> do NOT send search param
   *
   * Examples:
   * - /products?limit=6&sub_category_id=14
   * - /products?limit=6&sub_category_id=14&search=fo
   */
  const productsQuery = useQuery({
    queryKey: ["sale-products", { search: debouncedQ.trim(), subCategoryId, childCategoryId, limit, offset }],
    queryFn: async () => {
      const params: any = { limit, offset };

      // filters always apply if selected
      if (subCategoryId !== "all" && subIdNum !== null) {
        params.sub_category_id = subIdNum;
      }

      const childIdNum = Number.isFinite(Number(childCategoryId)) ? Number(childCategoryId) : null;
      if (childCategoryId !== "all" && childIdNum !== null) {
        params.child_category_id = childIdNum;
      }

      // ✅ Only send search=<text> when user typed
      const text = debouncedQ.trim();
      if (text) {
        params.search = text; // ✅ NO search=on, NO q=
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
    <div className={cn("flex h-full flex-col rounded-2xl border border-gray-200 bg-white", "dark:border-gray-800 dark:bg-white/[0.03]")}>
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Product Section</h3>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar px-5 py-5 sm:px-6">
        <div className="grid grid-cols-12 gap-3">
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
              placeholder={subCategoryId === "all" ? "All Child Categories" : "Select Child Category"}
              disabled={childOptions.length <= 1}
            />
          </div>

          <div className="col-span-12">
            <div className="flex h-12 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
              <Search size={18} className="text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type to search (search=value)"
                className="w-full bg-transparent text-sm text-gray-700 outline-none dark:text-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-[220px] animate-pulse rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
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

        <div className="mt-5">
          <Pagination page={page} pageSize={limit} total={total} onPageChange={setPage} />
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
