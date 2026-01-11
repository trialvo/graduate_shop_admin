// src/app/(admin)/products/create/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import RichTextEditor from "@/components/ui/editor/RichTextEditor";
import ImageMultiUploader, { type UploadedImage } from "@/components/ui/upload/ImageMultiUploader";
import VideoUploader from "@/components/ui/upload/VideoUploader";
import { cn } from "@/lib/utils";

import { getBrands } from "@/api/brands.api";
import { getColors } from "@/api/colors.api";
import { getAttributes, type Attribute, type AttributeVariant } from "@/api/attributes.api";
import { getChildCategories, getMainCategories, getSubCategories } from "@/api/categories.api";
import { createProduct } from "@/api/products.api";

type Option = { value: string; label: string };
type SkuMode = "auto" | "manual";

type VariantRow = {
  key: string; // `${colorId}__${variantId}`
  colorId: number;
  variantId: number;

  buyingPrice: number;
  sellingPrice: number;
  discount: number;
  stock: number;
  sku: string;

  active: boolean;
};

function Section({
  title,
  description,
  children,
  className,
  headerRight,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900", className)}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p> : null}
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function safeNumber(input: string, fallback: number) {
  const n = Number(input);
  return Number.isFinite(n) ? n : fallback;
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function genSkuFromParts(parts: string[]) {
  const cleaned = parts
    .map((p) => p.trim().toUpperCase().replace(/\s+/g, "-"))
    .filter(Boolean)
    .slice(0, 8);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return [...cleaned, String(rand)].join("-");
}

function unwrapList<T>(payload: unknown): T[] {
  const anyPayload = payload as any;
  if (Array.isArray(anyPayload)) return anyPayload;
  if (Array.isArray(anyPayload?.data)) return anyPayload.data;
  if (Array.isArray(anyPayload?.rows)) return anyPayload.rows;
  if (Array.isArray(anyPayload?.colors)) return anyPayload.colors;
  if (Array.isArray(anyPayload?.brands)) return anyPayload.brands;
  if (Array.isArray(anyPayload?.attributes)) return anyPayload.attributes;
  return [];
}

function makeKey(colorId: number, variantId: number) {
  return `${colorId}__${variantId}`;
}

function ensureMatrixRows(
  selectedColorIds: number[],
  selectedVariantIds: number[],
  prev: VariantRow[],
  defaults: { buying: number; selling: number; discount: number },
  skuBaseParts: string[],
) {
  const map = new Map(prev.map((r) => [r.key, r] as const));
  const next: VariantRow[] = [];

  for (const colorId of selectedColorIds) {
    for (const variantId of selectedVariantIds) {
      const key = makeKey(colorId, variantId);
      const existing = map.get(key);

      next.push(
        existing ?? {
          key,
          colorId,
          variantId,
          buyingPrice: defaults.buying,
          sellingPrice: defaults.selling,
          discount: defaults.discount,
          stock: 0,
          sku: genSkuFromParts([...skuBaseParts, `C${colorId}`, `V${variantId}`]),
          active: true,
        },
      );
    }
  }

  return next;
}

function getApiErrorMessage(err: unknown): string {
  const anyErr = err as any;
  const data = anyErr?.response?.data;

  if (typeof data?.error === "string" && data.error.trim()) return data.error.trim();
  if (typeof data?.message === "string" && data.message.trim()) return data.message.trim();
  if (typeof anyErr?.message === "string" && anyErr.message.trim()) return anyErr.message.trim();

  return "Failed to create product";
}

function getSuccessProductId(res: unknown): number | null {
  const anyRes = res as any;

  if (anyRes?.success === true && Number.isFinite(Number(anyRes?.productId))) return Number(anyRes.productId);
  if (Number.isFinite(Number(anyRes?.productId))) return Number(anyRes.productId);

  return null;
}

export default function CreateProductPage() {
  // -------------------- Form State --------------------
  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [slugLocked, setSlugLocked] = useState(false);

  const [mainCategoryId, setMainCategoryId] = useState<number>(0);
  const [subCategoryId, setSubCategoryId] = useState<number>(0);
  const [childCategoryId, setChildCategoryId] = useState<number>(0);
  const [brandId, setBrandId] = useState<number>(0);

  const [attributeId, setAttributeId] = useState<number>(0);

  const [skuMode, setSkuMode] = useState<SkuMode>("auto");
  const [skuBase, setSkuBase] = useState("");

  const [videoUrl, setVideoUrl] = useState<string>(""); // ✅ only url
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");

  const [flags, setFlags] = useState({
    status: true,
    featured: true,
    free_delivery: true,
    best_deal: true,
  });

  const [seo, setSeo] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    canonical_url: "",
    og_title: "",
    og_description: "",
    robots: "index, follow",
  });

  // Variations selection
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([]);
  const [matrix, setMatrix] = useState<VariantRow[]>([]);

  const [validationError, setValidationError] = useState("");
  const [errorBannerVisible, setErrorBannerVisible] = useState(true);

  useEffect(() => {
    if (validationError) setErrorBannerVisible(true);
  }, [validationError]);

  // -------------------- Lookups --------------------
  const { data: mainRes, isLoading: mainLoading } = useQuery({
    queryKey: ["mainCategories-all"],
    queryFn: () => getMainCategories(),
    staleTime: 60_000,
    retry: 1,
  });

  // ✅ SubCategories depends on MainCategory
  const { data: subRes, isLoading: subLoading } = useQuery({
    queryKey: ["subCategories-by-main", mainCategoryId],
    queryFn: () => getSubCategories({ main_category_id: mainCategoryId }),
    enabled: !!mainCategoryId,
    staleTime: 60_000,
    retry: 1,
  });

  // ✅ ChildCategories depends on SubCategory
  const { data: childRes, isLoading: childLoading } = useQuery({
    queryKey: ["childCategories-by-sub", subCategoryId],
    queryFn: () => getChildCategories({ sub_category_id: subCategoryId }),
    enabled: !!subCategoryId,
    staleTime: 60_000,
    retry: 1,
  });

  const { data: brandRes, isLoading: brandLoading } = useQuery({
    queryKey: ["brands-all"],
    queryFn: () => getBrands(),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: colorRes, isLoading: colorLoading } = useQuery({
    queryKey: ["colors-all"],
    queryFn: () => getColors(),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: attrRes, isLoading: attrLoading } = useQuery({
    queryKey: ["attributes-all"],
    queryFn: () => getAttributes(),
    staleTime: 60_000,
    retry: 1,
  });

  const mainCategories = useMemo(() => unwrapList<any>(mainRes), [mainRes]);
  const subCategories = useMemo(() => unwrapList<any>(subRes), [subRes]);
  const childCategories = useMemo(() => unwrapList<any>(childRes), [childRes]);

  const brands = useMemo(() => unwrapList<any>(brandRes).filter((b: any) => b.status !== false), [brandRes]);
  const colors = useMemo(() => unwrapList<any>(colorRes).filter((c: any) => c.status !== false), [colorRes]);
  const attributes = useMemo(() => unwrapList<Attribute>(attrRes).filter((a) => a.status !== false), [attrRes]);

  const initialLoading = mainLoading || brandLoading || colorLoading || attrLoading;

  // -------------------- Default selections when lookups load --------------------
  useEffect(() => {
    if (!mainCategories.length) return;
    setMainCategoryId((p) => (p ? p : Number(mainCategories[0]?.id ?? 0)));
  }, [mainCategories]);

  // when main changes -> reset dependent fields fast
  useEffect(() => {
    setSubCategoryId(0);
    setChildCategoryId(0);
  }, [mainCategoryId]);

  useEffect(() => {
    if (subLoading) return;
    if (!subCategories.length) {
      setSubCategoryId(0);
      return;
    }
    setSubCategoryId((p) =>
      subCategories.some((s: any) => Number(s.id) === Number(p)) ? p : Number(subCategories[0]?.id ?? 0),
    );
  }, [subCategories, subLoading]);

  // when sub changes -> reset child fast
  useEffect(() => {
    setChildCategoryId(0);
  }, [subCategoryId]);

  useEffect(() => {
    if (childLoading) return;
    if (!childCategories.length) {
      setChildCategoryId(0);
      return;
    }
    setChildCategoryId((p) =>
      childCategories.some((c: any) => Number(c.id) === Number(p)) ? p : Number(childCategories[0]?.id ?? 0),
    );
  }, [childCategories, childLoading]);

  useEffect(() => {
    if (!brands.length) return;
    setBrandId((p) => (p ? p : Number(brands[0]?.id ?? 0)));
  }, [brands]);

  useEffect(() => {
    if (!attributes.length) return;
    setAttributeId((p) => (p ? p : Number(attributes[0]?.id ?? 0)));
  }, [attributes]);

  // -------------------- Auto slug --------------------
  useEffect(() => {
    if (slugLocked) return;
    setProductSlug(slugify(productName));
  }, [productName, slugLocked]);

  // -------------------- Variants from selected attribute --------------------
  const selectedAttribute = useMemo(
    () => attributes.find((a) => Number(a.id) === Number(attributeId)),
    [attributes, attributeId],
  );

  const availableVariants: AttributeVariant[] = useMemo(() => {
    const list = Array.isArray(selectedAttribute?.variants) ? selectedAttribute.variants : [];
    return list.filter((v) => v && v.status !== false);
  }, [selectedAttribute]);

  // When attribute changes -> clear selectedVariantIds + matrix
  useEffect(() => {
    setSelectedVariantIds([]);
    setMatrix([]);
  }, [attributeId]);

  // -------------------- SKU base generator --------------------
  const generateSkuBase = () => {
    const brand = brands.find((b: any) => Number(b.id) === Number(brandId))?.name ?? "BRAND";
    const cat = mainCategories.find((c: any) => Number(c.id) === Number(mainCategoryId))?.name ?? "CAT";
    const name = productName || "PRODUCT";
    setSkuBase(genSkuFromParts([brand, cat, name]));
  };

  useEffect(() => {
    if (skuMode !== "auto") return;
    if (!productName.trim()) return;
    generateSkuBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skuMode, productName, brandId, mainCategoryId]);

  // -------------------- Ensure matrix rows when selections change --------------------
  useEffect(() => {
    const skuParts = [skuBase || "SKU", productSlug || "PRODUCT"].filter(Boolean);

    const next = ensureMatrixRows(selectedColorIds, selectedVariantIds, matrix, { buying: 0, selling: 0, discount: 0 }, skuParts);

    const same = next.length === matrix.length && next.every((n, i) => matrix[i]?.key === n.key);
    if (!same) setMatrix(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColorIds, selectedVariantIds]);

  // -------------------- Options --------------------
  const mainOptions: Option[] = useMemo(
    () => mainCategories.map((c: any) => ({ value: String(c.id), label: String(c.name) })),
    [mainCategories],
  );

  const subOptions: Option[] = useMemo(
    () => subCategories.map((s: any) => ({ value: String(s.id), label: String(s.name) })),
    [subCategories],
  );

  const childOptions: Option[] = useMemo(
    () => childCategories.map((c: any) => ({ value: String(c.id), label: String(c.name) })),
    [childCategories],
  );

  const brandOptions: Option[] = useMemo(
    () => brands.map((b: any) => ({ value: String(b.id), label: String(b.name) })),
    [brands],
  );

  const attributeOptions: Option[] = useMemo(
    () => attributes.map((a) => ({ value: String(a.id), label: String(a.name) })),
    [attributes],
  );

  // Colors dropdown incremental unique
  const remainingColors = useMemo(() => colors.filter((c: any) => !selectedColorIds.includes(Number(c.id))), [colors, selectedColorIds]);

  const colorOptions: Option[] = useMemo(
    () => remainingColors.map((c: any) => ({ value: String(c.id), label: String(c.name) })),
    [remainingColors],
  );

  const selectedColors = useMemo(() => {
    const byId = new Map(colors.map((c: any) => [Number(c.id), c]));
    return selectedColorIds.map((id) => byId.get(Number(id))).filter(Boolean);
  }, [colors, selectedColorIds]);

  // -------------------- Matrix helpers --------------------
  const toggleVariantId = (id: number) => {
    setSelectedVariantIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const updateRow = (key: string, patch: Partial<VariantRow>) => {
    setMatrix((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  // group rows by color (for rowspan view)
  const grouped = useMemo(() => {
    const g = new Map<number, VariantRow[]>();
    for (const r of matrix) {
      const arr = g.get(r.colorId) ?? [];
      arr.push(r);
      g.set(r.colorId, arr);
    }
    return selectedColorIds.map((id) => ({ colorId: id, rows: g.get(id) ?? [] })).filter((x) => x.rows.length > 0);
  }, [matrix, selectedColorIds]);

  // -------------------- Validation --------------------
  const validate = () => {
    if (!productName.trim()) return "Product name is required.";
    if (!productSlug.trim()) return "Slug is required.";
    if (!mainCategoryId) return "Main category is required.";
    if (!subCategoryId) return "Sub category is required.";
    if (!childCategoryId) return "Child category is required.";
    if (!brandId) return "Brand is required.";
    if (!attributeId) return "Attribute is required.";

    if (selectedColorIds.length === 0) return "Select at least 1 color.";
    if (selectedVariantIds.length === 0) return "Select at least 1 variant (from attribute).";

    const activeRows = matrix.filter((r) => r.active);
    if (!activeRows.length) return "At least 1 active variation required.";

    const invalid = activeRows.find((r) => r.sellingPrice <= 0);
    if (invalid) return "Selling price must be > 0 for all active variations.";

    return null;
  };

  // -------------------- Submit --------------------
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (res: unknown) => {
      const productId = getSuccessProductId(res);
      const anyRes = res as any;

      if (anyRes?.success === true) {
        toast.success(productId ? `Product created (ID: ${productId})` : "Product created");
        setValidationError("");
        setErrorBannerVisible(false);
        return;
      }

      const msg =
        (typeof anyRes?.error === "string" && anyRes.error.trim()) ||
        (typeof anyRes?.message === "string" && anyRes.message.trim()) ||
        "Failed to create product";

      toast.error(msg);
      setValidationError(msg);
      setErrorBannerVisible(true);
    },
    onError: (err: unknown) => {
      const msg = getApiErrorMessage(err);
      toast.error(msg);
      setValidationError(msg);
      setErrorBannerVisible(true);
    },
  });

  const submit = () => {
    const err = validate();
    if (err) {
      setValidationError(err);
      setErrorBannerVisible(true);
      return;
    }

    const variations = matrix
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

    createMutation.mutate({
      product_images: images.map((i) => i.file),
      name: productName.trim(),
      slug: productSlug.trim(),
      main_category_id: mainCategoryId,
      sub_category_id: subCategoryId,
      child_category_id: childCategoryId,
      brand_id: brandId,
      attribute_id: attributeId,

      // ✅ only URL
      video_path: videoUrl.trim() ? videoUrl.trim() : undefined,

      short_description: shortDescription,
      long_description: longDescription,

      status: flags.status,
      featured: flags.featured,
      free_delivery: flags.free_delivery,
      best_deal: flags.best_deal,

      meta_title: seo.meta_title,
      meta_description: seo.meta_description,
      meta_keywords: seo.meta_keywords,
      canonical_url: seo.canonical_url,
      og_title: seo.og_title,
      og_description: seo.og_description,
      robots: seo.robots,

      variations,
    });
  };

  // -------------------- UI --------------------
  if (initialLoading) {
    return (
      <div className="space-y-3">
        <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
        <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
        <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Floating error banner under header */}
      {validationError && errorBannerVisible ? (
        <div
          className={cn("fixed left-0 right-0 z-[60] px-4")}
          style={{ top: "calc(var(--app-header-height, 72px) + 12px)" }}
        >
          <div
            className={cn(
              "mx-auto w-full max-w-[1200px]",
              "rounded-[4px] border border-error-200 bg-error-50 px-4 py-3",
              "text-sm font-medium text-error-700 shadow-theme-xs",
              "dark:border-error-900/40 dark:bg-error-500/10 dark:text-error-300",
            )}
            role="alert"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 flex-1 pr-2">{validationError}</p>

              <button
                type="button"
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border",
                  "border-error-200 bg-white/70 text-error-700 hover:bg-white",
                  "dark:border-error-900/40 dark:bg-white/[0.03] dark:text-error-300 dark:hover:bg-white/[0.06]",
                )}
                onClick={() => setErrorBannerVisible(false)}
                aria-label="Dismiss error"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Product</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Dynamic load: category, brand, color, attribute & attribute variants from API.
        </p>
      </div>

      {/* Basic */}
      <Section title="Basic" description="Name, slug, categories and brand.">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Name *</p>
            <Input value={productName} onChange={(e) => setProductName(String(e.target.value))} placeholder="Product name" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Slug *</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Auto</span>
                <Switch key={`slug-${slugLocked}`} label="" defaultChecked={!slugLocked} onChange={(checked) => setSlugLocked(!checked)} />
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
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</p>
            <Select options={mainOptions} placeholder="Select category" defaultValue={String(mainCategoryId)} onChange={(v) => setMainCategoryId(Number(v))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub Category *</p>
            <Select
              key={`sub-${mainCategoryId}-${subCategoryId}`}
              options={subOptions}
              placeholder={subLoading ? "Loading sub categories..." : "Select sub category"}
              defaultValue={String(subCategoryId)}
              onChange={(v) => setSubCategoryId(Number(v))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Child Category *</p>
            <Select
              key={`child-${subCategoryId}-${childCategoryId}`}
              options={childOptions}
              placeholder={!subCategoryId ? "Select sub category first" : childLoading ? "Loading child categories..." : "Select child category"}
              defaultValue={String(childCategoryId)}
              onChange={(v) => setChildCategoryId(Number(v))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand *</p>
            <Select options={brandOptions} placeholder="Select brand" defaultValue={String(brandId)} onChange={(v) => setBrandId(Number(v))} />
          </div>
        </div>
      </Section>

      {/* Variations */}
      <Section
        title="Variations"
        description="Colors dropdown + variants from selected attribute. Generates variations payload."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Colors (dropdown) <span className="text-error-500">*</span>
            </p>

            <div className="mt-4">
              <Select
                key={`color-dd-${selectedColorIds.join("-")}`}
                options={colorOptions}
                placeholder={colorOptions.length ? "Select color" : "No more colors"}
                defaultValue=""
                onChange={(v) => {
                  const id = Number(v);
                  if (!Number.isFinite(id)) return;
                  if (selectedColorIds.includes(id)) return;
                  setSelectedColorIds((p) => [...p, id]);
                }}
              />
            </div>

            {selectedColors.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedColors.map((c: any) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-2 rounded-[4px] border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <span
                      className="h-3 w-5 rounded-md border border-gray-200 dark:border-gray-800"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                    <button
                      type="button"
                      className="text-error-500 hover:text-error-600"
                      onClick={() => setSelectedColorIds((p) => p.filter((x) => x !== Number(c.id)))}
                      aria-label="Remove color"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Attribute *</p>
              <Select options={attributeOptions} placeholder="Select attribute" defaultValue={String(attributeId)} onChange={(v) => setAttributeId(Number(v))} />
              <p className="text-xs text-gray-500 dark:text-gray-400">Variants come from selected attribute.</p>
            </div>

            <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Attribute Variants <span className="text-error-500">*</span>
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {availableVariants.map((v) => {
                  const active = selectedVariantIds.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => toggleVariantId(v.id)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                        active
                          ? "border-brand-500 bg-brand-500/10 text-gray-900 dark:text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]",
                      )}
                    >
                      {v.name}
                    </button>
                  );
                })}

                {!availableVariants.length ? (
                  <span className="text-sm text-gray-500 dark:text-gray-400">No variants found for this attribute.</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Matrix */}
        <div className="mt-6 rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <p className="text-base font-semibold text-gray-900 dark:text-white">Variation Matrix</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Generates API variations: color_id + variant_id + prices + stock + sku
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                  {["Color", "Variant", "Buying", "Selling", "Discount", "Stock", "SKU", "Active"].map((h) => (
                    <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {!grouped.length ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                      Select colors and attribute variants to generate rows.
                    </td>
                  </tr>
                ) : (
                  grouped.flatMap((g) => {
                    const color = colors.find((c: any) => Number(c.id) === Number(g.colorId));
                    return g.rows.map((r, idx) => {
                      const variantName = availableVariants.find((v) => v.id === r.variantId)?.name ?? `#${r.variantId}`;

                      return (
                        <tr key={r.key} className="border-b border-gray-100 dark:border-gray-800">
                          {idx === 0 ? (
                            <td rowSpan={g.rows.length} className="px-4 py-4 align-middle">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-4 w-6 rounded-md border border-gray-200 dark:border-gray-800"
                                  style={{ backgroundColor: color?.hex ?? "#111827" }}
                                />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{color?.name ?? "Unknown"}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{g.rows.length} rows</p>
                                </div>
                              </div>
                            </td>
                          ) : null}

                          <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">{variantName}</td>

                          <td className="px-4 py-4">
                            <Input
                              type="number"
                              value={r.buyingPrice}
                              onChange={(e) => updateRow(r.key, { buyingPrice: safeNumber(String(e.target.value), r.buyingPrice) })}
                            />
                          </td>

                          <td className="px-4 py-4">
                            <Input
                              type="number"
                              value={r.sellingPrice}
                              onChange={(e) => updateRow(r.key, { sellingPrice: safeNumber(String(e.target.value), r.sellingPrice) })}
                            />
                          </td>

                          <td className="px-4 py-4">
                            <Input
                              type="number"
                              value={r.discount}
                              onChange={(e) => updateRow(r.key, { discount: safeNumber(String(e.target.value), r.discount) })}
                            />
                          </td>

                          <td className="px-4 py-4">
                            <Input
                              type="number"
                              value={r.stock}
                              onChange={(e) => updateRow(r.key, { stock: Math.max(0, safeNumber(String(e.target.value), r.stock)) })}
                            />
                          </td>

                          <td className="px-4 py-4">
                            <Input value={r.sku} onChange={(e) => updateRow(r.key, { sku: String(e.target.value) })} />
                          </td>

                          <td className="px-4 py-4">
                            <Switch
                              key={`row-${r.key}-${r.active}`}
                              label=""
                              defaultChecked={r.active}
                              onChange={(checked) => updateRow(r.key, { active: checked })}
                            />
                          </td>
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Media */}
      <Section title="Media" description="Upload product images + paste a video URL (YouTube or direct video link).">
        <div className="space-y-6">
          <ImageMultiUploader label="Product Images" images={images} onChange={setImages} max={10} />

          <VideoUploader label="Product Video URL" value={videoUrl} onChange={setVideoUrl} />
        </div>
      </Section>

      {/* Descriptions */}
      <Section title="Descriptions">
        <div className="space-y-6">
          <RichTextEditor label="Short Description" value={shortDescription} onChange={setShortDescription} heightClassName="min-h-[160px]" />
          <RichTextEditor label="Long Description" value={longDescription} onChange={setLongDescription} heightClassName="min-h-[260px]" />
        </div>
      </Section>

      {/* Flags */}
      <Section title="Flags">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              { key: "status", label: "Status" },
              { key: "featured", label: "Featured" },
              { key: "free_delivery", label: "Free Delivery" },
              { key: "best_deal", label: "Best Deal" },
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
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</p>
            <Input value={seo.meta_title} onChange={(e) => setSeo((p) => ({ ...p, meta_title: String(e.target.value) }))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Canonical URL</p>
            <Input value={seo.canonical_url} onChange={(e) => setSeo((p) => ({ ...p, canonical_url: String(e.target.value) }))} />
          </div>
        </div>
      </Section>

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button onClick={submit} disabled={createMutation.isPending} startIcon={<CheckCircle2 size={16} />}>
          {createMutation.isPending ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
