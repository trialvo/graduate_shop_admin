"use client";

import React from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";


import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { api } from "@/api/client";
import { getProduct, updateProduct } from "@/api/products.api";
import { getMainCategories, getSubCategories, getChildCategories } from "@/api/categories.api";
import { getAttributes } from "@/api/attributes.api";
import { getColors } from "@/api/colors.api";
import BaseModal from "./BaseModal";

type Props = {
  open: boolean;
  productId: number | null;
  onClose: () => void;
  onUpdated?: () => void;
};

type Option = { value: string; label: string };

type ExistingImage = { id: number; path: string };

type VariationRow = {
  id: number;
  product_id: number;
  color_id: number;
  variant_id: number;
  buying_price: number;
  selling_price: number;
  discount: number;
  stock: number;
  sku: string;
  status?: number;
};

type VariationDraft = {
  color_id: number;
  variant_id: number;
  buying_price: number;
  selling_price: number;
  discount: number;
  stock: number;
  sku: string;
};

type InlineEditState = Record<number, VariationDraft>;

function safeNumber(v: string, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function unwrapList<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function normalizeRobots(v: string) {
  return v.replace(/\s+/g, " ").trim(); // "index, follow" => "index, follow"
}

/**
 * Tries to extract "variant options" from attributes response in a safe way.
 * Supports common shapes:
 * - attr.variants: [{id,name}]
 * - attr.values:   [{id,name}] or ["M","L"] (string list)
 */
function buildVariantOptionsForAttribute(attributeId: number, attributesRaw: any[]): Option[] {
  const attr = attributesRaw.find((a: any) => Number(a?.id) === Number(attributeId));
  if (!attr) return [];

  const variants = Array.isArray(attr?.variants) ? attr.variants : null;
  if (variants?.length) {
    return variants.map((x: any) => ({ value: String(x.id), label: String(x.name ?? x.title ?? x.value ?? x.id) }));
  }

  const values = Array.isArray(attr?.values) ? attr.values : null;
  if (values?.length) {
    // if objects with id
    if (typeof values[0] === "object" && values[0] !== null && "id" in values[0]) {
      return values.map((x: any) => ({ value: String(x.id), label: String(x.name ?? x.title ?? x.value ?? x.id) }));
    }
    // if strings only => no numeric IDs (API requires numeric) => can't map safely
    return [];
  }

  return [];
}

export default function EditProductModal({ open, productId, onClose, onUpdated }: Props) {
  const enabled = open && !!productId;

  // lookups (load all, no params)
  const { data: mainRes } = useQuery({
    queryKey: ["mainCategories-all"],
    queryFn: () => getMainCategories(),
    staleTime: 60_000,
  });

  const { data: subRes } = useQuery({
    queryKey: ["subCategories-all"],
    queryFn: () => getSubCategories(),
    staleTime: 60_000,
  });

  const { data: childRes } = useQuery({
    queryKey: ["childCategories-all"],
    queryFn: () => getChildCategories(),
    staleTime: 60_000,
  });

  const { data: colorsRes } = useQuery({
    queryKey: ["colors-all"],
    queryFn: () => getColors({} as any),
    staleTime: 60_000,
  });

  const { data: attrsRes } = useQuery({
    queryKey: ["attributes-all"],
    queryFn: () => getAttributes({} as any),
    staleTime: 60_000,
  });

  const mains = React.useMemo(() => unwrapList<any>(mainRes), [mainRes]);
  const subs = React.useMemo(() => unwrapList<any>(subRes), [subRes]);
  const childs = React.useMemo(() => unwrapList<any>(childRes), [childRes]);

  const colorsRaw = React.useMemo(() => unwrapList<any>(colorsRes), [colorsRes]);
  const attrsRaw = React.useMemo(() => unwrapList<any>(attrsRes), [attrsRes]);

  const colorNameById = React.useMemo(
    () => new Map(colorsRaw.map((c: any) => [Number(c.id), String(c.name ?? c.title ?? `#${c.id}`)])),
    [colorsRaw],
  );

  // product query
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(Number(productId)),
    enabled,
    retry: 1,
  });

  // ----------------------------
  // Form state
  // ----------------------------
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");

  const [mainCategoryId, setMainCategoryId] = React.useState<number>(0);
  const [subCategoryId, setSubCategoryId] = React.useState<number>(0);
  const [childCategoryId, setChildCategoryId] = React.useState<number>(0);

  const [brandId, setBrandId] = React.useState<number>(0); // if you want brand dropdown later
  const [attributeId, setAttributeId] = React.useState<number>(0);

  const [videoPath, setVideoPath] = React.useState<string>("");
  const [shortDescription, setShortDescription] = React.useState<string>("");
  const [longDescription, setLongDescription] = React.useState<string>("");

  const [status, setStatus] = React.useState<boolean>(true);
  const [featured, setFeatured] = React.useState<boolean>(false);
  const [freeDelivery, setFreeDelivery] = React.useState<boolean>(false);
  const [bestDeal, setBestDeal] = React.useState<boolean>(false);

  const [metaTitle, setMetaTitle] = React.useState<string>("");
  const [metaDescription, setMetaDescription] = React.useState<string>("");
  const [metaKeywords, setMetaKeywords] = React.useState<string>("");
  const [canonicalUrl, setCanonicalUrl] = React.useState<string>("");
  const [ogTitle, setOgTitle] = React.useState<string>("");
  const [ogDescription, setOgDescription] = React.useState<string>("");
  const [robots, setRobots] = React.useState<string>("index, follow");

  const [existingImages, setExistingImages] = React.useState<ExistingImage[]>([]);
  const [deleteImageIds, setDeleteImageIds] = React.useState<number[]>([]);
  const [newFiles, setNewFiles] = React.useState<File[]>([]);

  // variations
  const [variations, setVariations] = React.useState<VariationRow[]>([]);
  const [varEdit, setVarEdit] = React.useState<InlineEditState>({});
  const [addDraft, setAddDraft] = React.useState<VariationDraft>({
    color_id: 0,
    variant_id: 0,
    buying_price: 0,
    selling_price: 0,
    discount: 0,
    stock: 0,
    sku: "",
  });

  // small confirm modal for variation delete
  const [varDeleteOpen, setVarDeleteOpen] = React.useState(false);
  const [varDeleteId, setVarDeleteId] = React.useState<number | null>(null);

  // hydrate form when product changes
  React.useEffect(() => {
    const p = productQuery.data?.product;
    if (!p) return;

    setName(String(p.name ?? ""));
    setSlug(String(p.slug ?? ""));

    setMainCategoryId(Number(p.main_category_id ?? 0));
    setSubCategoryId(Number(p.sub_category_id ?? 0));
    setChildCategoryId(Number(p.child_category_id ?? 0));

    setBrandId(Number(p.brand_id ?? 0));
    setAttributeId(Number((p as any).attribute_id ?? 0));

    setVideoPath(String((p as any).video_path ?? ""));
    setShortDescription(String((p as any).short_description ?? ""));
    setLongDescription(String((p as any).long_description ?? ""));

    setStatus(Boolean(p.status));
    setFeatured(Boolean(p.featured));
    setFreeDelivery(Boolean((p as any).free_delivery ?? false));
    setBestDeal(Boolean(p.best_deal));

    setMetaTitle(String((p as any).meta_title ?? ""));
    setMetaDescription(String((p as any).meta_description ?? ""));
    setMetaKeywords(String((p as any).meta_keywords ?? ""));
    setCanonicalUrl(String((p as any).canonical_url ?? ""));
    setOgTitle(String((p as any).og_title ?? ""));
    setOgDescription(String((p as any).og_description ?? ""));
    setRobots(normalizeRobots(String((p as any).robots ?? "index, follow")));

    setExistingImages(Array.isArray(p.images) ? p.images : []);
    setDeleteImageIds([]);
    setNewFiles([]);

    const vars = Array.isArray((p as any).variations) ? ((p as any).variations as VariationRow[]) : [];
    setVariations(vars);
    setVarEdit({});

    // sensible defaults for add form
    setAddDraft((prev) => ({
      ...prev,
      color_id: vars[0]?.color_id ?? 0,
      variant_id: vars[0]?.variant_id ?? 0,
      buying_price: vars[0]?.buying_price ?? 0,
      selling_price: vars[0]?.selling_price ?? 0,
      discount: vars[0]?.discount ?? 0,
      stock: 0,
      sku: "",
    }));
  }, [productQuery.data]);

  // dropdown options
  const mainOptions: Option[] = React.useMemo(
    () => mains.map((c: any) => ({ value: String(c.id), label: String(c.name) })),
    [mains],
  );

  const availableSubs = React.useMemo(() => {
    if (!mainCategoryId) return subs;
    return subs.filter((s: any) => Number(s.main_category_id) === Number(mainCategoryId));
  }, [subs, mainCategoryId]);

  const subOptions: Option[] = React.useMemo(
    () => availableSubs.map((c: any) => ({ value: String(c.id), label: String(c.name) })),
    [availableSubs],
  );

  const availableChild = React.useMemo(() => {
    if (!subCategoryId) return childs;
    return childs.filter((c: any) => Number(c.sub_category_id) === Number(subCategoryId));
  }, [childs, subCategoryId]);

  const childOptions: Option[] = React.useMemo(
    () => availableChild.map((c: any) => ({ value: String(c.id), label: String(c.name) })),
    [availableChild],
  );

  const attributeOptions: Option[] = React.useMemo(() => {
    return attrsRaw.map((a: any) => ({ value: String(a.id), label: String(a.name ?? a.title ?? `#${a.id}`) }));
  }, [attrsRaw]);

  const colorOptions: Option[] = React.useMemo(() => {
    return colorsRaw.map((c: any) => ({ value: String(c.id), label: String(c.name ?? c.title ?? `#${c.id}`) }));
  }, [colorsRaw]);

  const variantOptionsFromAttr = React.useMemo(() => {
    if (!attributeId) return [];
    return buildVariantOptionsForAttribute(attributeId, attrsRaw);
  }, [attributeId, attrsRaw]);

  // keep sub/child valid
  React.useEffect(() => {
    if (!availableSubs.length) {
      setSubCategoryId(0);
      return;
    }
    if (!availableSubs.some((s: any) => Number(s.id) === Number(subCategoryId))) {
      setSubCategoryId(Number(availableSubs[0].id));
    }
  }, [availableSubs, subCategoryId]);

  React.useEffect(() => {
    if (!availableChild.length) {
      setChildCategoryId(0);
      return;
    }
    if (!availableChild.some((c: any) => Number(c.id) === Number(childCategoryId))) {
      setChildCategoryId(Number(availableChild[0].id));
    }
  }, [availableChild, childCategoryId]);

  // ----------------------------
  // Product update mutation
  // ----------------------------
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!productId) throw new Error("Missing product id");

      return updateProduct(productId, {
        product_images: newFiles,
        name,
        slug,

        main_category_id: mainCategoryId,
        sub_category_id: subCategoryId,
        child_category_id: childCategoryId,

        brand_id: brandId,
        attribute_id: attributeId,

        video_path: videoPath,
        short_description: shortDescription,
        long_description: longDescription,

        status,
        featured,
        free_delivery: freeDelivery,
        best_deal: bestDeal,

        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
        canonical_url: canonicalUrl,
        og_title: ogTitle,
        og_description: ogDescription,
        robots,

        delete_image_ids: deleteImageIds.length ? deleteImageIds : undefined,
      } as any);
    },
    onSuccess: async () => {
      toast.success("Product updated");
      onUpdated?.();
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? "Failed to update product";
      toast.error(msg);
    },
  });

  // ----------------------------
  // Variations API helpers
  // ----------------------------
  const createVariation = async (payload: VariationDraft) => {
    if (!productId) throw new Error("Missing product id");

    const body = {
      product_id: productId,
      color_id: payload.color_id,
      variant_id: payload.variant_id,
      buying_price: payload.buying_price,
      selling_price: payload.selling_price,
      discount: payload.discount,
      stock: payload.stock,
      sku: payload.sku,
    };

    const res = await api.post("/product/variation", body);
    return res.data;
  };

  const updateVariation = async (id: number, payload: VariationDraft) => {
    if (!productId) throw new Error("Missing product id");

    const body = {
      product_id: productId,
      color_id: payload.color_id,
      variant_id: payload.variant_id,
      buying_price: payload.buying_price,
      selling_price: payload.selling_price,
      discount: payload.discount,
      stock: payload.stock,
      sku: payload.sku,
    };

    const res = await api.put(`/product/variation/${id}`, body);
    return res.data;
  };

  const deleteVariation = async (id: number) => {
    const res = await api.delete(`/product/variation/${id}`);
    return res.data;
  };

  const createVarMutation = useMutation({
    mutationFn: (payload: VariationDraft) => createVariation(payload),
    onSuccess: async () => {
      toast.success("Variation added");
      await productQuery.refetch();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? "Failed to add variation";
      toast.error(msg);
    },
  });

  const updateVarMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: VariationDraft }) => updateVariation(id, payload),
    onSuccess: async () => {
      toast.success("Variation updated");
      setVarEdit({});
      await productQuery.refetch();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? "Failed to update variation";
      toast.error(msg);
    },
  });

  const deleteVarMutation = useMutation({
    mutationFn: (id: number) => deleteVariation(id),
    onSuccess: async () => {
      toast.success("Variation deleted");
      setVarDeleteOpen(false);
      setVarDeleteId(null);
      await productQuery.refetch();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? "Failed to delete variation";
      toast.error(msg);
    },
  });

  // ----------------------------
  // Variation UI helpers
  // ----------------------------
  const startEditVariation = (v: VariationRow) => {
    setVarEdit((p) => ({
      ...p,
      [v.id]: {
        color_id: v.color_id,
        variant_id: v.variant_id,
        buying_price: v.buying_price,
        selling_price: v.selling_price,
        discount: v.discount,
        stock: v.stock,
        sku: v.sku ?? "",
      },
    }));
  };

  const cancelEditVariation = (id: number) => {
    setVarEdit((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });
  };

  const patchEditVariation = (id: number, patch: Partial<VariationDraft>) => {
    setVarEdit((p) => ({
      ...p,
      [id]: { ...(p[id] ?? ({} as VariationDraft)), ...patch },
    }));
  };

  const toggleDeleteImage = (imgId: number) => {
    setDeleteImageIds((prev) => {
      if (prev.includes(imgId)) return prev.filter((x) => x !== imgId);
      return [...prev, imgId];
    });
  };

  const isBusy =
    productQuery.isFetching ||
    updateMutation.isPending ||
    createVarMutation.isPending ||
    updateVarMutation.isPending ||
    deleteVarMutation.isPending;

  const footer = (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        className="h-11"
        onClick={() => {
          if (isBusy) return;
          onClose();
        }}
      >
        Cancel
      </Button>

      <Button
        className="h-11"
        onClick={() => updateMutation.mutate()}
        disabled={isBusy || !name.trim() || !slug.trim() || !mainCategoryId || !subCategoryId || !childCategoryId}
      >
        Save Changes
      </Button>
    </div>
  );

  return (
    <>
      <BaseModal
        open={open}
        onClose={() => {
          if (isBusy) return;
          onClose();
        }}
        title="Edit Product"
        description="Update product info, images and variations."
        widthClassName="w-[1100px]"
        footer={footer}
      >
        {productQuery.isLoading ? (
          <div className="py-14 text-center text-sm text-gray-500 dark:text-gray-400">Loading product...</div>
        ) : productQuery.isError ? (
          <div className="py-14 text-center text-sm text-error-600">Failed to load product.</div>
        ) : (
          <div className="space-y-6">
            {/* Basic */}
            <div className="rounded-[6px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Basic Info</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">ID: {productId}</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name <span className="text-error-500">*</span>
                  </p>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug <span className="text-error-500">*</span>
                  </p>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="product-slug" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
                  <Select
                    key={`main-${mainCategoryId}`}
                    options={mainOptions}
                    placeholder="Select category"
                    defaultValue={mainCategoryId ? String(mainCategoryId) : ""}
                    onChange={(v) => {
                      const id = Number(v);
                      setMainCategoryId(id);
                      setSubCategoryId(0);
                      setChildCategoryId(0);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub Category</p>
                  <Select
                    key={`sub-${mainCategoryId}-${subCategoryId}`}
                    options={subOptions}
                    placeholder="Select sub category"
                    defaultValue={subCategoryId ? String(subCategoryId) : ""}
                    onChange={(v) => {
                      setSubCategoryId(Number(v));
                      setChildCategoryId(0);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Child Category</p>
                  <Select
                    key={`child-${subCategoryId}-${childCategoryId}`}
                    options={childOptions}
                    placeholder="Select child category"
                    defaultValue={childCategoryId ? String(childCategoryId) : ""}
                    onChange={(v) => setChildCategoryId(Number(v))}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Attribute</p>
                  <Select
                    key={`attr-${attributeId}`}
                    options={attributeOptions}
                    placeholder="Select attribute"
                    defaultValue={attributeId ? String(attributeId) : ""}
                    onChange={(v) => setAttributeId(Number(v))}
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Video URL</p>
                  <Input value={videoPath} onChange={(e) => setVideoPath(e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </div>

            {/* Flags */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                { label: "Status", value: status, onChange: setStatus },
                { label: "Featured", value: featured, onChange: setFeatured },
                { label: "Free Delivery", value: freeDelivery, onChange: setFreeDelivery },
                { label: "Best Deal", value: bestDeal, onChange: setBestDeal },
              ].map((x) => (
                <div
                  key={x.label}
                  className="rounded-[6px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{x.label}</p>
                    <Switch
                      key={`${x.label}-${x.value}`}
                      label=""
                      defaultChecked={x.value}
                      onChange={(checked) => x.onChange(checked)}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Toggle for listing & promotions.</p>
                </div>
              ))}
            </div>

            {/* Descriptions */}
            <div className="rounded-[6px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Descriptions</h3>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</p>
                  <textarea
                    className="min-h-[120px] w-full rounded-[6px] border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-800 dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Short description..."
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Long Description</p>
                  <textarea
                    className="min-h-[120px] w-full rounded-[6px] border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-800 dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={longDescription}
                    onChange={(e) => setLongDescription(e.target.value)}
                    placeholder="Long description..."
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="rounded-[6px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Images</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Existing: {existingImages.length} • Marked delete: {deleteImageIds.length} • New: {newFiles.length}
                </span>
              </div>

              {existingImages.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                  {existingImages.map((img) => {
                    const marked = deleteImageIds.includes(img.id);
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => toggleDeleteImage(img.id)}
                        className={cn(
                          "relative overflow-hidden rounded-[6px] border bg-gray-50 dark:bg-gray-950",
                          marked ? "border-error-400" : "border-gray-200 dark:border-gray-800",
                        )}
                        title={marked ? "Will be deleted" : "Click to mark for delete"}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.path} alt={`img-${img.id}`} className={cn("h-20 w-full object-cover", marked && "opacity-40")} />
                        <div
                          className={cn(
                            "absolute right-2 top-2 rounded-full px-2 py-1 text-[11px] font-semibold",
                            marked ? "bg-error-600 text-white" : "bg-black/50 text-white",
                          )}
                        >
                          {marked ? "Delete" : `#${img.id}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">No existing images.</div>
              )}

              <div className="mt-4 rounded-[6px] border border-dashed border-gray-300 p-4 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Upload new images</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  These will be sent as <code className="font-mono">product_images</code> (multi-file).
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-3 block w-full text-sm text-gray-700 dark:text-gray-300"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setNewFiles(files);
                  }}
                />

                {newFiles.length ? (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Selected: {newFiles.map((f) => f.name).join(", ")}
                  </div>
                ) : null}
              </div>
            </div>

            {/* ✅ Variations */}
            <div className="rounded-[6px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
              <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Variations</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Manage product variations (color + variant + prices + stock + sku).
                  </p>
                </div>

                <span className="inline-flex h-7 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  Total: {variations.length}
                </span>
              </div>

              {/* Add row */}
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                  <div className="md:col-span-1">
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">Color</p>
                    <Select
                      key={`add-color-${addDraft.color_id}`}
                      options={colorOptions}
                      placeholder="Color"
                      defaultValue={addDraft.color_id ? String(addDraft.color_id) : ""}
                      onChange={(v) => setAddDraft((p) => ({ ...p, color_id: Number(v) }))}
                    />
                  </div>

                  <div className="md:col-span-1">
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">Variant</p>

                    {variantOptionsFromAttr.length ? (
                      <Select
                        key={`add-variant-${attributeId}-${addDraft.variant_id}`}
                        options={variantOptionsFromAttr}
                        placeholder="Variant"
                        defaultValue={addDraft.variant_id ? String(addDraft.variant_id) : ""}
                        onChange={(v) => setAddDraft((p) => ({ ...p, variant_id: Number(v) }))}
                      />
                    ) : (
                      <Input
                        type="number"
                        value={addDraft.variant_id}
                        onChange={(e) => setAddDraft((p) => ({ ...p, variant_id: safeNumber(e.target.value, p.variant_id) }))}
                        placeholder="variant_id"
                      />
                    )}
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">Buy</p>
                    <Input
                      type="number"
                      value={addDraft.buying_price}
                      onChange={(e) =>
                        setAddDraft((p) => ({ ...p, buying_price: safeNumber(e.target.value, p.buying_price) }))
                      }
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">Sell</p>
                    <Input
                      type="number"
                      value={addDraft.selling_price}
                      onChange={(e) =>
                        setAddDraft((p) => ({ ...p, selling_price: safeNumber(e.target.value, p.selling_price) }))
                      }
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">Discount</p>
                    <Input
                      type="number"
                      value={addDraft.discount}
                      onChange={(e) => setAddDraft((p) => ({ ...p, discount: safeNumber(e.target.value, p.discount) }))}
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">Stock</p>
                    <Input
                      type="number"
                      value={addDraft.stock}
                      onChange={(e) => setAddDraft((p) => ({ ...p, stock: Math.max(0, safeNumber(e.target.value, p.stock)) }))}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">SKU</p>
                    <Input value={addDraft.sku} onChange={(e) => setAddDraft((p) => ({ ...p, sku: e.target.value }))} />
                  </div>

                  <div className="md:col-span-2 flex items-end justify-end gap-2">
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={() =>
                        setAddDraft({
                          color_id: 0,
                          variant_id: 0,
                          buying_price: 0,
                          selling_price: 0,
                          discount: 0,
                          stock: 0,
                          sku: "",
                        })
                      }
                    >
                      Reset
                    </Button>

                    <Button
                      className="h-11"
                      startIcon={<Plus className="h-4 w-4" />}
                      onClick={() => {
                        if (!addDraft.color_id) return toast.error("Select a color");
                        if (!addDraft.variant_id) return toast.error("Set variant_id");
                        if (addDraft.selling_price <= 0) return toast.error("Selling price required");
                        createVarMutation.mutate(addDraft);
                      }}
                      disabled={createVarMutation.isPending}
                    >
                      Add Variation
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table className="min-w-[1200px] border-collapse">
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                      {["Color", "Variant", "Buying", "Selling", "Discount", "Stock", "SKU", "Action"].map((h) => (
                        <TableCell key={h} isHeader className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {variations.length ? (
                      variations.map((v) => {
                        const editing = !!varEdit[v.id];
                        const draft = varEdit[v.id];

                        const colorLabel = colorNameById.get(Number(v.color_id)) ?? `#${v.color_id}`;

                        return (
                          <TableRow key={v.id} className="border-b border-gray-100 dark:border-gray-800">
                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Select
                                  key={`edit-color-${v.id}-${draft?.color_id}`}
                                  options={colorOptions}
                                  placeholder="Color"
                                  defaultValue={String(draft?.color_id ?? v.color_id)}
                                  onChange={(val) => patchEditVariation(v.id, { color_id: Number(val) })}
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{colorLabel}</span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                variantOptionsFromAttr.length ? (
                                  <Select
                                    key={`edit-variant-${v.id}-${draft?.variant_id}-${attributeId}`}
                                    options={variantOptionsFromAttr}
                                    placeholder="Variant"
                                    defaultValue={String(draft?.variant_id ?? v.variant_id)}
                                    onChange={(val) => patchEditVariation(v.id, { variant_id: Number(val) })}
                                  />
                                ) : (
                                  <Input
                                    type="number"
                                    value={draft?.variant_id ?? v.variant_id}
                                    onChange={(e) =>
                                      patchEditVariation(v.id, { variant_id: safeNumber(e.target.value, v.variant_id) })
                                    }
                                  />
                                )
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  #{v.variant_id}
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Input
                                  type="number"
                                  value={draft.buying_price}
                                  onChange={(e) =>
                                    patchEditVariation(v.id, { buying_price: safeNumber(e.target.value, draft.buying_price) })
                                  }
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{v.buying_price}</span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Input
                                  type="number"
                                  value={draft.selling_price}
                                  onChange={(e) =>
                                    patchEditVariation(v.id, { selling_price: safeNumber(e.target.value, draft.selling_price) })
                                  }
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{v.selling_price}</span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Input
                                  type="number"
                                  value={draft.discount}
                                  onChange={(e) => patchEditVariation(v.id, { discount: safeNumber(e.target.value, draft.discount) })}
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{v.discount}</span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Input
                                  type="number"
                                  value={draft.stock}
                                  onChange={(e) =>
                                    patchEditVariation(v.id, { stock: Math.max(0, safeNumber(e.target.value, draft.stock)) })
                                  }
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{v.stock}</span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Input value={draft.sku} onChange={(e) => patchEditVariation(v.id, { sku: e.target.value })} />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{v.sku}</span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              <div className="flex items-center justify-end gap-2">
                                {!editing ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-10 w-10"
                                      ariaLabel="Edit variation"
                                      onClick={() => startEditVariation(v)}
                                    >
                                      <Pencil className="h-4 w-4 text-brand-600" />
                                    </Button>

                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-10 w-10 border-error-200 text-error-500 hover:text-error-600 dark:border-error-500/30"
                                      ariaLabel="Delete variation"
                                      onClick={() => {
                                        setVarDeleteId(v.id);
                                        setVarDeleteOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-10 w-10"
                                      ariaLabel="Cancel"
                                      onClick={() => cancelEditVariation(v.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>

                                    <Button
                                      size="icon"
                                      className="h-10 w-10"
                                      ariaLabel="Save"
                                      onClick={() => {
                                        const payload = varEdit[v.id];
                                        if (!payload?.color_id) return toast.error("Color required");
                                        if (!payload?.variant_id) return toast.error("Variant required");
                                        if (payload.selling_price <= 0) return toast.error("Selling price required");
                                        updateVarMutation.mutate({ id: v.id, payload });
                                      }}
                                      disabled={updateVarMutation.isPending}
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                          No variations found for this product.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t border-gray-200 px-5 py-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Tip: If your Attribute API returns numeric variants, the Variant dropdown will show automatically. Otherwise, you can enter variant_id manually.
              </div>
            </div>

            {/* SEO (simple) */}
            <div className="rounded-[6px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">SEO</h3>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title</p>
                  <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Canonical URL</p>
                  <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</p>
                  <textarea
                    className="min-h-[90px] w-full rounded-[6px] border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-800 dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Keywords</p>
                  <Input value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="a,b,c" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">OG Title</p>
                  <Input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Robots</p>
                  <Input value={robots} onChange={(e) => setRobots(e.target.value)} placeholder="index, follow" />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">OG Description</p>
                  <textarea
                    className="min-h-[80px] w-full rounded-[6px] border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-800 dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={ogDescription}
                    onChange={(e) => setOgDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </BaseModal>

      {/* Variation Delete Confirm */}
      <BaseModal
        open={varDeleteOpen}
        onClose={() => {
          if (deleteVarMutation.isPending) return;
          setVarDeleteOpen(false);
          setVarDeleteId(null);
        }}
        title="Delete Variation"
        description="This action cannot be undone."
        widthClassName="w-[520px]"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="h-11"
              onClick={() => {
                if (deleteVarMutation.isPending) return;
                setVarDeleteOpen(false);
                setVarDeleteId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-11 bg-error-600 hover:bg-error-700"
              onClick={() => {
                if (!varDeleteId) return;
                deleteVarMutation.mutate(varDeleteId);
              }}
              disabled={deleteVarMutation.isPending}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this variation?
        </div>
      </BaseModal>
    </>
  );
}
