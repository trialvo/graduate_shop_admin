import { useMemo, useState } from "react";

import type {
  AttributeDefinition,
  BrandRow,
  ColorRow,
  ProductAttributeSelection,
  ProductLite,
  VariantRow,
} from "./types";

import {
  INITIAL_ATTRIBUTES,
  INITIAL_BRANDS,
  INITIAL_COLORS,
  INITIAL_PRODUCTS,
  INITIAL_VARIANTS,
} from "./mockData";

import BrandTab from "./tabs/BrandTab";
import ColorTab from "./tabs/ColorTab";
import AttributeTab from "./tabs/AttributeTab";
// import VariantTab from "./tabs/VariantTab";

const TABS = ["brand", "color", "attribute", "variant"] as const;
type TabType = (typeof TABS)[number];

export default function ProductAttributesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("brand");

  const [brands, setBrands] = useState<BrandRow[]>(INITIAL_BRANDS);
  const [colors, setColors] = useState<ColorRow[]>(INITIAL_COLORS);
  const [attributes, setAttributes] =
    useState<AttributeDefinition[]>(INITIAL_ATTRIBUTES);

  const [products] = useState<ProductLite[]>(INITIAL_PRODUCTS);

  // productId -> { attributeId -> selected values[] }
  const [productAttributeMap, setProductAttributeMap] = useState<
    Record<number, ProductAttributeSelection>
  >({});

  const [variants, setVariants] = useState<VariantRow[]>(INITIAL_VARIANTS);

  const activeAttributes = useMemo(
    () => attributes.filter((a) => a.status),
    [attributes]
  );

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
      <div className="inline-flex w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {TABS.map((tab) => {
          const label =
            tab === "brand"
              ? "Product Brand"
              : tab === "color"
              ? "Product Color"
              : tab === "attribute"
              ? "Attribute / Size"
              : "Variant";

          const active = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "flex-1 px-4 py-3 text-sm font-semibold transition",
                active
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "brand" && (
        <BrandTab brands={brands} onChange={setBrands} />
      )}

      {activeTab === "color" && (
        <ColorTab colors={colors} onChange={setColors} />
      )}

      {activeTab === "attribute" && (
        <AttributeTab attributes={attributes} onChange={setAttributes} />
      )}

      {/* {activeTab === "variant" && (
        <VariantTab
          products={products}
          brands={brands}
          colors={colors}
          attributeDefs={activeAttributes}
          productAttributeMap={productAttributeMap}
          onChangeProductAttributeMap={setProductAttributeMap}
          variants={variants}
          onChangeVariants={setVariants}
        />
      )} */}
    </div>
  );
}
