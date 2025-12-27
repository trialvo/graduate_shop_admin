// src/components/products/all-products/StatusToggle.tsx
"use client";

import React from "react";
import type { ProductStatus } from "./types";
import { cn } from "@/lib/utils";

type Props = {
  value: ProductStatus;
  onChange: (v: ProductStatus) => void;
};

const StatusToggle: React.FC<Props> = ({ value, onChange }) => {
  const checked = value === "active";

  return (
    <button
      onClick={() => onChange(checked ? "inactive" : "active")}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full transition border",
        checked
          ? "bg-brand-500 border-brand-600"
          : "bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
      )}
      aria-label="Toggle status"
      type="button"
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
