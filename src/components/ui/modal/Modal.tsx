import { X } from "lucide-react";
import React, { useEffect } from "react";

import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

const SIZE_CLASS: Record<NonNullable<Props["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = "md",
}: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Dialog */}
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            "w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-900",
            SIZE_CLASS[size]
          )}
          role="dialog"
          aria-modal="true"
        >
          {(title || description) && (
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
              <div>
                {title ? (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="px-6 py-5">{children}</div>

          {footer ? (
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-end">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
