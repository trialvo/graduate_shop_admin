import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import ProductAddModal from "./ProductAddModal";
import type { CartItem, SaleProduct } from "./types";
import ImageSelectDropdown from "../ui/dropdown/ImageSelectDropdown";

interface Props {
  products: SaleProduct[];
  categories: { id: string; name: string; image: string }[];
  onAddToCart: (item: CartItem) => void;
}

const ProductSelectionPanel = ({ products, categories, onAddToCart }: Props) => {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "all");
  const [subCategoryId, setSubCategoryId] = useState<string>("all");
  const [q, setQ] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<SaleProduct | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name;
      const catOk = categoryId === "all" ? true : p.category === selectedCategoryName;

      const subOk = subCategoryId === "all" ? true : p.subCategory === subCategoryId;

      const qOk =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query);

      return catOk && subOk && qOk;
    });
  }, [products, q, categoryId, subCategoryId, categories]);

  const subCategoryOptions = useMemo(() => {
    const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name;
    const pool =
      categoryId === "all"
        ? products
        : products.filter((p) => p.category === selectedCategoryName);

    const unique = Array.from(
      new Set(
        pool
          .map((p) => p.subCategory)
          .filter((name): name is string => Boolean(name))
      )
    );

    return [
      { id: "all", label: "Sub Category" },
      ...unique.map((name) => ({ id: name, label: name })),
    ];
  }, [products, categories, categoryId]);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ id: c.id, label: c.name, image: c.image })),
    [categories]
  );

  // Reset sub-category when category changes
  const handleCategoryChange = (next: string) => {
    setCategoryId(next);
    setSubCategoryId("all");
  };

  return (
    <div className="h-full rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Product Section
        </h3>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-6">
          {/* Replace "Organic Shop" dropdown with "All Categories" (with images) */}
          <ImageSelectDropdown
            value={categoryId}
            onChange={handleCategoryChange}
            options={categoryOptions}
            placeholder="All Categories"
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          {/* Replace "All Categories" dropdown with "Sub Category" */}
          <ImageSelectDropdown
            value={subCategoryId}
            onChange={setSubCategoryId}
            options={subCategoryOptions}
            placeholder="Sub Category"
          />
        </div>

        <div className="col-span-12">
          <div className="flex h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
            <Search size={18} className="text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by product name"
              className="w-full bg-transparent text-sm text-gray-700 outline-none dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="mt-4 flex-1 overflow-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onClick={() => {
                setSelected(p);
                setModalOpen(true);
              }}
            />
          ))}
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
