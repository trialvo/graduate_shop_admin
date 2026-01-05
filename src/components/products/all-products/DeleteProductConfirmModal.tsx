// src/components/products/all-products/modals/DeleteProductConfirmModal.tsx
"use client";

import React from "react";
import Button from "@/components/ui/button/Button";
import BaseModal from "./BaseModal";

type Props = {
  open: boolean;
  productName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteProductConfirmModal({
  open,
  productName,
  loading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <BaseModal
      open={open}
      title="Delete product"
      description="This action cannot be undone. This will permanently delete the product."
      widthClassName="w-[520px]"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-error-600 hover:bg-error-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      }
    >
      <div className="rounded-[6px] border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
        You’re about to delete:{" "}
        <span className="font-semibold">{productName ?? "this product"}</span>
      </div>
    </BaseModal>
  );
}
