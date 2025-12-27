// src/components/products/all-products/modals/BaseModal.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  widthClassName?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
};

export default function BaseModal({
  open,
  title,
  description,
  widthClassName = "w-[980px]",
  children,
  footer,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div
          className={cn(
            "max-h-[92vh] overflow-hidden rounded-[6px] border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900",
            widthClassName,
          )}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <div className="min-w-0">
              {title ? (
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              ) : null}
              {description ? (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              className="h-9 w-9 rounded-[6px] border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.04]"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="max-h-[calc(92vh-120px)] overflow-y-auto px-5 py-4">
            {children}
          </div>

          {footer ? (
            <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
