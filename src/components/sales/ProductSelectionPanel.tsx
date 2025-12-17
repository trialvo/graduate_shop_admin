import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import ProductAddModal from "./ProductAddModal";
import type { CartItem, SaleProduct } from "./types";

interface Props {
  products: SaleProduct[];
  shops: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  onAddToCart: (item: CartItem) => void;
}

const ProductSelectionPanel = ({ products, shops, categories, onAddToCart }: Props) => {
  const [shopId, setShopId] = useState(shops[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "all");
  const [q, setQ] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<SaleProduct | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      const catOk =
        categoryId === "all" ? true : p.category.toLowerCase() === categories.find(c => c.id === categoryId)?.name.toLowerCase();
      const qOk =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query);
      return catOk && qOk;
    });
  }, [products, q, categoryId, categories]);

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Product Section
        </h3>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-6">
          <select
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
            className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          >
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-6">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
