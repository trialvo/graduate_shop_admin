// src/components/products/all-products/modals/BaseModal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative max-h-[94vh] flex flex-col overflow-hidden",
          "rounded-xl border border-gray-200/80 bg-white shadow-2xl",
          "dark:border-gray-700/60 dark:bg-gray-900",
          widthClassName,
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="min-w-0 flex-1">
            {title ? (
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              "border border-gray-200 text-gray-500 transition-all",
              "hover:bg-gray-100 hover:text-gray-700",
              "dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
            )}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-950/50">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
