import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, RefreshCw, Search, Trash2, Wand2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

import RichTextEditor from "@/components/ui/editor/RichTextEditor";
import ImageMultiUploader, { type UploadedImage } from "@/components/ui/upload/ImageMultiUploader";
import VideoUploader, { type UploadedVideo } from "@/components/ui/upload/VideoUploader";

import {
  INITIAL_ATTRIBUTES,
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_CHILD_CATEGORIES,
  INITIAL_COLORS,
  INITIAL_SUB_CATEGORIES,
} from "./mockData";

import type {
  AttributeDefinition,
  DiscountType,
  Option,
  ProductAttributeSelection,
  ProductStatusFlags,
  SeoMeta,
  VariantDraft,
} from "./types";

import { cartesian, genSkuFromParts, safeNumber, slugify } from "./utils";

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

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CreateProductPage() {
  // Data (replace with API later)
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

  // Attributes / Variants selections
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const [productAttributeMap, setProductAttributeMap] = useState<ProductAttributeSelection>({});
  const [variants, setVariants] = useState<VariantDraft[]>([]);

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

  // UI
  const [variantSearch, setVariantSearch] = useState<string>("");
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

  // Auto SKU generator
  const canAutoSku = skuMode === "auto";
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
    if (!canAutoSku) return;
    if (!productName) return;
    generateSku();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skuMode, productName, categoryId, subCategoryId, childCategoryId, brandId]);

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

  const selectedColors = useMemo(
    () => colors.filter((c) => selectedColorIds.includes(c.id)),
    [colors, selectedColorIds]
  );

  const requiredMissing = useMemo(() => {
    return attributeDefs
      .filter((a) => a.required)
      .filter((a) => (productAttributeMap[a.id] ?? []).length === 0);
  }, [attributeDefs, productAttributeMap]);

  const previewVariantCount = useMemo(() => {
    const dims: string[][] = [];
    if (selectedColors.length > 0) dims.push(selectedColors.map((c) => c.name));
    attributeDefs.forEach((a) => {
      const vals = productAttributeMap[a.id] ?? [];
      if (vals.length > 0) dims.push(vals);
    });
    const combos = cartesian(dims);
    return combos.length > 0 ? combos.length : 1;
  }, [selectedColors, attributeDefs, productAttributeMap]);

  const toggleColor = (id: number) => {
    setSelectedColorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAttrValue = (attr: AttributeDefinition, value: string) => {
    setProductAttributeMap((prev) => {
      const current = prev[attr.id] ?? [];
      const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
      return { ...prev, [attr.id]: next };
    });
  };

  const setSelectAllAttr = (attr: AttributeDefinition) => {
    setProductAttributeMap((prev) => ({ ...prev, [attr.id]: attr.values }));
  };

  const clearAttr = (attr: AttributeDefinition) => {
    setProductAttributeMap((prev) => ({ ...prev, [attr.id]: [] }));
  };

  const generateVariants = () => {
    if (requiredMissing.length > 0) {
      setValidationError(`Required attributes missing: ${requiredMissing.map((x) => x.name).join(", ")}`);
      return;
    }
    setValidationError("");

    const dims: { label: string; values: string[] }[] = [];
    if (selectedColors.length > 0) dims.push({ label: "Color", values: selectedColors.map((c) => c.name) });

    attributeDefs.forEach((a) => {
      const vals = productAttributeMap[a.id] ?? [];
      if (vals.length > 0) dims.push({ label: a.name, values: vals });
    });

    const combos = cartesian(dims.map((d) => d.values));
    const ensureOne = combos.length > 0 ? combos : [[]];

    const base = sku ? sku.split("-")[0] : slugify(productName || "PRODUCT").toUpperCase();
    const existingSku = new Set(variants.map((v) => v.sku));

    const next: VariantDraft[] = [];
    ensureOne.forEach((combo) => {
      const attrs: Record<string, string> = {};
      combo.forEach((val, idx) => {
        const label = dims[idx]?.label ?? `Attr${idx + 1}`;
        attrs[label] = val;
      });

      const nameParts = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`);
      const name = nameParts.length > 0 ? nameParts.join(" / ") : "Default";

      const skuParts = [base, ...Object.values(attrs).map((v) => v.toUpperCase().replace(/\s+/g, "-"))];
      const nextSku = skuParts.join("-");
      if (existingSku.has(nextSku)) return;

      next.push({
        id: makeId(),
        name,
        sku: nextSku,
        buyPrice,
        oldPrice: sellPrice,
        sellPrice: finalSellPrice,
        stock: 0,
        active: true,
        attributes: attrs,
      });
    });

    setVariants([...next, ...variants]);
  };

  const totalStock = useMemo(() => variants.reduce((sum, v) => sum + Math.max(0, v.stock), 0), [variants]);

  const filteredVariants = useMemo(() => {
    const q = variantSearch.trim().toLowerCase();
    if (!q) return variants;
    return variants.filter((v) => v.name.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q));
  }, [variants, variantSearch]);

  const updateVariant = (id: string, patch: Partial<VariantDraft>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const removeVariant = (id: string) => setVariants((prev) => prev.filter((v) => v.id !== id));
  const clearVariants = () => setVariants([]);

  const validateForm = (): string | null => {
    if (!productName.trim()) return "Product name is required.";
    if (!productSlug.trim()) return "Product slug is required.";
    if (!categoryId) return "Category is required.";
    if (!subCategoryId) return "Sub category is required.";
    if (!childCategoryId) return "Child category is required.";
    if (!brandId) return "Brand is required.";
    if (!sku.trim()) return "SKU / Barcode is required.";
    if (sellPrice <= 0) return "Selling price must be greater than 0.";
    if (variants.length > 0 && totalStock <= 0) return "Variant stock total is 0. Please add stock for variants.";
    if (requiredMissing.length > 0) return `Required attributes missing: ${requiredMissing.map((x) => x.name).join(", ")}`;
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
      attributes: { colorIds: selectedColorIds, selections: productAttributeMap },
      variants,
      stockTotal: variants.length > 0 ? totalStock : undefined,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Product</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Advanced product creation form with attributes, variants, media and SEO
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
                <Switch key={`slug-${slugLocked}`} label="" defaultChecked={!slugLocked} onChange={(checked) => setSlugLocked(!checked)} />
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

            <p className="text-xs text-gray-500 dark:text-gray-400">Tip: if Auto enabled, slug will be generated from product name.</p>
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
                <Button onClick={generateSku} disabled={skuMode !== "auto"} startIcon={<Wand2 size={16} />}>
                  Generate
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Auto mode will generate SKU based on brand/category/name.</p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing</h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Buy Price</p>
            <Input type="number" value={buyPrice} onChange={(e) => setBuyPrice(safeNumber(String(e.target.value), buyPrice))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selling Price <span className="text-error-500">*</span>
            </p>
            <Input type="number" value={sellPrice} onChange={(e) => setSellPrice(safeNumber(String(e.target.value), sellPrice))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reseller Price</p>
            <Input type="number" value={resellerPrice} onChange={(e) => setResellerPrice(safeNumber(String(e.target.value), resellerPrice))} />
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
            <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(safeNumber(String(e.target.value), discountValue))} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Discount amount: <span className="font-semibold">{discountAmount.toFixed(2)}</span>, Final selling price:{" "}
              <span className="font-semibold">{finalSellPrice.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Attributes & Variants */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Attributes & Variants</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select colors/attributes and generate variants (each variant has its own pricing & stock)
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={clearVariants} disabled={variants.length === 0} startIcon={<Trash2 size={16} />}>
              Clear Variants
            </Button>
            <Button onClick={generateVariants} startIcon={<Wand2 size={16} />}>
              Generate Variants
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview variants:</span>
          <span className="inline-flex h-7 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {previewVariantCount}
          </span>
          {variants.length > 0 ? (
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              Total stock: <span className="font-semibold">{totalStock}</span>
            </span>
          ) : null}
        </div>

        {/* Colors */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Colors</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">Selected: {selectedColorIds.length}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {colors.map((c) => {
              const active = selectedColorIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleColor(c.id)}
                  className={[
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition",
                    active
                      ? "border-brand-500 bg-brand-500/10 text-gray-900 dark:text-white"
                      : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.03] text-gray-700 dark:text-gray-300",
                  ].join(" ")}
                >
                  <span className="h-4 w-6 rounded-md border border-gray-200 dark:border-gray-800" style={{ backgroundColor: c.hex }} aria-hidden />
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Attributes */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Attributes</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {attributeDefs.map((a) => {
              const selected = productAttributeMap[a.id] ?? [];
              const missing = a.required && selected.length === 0;
              return (
                <div
                  key={a.id}
                  className={[
                    "rounded-2xl border p-4",
                    missing
                      ? "border-error-200 bg-error-50 dark:border-error-900/40 dark:bg-error-500/10"
                      : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {a.name}{" "}
                        {a.required ? (
                          <span className="ml-2 inline-flex rounded-md bg-error-500/10 px-2 py-0.5 text-xs font-semibold text-error-600 dark:text-error-300">
                            Required
                          </span>
                        ) : (
                          <span className="ml-2 inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            Optional
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select values for this product</p>
                    </div>

                    <span className="text-xs text-gray-500 dark:text-gray-400">Selected: {selected.length}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {a.values.length === 0 ? (
                      <span className="text-sm text-gray-500 dark:text-gray-400">No values defined for this attribute</span>
                    ) : null}

                    {a.values.map((v) => {
                      const active = selected.includes(v);
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => toggleAttrValue(a, v)}
                          className={[
                            "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                            active
                              ? "border-brand-500 bg-brand-500/10 text-gray-900 dark:text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]",
                          ].join(" ")}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      onClick={() => clearAttr(a)}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      onClick={() => setSelectAllAttr(a)}
                      disabled={a.values.length === 0}
                    >
                      Select All
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Variants table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-gray-900 dark:text-white">Variants</p>
              <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {variants.length}
              </span>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
              <div className="relative w-full sm:w-[260px]">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Search size={16} className="text-gray-400" />
                </div>
                <Input className="pl-9" placeholder="Search variant" value={variantSearch} onChange={(e) => setVariantSearch(String(e.target.value))} />
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setVariants((prev) => prev.map((v) => ({ ...v, buyPrice, oldPrice: sellPrice, sellPrice: finalSellPrice })));
                }}
                disabled={variants.length === 0}
                startIcon={<RefreshCw size={16} />}
              >
                Sync Prices
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[1200px] border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                  {["Variant", "SKU", "Buy", "Old", "Sell", "Stock", "Active", "Action"].map((h) => (
                    <TableCell key={h} isHeader className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredVariants.map((v) => (
                  <TableRow key={v.id} className="border-b border-gray-100 dark:border-gray-800">
                    <TableCell className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{v.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(" • ")}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <Input value={v.sku} onChange={(e) => updateVariant(v.id, { sku: String(e.target.value) })} />
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <Input type="number" value={v.buyPrice} onChange={(e) => updateVariant(v.id, { buyPrice: safeNumber(String(e.target.value), v.buyPrice) })} />
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <Input type="number" value={v.oldPrice} onChange={(e) => updateVariant(v.id, { oldPrice: safeNumber(String(e.target.value), v.oldPrice) })} />
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <Input type="number" value={v.sellPrice} onChange={(e) => updateVariant(v.id, { sellPrice: safeNumber(String(e.target.value), v.sellPrice) })} />
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <Input type="number" value={v.stock} onChange={(e) => updateVariant(v.id, { stock: Math.max(0, safeNumber(String(e.target.value), v.stock)) })} />
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <Switch key={`v-${v.id}-${v.active}`} label="" defaultChecked={v.active} onChange={(checked) => updateVariant(v.id, { active: checked })} />
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <button
                        type="button"
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-error-200 bg-white px-3 text-sm font-semibold text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                        onClick={() => removeVariant(v.id)}
                      >
                        <Trash2 size={16} className="mr-2" /> Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredVariants.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={8}>
                      No variants. Select attributes and click Generate Variants.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media</h2>
        <ImageMultiUploader label="Product Images" images={images} onChange={setImages} max={10} helperText="Recommended: 1 primary image + additional gallery images." />
        <VideoUploader label="Product Video" value={video} onChange={setVideo} helperText="Optional: upload a video or paste a video URL." />
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
            <Input placeholder="SEO title" value={seo.metaTitle} onChange={(e) => setSeo((p) => ({ ...p, metaTitle: String(e.target.value) }))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Canonical URL</p>
            <Input placeholder="https://..." value={seo.canonicalUrl} onChange={(e) => setSeo((p) => ({ ...p, canonicalUrl: String(e.target.value) }))} />
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
            <Input placeholder="Open graph title" value={seo.ogTitle} onChange={(e) => setSeo((p) => ({ ...p, ogTitle: String(e.target.value) }))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Robots</p>
            <Select key={`robots-${seo.robots}`} options={ROBOTS_OPTIONS} placeholder="robots" defaultValue={seo.robots} onChange={(v) => setSeo((p) => ({ ...p, robots: v }))} />
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
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Toggle this flag for product listing & promotions.</p>
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
            setProductAttributeMap({});
            clearVariants();
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
