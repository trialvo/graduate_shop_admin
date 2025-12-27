
// src/components/products/all-products/modals/EditProductModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import RichTextEditor from "@/components/ui/editor/RichTextEditor";
import ImageMultiUploader, { type UploadedImage } from "@/components/ui/upload/ImageMultiUploader";
import VideoUploader, { type UploadedVideo } from "@/components/ui/upload/VideoUploader";

import BaseModal from "./BaseModal";
import { cn } from "@/lib/utils";

import { getBrands } from "@/api/brands.api";
import { getAttributes, type Attribute } from "@/api/attributes.api";
import { getChildCategories, getMainCategories, getSubCategories } from "@/api/categories.api";
import { getProduct, updateProduct } from "@/api/products.api";

type Option = { value: string; label: string };

function unwrapList<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.brands)) return payload.brands;
  if (Array.isArray(payload?.attributes)) return payload.attributes;
  return [];
}

type Props = {
  open: boolean;
  productId: number | null;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditProductModal({ open, productId, onClose, onUpdated }: Props) {
  const enabled = open && typeof productId === "number";

  // lookups
  const { data: mainRes } = useQuery({
    queryKey: ["mainCategories-all"],
    queryFn: () => getMainCategories(),
    staleTime: 60_000,
    enabled: open,
  });

  const { data: subRes } = useQuery({
    queryKey: ["subCategories-all"],
    queryFn: () => getSubCategories(),
    staleTime: 60_000,
    enabled: open,
  });

  const { data: childRes } = useQuery({
    queryKey: ["childCategories-all"],
    queryFn: () => getChildCategories(),
    staleTime: 60_000,
    enabled: open,
  });

  const { data: brandRes } = useQuery({
    queryKey: ["brands-all"],
    queryFn: () => getBrands(),
    staleTime: 60_000,
    enabled: open,
  });

  const { data: attrRes } = useQuery({
    queryKey: ["attributes-all"],
    queryFn: () => getAttributes(),
    staleTime: 60_000,
    enabled: open,
  });

  const mainCategories = useMemo(() => unwrapList<any>(mainRes), [mainRes]);
  const subCategories = useMemo(() => unwrapList<any>(subRes), [subRes]);
  const childCategories = useMemo(() => unwrapList<any>(childRes), [childRes]);
  const brands = useMemo(() => unwrapList<any>(brandRes).filter((b: any) => b.status !== false), [brandRes]);
  const attributes = useMemo(() => unwrapList<Attribute>(attrRes).filter((a) => a.status !== false), [attrRes]);

  // product
  const { data: prodRes, isLoading: productLoading } = useQuery({
    queryKey: ["product-single", productId],
    queryFn: () => getProduct(productId as number),
    enabled,
    staleTime: 0,
  });

  // form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [mainCategoryId, setMainCategoryId] = useState<number>(0);
  const [subCategoryId, setSubCategoryId] = useState<number>(0);
  const [childCategoryId, setChildCategoryId] = useState<number>(0);

  const [brandId, setBrandId] = useState<number>(0);
  const [attributeId, setAttributeId] = useState<number>(0);

  const [video, setVideo] = useState<UploadedVideo>({ kind: "none" });
  const [newImages, setNewImages] = useState<UploadedImage[]>([]);

  const [existingImages, setExistingImages] = useState<{ id: number; path: string }[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);

  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");

  const [flags, setFlags] = useState({
    status: true,
    featured: false,
    free_delivery: false,
    best_deal: false,
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

  // hydrate form from product
  useEffect(() => {
    if (!prodRes?.product) return;

    const p = prodRes.product;

    setName(p.name ?? "");
    setSlug(p.slug ?? "");

    setMainCategoryId(Number(p.main_category_id ?? 0));
    setSubCategoryId(Number(p.sub_category_id ?? 0));
    setChildCategoryId(Number(p.child_category_id ?? 0));
    setBrandId(Number(p.brand_id ?? 0));

    setAttributeId(Number(p.attribute_id ?? (attributes?.[0]?.id ?? 0)));

    setExistingImages(Array.isArray(p.images) ? p.images : []);
    setDeleteImageIds([]);

    setShortDescription(String(p.short_description ?? ""));
    setLongDescription(String(p.long_description ?? ""));

    setFlags({
      status: Boolean(p.status),
      featured: Boolean(p.featured),
      free_delivery: Boolean(p.free_delivery ?? false),
      best_deal: Boolean(p.best_deal),
    });

    setSeo({
      meta_title: String(p.meta_title ?? ""),
      meta_description: String(p.meta_description ?? ""),
      meta_keywords: String(p.meta_keywords ?? ""),
      canonical_url: String(p.canonical_url ?? ""),
      og_title: String(p.og_title ?? ""),
      og_description: String(p.og_description ?? ""),
      robots: String(p.robots ?? "index, follow"),
    });

    setVideo(p.video_path ? ({ kind: "url", url: p.video_path } as any) : { kind: "none" });
    setNewImages([]);
  }, [prodRes, attributes]);

  const availableSubs = useMemo(() => {
    if (!mainCategoryId) return [];
    return subCategories.filter((s: any) => Number(s.main_category_id) === Number(mainCategoryId));
  }, [subCategories, mainCategoryId]);

  const availableChild = useMemo(() => {
    if (!subCategoryId) return [];
    return childCategories.filter((c: any) => Number(c.sub_category_id) === Number(subCategoryId));
  }, [childCategories, subCategoryId]);

  const mainOptions: Option[] = useMemo(
    () => mainCategories.map((c: any) => ({ value: String(c.id), label: String(c.name) })),
    [mainCategories],
  );

  const subOptions: Option[] = useMemo(
    () => availableSubs.map((s: any) => ({ value: String(s.id), label: String(s.name) })),
    [availableSubs],
  );

  const childOptions: Option[] = useMemo(
    () => availableChild.map((c: any) => ({ value: String(c.id), label: String(c.name) })),
    [availableChild],
  );

  const brandOptions: Option[] = useMemo(
    () => brands.map((b: any) => ({ value: String(b.id), label: String(b.name) })),
    [brands],
  );

  const attrOptions: Option[] = useMemo(
    () => attributes.map((a) => ({ value: String(a.id), label: String(a.name) })),
    [attributes],
  );

  const mutation = useMutation({
    mutationFn: (payload: any) => updateProduct(productId as number, payload),
    onSuccess: () => {
      toast.success("Product updated successfully");
      onUpdated();
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? "Failed to update product";
      toast.error(msg);
    },
  });

  const toggleDeleteImage = (id: number) => {
    setDeleteImageIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = () => {
    if (!productId) return;

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    mutation.mutate({
      product_images: newImages.map((i) => i.file),
      name: name.trim(),
      slug: slug.trim(),
      main_category_id: mainCategoryId,
      sub_category_id: subCategoryId,
      child_category_id: childCategoryId,
      brand_id: brandId,
      attribute_id: attributeId,

      video_path: video.kind === "url" ? video.url : undefined,
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

      delete_image_ids: deleteImageIds,
    });
  };

  return (
    <BaseModal
      open={open}
      title="Edit Product"
      description="Update product info, upload new images, and mark existing images for deletion."
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={save} disabled={mutation.isPending || productLoading}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      }
    >
      {productLoading ? (
        <div className="space-y-3">
          <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
          <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
          <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Basic</h3>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Name *</p>
                <Input value={name} onChange={(e) => setName(String(e.target.value))} placeholder="Product name" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Slug *</p>
                <Input value={slug} onChange={(e) => setSlug(String(e.target.value))} placeholder="product-slug" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
                <Select options={mainOptions} defaultValue={String(mainCategoryId)} onChange={(v) => setMainCategoryId(Number(v))} placeholder="Select category" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub Category</p>
                <Select
                  key={`sub-${mainCategoryId}-${subCategoryId}`}
                  options={subOptions}
                  defaultValue={String(subCategoryId)}
                  onChange={(v) => setSubCategoryId(Number(v))}
                  placeholder="Select sub category"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Child Category</p>
                <Select
                  key={`child-${subCategoryId}-${childCategoryId}`}
                  options={childOptions}
                  defaultValue={String(childCategoryId)}
                  onChange={(v) => setChildCategoryId(Number(v))}
                  placeholder="Select child category"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand</p>
                <Select options={brandOptions} defaultValue={String(brandId)} onChange={(v) => setBrandId(Number(v))} placeholder="Select brand" />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Attribute</p>
                <Select options={attrOptions} defaultValue={String(attributeId)} onChange={(v) => setAttributeId(Number(v))} placeholder="Select attribute" />
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Flags</h3>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  { key: "status", label: "Status" },
                  { key: "featured", label: "Featured" },
                  { key: "free_delivery", label: "Free Delivery" },
                  { key: "best_deal", label: "Best Deal" },
                ] as const
              ).map((item) => (
                <div key={item.key} className="rounded-[4px] border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between gap-2">
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

          {/* Media */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Media</h3>

            {/* Existing images */}
            {existingImages.length ? (
              <div className="rounded-[4px] border border-gray-200 p-3 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Existing Images (select to delete)
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {existingImages.map((img) => {
                    const marked = deleteImageIds.includes(img.id);
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => toggleDeleteImage(img.id)}
                        className={cn(
                          "relative overflow-hidden rounded-[6px] border p-2 text-left transition",
                          marked
                            ? "border-error-400 bg-error-50 dark:border-error-500/40 dark:bg-error-500/10"
                            : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-white/[0.04]",
                        )}
                        aria-label="Toggle delete image"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.path} alt={`img-${img.id}`} className="h-20 w-full rounded-[4px] object-cover" />
                        <div className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          ID: {img.id}
                        </div>
                        {marked ? (
                          <span className="absolute right-2 top-2 rounded bg-error-600 px-2 py-1 text-[10px] font-bold text-white">
                            DELETE
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <ImageMultiUploader
              label="Upload New Images"
              images={newImages}
              onChange={setNewImages}
              max={10}
              helperText="These images will be uploaded and added to the product."
            />

            <VideoUploader label="Video URL" value={video} onChange={setVideo} />
          </div>

          {/* Descriptions */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Descriptions</h3>

            <RichTextEditor label="Short Description" value={shortDescription} onChange={setShortDescription} heightClassName="min-h-[140px]" />
            <RichTextEditor label="Long Description" value={longDescription} onChange={setLongDescription} heightClassName="min-h-[220px]" />
          </div>

          {/* SEO */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">SEO</h3>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</p>
                <Input value={seo.meta_title} onChange={(e) => setSeo((p) => ({ ...p, meta_title: String(e.target.value) }))} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Canonical URL</p>
                <Input value={seo.canonical_url} onChange={(e) => setSeo((p) => ({ ...p, canonical_url: String(e.target.value) }))} />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</p>
                <textarea
                  className="min-h-[110px] w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={seo.meta_description}
                  onChange={(e) => setSeo((p) => ({ ...p, meta_description: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
