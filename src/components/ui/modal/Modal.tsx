import React from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;

  bodyClassName?: string;

  /** customize only specific modal UI */
  contentClassName?: string;
};

export default function Modal({
  open,
  title,
  description,
  size = "md",
  onClose,
  footer,
  children,
  bodyClassName,
  contentClassName,
}: ModalProps) {
  if (!open) return null;

  const sizeClass =
    size === "sm"
      ? "max-w-md"
      : size === "lg"
        ? "max-w-3xl"
        : size === "xl"
          ? "max-w-5xl"
          : "max-w-xl";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal"
      />

      {/* Modal */}
      <div
        className={cn(
          "relative z-[10000] w-full bg-white shadow-theme-xs dark:bg-gray-900",
          "overflow-hidden", // ✅ IMPORTANT: clip header/footer so rounded corners show
          "rounded-[4px]", // default
          sizeClass,
          contentClassName // ✅ e.g. rounded-[6px]
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
              {description ? (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={cn("max-h-[500px] overflow-y-auto px-5 py-5", bodyClassName)}>
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
