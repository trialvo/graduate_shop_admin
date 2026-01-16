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

const DEFAULT_LIMIT = 20; // ✅ better for pagination + grid

const ProductSelectionPanel: React.FC<Props> = ({ onAddToCart }) => {
  const [subCategoryId, setSubCategoryId] = React.useState<string>("all");
  const [childCategoryId, setChildCategoryId] = React.useState<string>("all");
  const [q, setQ] = React.useState<string>("");

  const [page, setPage] = React.useState(1);
  const limit = DEFAULT_LIMIT;
  const offset = (page - 1) * limit;

  const debouncedQ = useDebouncedValue(q, 450);

  // ✅ 1) Load all sub categories (always)
  const { data: subRes, isLoading: subLoading } = useQuery({
    queryKey: ["sale-subCategories"],
    queryFn: () => getSubCategories(),
    staleTime: 60_000,
  });

  const subCategories = React.useMemo(() => unwrapList<SaleSubCategory>(subRes), [subRes]);

  // ✅ 2) Load child categories DEPENDS on subcategory
  const subIdNum = React.useMemo(() => {
    const n = Number(subCategoryId);
    return Number.isFinite(n) ? n : null;
  }, [subCategoryId]);

  const {
    data: childRes,
    isLoading: childLoading,
  } = useQuery({
    queryKey: ["sale-childCategories", { subCategoryId }],
    queryFn: () => {
      // ✅ If "all" → fetch all child categories
      // ✅ If selected sub id → fetch only that sub's child categories
      if (subCategoryId === "all" || subIdNum === null) {
        return getChildCategories();
      }

      // Your categories API already supports params.
      // We pass sub_category_id so backend returns dependent child categories.
      return getChildCategories({ sub_category_id: subIdNum } as any);
    },
    staleTime: 60_000,
  });

  const childCategories = React.useMemo(() => unwrapList<SaleChildCategory>(childRes), [childRes]);

  // ✅ If backend returns all even after sub filter, keep UI safe:
  const filteredChildCategories = React.useMemo(() => {
    if (subCategoryId === "all" || subIdNum === null) return childCategories;
    return childCategories.filter((c) => Number(c.sub_category_id) === subIdNum);
  }, [childCategories, subCategoryId, subIdNum]);

  // ✅ Reset child category when sub changes
  React.useEffect(() => {
    setChildCategoryId("all");
  }, [subCategoryId]);

  // ✅ Reset pagination when filters/search change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, subCategoryId, childCategoryId]);

  // ✅ 3) Products list (debounced + correct query params)
  const productsQuery = useQuery({
    queryKey: ["sale-products", { q: debouncedQ.trim(), subCategoryId, childCategoryId, limit, offset }],
    queryFn: async () => {
      const params: any = {
        limit,
        offset, // you want offset=0 too — we pass it here (api helper may omit, but still OK)
      };

      const hasText = Boolean(debouncedQ.trim());
      const hasSub = subCategoryId !== "all" && subIdNum !== null;
      const childIdNum = Number.isFinite(Number(childCategoryId)) ? Number(childCategoryId) : null;
      const hasChild = childCategoryId !== "all" && childIdNum !== null;

      // ✅ when any filter/search → must send search=on
      if (hasText || hasSub || hasChild) {
        params.search = "on";
      }

      // ✅ search query key: backend expects q in your current usage
      if (hasText) {
        params.q = debouncedQ.trim();
      }

      if (hasSub) {
        params.sub_category_id = subIdNum;
      }

      if (hasChild) {
        params.child_category_id = childIdNum;
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
        "flex h-full flex-col rounded-2xl border border-gray-200 bg-white",
        "dark:border-gray-800 dark:bg-white/[0.03]"
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Product Section</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Filter and search products, then add to cart.
        </p>
      </div>

      {/* Body scroll */}
      <div className="flex-1 overflow-auto custom-scrollbar px-5 py-5 sm:px-6">
        {/* Filters */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-6">
            <ImageSelectDropdown
              value={subCategoryId}
              onChange={(v) => {
                setSubCategoryId(v);
                // child resets by effect, but we keep it instant too:
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
                placeholder="Search by name or SKU"
                className="w-full bg-transparent text-sm text-gray-700 outline-none dark:text-gray-200"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Search applies: <span className="font-semibold">/products?search=on</span>
            </p>
          </div>
        </div>

        {/* Product grid */}
        <div className="mt-5">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-[170px] animate-pulse rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.03]"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
