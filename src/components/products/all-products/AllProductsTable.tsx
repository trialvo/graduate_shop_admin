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
  // keep simple; replace later with currency util
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
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-950">
              <TableCell isHeader className="w-[70px] text-gray-600 dark:text-gray-300">
                Sl
              </TableCell>

              <TableCell isHeader className="min-w-[320px] text-gray-600 dark:text-gray-300">
                Product name
              </TableCell>

              <TableCell isHeader className="min-w-[170px] text-gray-600 dark:text-gray-300">
                Product position
              </TableCell>

              <TableCell isHeader className="min-w-[300px] text-gray-600 dark:text-gray-300">
                Category
              </TableCell>

              <TableCell isHeader className="min-w-[200px] text-gray-600 dark:text-gray-300">
                Quantity available
              </TableCell>

              <TableCell isHeader className="min-w-[240px] text-gray-600 dark:text-gray-300">
                Price
              </TableCell>

              <TableCell isHeader className="min-w-[140px] text-gray-600 dark:text-gray-300">
                Status
              </TableCell>

              <TableCell isHeader className="min-w-[140px] text-gray-600 dark:text-gray-300">
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
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.04] border-gray-200 dark:border-gray-800"
                >
                  <TableCell className="text-gray-600 dark:text-gray-300">{idx + 1}</TableCell>

                  {/* Product name (image + name + sku) */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-brand-500/20" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[240px]">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {p.sku}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* position number */}
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    #{p.positionNumber}
                  </TableCell>

                  {/* category path */}
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {formatCategoryPath(p)}
                  </TableCell>

                  {/* quantity + plus */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "font-semibold",
                          lowStock ? "text-red-600" : "text-gray-900 dark:text-gray-100",
                        ].join(" ")}
                      >
                        {p.stockQty}
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStockPlus(p.id)}
                        className="h-7 w-7 rounded-full"
                      >
                        <Plus className="h-4 w-4 text-brand-600" />
                      </Button>

                      {lowStock && (
                        <span className="text-xs text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-300 px-2 py-1 rounded-full border border-red-100 dark:border-red-500/20">
                          Low
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* price */}
                  <TableCell>
                    <div className="leading-tight">
                      <div className="text-gray-900 dark:text-gray-100 font-semibold">
                        {formatMoney(p.price)}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
                        <span>Discount: {p.discount ?? 0}%</span>
                        <span>Sale: {formatMoney(p.salePrice ?? p.price)}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* status toggle */}
                  <TableCell>
                    <StatusToggle
                      value={p.status}
                      onChange={(next) => onToggleStatus(p.id, next)}
                    />
                  </TableCell>

                  {/* action */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(p.id)}
                        className="h-10 w-10"
                      >
                        <Pencil className="h-4 w-4 text-brand-600" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(p.id)}
                        className="h-10 w-10 border-red-300 text-red-600 hover:text-red-600"
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
                <TableCell className="py-10 text-center text-gray-500 dark:text-gray-400">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (UI only) */}
      <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
        <button className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
          ‹
        </button>

        <button className="h-9 w-9 rounded-lg bg-brand-500 text-white font-semibold">1</button>
        <button className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
          2
        </button>
        <button className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
          3
        </button>

        <button className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
          ›
        </button>
      </div>
    </div>
  );
};

export default AllProductsTable;
