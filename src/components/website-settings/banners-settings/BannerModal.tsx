import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, UploadCloud, X } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import type {
  BannerRow,
  BannerType,
  BannerZone,
  CategoryLite,
  Option,
  ProductLite,
} from "./types";
import { safeText } from "./types";

const TYPE_OPTIONS: Option[] = [
  { value: "default", label: "Default" },
  { value: "category_wise", label: "Category wise" },
  { value: "product_wise", label: "Product wise" },
  { value: "custom_url", label: "Custom URL" },
];

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: BannerRow | null;

  zones: BannerZone[];
  categories: CategoryLite[];
  products: ProductLite[];

  onClose: () => void;
  onSave: (payload: Omit<BannerRow, "id" | "createdAt">) => void;
};

type ImgMeta = {
  width: number;
  height: number;
  ratio: number; // width/height
};

const RECOMMENDED = {
  ratio: 3 / 1,
  // realistic dashboard banner (you can change later)
  width: 1200,
  height: 400,
};

function ratioLabel(r: number) {
  return `${r.toFixed(2)}:1`;
}

function isImageFile(f: File) {
  return f.type.startsWith("image/");
}

export default function BannerModal({
  open,
  mode,
  initial,
  zones,
  categories,
  products,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [zone, setZone] = useState<BannerZone>(zones[0] ?? "Home Top");
  const [type, setType] = useState<BannerType>("default");

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [url, setUrl] = useState("");

  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState(true);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [imgMeta, setImgMeta] = useState<ImgMeta | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setTitle(safeText(initial.title));
      setZone(initial.zone);
      setType(initial.type);

      setCategoryId(initial.categoryId ?? null);
      setProductId(initial.productId ?? null);
      setUrl(initial.url ?? "");

      setFeatured(Boolean(initial.featured));
      setStatus(Boolean(initial.status));

      setImageUrl(initial.imageUrl ?? null);
      setImageFileName(initial.imageFileName ?? null);
      setImgMeta(null);
      return;
    }

    // create defaults
    setTitle("");
    setZone(zones[0] ?? "Home Top");
    setType("default");
    setCategoryId(null);
    setProductId(null);
    setUrl("");
    setFeatured(false);
    setStatus(true);
    setImageUrl(null);
    setImageFileName(null);
    setImgMeta(null);
  }, [open, mode, initial, zones]);

  // Reset target fields when type changes
  useEffect(() => {
    if (type !== "category_wise") setCategoryId(null);
    if (type !== "product_wise") setProductId(null);
    if (type !== "custom_url") setUrl("");
  }, [type]);

  const zoneOptions: Option[] = useMemo(
    () => zones.map((z) => ({ value: z, label: z })),
    [zones]
  );

  const categoryOptions: Option[] = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories]
  );

  const productOptions: Option[] = useMemo(
    () =>
      products.map((p) => ({
        value: String(p.id),
        label: `${p.name} (${p.sku})`,
      })),
    [products]
  );

  const canSave = useMemo(() => {
    if (!title.trim()) return false;

    if (type === "category_wise" && !categoryId) return false;
    if (type === "product_wise" && !productId) return false;
    if (type === "custom_url" && !url.trim()) return false;

    // image is optional by your earlier list, but if you want required, uncomment:
    // if (!imageUrl) return false;

    return true;
  }, [title, type, categoryId, productId, url]);

  const pickImage = () => fileRef.current?.click();

  const loadMeta = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      const r = h > 0 ? w / h : 0;
      setImgMeta({ width: w, height: h, ratio: r });
    };
    img.src = src;
  };

  const setFile = (f: File | null) => {
    if (!f) return;
    if (!isImageFile(f)) return;

    const nextUrl = URL.createObjectURL(f);
    setImageUrl(nextUrl);
    setImageFileName(f.name);
    loadMeta(nextUrl);
  };

  const onFileChange = (f: File | null) => setFile(f);

  const resetImage = () => {
    setImageUrl(null);
    setImageFileName(null);
    setImgMeta(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = () => {
    const payload: Omit<BannerRow, "id" | "createdAt"> = {
      title: title.trim(),
      zone,
      type,
      categoryId: type === "category_wise" ? categoryId : null,
      productId: type === "product_wise" ? productId : null,
      url: type === "custom_url" ? url.trim() : null,

      imageUrl,
      imageFileName,

      featured,
      status,
    };

    onSave(payload);
  };

  const ratioDiff = useMemo(() => {
    if (!imgMeta?.ratio) return null;
    return Math.abs(imgMeta.ratio - RECOMMENDED.ratio);
  }, [imgMeta]);

  const ratioOk = useMemo(() => {
    // allow small tolerance
    if (ratioDiff == null) return null;
    return ratioDiff <= 0.12; // ~ acceptable
  }, [ratioDiff]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close overlay"
      />

      <div className="relative w-[96vw] max-w-6xl overflow-hidden rounded-[4px] border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === "create" ? "Add New Banner" : "Edit Banner"}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Recommended size: {RECOMMENDED.width}×{RECOMMENDED.height} (Ratio 3:1)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[800px] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Banner Information
                </h4>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title <span className="text-error-500">*</span>
                    </p>
                    <Input
                      placeholder="New banner"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Zone <span className="text-error-500">*</span>
                    </p>
                    <Select
                      options={zoneOptions}
                      placeholder="Select zone"
                      defaultValue={zone}
                      onChange={(v) => setZone(v as BannerZone)}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Banner type <span className="text-error-500">*</span>
                    </p>
                    <Select
                      options={TYPE_OPTIONS}
                      placeholder="Select type"
                      defaultValue={type}
                      onChange={(v) => setType(v as BannerType)}
                    />
                  </div>
                </div>

                {type === "category_wise" ? (
                  <div className="mt-5 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category <span className="text-error-500">*</span>
                    </p>
                    <Select
                      options={categoryOptions}
                      placeholder="Select category"
                      defaultValue={categoryId ? String(categoryId) : ""}
                      onChange={(v) => setCategoryId(Number(v))}
                    />
                  </div>
                ) : null}

                {type === "product_wise" ? (
                  <div className="mt-5 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Product <span className="text-error-500">*</span>
                    </p>
                    <Select
                      options={productOptions}
                      placeholder="Select product"
                      defaultValue={productId ? String(productId) : ""}
                      onChange={(v) => setProductId(Number(v))}
                    />
                  </div>
                ) : null}

                {type === "custom_url" ? (
                  <div className="mt-5 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Target URL <span className="text-error-500">*</span>
                    </p>
                    <Input
                      placeholder="https://your-site.com/campaign"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Example: campaign landing / product promo page.
                    </p>
                  </div>
                ) : null}

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-[4px] border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Featured
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Highlight this banner
                        </p>
                      </div>
                      <Switch
                        label=""
                        defaultChecked={featured}
                        onChange={(c) => setFeatured(c)}
                      />
                    </div>
                  </div>

                  <div className="rounded-[4px] border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Status
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {status ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <Switch
                        label=""
                        defaultChecked={status}
                        onChange={(c) => setStatus(c)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Advanced Upload */}
            <div className="space-y-6">
              <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Banner Image
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Recommended ratio: 3:1 ({RECOMMENDED.width}×{RECOMMENDED.height})
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={pickImage}>
                      Upload
                    </Button>
                    <Button variant="outline" onClick={resetImage}>
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Drag & Drop Upload + Proper 3:1 preview */}
                <div
                  className={[
                    "mt-4 overflow-hidden rounded-[4px] border transition",
                    dragOver
                      ? "border-brand-500"
                      : "border-gray-200 dark:border-gray-800",
                  ].join(" ")}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0] ?? null;
                    onFileChange(file);
                  }}
                >
                  {/* 3:1 container */}
                  <div className="relative w-full bg-gray-50 dark:bg-gray-800">
                    <div className="pt-[33.333%]" />
                    <div className="absolute inset-0">
                      {imageUrl ? (
                        <>
                          <img
                            src={imageUrl}
                            alt="Banner preview"
                            className="h-full w-full object-cover"
                          />
                          {/* overlay for professional feel */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </>
                      ) : (
                        <button
                          type="button"
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400"
                          onClick={pickImage}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-gray-300 bg-white shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">
                            <UploadCloud size={20} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold">Upload Banner</p>
                            <p className="mt-1 text-xs">
                              Drag & drop or click to select
                            </p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                          <ImageIcon size={14} />
                          {imageFileName ?? "No file selected"}
                        </span>
                      </div>

                      {imgMeta ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex h-7 items-center rounded-lg border border-gray-200 bg-white px-2 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                            {imgMeta.width}×{imgMeta.height}
                          </span>

                          <span
                            className={[
                              "inline-flex h-7 items-center rounded-lg border px-2 font-semibold",
                              ratioOk === true
                                ? "border-success-200 bg-success-50 text-success-700 dark:border-success-900/30 dark:bg-success-500/10 dark:text-success-300"
                                : "border-error-200 bg-error-50 text-error-700 dark:border-error-900/30 dark:bg-error-500/10 dark:text-error-300",
                            ].join(" ")}
                          >
                            Ratio {ratioLabel(imgMeta.ratio)}
                            {ratioOk === true ? " ✓" : " !"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          Ratio 3:1 recommended
                        </span>
                      )}
                    </div>

                    {imgMeta && ratioOk === false ? (
                      <p className="mt-2 text-xs text-error-600 dark:text-error-300">
                        Your image ratio is not close to 3:1. It will be cropped in preview
                        (top/bottom or sides). Recommended: {RECOMMENDED.width}×
                        {RECOMMENDED.height}.
                      </p>
                    ) : null}
                  </div>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />
              </div>

              {/* small pro panel */}
              <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Best practice
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Use WebP/JPG for faster load</li>
                  <li>• Keep text away from edges (safe padding)</li>
                  <li>• Use high contrast for readability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSave}>
            {mode === "create" ? "Submit" : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
}
