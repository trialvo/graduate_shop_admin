import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Wand2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import RichTextEditor from "@/components/ui/editor/RichTextEditor";
import ImageMultiUploader, { type UploadedImage } from "@/components/ui/upload/ImageMultiUploader";
import VideoUploader, { type UploadedVideo } from "@/components/ui/upload/VideoUploader";

import VariantMatrix from "./components/VariantMatrix";

import {
  INITIAL_ATTRIBUTES,
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_CHILD_CATEGORIES,
  INITIAL_COLORS,
  INITIAL_SUB_CATEGORIES,
} from "./mockData";

import type { DiscountType, Option, ProductStatusFlags, SeoMeta, VariantMatrixRow } from "./types";
import { genSkuFromParts, safeNumber, slugify } from "./utils";

type SkuMode = "auto" | "manual";

const DISCOUNT_TYPE_OPTIONS: Option[] = [
  { value: "percent", label: "Percent (%)" },
  { value: "flat", label: "Flat amount" },
];

const ROBOTS_OPTIONS: Option[] = [
  { value: "index,follow", label: "index,follow" },
  { value: "noindex,follow", label: "noindex,follow" },
  { value: "index,nofollow", label: "index,nofollow" },
  { value: "noindex,nofollow", label: "noindex,nofollow" },
];

export default function CreateProductPage() {
  // Data
  const categories = INITIAL_CATEGORIES;
  const subCategories = INITIAL_SUB_CATEGORIES;
  const childCategories = INITIAL_CHILD_CATEGORIES;

  const brands = INITIAL_BRANDS.filter((b) => b.status);
  const colors = INITIAL_COLORS.filter((c) => c.status);
  const attributeDefs = INITIAL_ATTRIBUTES.filter((a) => a.status);

  // Basic
  const [productName, setProductName] = useState<string>("");
  const [productSlug, setProductSlug] = useState<string>("");
  const [slugLocked, setSlugLocked] = useState<boolean>(false);

  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id ?? 0);
  const availableSub = useMemo(
    () => subCategories.filter((s) => s.categoryId === categoryId),
    [subCategories, categoryId]
  );
  const [subCategoryId, setSubCategoryId] = useState<number>(availableSub[0]?.id ?? 0);

  const availableChild = useMemo(
    () => childCategories.filter((c) => c.subCategoryId === subCategoryId),
    [childCategories, subCategoryId]
  );
  const [childCategoryId, setChildCategoryId] = useState<number>(availableChild[0]?.id ?? 0);

  const [brandId, setBrandId] = useState<number>(brands[0]?.id ?? 1);

  // SKU
  const [skuMode, setSkuMode] = useState<SkuMode>("auto");
  const [sku, setSku] = useState<string>("");

  // Pricing
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [resellerPrice, setResellerPrice] = useState<number>(0);
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState<number>(0);

  // ✅ NEW: Variant Matrix selections
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const defaultAttrId = attributeDefs.find((a) => a.name.toLowerCase().includes("size"))?.id ?? (attributeDefs[0]?.id ?? 0);
  const [activeAttributeId, setActiveAttributeId] = useState<number>(defaultAttrId);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [variantMatrix, setVariantMatrix] = useState<VariantMatrixRow[]>([]);

  // Media
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [video, setVideo] = useState<UploadedVideo>({ kind: "none" });

  // Descriptions
  const [shortDescription, setShortDescription] = useState<string>("");
  const [detailsDescription, setDetailsDescription] = useState<string>("");

  // SEO
  const [seo, setSeo] = useState<SeoMeta>({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    robots: "index,follow",
  });

  // Flags
  const [flags, setFlags] = useState<ProductStatusFlags>({
    status: true,
    featured: false,
    freeDelivery: false,
    bestDeal: false,
  });

  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  // Auto slug
  useEffect(() => {
    if (slugLocked) return;
    setProductSlug(slugify(productName));
  }, [productName, slugLocked]);

  // Update available sub/child when parent changes
  useEffect(() => {
    if (availableSub.length === 0) {
      setSubCategoryId(0);
      return;
    }
    if (!availableSub.some((s) => s.id === subCategoryId)) {
      setSubCategoryId(availableSub[0].id);
    }
  }, [availableSub, subCategoryId]);

  useEffect(() => {
    if (availableChild.length === 0) {
      setChildCategoryId(0);
      return;
    }
    if (!availableChild.some((c) => c.id === childCategoryId)) {
      setChildCategoryId(availableChild[0].id);
    }
  }, [availableChild, childCategoryId]);

  // Discount
  const discountAmount = useMemo(() => {
    const v = Math.max(0, discountValue);
    if (sellPrice <= 0) return 0;
    if (discountType === "percent") return Math.min(sellPrice, (sellPrice * v) / 100);
    return Math.min(sellPrice, v);
  }, [discountType, discountValue, sellPrice]);

  const finalSellPrice = useMemo(() => {
    const n = Math.max(0, sellPrice - discountAmount);
    return Number.isFinite(n) ? n : 0;
  }, [sellPrice, discountAmount]);

  // SKU generator
  const generateSku = () => {
    const cat = categories.find((c) => c.id === categoryId)?.name ?? "CAT";
    const sub = subCategories.find((s) => s.id === subCategoryId)?.name ?? "SUB";
    const child = childCategories.find((c) => c.id === childCategoryId)?.name ?? "CHILD";
    const brand = brands.find((b) => b.id === brandId)?.name ?? "BRAND";
    const name = productName || "PRODUCT";
    const next = genSkuFromParts([brand, cat, sub, child, name]);
    setSku(next);
  };

  useEffect(() => {
    if (skuMode !== "auto") return;
    if (!productName) return;
    generateSku();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skuMode, productName, categoryId, subCategoryId, childCategoryId, brandId]);

  // Options
  const categoryOptions: Option[] = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories]
  );
  const subOptions: Option[] = useMemo(
    () => availableSub.map((s) => ({ value: String(s.id), label: s.name })),
    [availableSub]
  );
  const childOptions: Option[] = useMemo(
    () => availableChild.map((c) => ({ value: String(c.id), label: c.name })),
    [availableChild]
  );
  const brandOptions: Option[] = useMemo(
    () => brands.map((b) => ({ value: String(b.id), label: b.name })),
    [brands]
  );

  const totalStock = useMemo(() => {
    return variantMatrix.reduce((sum, r) => sum + Math.max(0, r.stock), 0);
  }, [variantMatrix]);

  const validateForm = (): string | null => {
    if (!productName.trim()) return "Product name is required.";
    if (!productSlug.trim()) return "Product slug is required.";
    if (!categoryId) return "Category is required.";
    if (!subCategoryId) return "Sub category is required.";
    if (!childCategoryId) return "Child category is required.";
    if (!brandId) return "Brand is required.";
    if (!sku.trim()) return "SKU / Barcode is required.";
    if (sellPrice <= 0) return "Selling price must be greater than 0.";

    // Matrix rules
    if (selectedColorIds.length === 0) return "Please select at least 1 color.";
    if (selectedValues.length === 0) return "Please select at least 1 attribute value (e.g. size).";
    if (variantMatrix.length === 0) return "Variant matrix is empty. Select colors & values.";

    return null;
  };

  const submit = () => {
    setSubmitMessage("");
    const err = validateForm();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError("");

    const payload = {
      productName,
      productSlug,
      categoryId,
      subCategoryId,
      childCategoryId,
      brandId,
      skuMode,
      sku,
      pricing: {
        buyPrice,
        sellPrice,
        resellerPrice,
        discountType,
        discountValue,
        discountAmount,
        finalSellPrice,
      },
      variantConcept: "color_dropdown + attribute_values_matrix",
      variantMatrix,
      totalStock,
      media: {
        images: images.map((i) => ({ name: i.file.name, size: i.file.size, type: i.file.type })),
        video: video.kind === "file" ? { kind: "file", name: video.file.name } : video,
      },
      descriptions: { shortDescription, detailsDescription },
      seo,
      flags,
    };

    console.log("Create product payload:", payload);
    setSubmitMessage("Product draft prepared successfully (check console payload).");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Product</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Advanced product creation form with dynamic attribute matrix & variants
        </p>
      </div>

      {validationError ? (
        <div className="rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700 dark:border-error-900/40 dark:bg-error-500/10 dark:text-error-300">
          {validationError}
        </div>
      ) : null}

      {submitMessage ? (
        <div className="rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700 dark:border-success-900/40 dark:bg-success-500/10 dark:text-success-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            {submitMessage}
          </div>
        </div>
      ) : null}

      {/* Basic Info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Name <span className="text-error-500">*</span>
            </p>
            <Input placeholder="Product name" value={productName} onChange={(e) => setProductName(String(e.target.value))} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Product Slug <span className="text-error-500">*</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Auto</span>
                <Switch
                  key={`slug-${slugLocked}`}
                  label=""
                  defaultChecked={!slugLocked}
                  onChange={(checked) => setSlugLocked(!checked)}
                />
              </div>
            </div>

            <Input
              placeholder="product-slug"
              value={productSlug}
              onChange={(e) => {
                setProductSlug(String(e.target.value));
                setSlugLocked(true);
              }}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tip: if Auto enabled, slug will be generated from product name.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category <span className="text-error-500">*</span>
            </p>
            <Select
              key={`cat-${categoryId}`}
              options={categoryOptions}
              placeholder="Select category"
              defaultValue={String(categoryId)}
              onChange={(v) => setCategoryId(Number(v))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sub Category <span className="text-error-500">*</span>
            </p>
            <Select
              key={`sub-${categoryId}-${subCategoryId}`}
              options={subOptions}
              placeholder="Select sub category"
              defaultValue={String(subCategoryId)}
              onChange={(v) => setSubCategoryId(Number(v))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Child Category <span className="text-error-500">*</span>
            </p>
            <Select
              key={`child-${subCategoryId}-${childCategoryId}`}
              options={childOptions}
              placeholder="Select child category"
              defaultValue={String(childCategoryId)}
              onChange={(v) => setChildCategoryId(Number(v))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Brand <span className="text-error-500">*</span>
            </p>
            <Select
              key={`brand-${brandId}`}
              options={brandOptions}
              placeholder="Select brand"
              defaultValue={String(brandId)}
              onChange={(v) => setBrandId(Number(v))}
            />
          </div>

          {/* SKU */}
          <div className="space-y-2 lg:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                SKU / Barcode <span className="text-error-500">*</span>
              </p>

              <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => setSkuMode("auto")}
                  className={[
                    "px-4 py-2 text-sm font-semibold transition",
                    skuMode === "auto"
                      ? "bg-brand-500 text-white"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]",
                  ].join(" ")}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => setSkuMode("manual")}
                  className={[
                    "px-4 py-2 text-sm font-semibold transition",
                    skuMode === "manual"
                      ? "bg-brand-500 text-white"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]",
                  ].join(" ")}
                >
                  Manual
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="SKU"
                  value={sku}
                  onChange={(e) => setSku(String(e.target.value))}
                  disabled={skuMode === "auto"}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(sku).catch(() => undefined);
                  }}
                  disabled={!sku.trim()}
                  startIcon={<Copy size={16} />}
                >
                  Copy
                </Button>
                <Button
                  onClick={generateSku}
                  disabled={skuMode !== "auto"}
                  startIcon={<Wand2 size={16} />}
                >
                  Generate
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Auto mode will generate SKU based on brand/category/name.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing</h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Buy Price</p>
            <Input
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(safeNumber(String(e.target.value), buyPrice))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selling Price <span className="text-error-500">*</span>
            </p>
            <Input
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(safeNumber(String(e.target.value), sellPrice))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reseller Price</p>
            <Input
              type="number"
              value={resellerPrice}
              onChange={(e) => setResellerPrice(safeNumber(String(e.target.value), resellerPrice))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount Type</p>
            <Select
              key={`dtype-${discountType}`}
              options={DISCOUNT_TYPE_OPTIONS}
              placeholder="Discount type"
              defaultValue={discountType}
              onChange={(v) => setDiscountType(v as DiscountType)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount Value</p>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(safeNumber(String(e.target.value), discountValue))}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Discount amount: <span className="font-semibold">{discountAmount.toFixed(2)}</span>, Final selling price:{" "}
              <span className="font-semibold">{finalSellPrice.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ✅ NEW Attributes & Variants Concept */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Attributes & Variants</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Color dropdown → auto add table. Attribute values → rows under each color (like your screenshot).
          </p>
        </div>

        <VariantMatrix
          colors={colors}
          attributeDefs={attributeDefs}
          baseBuyPrice={buyPrice}
          baseOldPrice={sellPrice}
          baseNewPrice={finalSellPrice}
          selectedColorIds={selectedColorIds}
          onChangeSelectedColorIds={setSelectedColorIds}
          activeAttributeId={activeAttributeId}
          onChangeActiveAttributeId={setActiveAttributeId}
          selectedValues={selectedValues}
          onChangeSelectedValues={setSelectedValues}
          matrix={variantMatrix}
          onChangeMatrix={setVariantMatrix}
        />

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Total stock from variants: <span className="font-semibold">{totalStock}</span>
        </div>
      </div>

      {/* Media */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media</h2>
        <ImageMultiUploader
          label="Product Images"
          images={images}
          onChange={setImages}
          max={10}
          helperText="Recommended: 1 primary image + additional gallery images."
        />
        <VideoUploader
          label="Product Video"
          value={video}
          onChange={setVideo}
          helperText="Optional: upload a video or paste a video URL."
        />
      </div>

      {/* Descriptions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Descriptions</h2>
        <RichTextEditor
          label="Short Description"
          value={shortDescription}
          onChange={setShortDescription}
          placeholder="Write a short product summary (bullet points recommended)"
          heightClassName="min-h-[160px]"
          helperText="Short description is usually shown in product card/preview."
        />
        <RichTextEditor
          label="Product Details Description"
          value={detailsDescription}
          onChange={setDetailsDescription}
          placeholder="Write full details. You can insert images, tables, links and videos."
          heightClassName="min-h-[260px]"
          helperText="Tip: Use headings, tables for specs, and images/videos for rich details."
        />
      </div>

      {/* SEO */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Meta</h2>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</p>
            <Input
              placeholder="SEO title"
              value={seo.metaTitle}
              onChange={(e) => setSeo((p) => ({ ...p, metaTitle: String(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Canonical URL</p>
            <Input
              placeholder="https://..."
              value={seo.canonicalUrl}
              onChange={(e) => setSeo((p) => ({ ...p, canonicalUrl: String(e.target.value) }))}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</p>
            <textarea
              className="min-h-[110px] w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              placeholder="SEO description"
              value={seo.metaDescription}
              onChange={(e) => setSeo((p) => ({ ...p, metaDescription: e.target.value }))}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Keywords</p>
            <Input
              placeholder="keyword1, keyword2, keyword3"
              value={seo.metaKeywords}
              onChange={(e) => setSeo((p) => ({ ...p, metaKeywords: String(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">OG Title</p>
            <Input
              placeholder="Open graph title"
              value={seo.ogTitle}
              onChange={(e) => setSeo((p) => ({ ...p, ogTitle: String(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Robots</p>
            <Select
              key={`robots-${seo.robots}`}
              options={ROBOTS_OPTIONS}
              placeholder="robots"
              defaultValue={seo.robots}
              onChange={(v) => setSeo((p) => ({ ...p, robots: v }))}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">OG Description</p>
            <textarea
              className="min-h-[90px] w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              placeholder="Open graph description"
              value={seo.ogDescription}
              onChange={(e) => setSeo((p) => ({ ...p, ogDescription: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Flags */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Flags</h2>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              { key: "status", label: "Status (Active)" },
              { key: "featured", label: "Featured" },
              { key: "freeDelivery", label: "Free Delivery" },
              { key: "bestDeal", label: "Best Deal" },
            ] as const
          ).map((item) => (
            <div key={item.key} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                <Switch
                  key={`flag-${item.key}-${flags[item.key]}`}
                  label=""
                  defaultChecked={flags[item.key]}
                  onChange={(checked) => setFlags((p) => ({ ...p, [item.key]: checked }))}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Toggle this flag for product listing & promotions.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setProductName("");
            setProductSlug("");
            setSlugLocked(false);

            setSkuMode("auto");
            setSku("");

            setBuyPrice(0);
            setSellPrice(0);
            setResellerPrice(0);
            setDiscountType("percent");
            setDiscountValue(0);

            setSelectedColorIds([]);
            setSelectedValues([]);
            setVariantMatrix([]);

            setShortDescription("");
            setDetailsDescription("");

            setSeo({
              metaTitle: "",
              metaDescription: "",
              metaKeywords: "",
              canonicalUrl: "",
              ogTitle: "",
              ogDescription: "",
              robots: "index,follow",
            });

            setFlags({ status: true, featured: false, freeDelivery: false, bestDeal: false });
            setValidationError("");
            setSubmitMessage("");
          }}
        >
          Reset Form
        </Button>

        <Button onClick={submit}>Create Product</Button>
      </div>
    </div>
  );
}
