// src/components/products/product-create/ProductEditModal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

import ProductForm from "./ProductForm";
import { getProduct } from "@/api/products.api";

type Props = {
  open: boolean;
  productId: number | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function ProductEditModal({ open, productId, onClose, onUpdated }: Props) {
  const enabled = open && Boolean(productId);

  const { data, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId as number),
    enabled,
    staleTime: 0,
    retry: 1,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[1100px] overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-white">Edit Product</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Update product fields, upload images, and remove existing images.
            </p>
          </div>

          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
              "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]",
            )}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-5">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
              <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
              <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
            </div>
          ) : (
            <ProductForm
              mode="edit"
              productId={productId as number}
              initialProduct={data?.product ?? null}
              onClose={onClose}
              onSuccess={() => onUpdated?.()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
