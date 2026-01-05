// src/components/ui/button/StatusToggle.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props<T extends string> = {
  value: T;
  onChange: (v: T) => void;

  /** default: "active" */
  onValue?: T;
  /** default: "inactive" */
  offValue?: T;

  disabled?: boolean;
  className?: string;
};

const StatusToggle = <T extends string,>({
  value,
  onChange,
  onValue = "active" as T,
  offValue = "inactive" as T,
  disabled = false,
  className,
}: Props<T>) => {
  const checked = String(value).toLowerCase() === String(onValue).toLowerCase();

  return (
    <button
      onClick={() => {
        if (disabled) return;
        onChange(checked ? offValue : onValue);
      }}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full transition border",
        checked
          ? "bg-brand-500 border-brand-600"
          : "bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
      aria-label="Toggle status"
      aria-pressed={checked}
      type="button"
      disabled={disabled}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 transform rounded-full bg-white shadow transition",
          checked ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
};

export default StatusToggle;
