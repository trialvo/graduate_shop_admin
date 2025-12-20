"use client";

import React from "react";
import { Download, Search } from "lucide-react";

import type { Product } from "./types";
import { demoProducts } from "./data";
import AllProductsTable from "./AllProductsTable";

import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import StockUpdateModal, {
  StockUpdateModalProduct,
  StockUpdatePayload,
} from "@/components/dashboard/StockUpdateModal";

const AllProductsPage: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>(demoProducts);
  const [query, setQuery] = React.useState<string>("");

  // ✅ common modal state
  const [stockModalOpen, setStockModalOpen] = React.useState(false);
  const [stockModalProduct, setStockModalProduct] =
    React.useState<StockUpdateModalProduct | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryPath.category.toLowerCase().includes(q) ||
        (p.categoryPath.subCategory ?? "").toLowerCase().includes(q) ||
        (p.categoryPath.childCategory ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, query]);

  const openStockModal = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;

    setStockModalProduct({
      id: p.id,
      name: p.name,
      currentStock: p.stockQty,
    });
    setStockModalOpen(true);
  };

  /** ✅ professional payload handler (history + server-ready) */
  const applyStockUpdate = (payload: StockUpdatePayload) => {
    const { productId, type, qty } = payload;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;

        const current = p.stockQty;

        const next =
          type === "increase"
            ? current + Math.max(0, qty)
            : type === "decrease"
              ? current - Math.max(0, qty)
              : Math.max(0, qty); // set

        return { ...p, stockQty: Math.max(0, next) };
      })
    );

    // ✅ send to server + store history
    // await fetch("/api/stock/update", { method:"POST", body: JSON.stringify(payload) })
    console.log("Stock update request:", payload);
  };

  const toggleStatus = (productId: string, next: Product["status"]) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: next } : p))
    );
  };

  const onEdit = (productId: string) => console.log("edit", productId);

  const onDelete = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const lowStockCount = products.filter((p) => p.stockQty <= 10).length;

  return (
    <div className="w-full px-4 py-6 md:px-8">
      {/* Toolbar */}
      <div className="mb-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          {/* Search */}
          <div className="flex w-full lg:w-[420px]">
            <div className="relative w-full">
              <Input
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                placeholder="Ex : search item by name"
                className="h-11 rounded-l-xl rounded-r-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              />
            </div>

            <Button
              variant="primary"
              className="h-11 rounded-l-none rounded-r-xl px-4 bg-brand-500 hover:bg-brand-600"
              startIcon={<Search className="h-4 w-4" />}
              onClick={() => {}}
              type="button"
            >
              {/* icon only */}
            </Button>
          </div>

          {/* Export */}
          <Button
            variant="outline"
            className="h-11"
            startIcon={<Download className="h-4 w-4" />}
            onClick={() => console.log("export")}
            type="button"
          >
            Export
          </Button>

          {/* Low stock */}
          <Button
            variant="primary"
            className="h-11 bg-teal-700 hover:bg-teal-800"
            onClick={() => console.log("low stock list")}
            type="button"
          >
            Low Stock List ({lowStockCount})
          </Button>

          {/* New request */}
          <Button
            variant="primary"
            className="h-11 bg-teal-700 hover:bg-teal-800"
            onClick={() => console.log("new product request")}
            type="button"
          >
            New Product Request
          </Button>
        </div>
      </div>

      {/* Table */}
      <AllProductsTable
        products={filtered}
        onStockPlus={openStockModal}
        onToggleStatus={toggleStatus}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* ✅ Common Stock Modal */}
      <StockUpdateModal
        open={stockModalOpen}
        product={stockModalProduct}
        onClose={() => setStockModalOpen(false)}
        onApply={applyStockUpdate}
        minStockAfterUpdate={0}
      />
    </div>
  );
};

export default AllProductsPage;
