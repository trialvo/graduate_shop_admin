import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import ImageSelectDropdown from "@/components/ui/dropdown/ImageSelectDropdown";
import ProductCard from "./ProductCard";
import ProductAddModal from "./ProductAddModal";

import { getSubCategories, getChildCategories } from "@/api/categories.api";
import { getProducts, type Product } from "@/api/products.api";
import type { CartItem } from "./types";
import { toPublicUrl } from "@/utils/toPublicUrl";

const PAGE_SIZE = 15;

interface Props {
  onAddToCart: (item: CartItem) => void;
}

export default function ProductSelectionPanel({ onAddToCart }: Props) {
  /* =========================
   * Filters & Pagination
   * ========================= */
  const [subCategoryId, setSubCategoryId] = useState<string>("all");
  const [childCategoryId, setChildCategoryId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  /* =========================
   * Modal state
   * ========================= */
  const [openModal, setOpenModal] = useState(false);
  const [activeProductId, setActiveProductId] = useState<number | null>(null);

  /* =========================
   * Sub Categories
   * ========================= */
  const { data: subRes } = useQuery({
    queryKey: ["subCategories"],
    queryFn: () => getSubCategories(),
  });

  const subCategories = subRes?.data ?? [];

  /* =========================
   * Child Categories
   * ========================= */
  const { data: childRes } = useQuery({
    queryKey: ["childCategories", subCategoryId],
    queryFn: () =>
      getChildCategories(
        subCategoryId === "all"
          ? undefined
          : { sub_category_id: Number(subCategoryId) }
      ),
    enabled: subCategoryId !== "all",
  });

  const childCategories = childRes?.data ?? [];

  /* =========================
   * Products
   * ========================= */
const { data: productsRes, isLoading } = useQuery({
  queryKey: [
    "products",
    search,
    subCategoryId,
    childCategoryId,
    page,
  ],
  queryFn: () =>
    getProducts({
      search: search || undefined, // ✅ CHANGED HERE
      sub_category_id:
        subCategoryId === "all" ? undefined : Number(subCategoryId),
      child_category_id:
        childCategoryId === "all" ? undefined : Number(childCategoryId),
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
  placeholderData: (prev) => prev,
});

  const products: Product[] = productsRes?.products ?? [];
  const total = productsRes?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* =========================
   * Render
   * ========================= */
  return (
    <div className="flex h-full flex-col rounded-[6px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
        Product Section
      </h3>

      {/* =========================
       * Filters
       * ========================= */}
      <div className="grid grid-cols-12 gap-3">
        {/* Sub Category */}
        <div className="col-span-6">
          <ImageSelectDropdown
            value={subCategoryId}
            onChange={(v) => {
              setSubCategoryId(v);
              setChildCategoryId("all");
              setPage(0);
            }}
            placeholder="All Sub Categories"
            options={[
              { id: "all", label: "All Sub Categories" },
              ...subCategories.map((s) => ({
                id: String(s.id),
                label: s.name,
                image: toPublicUrl(s.img_path),
              })),
            ]}
          />
        </div>

        {/* Child Category */}
        <div className="col-span-6">
          <ImageSelectDropdown
            value={childCategoryId}
            onChange={(v) => {
              setChildCategoryId(v);
              setPage(0);
            }}
            placeholder="All Child Categories"
            disabled={subCategoryId === "all"}
            options={[
              { id: "all", label: "All Child Categories" },
              ...childCategories.map((c) => ({
                id: String(c.id),
                label: c.name,
                image: toPublicUrl(c.img_path),
              })),
            ]}
          />
        </div>

        {/* Search */}
        <div className="col-span-12">
          <div className="flex h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
            <Search size={18} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by product name / SKU"
              className="w-full bg-transparent text-sm text-gray-700 outline-none dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* =========================
       * Product Grid
       * ========================= */}
      <div className="mt-4 flex-1 overflow-auto custom-scrollbar">
        {products.length === 0 && !isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => {
                  setActiveProductId(product.id);
                  setOpenModal(true);
                }}
              />
            ))}
          </div>
        )}

        {isLoading && (
          <div className="py-6 text-center text-sm text-gray-500">
            Loading products…
          </div>
        )}
      </div>

      {/* =========================
       * Pagination
       * ========================= */}
      <div className="mt-4 flex items-center justify-between">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className="rounded px-3 py-1 text-sm disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm text-gray-600 dark:text-gray-300">
          Page {page + 1} / {totalPages}
        </span>

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded px-3 py-1 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* =========================
       * Product Modal
       * ========================= */}
      <ProductAddModal
        open={openModal}
        productId={activeProductId}
        onClose={() => {
          setOpenModal(false);
          setActiveProductId(null);
        }}
        onAdd={onAddToCart}
      />
    </div>
  );
}
