// src/components/products/product-attributes/ProductAttributesPage.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

import BrandTab from "./tabs/BrandTab";
import ColorTab from "./tabs/ColorTab";
import AttributeTab from "./tabs/AttributeTab";

const TABS = ["brand", "color", "attribute"] as const;
type TabType = (typeof TABS)[number];

export default function ProductAttributesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("brand");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Product Attributes
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage brand, color, attributes and product variants dynamically
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex w-full max-w-4xl rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {TABS.map((tab) => {
          const label =
            tab === "brand"
              ? "Product Brand"
              : tab === "color"
              ? "Product Color"
              : "Attribute / Variant";

          const active = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-semibold transition",
                active
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "brand" ? <BrandTab /> : null}
      {activeTab === "color" ? <ColorTab /> : null}
      {activeTab === "attribute" ? <AttributeTab /> : null}
    </div>
  );
}
