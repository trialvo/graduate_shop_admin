"use client";

import React from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  Image as ImageIcon,
  Layers,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Star,
  ToggleLeft,
  Trash2,
  Video,
  X,
  Zap,
} from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import RichTextEditor from "@/components/ui/editor/RichTextEditor";
import ImageMultiUploader, { type UploadedImage } from "@/components/ui/upload/ImageMultiUploader";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { api } from "@/api/client";
import { getProduct, updateProduct } from "@/api/products.api";
import {
  getMainCategories,
  getSubCategories,
  getChildCategories,
} from "@/api/categories.api";
import { getAttributes } from "@/api/attributes.api";
import { getColors } from "@/api/colors.api";
import { getBrands } from "@/api/brands.api";
import BaseModal from "./BaseModal";
import { toPublicUrl } from "@/utils/toPublicUrl";

type Props = {
  open: boolean;
  productId: number | null;
  onClose: () => void;
  onUpdated?: () => void;
};

type Option = { value: string; label: string; status?: boolean };

type ExistingImage = { id: number; path: string };

type VariationColor = {
  id: number;
  name: string;
  hex?: string | null;
  priority?: number;
  status?: boolean;
};

type VariationVariant = {
  id: number;
  name: string;
  priority?: number;
  status?: boolean;
  attribute?: {
    id: number;
    name: string;
    priority?: number;
  };
};

type VariationRow = {
  id: number;
  product_id?: number;
  color_id?: number;
  variant_id?: number;
  color?: VariationColor | null;
  variant?: VariationVariant | null;
  buying_price: number;
  selling_price: number;
  discount: number;
  discount_type?: number | null;
  final_price?: number;
  stock: number;
  sku: string;
  status?: number | boolean;
  in_stock?: boolean;
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
  return v.replace(/\s+/g, " ").trim();
}

function normalizeId(value: number) {
  return Number.isFinite(value) && value > 0 ? value : null;
}

const SKU_MAX_LENGTH = 21;
const SKU_PRODUCT_LENGTH = 5;
const SKU_COLOR_LENGTH = 5;
const SKU_SIZE_LENGTH = 4;

function cleanSkuPart(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]+/g, "");
}

function fixedPart(input: string, length: number) {
  const cleaned = cleanSkuPart(input).slice(0, length);
  return cleaned.padEnd(length, "X");
}

function buildSku({
  productBase,
  colorName,
  variantName,
}: {
  productBase: string;
  colorName: string;
  variantName: string;
}) {
  const productPart = fixedPart(productBase || "PRODUCT", SKU_PRODUCT_LENGTH);
  const colorPart = fixedPart(colorName || "COLOR", SKU_COLOR_LENGTH);
  const sizePart = fixedPart(variantName || "SIZE", SKU_SIZE_LENGTH);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${productPart}-${colorPart}-${sizePart}-${String(rand)}`.slice(
    0,
    SKU_MAX_LENGTH,
  );
}

function readId(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getVariationColorId(v: VariationRow) {
  return readId(v.color_id ?? v.color?.id ?? 0);
}

function getVariationVariantId(v: VariationRow) {
  return readId(v.variant_id ?? v.variant?.id ?? 0);
}

function pickNestedId(payload: any, directKey: string, nestedKey: string) {
  return readId(payload?.[directKey] ?? payload?.[nestedKey]?.id ?? 0);
}

function getApiErrorMessage(err: unknown, fallback: string) {
  const anyErr = err as any;
  const data = anyErr?.response?.data;

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      if (typeof parsed?.error === "string") return parsed.error;
      if (typeof parsed?.message === "string") return parsed.message;
    } catch {
      return data;
    }
  }

  if (typeof data?.error === "string") return data.error;
  if (typeof data?.message === "string") return data.message;
  if (Array.isArray(data?.errors)) {
    return data.errors
      .map((e: any) => (typeof e === "string" ? e : (e?.message ?? e?.error)))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof anyErr?.message === "string") return anyErr.message;

  return fallback;
}

/**
 * Tries to extract "variant options" from attributes response in a safe way.
 * Supports common shapes:
 * - attr.variants: [{id,name}]
 * - attr.values:   [{id,name}] or ["M","L"] (string list)
 */
function buildVariantOptionsForAttribute(
  attributeId: number,
  attributesRaw: any[],
): Option[] {
  const attr = attributesRaw.find(
    (a: any) => Number(a?.id) === Number(attributeId),
  );
  if (!attr) return [];

  const variants = Array.isArray(attr?.variants) ? attr.variants : null;
  if (variants?.length) {
    return variants.map((x: any) => ({
      value: String(x.id),
      label: String(x.name ?? x.title ?? x.value ?? x.id),
    }));
  }

  const values = Array.isArray(attr?.values) ? attr.values : null;
  if (values?.length) {
    if (
      typeof values[0] === "object" &&
      values[0] !== null &&
      "id" in values[0]
    ) {
      return values.map((x: any) => ({
        value: String(x.id),
        label: String(x.name ?? x.title ?? x.value ?? x.id),
      }));
    }
    return [];
  }

  return [];
}

export default function EditProductModal({
  open,
  productId,
  onClose,
  onUpdated,
}: Props) {
  const enabled = open && !!productId;

  // lookups (load all, no params)
  const { data: mainRes, isFetching: mainFetching } = useQuery({
    queryKey: ["mainCategories-all"],
    queryFn: () => getMainCategories(),
    staleTime: 60_000,
  });

  const { data: subRes, isFetching: subFetching } = useQuery({
    queryKey: ["subCategories-all"],
    queryFn: () => getSubCategories(),
    staleTime: 60_000,
  });

  const { data: childRes, isFetching: childFetching } = useQuery({
    queryKey: ["childCategories-all"],
    queryFn: () => getChildCategories(),
    staleTime: 60_000,
  });

  const { data: colorsRes, isFetching: colorsFetching } = useQuery({
    queryKey: ["colors-all"],
    queryFn: () => getColors({} as any),
    staleTime: 60_000,
  });

  const { data: attrsRes, isFetching: attrsFetching } = useQuery({
    queryKey: ["attributes-all"],
    queryFn: () => getAttributes({} as any),
    staleTime: 60_000,
  });

  const { data: brandsRes, isFetching: brandsFetching } = useQuery({
    queryKey: ["brands-all"],
    queryFn: () => getBrands({ limit: 500, offset: 0 }),
    staleTime: 60_000,
  });

  const mains = React.useMemo(() => unwrapList<any>(mainRes), [mainRes]);
  const subs = React.useMemo(() => unwrapList<any>(subRes), [subRes]);
  const childs = React.useMemo(() => unwrapList<any>(childRes), [childRes]);

  const colorsRaw = React.useMemo(
    () => unwrapList<any>(colorsRes),
    [colorsRes],
  );
  const attrsRaw = React.useMemo(() => unwrapList<any>(attrsRes), [attrsRes]);
  const brandsRaw = React.useMemo(
    () => unwrapList<any>(brandsRes),
    [brandsRes],
  );

  const colorNameById = React.useMemo(
    () =>
      new Map(
        colorsRaw.map((c: any) => [
          Number(c.id),
          String(c.name ?? c.title ?? `#${c.id}`),
        ]),
      ),
    [colorsRaw],
  );

  const brandNameById = React.useMemo(
    () =>
      new Map(
        brandsRaw.map((b: any) => [
          Number(b.id),
          String(b.name ?? b.title ?? `#${b.id}`),
        ]),
      ),
    [brandsRaw],
  );

  const colorHexById = React.useMemo(
    () =>
      new Map(colorsRaw.map((c: any) => [Number(c.id), String(c.hex ?? "")])),
    [colorsRaw],
  );

  const getColorLabel = React.useCallback(
    (colorId: number) => colorNameById.get(Number(colorId)) ?? `#${colorId}`,
    [colorNameById],
  );

  const getColorHex = React.useCallback(
    (colorId: number) => colorHexById.get(Number(colorId)) ?? "",
    [colorHexById],
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

  const [brandId, setBrandId] = React.useState<number>(0); // keep for API compatibility
  const [attributeId, setAttributeId] = React.useState<number>(0);

  // ✅ consistent naming: videoUrl
  const [videoUrl, setVideoUrl] = React.useState<string>("");
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

  const [existingImages, setExistingImages] = React.useState<ExistingImage[]>(
    [],
  );
  const [deleteImageIds, setDeleteImageIds] = React.useState<number[]>([]);
  const [newImages, setNewImages] = React.useState<UploadedImage[]>([]);

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
    if (!enabled) return;

    const p = productQuery.data?.product;
    if (!p) return;

    setName(String(p.name ?? ""));
    setSlug(String(p.slug ?? ""));

    setMainCategoryId(pickNestedId(p, "main_category_id", "main_category"));
    setSubCategoryId(pickNestedId(p, "sub_category_id", "sub_category"));
    setChildCategoryId(pickNestedId(p, "child_category_id", "child_category"));

    setBrandId(pickNestedId(p, "brand_id", "brand"));
    setAttributeId(pickNestedId(p, "attribute_id", "attribute"));

    // ✅ initial value fix
    setVideoUrl(String((p as any).video_path ?? ""));
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
    setNewImages([]);

    const vars = Array.isArray((p as any).variations)
      ? ((p as any).variations as VariationRow[])
      : [];
    setVariations(vars);
    setVarEdit({});

    setAddDraft({
      color_id: 0,
      variant_id: 0,
      buying_price: 0,
      selling_price: 0,
      discount: 0,
      stock: 0,
      sku: "",
    });
  }, [enabled, productQuery.data]);

  // newImages is managed by ImageMultiUploader (includes cropper)

  // dropdown options
  const mainOptions: Option[] = React.useMemo(
    () =>
      mains.map((c: any) => ({
        value: String(c.id),
        label: String(c.name),
        status: c.status !== false,
      })),
    [mains],
  );

  const availableSubs = React.useMemo(() => {
    if (!mainCategoryId) return subs;
    return subs.filter(
      (s: any) => Number(s.main_category_id) === Number(mainCategoryId),
    );
  }, [subs, mainCategoryId]);

  const subOptions: Option[] = React.useMemo(
    () =>
      availableSubs.map((c: any) => ({
        value: String(c.id),
        label: String(c.name),
        status: c.status !== false,
      })),
    [availableSubs],
  );

  const availableChild = React.useMemo(() => {
    if (!subCategoryId) return childs;
    return childs.filter(
      (c: any) => Number(c.sub_category_id) === Number(subCategoryId),
    );
  }, [childs, subCategoryId]);

  const childOptions: Option[] = React.useMemo(
    () => [
      { value: "", label: "Select child category (optional)" },
      ...availableChild.map((c: any) => ({
        value: String(c.id),
        label: String(c.name),
        status: c.status !== false,
      })),
    ],
    [availableChild],
  );

  const attributeOptions: Option[] = React.useMemo(() => {
    return attrsRaw.map((a: any) => ({
      value: String(a.id),
      label: String(a.name ?? a.title ?? `#${a.id}`),
    }));
  }, [attrsRaw]);

  const brandOptions: Option[] = React.useMemo(
    () => [
      { value: "", label: "Select brand" },
      ...brandsRaw.map((b: any) => ({
        value: String(b.id),
        label: String(b.name ?? b.title ?? `#${b.id}`),
      })),
    ],
    [brandsRaw],
  );

  const colorOptions: Option[] = React.useMemo(() => {
    return colorsRaw.map((c: any) => ({
      value: String(c.id),
      label: String(c.name ?? c.title ?? `#${c.id}`),
    }));
  }, [colorsRaw]);

  const variantOptionsFromAttr = React.useMemo(() => {
    if (!attributeId) return [];
    return buildVariantOptionsForAttribute(attributeId, attrsRaw);
  }, [attributeId, attrsRaw]);

  const variantLabelById = React.useMemo(() => {
    return new Map(
      variantOptionsFromAttr.map((v) => [Number(v.value), String(v.label)]),
    );
  }, [variantOptionsFromAttr]);

  // keep sub/child valid
  React.useEffect(() => {
    if (!enabled) return;

    if (!availableSubs.length) {
      setSubCategoryId(0);
      return;
    }
    if (
      !availableSubs.some((s: any) => Number(s.id) === Number(subCategoryId))
    ) {
      setSubCategoryId(Number(availableSubs[0].id));
    }
  }, [enabled, availableSubs, subCategoryId]);

  React.useEffect(() => {
    if (!enabled) return;

    if (!availableChild.length) {
      setChildCategoryId(0);
      return;
    }
    // ✅ child category is optional
    // - keep 0 as "not selected"
    // - if an invalid child id exists, reset to 0 (do not auto-pick the first)
    if (!childCategoryId) return;

    if (
      !availableChild.some((c: any) => Number(c.id) === Number(childCategoryId))
    ) {
      setChildCategoryId(0);
    }
  }, [enabled, availableChild, childCategoryId]);

  // ----------------------------
  // Product update mutation
  // ----------------------------
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!productId) throw new Error("Missing product id");

      return updateProduct(productId, {
        product_images: newImages.map((i) => i.file),
        name,
        slug,

        main_category_id: normalizeId(mainCategoryId),
        sub_category_id: normalizeId(subCategoryId),
        child_category_id: normalizeId(childCategoryId),

        brand_id: normalizeId(brandId),
        attribute_id: normalizeId(attributeId),

        // ✅ send as video_path like create
        video_path: videoUrl,
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
    onSuccess: async (res: any) => {
      if (
        res?.error ||
        (Number(res?.flag) >= 400 && Number.isFinite(Number(res?.flag)))
      ) {
        const msg =
          (typeof res?.error === "string" && res.error.trim()) ||
          (typeof res?.message === "string" && res.message.trim()) ||
          "Failed to update product";
        toast.error(msg);
        return;
      }

      toast.success("Product updated");
      onUpdated?.();
      onClose();
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to update product"));
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
      toast.error(getApiErrorMessage(err, "Failed to add variation"));
    },
  });

  const updateVarMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: VariationDraft }) =>
      updateVariation(id, payload),
    onSuccess: async () => {
      toast.success("Variation updated");
      setVarEdit({});
      await productQuery.refetch();
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to update variation"));
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
      toast.error(getApiErrorMessage(err, "Failed to delete variation"));
    },
  });

  // ----------------------------
  // Variation UI helpers
  // ----------------------------
  const startEditVariation = (v: VariationRow) => {
    setVarEdit((p) => ({
      ...p,
      [v.id]: {
        color_id: getVariationColorId(v),
        variant_id: getVariationVariantId(v),
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

  // addNewFiles removed — ImageMultiUploader manages new images with built-in cropper

  const isBusy =
    productQuery.isFetching ||
    updateMutation.isPending ||
    createVarMutation.isPending ||
    updateVarMutation.isPending ||
    deleteVarMutation.isPending;

  const footer = (
    <div className="flex items-center justify-between gap-4">
      <div className="text-xs text-gray-400 dark:text-gray-500">
        {isBusy ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            Processing…
          </span>
        ) : (
          <span>ID: {productId}</span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          className="h-10 px-5"
          onClick={() => {
            if (isBusy) return;
            onClose();
          }}
        >
          Cancel
        </Button>

        <Button
          className="h-10 px-6"
          startIcon={<Save size={15} />}
          onClick={() => updateMutation.mutate()}
          disabled={
            isBusy ||
            !name.trim() ||
            !slug.trim() ||
            !mainCategoryId ||
            !subCategoryId
          }
        >
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );

  // initial loading for lookups + product
  const initialLoading =
    productQuery.isLoading ||
    (!productQuery.data &&
      (mainFetching ||
        subFetching ||
        childFetching ||
        colorsFetching ||
        attrsFetching ||
        brandsFetching));

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
        {initialLoading ? (
          <div className="space-y-3">
            <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
            <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
            <div className="h-12 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
          </div>
        ) : productQuery.isError ? (
          <div className="py-14 text-center text-sm text-error-600">
            Failed to load product.
          </div>
        ) : (
          <div className="space-y-7">
            {/* ─── Basic Info ─── */}
            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Package size={16} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Basic Info</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  ID: {productId}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Name <span className="text-error-500">*</span>
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Slug <span className="text-error-500">*</span>
                  </label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="product-slug" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Category</label>
                  <Select
                    key={`main-${mainCategoryId}`}
                    options={mainOptions}
                    placeholder="Select category"
                    defaultValue={mainCategoryId ? String(mainCategoryId) : ""}
                    onChange={(v) => {
                      setMainCategoryId(Number(v));
                      setSubCategoryId(0);
                      setChildCategoryId(0);
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Sub Category</label>
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Child Category</label>
                  <Select
                    key={`child-${subCategoryId}-${childCategoryId}`}
                    options={childOptions}
                    placeholder="Select child category (optional)"
                    defaultValue={childCategoryId ? String(childCategoryId) : ""}
                    onChange={(v) => setChildCategoryId(v ? Number(v) : 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Brand</label>
                  <Select
                    key={`brand-${brandId}`}
                    options={brandOptions}
                    placeholder="Select brand"
                    defaultValue={brandId ? String(brandId) : ""}
                    onChange={(v) => setBrandId(v ? Number(v) : 0)}
                  />
                </div>
              </div>
            </div>

            {/* ─── Media ─── */}
            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ImageIcon size={16} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Media</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Product images & video</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    {existingImages.length} existing
                  </span>
                  {deleteImageIds.length > 0 && (
                    <span className="rounded-md bg-error-50 px-2 py-0.5 text-[11px] font-semibold text-error-600 dark:bg-error-500/10 dark:text-error-400">
                      {deleteImageIds.length} to delete
                    </span>
                  )}
                  {newImages.length > 0 && (
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      {newImages.length} new
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-5 p-5">
                {/* Video URL */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <Video size={13} /> Video URL
                  </label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/... or direct video link"
                  />
                </div>

                {/* Existing Images */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <ImageIcon size={13} /> Existing Images
                  </label>

                  {existingImages.length ? (
                    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                      {existingImages.map((img) => {
                        const marked = deleteImageIds.includes(img.id);
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => toggleDeleteImage(img.id)}
                            className={cn(
                              "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200",
                              marked
                                ? "border-error-400 ring-2 ring-error-400/20"
                                : "border-gray-200 hover:border-brand-300 hover:shadow-md dark:border-gray-700 dark:hover:border-brand-600",
                            )}
                            title={marked ? "Click to restore" : "Click to mark for deletion"}
                          >
                            <img
                              src={toPublicUrl(img.path)}
                              alt={`img-${img.id}`}
                              className={cn(
                                "h-full w-full object-cover transition-all duration-200",
                                marked ? "scale-95 opacity-30 grayscale" : "group-hover:scale-105",
                              )}
                            />
                            {marked ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-error-500/10">
                                <Trash2 size={18} className="text-error-500" />
                                <span className="text-[10px] font-bold text-error-600">REMOVE</span>
                              </div>
                            ) : (
                              <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                                #{img.id}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">No existing images.</p>
                  )}
                </div>

                {/* New Images (with cropper) */}
                <ImageMultiUploader
                  label="Upload New Images"
                  images={newImages}
                  onChange={setNewImages}
                  max={10}
                  helperText="Each image will be cropped to 1200×1200 before upload."
                />
              </div>
            </div>

            {/* ─── Flags ─── */}
            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ToggleLeft size={16} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Product Flags</h3>
              </div>
              <div className="grid grid-cols-1 gap-px bg-gray-100 dark:bg-gray-800 sm:grid-cols-3">
                {[
                  { label: "Status", desc: "Show in storefront", icon: ToggleLeft, value: status, onChange: setStatus },
                  { label: "Featured", desc: "Highlight as featured", icon: Star, value: featured, onChange: setFeatured },
                  { label: "Best Deal", desc: "Tag as best deal", icon: Zap, value: bestDeal, onChange: setBestDeal },
                ].map((x) => (
                  <div key={x.label} className="flex items-center justify-between gap-3 bg-white px-5 py-4 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <x.icon size={15} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{x.label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{x.desc}</p>
                      </div>
                    </div>
                    <Switch key={`${x.label}-${x.value}`} label="" defaultChecked={x.value} onChange={(checked) => x.onChange(checked)} />
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Descriptions ─── */}
            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Description</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rich text product description</p>
                </div>
              </div>

              <div className="p-5">
                <RichTextEditor
                  label="Long Description"
                  value={longDescription}
                  onChange={setLongDescription}
                  heightClassName="min-h-[260px]"
                />
              </div>
            </div>

            {/* ─── Variations ─── */}
            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 dark:border-gray-800 dark:bg-gray-950/40 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Variations</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Color, variant, prices, stock &amp; SKU</p>
                  </div>
                </div>

                <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-sky-50 px-2.5 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-400">
                  <Layers size={12} /> {variations.length} variation{variations.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="px-5 py-1 w-[50%]">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attribute
                </p>
                <Select
                  key={`attr-${attributeId}`}
                  options={attributeOptions}
                  placeholder="Select attribute"
                  defaultValue={attributeId ? String(attributeId) : ""}
                  onChange={(v) => setAttributeId(Number(v))}
                />
              </div>

              {/* Add row */}
              <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                  <div className="md:col-span-1">
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Color
                    </p>
                    <Select
                      key={`add-color-${addDraft.color_id}`}
                      options={colorOptions}
                      placeholder="Color"
                      defaultValue={
                        addDraft.color_id ? String(addDraft.color_id) : ""
                      }
                      onChange={(v) =>
                        setAddDraft((p) => ({ ...p, color_id: Number(v) }))
                      }
                    />
                  </div>

                  <div className="md:col-span-1">
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Variant
                    </p>

                    {variantOptionsFromAttr.length ? (
                      <Select
                        key={`add-variant-${attributeId}-${addDraft.variant_id}`}
                        options={variantOptionsFromAttr}
                        placeholder="Variant"
                        defaultValue={
                          addDraft.variant_id ? String(addDraft.variant_id) : ""
                        }
                        onChange={(v) =>
                          setAddDraft((p) => ({ ...p, variant_id: Number(v) }))
                        }
                      />
                    ) : (
                      <Input
                        type="number"
                        value={addDraft.variant_id}
                        onChange={(e) =>
                          setAddDraft((p) => ({
                            ...p,
                            variant_id: safeNumber(
                              e.target.value,
                              p.variant_id,
                            ),
                          }))
                        }
                        placeholder="variant_id"
                      />
                    )}
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Buy
                    </p>
                    <Input
                      type="number"
                      value={addDraft.buying_price}
                      onChange={(e) =>
                        setAddDraft((p) => ({
                          ...p,
                          buying_price: safeNumber(
                            e.target.value,
                            p.buying_price,
                          ),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Sell
                    </p>
                    <Input
                      type="number"
                      value={addDraft.selling_price}
                      onChange={(e) =>
                        setAddDraft((p) => ({
                          ...p,
                          selling_price: safeNumber(
                            e.target.value,
                            p.selling_price,
                          ),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Discount
                    </p>
                    <Input
                      type="number"
                      value={addDraft.discount}
                      onChange={(e) =>
                        setAddDraft((p) => ({
                          ...p,
                          discount: safeNumber(e.target.value, p.discount),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Stock
                    </p>
                    <Input
                      type="number"
                      value={addDraft.stock}
                      onChange={(e) =>
                        setAddDraft((p) => ({
                          ...p,
                          stock: Math.max(
                            0,
                            safeNumber(e.target.value, p.stock),
                          ),
                        }))
                      }
                    />
                  </div>

                  <div className="md:col-span-4">
                    <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      SKU
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={addDraft.sku}
                        onChange={(e) =>
                          setAddDraft((p) => ({
                            ...p,
                            sku: String(e.target.value).slice(0, SKU_MAX_LENGTH),
                          }))
                        }
                        wrapperClassName="min-w-[220px]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const productBase =
                            name.trim() ||
                            brandNameById.get(brandId) ||
                            "PRODUCT";
                          const colorName =
                            colorNameById.get(addDraft.color_id) ??
                            `C${addDraft.color_id}`;
                          const variantName =
                            variantLabelById.get(addDraft.variant_id) ??
                            `V${addDraft.variant_id}`;
                          setAddDraft((p) => ({
                            ...p,
                            sku: buildSku({
                              productBase,
                              colorName,
                              variantName,
                            }),
                          }));
                        }}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-end justify-end gap-2 md:col-span-2">
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
                        if (!addDraft.color_id)
                          return toast.error("Select a color");
                        if (!addDraft.variant_id)
                          return toast.error("Set variant_id");
                        if (addDraft.selling_price <= 0)
                          return toast.error("Selling price required");
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
                    <TableRow className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                      {[
                        "Color",
                        "Variant",
                        "Buying",
                        "Selling",
                        "Discount",
                        "Stock",
                        "SKU",
                        "Action",
                      ].map((h) => (
                        <TableCell
                          key={h}
                          isHeader
                          className={[
                            "px-4 py-4 text-left text-xs font-semibold text-brand-500",
                            h === "Action"
                              ? "sticky right-0 z-10 bg-gray-50 dark:bg-gray-950"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
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

                        const colorId = getVariationColorId(v);
                        const variantId = getVariationVariantId(v);
                        const colorLabel =
                          v.color?.name ?? getColorLabel(colorId);
                        const colorHex = v.color?.hex ?? getColorHex(colorId);
                        const variantLabel = v.variant?.name ?? `#${variantId}`;

                        return (
                          <TableRow
                            key={v.id}
                            className="border-b border-gray-100 dark:border-gray-800"
                          >
                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Select
                                  key={`edit-color-${v.id}-${draft?.color_id}`}
                                  options={colorOptions}
                                  placeholder="Color"
                                  defaultValue={String(
                                    draft?.color_id ?? colorId,
                                  )}
                                  onChange={(val) =>
                                    patchEditVariation(v.id, {
                                      color_id: Number(val),
                                    })
                                  }
                                />
                              ) : (
                                <span className="flex items-center gap-2">
                                  <span
                                    className="!w-2 !h-2"
                                    style={{
                                      background: colorHex || "#e5e7eb",
                                    }}
                                  ></span>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {colorLabel}
                                  </span>
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                variantOptionsFromAttr.length ? (
                                  <Select
                                    key={`edit-variant-${v.id}-${draft?.variant_id}-${attributeId}`}
                                    options={variantOptionsFromAttr}
                                    placeholder="Variant"
                                    defaultValue={String(
                                      draft?.variant_id ?? variantId,
                                    )}
                                    onChange={(val) =>
                                      patchEditVariation(v.id, {
                                        variant_id: Number(val),
                                      })
                                    }
                                  />
                                ) : (
                                  <Input
                                    type="number"
                                    value={draft?.variant_id ?? variantId}
                                    onChange={(e) =>
                                      patchEditVariation(v.id, {
                                        variant_id: safeNumber(
                                          e.target.value,
                                          variantId,
                                        ),
                                      })
                                    }
                                  />
                                )
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {variantLabel}
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Input
                                  type="number"
                                  value={draft.buying_price}
                                  onChange={(e) =>
                                    patchEditVariation(v.id, {
                                      buying_price: safeNumber(
                                        e.target.value,
                                        draft.buying_price,
                                      ),
                                    })
                                  }
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {v.buying_price}
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Input
                                  type="number"
                                  value={draft.selling_price}
                                  onChange={(e) =>
                                    patchEditVariation(v.id, {
                                      selling_price: safeNumber(
                                        e.target.value,
                                        draft.selling_price,
                                      ),
                                    })
                                  }
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {v.selling_price}
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Input
                                  type="number"
                                  value={draft.discount}
                                  onChange={(e) =>
                                    patchEditVariation(v.id, {
                                      discount: safeNumber(
                                        e.target.value,
                                        draft.discount,
                                      ),
                                    })
                                  }
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {v.discount}
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <Input
                                  type="number"
                                  value={draft.stock}
                                  onChange={(e) =>
                                    patchEditVariation(v.id, {
                                      stock: Math.max(
                                        0,
                                        safeNumber(e.target.value, draft.stock),
                                      ),
                                    })
                                  }
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {v.stock}
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4">
                              {editing ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={draft.sku}
                                    onChange={(e) =>
                                      patchEditVariation(v.id, {
                                        sku: String(e.target.value).slice(
                                          0,
                                          SKU_MAX_LENGTH,
                                        ),
                                      })
                                    }
                                    wrapperClassName="min-w-[220px]"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const productBase =
                                        name.trim() ||
                                        brandNameById.get(brandId) ||
                                        "PRODUCT";
                                      const draftColorId =
                                        draft?.color_id ?? colorId;
                                      const draftVariantId =
                                        draft?.variant_id ?? variantId;
                                      const colorName =
                                        colorNameById.get(draftColorId) ??
                                        `C${draftColorId}`;
                                      const variantName =
                                        variantLabelById.get(draftVariantId) ??
                                        variantLabel;
                                      patchEditVariation(v.id, {
                                        sku: buildSku({
                                          productBase,
                                          colorName,
                                          variantName,
                                        }),
                                      });
                                    }}
                                  >
                                    Generate
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {v.sku}
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="px-4 py-4 sticky right-0 z-10 bg-white dark:bg-gray-900">
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
                                        if (!payload?.color_id)
                                          return toast.error("Color required");
                                        if (!payload?.variant_id)
                                          return toast.error(
                                            "Variant required",
                                          );
                                        if (payload.selling_price <= 0)
                                          return toast.error(
                                            "Selling price required",
                                          );
                                        updateVarMutation.mutate({
                                          id: v.id,
                                          payload,
                                        });
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
                        <TableCell
                          colSpan={8}
                          className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          No variations found for this product.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t border-gray-200 px-5 py-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                Tip: If your Attribute API returns numeric variants, the Variant
                dropdown will show automatically. Otherwise, you can enter
                variant_id manually.
              </div>
            </div>

            {/* ─── SEO ─── */}
            <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5 dark:border-gray-800 dark:bg-gray-950/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Globe size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">SEO Settings</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Meta tags, OG and robots</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Meta Title</label>
                  <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Canonical URL</label>
                  <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} />
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Meta Description</label>
                  <textarea
                    className="min-h-[80px] w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-800 dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Meta Keywords</label>
                  <Input value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">OG Title</label>
                  <Input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Robots</label>
                  <Input value={robots} onChange={(e) => setRobots(e.target.value)} placeholder="index, follow" />
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">OG Description</label>
                  <textarea
                    className="min-h-[70px] w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-800 dark:text-white dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
              className="h-10"
              onClick={() => {
                if (deleteVarMutation.isPending) return;
                setVarDeleteOpen(false);
                setVarDeleteId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-10 bg-error-600 hover:bg-error-700"
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
