"use client";

import React from "react";
import { Pencil, Trash2, Plus } from "lucide-react";

import type { Product } from "./types";
import StatusToggle from "./StatusToggle";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";

type Props = {
  products: Product[];
  onStockPlus: (productId: string) => void;
  onToggleStatus: (productId: string, next: Product["status"]) => void;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
};

const formatCategoryPath = (p: Product) => {
  const { category, subCategory, childCategory } = p.categoryPath;
  return [category, subCategory, childCategory].filter(Boolean).join(" > ");
};

const formatMoney = (n: number) => {
  return `$ ${n.toFixed(2)}`;
};

const AllProductsTable: React.FC<Props> = ({
  products,
  onStockPlus,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      {/* ✅ Scroll ONLY inside table area */}
      <div className="w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain">
        <Table className="min-w-[1100px] border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950">
              <TableCell
                isHeader
                className="w-[70px] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-brand-500"
              >
                Sl
              </TableCell>

              <TableCell
                isHeader
                className="min-w-[320px] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-brand-500"
              >
                Product
              </TableCell>

              <TableCell
                isHeader
                className="min-w-[170px] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-brand-500"
              >
                Position
              </TableCell>

              <TableCell
                isHeader
                className="min-w-[300px] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-brand-500"
              >
                Category
              </TableCell>

              <TableCell
                isHeader
                className="min-w-[200px] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-brand-500"
              >
                Stock
              </TableCell>

              <TableCell
                isHeader
                className="min-w-[240px] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-brand-500"
              >
                Price
              </TableCell>

              <TableCell
                isHeader
                className="min-w-[140px] px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-brand-500"
              >
                Status
              </TableCell>

              <TableCell
                isHeader
                className="min-w-[160px] px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-brand-500"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map((p, idx) => {
              const lowStock = p.stockQty <= 10;

              return (
                <TableRow
                  key={p.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                >
                  <TableCell className="px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {idx + 1}
                  </TableCell>

                  {/* Product (image + name + sku) */}
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-brand-500/20" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[280px]">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {p.sku}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Position */}
                  <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    #{p.positionNumber}
                  </TableCell>

                  {/* Category */}
                  <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">
                    <span className="block truncate max-w-[320px]">{formatCategoryPath(p)}</span>
                  </TableCell>

                  {/* Stock */}
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "text-sm font-semibold",
                          lowStock ? "text-error-500" : "text-gray-900 dark:text-white",
                        ].join(" ")}
                      >
                        {p.stockQty}
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStockPlus(p.id)}
                        className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                        ariaLabel="Increase stock"
                      >
                        <Plus className="h-4 w-4 text-brand-600" />
                      </Button>

                      {lowStock && (
                        <span className="text-xs font-semibold text-error-500 bg-error-50 dark:bg-error-500/10 dark:text-error-300 px-2 py-1 rounded-full border border-error-100 dark:border-error-500/20">
                          Low
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="px-4 py-4">
                    <div className="leading-tight">
                      <div className="text-gray-900 dark:text-white font-semibold whitespace-nowrap">
                        {formatMoney(p.price)}
                      </div>

                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
                        <span>Discount: {p.discount ?? 0}%</span>
                        <span>Sale: {formatMoney(p.salePrice ?? p.price)}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-4 py-4">
                    <StatusToggle value={p.status} onChange={(next) => onToggleStatus(p.id, next)} />
                  </TableCell>

                  {/* Action */}
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(p.id)}
                        className="h-10 w-10"
                        ariaLabel="Edit product"
                      >
                        <Pencil className="h-4 w-4 text-brand-600" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(p.id)}
                        className="h-10 w-10 border-error-200 text-error-500 hover:text-error-600 dark:border-error-500/30"
                        ariaLabel="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {products.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  isHeader={false}
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (UI only) */}
      <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
        <button className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
          ‹
        </button>

        <button className="h-9 w-9 rounded-lg bg-brand-500 text-white font-semibold">1</button>
        <button className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
          2
        </button>
        <button className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
          3
        </button>

        <button className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
          ›
        </button>
      </div>
    </div>
  );
};

export default AllProductsTable;
