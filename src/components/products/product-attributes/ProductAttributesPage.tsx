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

  const tabsHeader = (
    <div className="flex w-full gap-1 overflow-x-auto rounded-[4px] border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
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
              "flex-1 whitespace-nowrap rounded-[4px] px-3 py-2 text-xs font-semibold transition sm:text-sm",
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
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Product Attributes
          </h1>
        </div>
      </div>

      {/* Content */}
      {activeTab === "brand" ? <BrandTab tabsHeader={tabsHeader} /> : null}
      {activeTab === "color" ? <ColorTab tabsHeader={tabsHeader} /> : null}
      {activeTab === "attribute" ? <AttributeTab tabsHeader={tabsHeader} /> : null}
    </div>
  );
}
