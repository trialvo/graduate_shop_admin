// src/components/products/product-create/ProductForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Copy, Pencil, Wand2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import RichTextEditor from "@/components/ui/editor/RichTextEditor";
import ImageMultiUploader, { type UploadedImage } from "@/components/ui/upload/ImageMultiUploader";
import VideoUploader from "@/components/ui/upload/VideoUploader";
import { cn } from "@/lib/utils";

import { getAttributes } from "@/api/attributes.api";
import { getVariants } from "@/api/variants.api";
import { createProduct, updateProduct, type Product, type ProductVariationPayload } from "@/api/products.api";

import VariantMatrix from "./components/VariantMatrix";
import type { ExistingImage, Option, ProductStatusFlags, SeoMeta, VariantMatrixRow } from "./types";
import { genSkuFromParts, safeNumber, slugify } from "./utils";
import { toPublicUrl } from "@/utils/toPublicUrl";
import ConfirmDeleteModal from "@/components/ui/modal/ConfirmDeleteModal";

type SkuMode = "auto" | "manual";

const ROBOTS_OPTIONS: Option[] = [
  { value: "index, follow", label: "index, follow" },
  { value: "noindex, follow", label: "noindex, follow" },
  { value: "index, nofollow", label: "index, nofollow" },
  { value: "noindex, nofollow", label: "noindex, nofollow" },
];

function parseApiError(err: any, fallback: string) {
  return err?.response?.data?.error ?? err?.response?.data?.message ?? fallback;
}

// NOTE: You can replace these with real APIs later.
// Keeping same UI structure; only Product endpoints are real.
const INITIAL_CATEGORIES = [{ id: 1, name: "Category 1" }];
const INITIAL_SUB_CATEGORIES = [{ id: 1, categoryId: 1, name: "Sub Category 1" }];
const INITIAL_CHILD_CATEGORIES = [{ id: 1, subCategoryId: 1, name: "Child Category 1" }];
const INITIAL_BRANDS = [{ id: 2, name: "Brand 2", status: true }];
const INITIAL_COLORS = [
  { id: 1, name: "Red", hex: "#ef4444", status: true },
  { id: 2, name: "Blue", hex: "#3b82f6", status: true },
];

type Props = {
  mode: "create" | "edit";
  productId?: number;
  initialProduct?: Product | null;
  onSuccess?: () => void;
  onClose?: () => void; // for modal usage
};

export default function ProductForm({ mode, productId, initialProduct, onSuccess, onClose }: Props) {
  // Data (mock for now)
  const categories = INITIAL_CATEGORIES;
  const subCategories = INITIAL_SUB_CATEGORIES;
  const childCategories = INITIAL_CHILD_CATEGORIES;
  const brands = INITIAL_BRANDS.filter((b) => b.status);
  const colors = INITIAL_COLORS.filter((c) => c.status);

  // Attributes + Variants (REAL APIs)
  const { data: attrList } = useQuery({
    queryKey: ["attributes-dropdown"],
    queryFn: () => getAttributes({ limit: 10 }),
    staleTime: 60_000,
    retry: 1,
  });

  const attributes = useMemo(() => attrList?.data ?? [], [attrList?.data]);

  const { data: variantsList } = useQuery({
    queryKey: ["variants-dropdown"],
    queryFn: () => getVariants({ limit: 100 }),
    staleTime: 60_000,
    retry: 1,
  });

  const variants = useMemo(() => variantsList?.data ?? [], [variantsList?.data]);

  // Basic
  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [slugLocked, setSlugLocked] = useState(false);

  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id ?? 0);
  const availableSub = useMemo(() => subCategories.filter((s) => s.categoryId === categoryId), [subCategories, categoryId]);
  const [subCategoryId, setSubCategoryId] = useState<number>(availableSub[0]?.id ?? 0);

  const availableChild = useMemo(() => childCategories.filter((c) => c.subCategoryId === subCategoryId), [childCategories, subCategoryId]);
  const [childCategoryId, setChildCategoryId] = useState<number>(availableChild[0]?.id ?? 0);

  const [brandId, setBrandId] = useState<number>(brands[0]?.id ?? 0);

  // Attribute (REAL)
  const defaultAttrId = attributes[0]?.id ?? 0;
  const [attributeId, setAttributeId] = useState<number>(defaultAttrId);

  // SKU
  const [skuMode, setSkuMode] = useState<SkuMode>("auto");
  const [sku, setSku] = useState("");

  // Media
  const [newImages, setNewImages] = useState<UploadedImage[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  // Existing images for edit
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);
  const [deleteImgModal, setDeleteImgModal] = useState<{ open: boolean; imageId?: number }>({ open: false });

  // Descriptions
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");

  // SEO
  const [seo, setSeo] = useState<SeoMeta>({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    robots: "index, follow",
  });

  // Flags
  const [flags, setFlags] = useState<ProductStatusFlags>({
    status: true,
    featured: false,
    freeDelivery: false,
    bestDeal: false,
  });

  // Variations Matrix (API-correct)
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
  const [variantMatrix, setVariantMatrix] = useState<VariantMatrixRow[]>([]);

  const [validationError, setValidationError] = useState<string>("");

  // Auto slug
  useEffect(() => {
    if (slugLocked) return;
    setProductSlug(slugify(productName));
  }, [productName, slugLocked]);

  // Update dependent selects (mock)
  useEffect(() => {
    if (!availableSub.length) {
      setSubCategoryId(0);
      return;
    }
    if (!availableSub.some((s) => s.id === subCategoryId)) setSubCategoryId(availableSub[0].id);
  }, [availableSub, subCategoryId]);

  useEffect(() => {
    if (!availableChild.length) {
      setChildCategoryId(0);
      return;
    }
    if (!availableChild.some((c) => c.id === childCategoryId)) setChildCategoryId(availableChild[0].id);
  }, [availableChild, childCategoryId]);

  // Options
  const categoryOptions: Option[] = useMemo(() => categories.map((c) => ({ value: String(c.id), label: c.name })), [categories]);
  const subOptions: Option[] = useMemo(() => availableSub.map((s) => ({ value: String(s.id), label: s.name })), [availableSub]);
  const childOptions: Option[] = useMemo(() => availableChild.map((c) => ({ value: String(c.id), label: c.name })), [availableChild]);
  const brandOptions: Option[] = useMemo(() => brands.map((b) => ({ value: String(b.id), label: b.name })), [brands]);
  const attributeOptions: Option[] = useMemo(() => attributes.map((a) => ({ value: String(a.id), label: a.name })), [attributes]);

  // SKU generator
  const generateSku = () => {
    const brand = brands.find((b) => b.id === brandId)?.name ?? "BRAND";
    const cat = categories.find((c) => c.id === categoryId)?.name ?? "CAT";
    const name = productName || "PRODUCT";
    setSku(genSkuFromParts([brand, cat, name]));
  };

  useEffect(() => {
    if (skuMode !== "auto") return;
    if (!productName.trim()) return;
    generateSku();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skuMode, productName, categoryId, brandId]);

  // Hydrate for edit mode
  useEffect(() => {
    if (mode !== "edit") return;
    if (!initialProduct) return;

    setProductName(initialProduct.name ?? "");
    setProductSlug(initialProduct.slug ?? "");
    setSlugLocked(true);

    setCategoryId(initialProduct.main_category_id ?? categories[0]?.id ?? 0);
    setSubCategoryId(initialProduct.sub_category_id ?? availableSub[0]?.id ?? 0);
    setChildCategoryId(initialProduct.child_category_id ?? availableChild[0]?.id ?? 0);

    setBrandId(initialProduct.brand_id ?? (brands[0]?.id ?? 0));
    setAttributeId(initialProduct.attribute_id ?? defaultAttrId);

    setShortDescription(initialProduct.short_description ?? "");
    setLongDescription(initialProduct.long_description ?? "");
    setVideoUrl(initialProduct.video_path ?? "");

    setFlags({
      status: Boolean(initialProduct.status),
      featured: Boolean(initialProduct.featured),
      freeDelivery: Boolean(initialProduct.free_delivery),
      bestDeal: Boolean(initialProduct.best_deal),
    });

    setSeo({
      metaTitle: initialProduct.meta_title ?? "",
      metaDescription: initialProduct.meta_description ?? "",
      metaKeywords: initialProduct.meta_keywords ?? "",
      canonicalUrl: initialProduct.canonical_url ?? "",
      ogTitle: initialProduct.og_title ?? "",
      ogDescription: initialProduct.og_description ?? "",
      robots: initialProduct.robots ?? "index, follow",
    });

    const imgs = (initialProduct.images ?? initialProduct.product_images ?? []) as any[];
    const normalized: ExistingImage[] = imgs
      .filter((x) => x && typeof x.id === "number")
      .map((x) => ({ id: x.id, path: String(x.path ?? x.url ?? x.image ?? "") }))
      .filter((x) => Boolean(x.path));

    setExistingImages(normalized);
    setDeleteImageIds([]);
  }, [mode, initialProduct, attributes.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    if (!productName.trim()) return "Product name is required.";
    if (!productSlug.trim()) return "Product slug is required.";
    if (!categoryId) return "Main category is required.";
    if (!subCategoryId) return "Sub category is required.";
    if (!childCategoryId) return "Child category is required.";
    if (!brandId) return "Brand is required.";
    if (!attributeId) return "Attribute is required.";

    if (selectedColorIds.length === 0) return "Select at least 1 color.";
    if (selectedVariantIds.length === 0) return "Select at least 1 variant value.";
    if (variantMatrix.length === 0) return "Variation matrix is empty.";

    const activeRows = variantMatrix.filter((r) => r.active);
    if (!activeRows.length) return "At least one active variation is required.";

    const invalidPrice = activeRows.find((r) => r.sellingPrice <= 0);
    if (invalidPrice) return "Selling price must be greater than 0 for all active variations.";

    return null;
  };

  const buildVariationsPayload = (): ProductVariationPayload[] => {
    return variantMatrix
      .filter((r) => r.active)
      .map((r) => ({
        color_id: r.colorId,
        variant_id: r.variantId,
        buying_price: Math.max(0, r.buyingPrice),
        selling_price: Math.max(0, r.sellingPrice),
        discount: Math.max(0, r.discount),
        stock: Math.max(0, r.stock),
        sku: r.sku,
      }));
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (res) => {
      toast.success(`Product created (ID: ${res.productId})`);
      onSuccess?.();
    },
    onError: (err: any) => toast.error(parseApiError(err, "Failed to create product")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => updateProduct(id, payload),
    onSuccess: () => {
      toast.success("Product updated");
      onSuccess?.();
      onClose?.();
    },
    onError: (err: any) => toast.error(parseApiError(err, "Failed to update product")),
  });

  const onSubmit = () => {
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError("");

    const variations = buildVariationsPayload();

    const payloadBase = {
      product_images: newImages.map((x) => x.file),
      name: productName.trim(),
      slug: productSlug.trim(),
      main_category_id: categoryId,
      sub_category_id: subCategoryId,
      child_category_id: childCategoryId,
      brand_id: brandId,
      attribute_id: attributeId,

      video_path: videoUrl.trim() ? videoUrl.trim() : undefined,

      short_description: shortDescription,
      long_description: longDescription,

      status: flags.status,
      featured: flags.featured,
      free_delivery: flags.freeDelivery,
      best_deal: flags.bestDeal,

      meta_title: seo.metaTitle,
      meta_description: seo.metaDescription,
      meta_keywords: seo.metaKeywords,
      canonical_url: seo.canonicalUrl,
      og_title: seo.ogTitle,
      og_description: seo.ogDescription,
      robots: seo.robots,

      variations,
    };

    if (mode === "create") {
      createMutation.mutate(payloadBase);
      return;
    }

    if (!productId) {
      toast.error("Missing productId");
      return;
    }

    updateMutation.mutate({
      id: productId,
      payload: {
        ...payloadBase,
        delete_image_ids: deleteImageIds.length ? deleteImageIds : undefined,
      },
    });
  };

  const brandNameForSku = brands.find((b) => b.id === brandId)?.name ?? "BRAND";

  return (
    <div className="space-y-6">
      {validationError ? (
        <div className="rounded-[4px] border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700 dark:border-error-900/40 dark:bg-error-500/10 dark:text-error-300">
          {validationError}
        </div>
      ) : null}

      {/* Basic Info */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Name <span className="text-error-500">*</span>
            </p>
            <Input value={productName} onChange={(e) => setProductName(String(e.target.value))} placeholder="Product name" />
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
              value={productSlug}
              onChange={(e) => {
                setProductSlug(String(e.target.value));
                setSlugLocked(true);
              }}
              placeholder="product-slug"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Main Category *</p>
            <Select options={categoryOptions} placeholder="Select" defaultValue={String(categoryId)} onChange={(v) => setCategoryId(Number(v))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub Category *</p>
            <Select
              key={`sub-${categoryId}-${subCategoryId}`}
              options={subOptions}
              placeholder="Select"
              defaultValue={String(subCategoryId)}
              onChange={(v) => setSubCategoryId(Number(v))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Child Category *</p>
            <Select
              key={`child-${subCategoryId}-${childCategoryId}`}
              options={childOptions}
              placeholder="Select"
              defaultValue={String(childCategoryId)}
              onChange={(v) => setChildCategoryId(Number(v))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand *</p>
            <Select options={brandOptions} placeholder="Select" defaultValue={String(brandId)} onChange={(v) => setBrandId(Number(v))} />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Attribute *</p>
            <Select
              key={`attr-${attributeId}`}
              options={attributeOptions}
              placeholder="Select attribute"
              defaultValue={String(attributeId)}
              onChange={(v) => setAttributeId(Number(v))}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This attribute controls which variants will be selectable for variations.
            </p>
          </div>

          {/* SKU base (optional, not required by API but useful) */}
          <div className="space-y-2 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">SKU Base (helper)</p>

              <div className="inline-flex rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => setSkuMode("auto")}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold transition",
                    skuMode === "auto"
                      ? "bg-brand-500 text-white"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]",
                  )}
                >
                  Auto
                </button>
                <button
                  type="button"
                  onClick={() => setSkuMode("manual")}
                  className={cn(
                    "px-4 py-2 text-sm font-semibold transition",
                    skuMode === "manual"
                      ? "bg-brand-500 text-white"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]",
                  )}
                >
                  Manual
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input value={sku} onChange={(e) => setSku(String(e.target.value))} disabled={skuMode === "auto"} placeholder="SKU base" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard?.writeText(sku).catch(() => undefined)}
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
          </div>
        </div>
      </div>

      {/* Variations Matrix */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Variations</h2>

        <VariantMatrix
          colors={colors}
          variants={variants as any}
          activeAttributeId={attributeId}
          selectedColorIds={selectedColorIds}
          onChangeSelectedColorIds={setSelectedColorIds}
          selectedVariantIds={selectedVariantIds}
          onChangeSelectedVariantIds={setSelectedVariantIds}
          matrix={variantMatrix}
          onChangeMatrix={setVariantMatrix}
          baseBuyingPrice={0}
          baseSellingPrice={0}
          baseDiscount={0}
          brandNameForSku={brandNameForSku}
          productSlugForSku={productSlug}
        />
      </div>

      {/* Media */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media</h2>

        {/* Existing images (edit only) */}
        {mode === "edit" && existingImages.length ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Existing Images</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {existingImages.map((img) => {
                const marked = deleteImageIds.includes(img.id);
                return (
                  <div
                    key={img.id}
                    className={cn(
                      "overflow-hidden rounded-[8px] border bg-white dark:bg-gray-900",
                      marked ? "border-error-300 dark:border-error-900/40" : "border-gray-200 dark:border-gray-800",
                    )}
                  >
                    <div className="aspect-square w-full bg-gray-50 dark:bg-gray-800">
                      {/* toPublicUrl */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={toPublicUrl(img.path)}
                        alt="product"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-2">
                      <button
                        type="button"
                        className={cn(
                          "w-full rounded-md border px-2 py-1 text-xs font-semibold",
                          marked
                            ? "border-error-200 bg-error-50 text-error-700 dark:border-error-900/40 dark:bg-error-500/10 dark:text-error-300"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]",
                        )}
                        onClick={() => setDeleteImgModal({ open: true, imageId: img.id })}
                      >
                        {marked ? "Marked for delete" : "Delete image"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Deleted images will be sent as <span className="font-semibold">delete_image_ids</span> in update payload.
            </p>
          </div>
        ) : null}

        {/* New images upload */}
        <ImageMultiUploader
          label="Upload Images"
          images={newImages}
          onChange={setNewImages}
          max={10}
          helperText="Upload new images (multi)."
        />

        <VideoUploader
          label="Video URL"
          value={videoUrl}
          onChange={setVideoUrl}
          helperText="Paste YouTube URL (video_path)."
        />
      </div>

      {/* Descriptions */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Descriptions</h2>

        <RichTextEditor
          label="Short Description"
          value={shortDescription}
          onChange={setShortDescription}
          placeholder="Short description"
          heightClassName="min-h-[160px]"
        />

        <RichTextEditor
          label="Long Description"
          value={longDescription}
          onChange={setLongDescription}
          placeholder="Long description"
          heightClassName="min-h-[260px]"
        />
      </div>

      {/* SEO */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SEO</h2>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</p>
            <Input value={seo.metaTitle} onChange={(e) => setSeo((p) => ({ ...p, metaTitle: String(e.target.value) }))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Canonical URL</p>
            <Input value={seo.canonicalUrl} onChange={(e) => setSeo((p) => ({ ...p, canonicalUrl: String(e.target.value) }))} />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</p>
            <textarea
              className="min-h-[110px] w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              value={seo.metaDescription}
              onChange={(e) => setSeo((p) => ({ ...p, metaDescription: e.target.value }))}
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Keywords</p>
            <Input value={seo.metaKeywords} onChange={(e) => setSeo((p) => ({ ...p, metaKeywords: String(e.target.value) }))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">OG Title</p>
            <Input value={seo.ogTitle} onChange={(e) => setSeo((p) => ({ ...p, ogTitle: String(e.target.value) }))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Robots</p>
            <Select
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
              value={seo.ogDescription}
              onChange={(e) => setSeo((p) => ({ ...p, ogDescription: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Flags */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Flags</h2>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              { key: "status", label: "Status" },
              { key: "featured", label: "Featured" },
              { key: "freeDelivery", label: "Free Delivery" },
              { key: "bestDeal", label: "Best Deal" },
            ] as const
          ).map((item) => (
            <div key={item.key} className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                <Switch
                  key={`flag-${item.key}-${flags[item.key]}`}
                  label=""
                  defaultChecked={flags[item.key]}
                  onChange={(checked) => setFlags((p) => ({ ...p, [item.key]: checked }))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onClose ? (
          <Button variant="outline" onClick={onClose} disabled={createMutation.isPending || updateMutation.isPending}>
            Cancel
          </Button>
        ) : null}

        <Button
          onClick={onSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
          startIcon={mode === "create" ? <CheckCircle2 size={16} /> : <Pencil size={16} />}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Update Product"}
        </Button>
      </div>

      {/* Delete image confirm */}
      <ConfirmDeleteModal
        open={deleteImgModal.open}
        title="Delete this image?"
        description="This will mark the image for deletion on update."
        confirmText="Mark Delete"
        onClose={() => setDeleteImgModal({ open: false })}
        onConfirm={() => {
          const id = deleteImgModal.imageId;
          if (!id) return;
          setDeleteImageIds((p) => (p.includes(id) ? p : [...p, id]));
          setDeleteImgModal({ open: false });
        }}
      />
    </div>
  );
}
