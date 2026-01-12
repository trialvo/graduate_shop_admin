// src/components/products/all-products/AllProductsPage.tsx
"use client";

import React from "react";
import toast from "react-hot-toast";
import { Download, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";

import AllProductsTable from "./AllProductsTable";
import type { Product, ProductListFilters } from "./types";
import { toUiProduct } from "./utils";

import { deleteProduct, getProducts, updateProductStatus } from "@/api/products.api";
import { getChildCategories, getMainCategories, getSubCategories } from "@/api/categories.api";

import EditProductModal from "./EditProductModal";
import StockVariantsModal from "./StockVariantsModal";
import DeleteProductConfirmModal from "./DeleteProductConfirmModal";

type Option = { value: string; label: string };

function unwrapList<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState<T>(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const AllProductsPage: React.FC = () => {
  const qc = useQueryClient();

  const [filters, setFilters] = React.useState<ProductListFilters>({
    q: "",
    mainCategoryId: undefined,
    subCategoryId: undefined,
    childCategoryId: undefined,
    brandId: undefined,
    status: undefined,
    featured: undefined,
    bestDeal: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    limit: 20,
    offset: 0, // state can keep 0, but API call won't send it
  });

  const debouncedQ = useDebouncedValue(filters.q, 450);

  const { data: mainRes } = useQuery({
    queryKey: ["mainCategories-all"],
    queryFn: () => getMainCategories(),
    staleTime: 60_000,
  });

  const { data: subRes } = useQuery({
    queryKey: ["subCategories-all"],
    queryFn: () => getSubCategories(),
    staleTime: 60_000,
  });

  const { data: childRes } = useQuery({
    queryKey: ["childCategories-all"],
    queryFn: () => getChildCategories(),
    staleTime: 60_000,
  });

  const mains = React.useMemo(() => unwrapList<any>(mainRes), [mainRes]);
  const subs = React.useMemo(() => unwrapList<any>(subRes), [subRes]);
  const childs = React.useMemo(() => unwrapList<any>(childRes), [childRes]);

  const mainNameById = React.useMemo(
    () => new Map(mains.map((c: any) => [Number(c.id), String(c.name)])),
    [mains],
  );
  const subNameById = React.useMemo(
    () => new Map(subs.map((c: any) => [Number(c.id), String(c.name)])),
    [subs],
  );
  const childNameById = React.useMemo(
    () => new Map(childs.map((c: any) => [Number(c.id), String(c.name)])),
    [childs],
  );

  const mainOptions: Option[] = React.useMemo(
    () => [{ value: "", label: "All Categories" }, ...mains.map((c: any) => ({ value: String(c.id), label: String(c.name) }))],
    [mains],
  );

  const availableSubs = React.useMemo(() => {
    if (!filters.mainCategoryId) return subs;
    return subs.filter((s: any) => Number(s.main_category_id) === Number(filters.mainCategoryId));
  }, [subs, filters.mainCategoryId]);

  const subOptions: Option[] = React.useMemo(
    () => [{ value: "", label: "All Sub Categories" }, ...availableSubs.map((c: any) => ({ value: String(c.id), label: String(c.name) }))],
    [availableSubs],
  );

  const availableChild = React.useMemo(() => {
    if (!filters.subCategoryId) return childs;
    return childs.filter((c: any) => Number(c.sub_category_id) === Number(filters.subCategoryId));
  }, [childs, filters.subCategoryId]);

  const childOptions: Option[] = React.useMemo(
    () => [{ value: "", label: "All Child Categories" }, ...availableChild.map((c: any) => ({ value: String(c.id), label: String(c.name) }))],
    [availableChild],
  );

  // ✅ initial request => only ?limit=20 (no offset=0, no search=on)
  const productsQuery = useQuery({
    queryKey: ["products", { ...filters, q: debouncedQ }],
    queryFn: () => {
      const params: any = { limit: filters.limit };

      if (filters.offset > 0) params.offset = filters.offset;
      if (debouncedQ.trim()) params.q = debouncedQ.trim();

      if (filters.mainCategoryId) params.main_category_id = filters.mainCategoryId;
      if (filters.subCategoryId) params.sub_category_id = filters.subCategoryId;
      if (filters.childCategoryId) params.child_category_id = filters.childCategoryId;
      if (filters.brandId) params.brand_id = filters.brandId;

      if (filters.status !== undefined) params.status = filters.status;
      if (filters.featured !== undefined) params.featured = filters.featured;
      if (filters.bestDeal !== undefined) params.best_deal = filters.bestDeal;

      if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
      if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;

      return getProducts(params);
    },
    staleTime: 0,
    retry: 1,
  });

  const uiProducts: Product[] = React.useMemo(() => {
    const list = productsQuery.data?.products ?? [];
    return list.map((p) => toUiProduct(p, { mainNameById, subNameById, childNameById }));
  }, [productsQuery.data, mainNameById, subNameById, childNameById]);

  // -----------------------
  // ✅ Stock modal state
  // -----------------------
  const [stockOpen, setStockOpen] = React.useState(false);
  const [stockProductId, setStockProductId] = React.useState<number | null>(null);
  const stockProductName = React.useMemo(() => {
    if (!stockProductId) return undefined;
    const p = productsQuery.data?.products?.find((x) => x.id === stockProductId);
    return p?.name;
  }, [productsQuery.data, stockProductId]);

  const onStockPlus = (productId: string) => {
    setStockProductId(Number(productId));
    setStockOpen(true);
  };

  // -----------------------
  // ✅ Edit/Delete modals
  // -----------------------
  const [editOpen, setEditOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const deleteName = React.useMemo(() => {
    const p = productsQuery.data?.products?.find((x) => x.id === deleteId);
    return p?.name;
  }, [productsQuery.data, deleteId]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted");
      setDeleteOpen(false);
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: ["products"] }).catch(() => undefined);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? "Failed to delete product";
      toast.error(msg);
    },
  });

  const onEdit = (productId: string) => {
    setEditId(Number(productId));
    setEditOpen(true);
  };

  const onDelete = (productId: string) => {
    setDeleteId(Number(productId));
    setDeleteOpen(true);
  };

  // -----------------------
  // ✅ Status toggle API
  // -----------------------
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: boolean }) => updateProductStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["products"] }).catch(() => undefined);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? "Failed to update status";
      toast.error(msg);
      qc.invalidateQueries({ queryKey: ["products"] }).catch(() => undefined);
    },
  });

  const onToggleStatus = (id: string, next: Product["status"]) => {
    const pid = Number(id);
    const nextBool = next === "active";

    // optimistic cache update
    qc.setQueriesData({ queryKey: ["products"] }, (old: any) => {
      if (!old?.products) return old;
      return {
        ...old,
        products: old.products.map((p: any) => (Number(p.id) === pid ? { ...p, status: nextBool } : p)),
      };
    });

    statusMutation.mutate({ id: pid, status: nextBool });
  };

  const lowStockCount = uiProducts.filter((p) => p.stockQty <= 10).length;

  const total = productsQuery.data?.total ?? 0;
  const limit = filters.limit;
  const offset = filters.offset;

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Toolbar */}
      <div className="rounded-[4px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="flex w-full lg:w-[420px] min-w-0">
              <div className="relative w-full min-w-0">
                <Input
                  value={filters.q}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFilters((p) => ({ ...p, q: e.target.value, offset: 0 }))
                  }
                  placeholder="Ex : search item by name"
                  className="h-11 rounded-l-xl rounded-r-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
                />
              </div>

              <Button
                variant="primary"
                className="h-11 rounded-l-none rounded-r-xl px-4 bg-brand-500 hover:bg-brand-600"
                startIcon={<Search className="h-4 w-4" />}
                onClick={() => productsQuery.refetch()}
                type="button"
                ariaLabel="Search"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                variant="outline"
                className="h-11"
                startIcon={<Download className="h-4 w-4" />}
                onClick={() => console.log("export")}
                type="button"
              >
                Export
              </Button>

              <Button
                variant="primary"
                className="h-11 bg-teal-700 hover:bg-teal-800"
                onClick={() => console.log("low stock list")}
                type="button"
              >
                Low Stock List ({lowStockCount})
              </Button>

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

          {/* Filters row */}
          <div className="rounded-[6px] border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Category Filter</div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <Select
                key={`main-${filters.mainCategoryId ?? ""}`}
                options={mainOptions}
                placeholder="All Categories"
                defaultValue={filters.mainCategoryId ? String(filters.mainCategoryId) : ""}
                onChange={(v) => {
                  const id = v ? Number(v) : undefined;
                  setFilters((p) => ({
                    ...p,
                    mainCategoryId: id,
                    subCategoryId: undefined,
                    childCategoryId: undefined,
                    offset: 0,
                  }));
                }}
              />

              <Select
                key={`sub-${filters.mainCategoryId ?? ""}-${filters.subCategoryId ?? ""}`}
                options={subOptions}
                placeholder="All Sub Categories"
                defaultValue={filters.subCategoryId ? String(filters.subCategoryId) : ""}
                onChange={(v) => {
                  const id = v ? Number(v) : undefined;
                  setFilters((p) => ({
                    ...p,
                    subCategoryId: id,
                    childCategoryId: undefined,
                    offset: 0,
                  }));
                }}
              />

              <Select
                key={`child-${filters.subCategoryId ?? ""}-${filters.childCategoryId ?? ""}`}
                options={childOptions}
                placeholder="All Child Categories"
                defaultValue={filters.childCategoryId ? String(filters.childCategoryId) : ""}
                onChange={(v) => {
                  const id = v ? Number(v) : undefined;
                  setFilters((p) => ({ ...p, childCategoryId: id, offset: 0 }));
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full min-w-0">
        <AllProductsTable
          products={uiProducts}
          onStockPlus={onStockPlus}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          className="h-10"
          onClick={() => setFilters((p) => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}
          disabled={!canPrev}
        >
          Prev
        </Button>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          {total === 0 ? "0" : `${offset + 1} - ${Math.min(offset + limit, total)}`} of {total}
        </div>

        <Button
          variant="outline"
          className="h-10"
          onClick={() => setFilters((p) => ({ ...p, offset: p.offset + p.limit }))}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>

      {/* ✅ Stock modal (variations) */}
      <StockVariantsModal
        open={stockOpen}
        productId={stockProductId}
        productName={stockProductName}
        onClose={() => {
          setStockOpen(false);
          setStockProductId(null);
        }}
        onUpdated={() => qc.invalidateQueries({ queryKey: ["products"] }).catch(() => undefined)}
      />

      {/* Edit */}
      <EditProductModal
        open={editOpen}
        productId={editId}
        onClose={() => setEditOpen(false)}
        onUpdated={() => qc.invalidateQueries({ queryKey: ["products"] }).catch(() => undefined)}
      />

      {/* Delete */}
      <DeleteProductConfirmModal
        open={deleteOpen}
        productName={deleteName}
        loading={deleteMutation.isPending}
        onClose={() => {
          if (deleteMutation.isPending) return;
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={() => {
          if (!deleteId) return;
          deleteMutation.mutate(deleteId);
        }}
      />
    </div>
  );
};

export default AllProductsPage;
