// src/components/products/product-create/components/VariantMatrix.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { Option, VariantMatrixRow } from "../types";
import { genSkuFromParts, makeKey, safeNumber } from "../utils";

type ColorRow = { id: number; name: string; hex: string };
type VariantRow = { id: number; name: string; attribute_id: number };

type Props = {
  colors: ColorRow[];
  variants: VariantRow[]; // fetched from /api/v1/variants
  activeAttributeId: number;

  selectedColorIds: number[];
  onChangeSelectedColorIds: (next: number[]) => void;

  selectedVariantIds: number[];
  onChangeSelectedVariantIds: (next: number[]) => void;

  matrix: VariantMatrixRow[];
  onChangeMatrix: (next: VariantMatrixRow[]) => void;

  baseBuyingPrice: number;
  baseSellingPrice: number;
  baseDiscount: number;

  brandNameForSku?: string;
  productSlugForSku?: string;
};

function uniqueNumbers(arr: number[]) {
  return Array.from(new Set(arr));
}

function ensureRows(
  selectedColorIds: number[],
  selectedVariantIds: number[],
  prev: VariantMatrixRow[],
  defaults: { buying: number; selling: number; discount: number },
  skuParts: string[],
) {
  const map = new Map(prev.map((r) => [r.key, r]));
  const next: VariantMatrixRow[] = [];

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
          sku: genSkuFromParts([...skuParts, `C${colorId}`, `V${variantId}`]),
          active: true,
        },
      );
    }
  }
  return next;
}

export default function VariantMatrix({
  colors,
  variants,
  activeAttributeId,

  selectedColorIds,
  onChangeSelectedColorIds,

  selectedVariantIds,
  onChangeSelectedVariantIds,

  matrix,
  onChangeMatrix,

  baseBuyingPrice,
  baseSellingPrice,
  baseDiscount,

  brandNameForSku,
  productSlugForSku,
}: Props) {
  const [pendingColorId, setPendingColorId] = useState<string>("");

  const variantsForAttr = useMemo(
    () => variants.filter((v) => v.attribute_id === activeAttributeId),
    [variants, activeAttributeId],
  );

  const remainingColors = useMemo(
    () => colors.filter((c) => !selectedColorIds.includes(c.id)),
    [colors, selectedColorIds],
  );

  const colorOptions: Option[] = useMemo(
    () => remainingColors.map((c) => ({ value: String(c.id), label: c.name })),
    [remainingColors],
  );

  const selectedColors = useMemo(() => {
    const byId = new Map(colors.map((c) => [c.id, c]));
    return selectedColorIds.map((id) => byId.get(id)).filter(Boolean) as ColorRow[];
  }, [colors, selectedColorIds]);

  const selectedVariants = useMemo(() => {
    const byId = new Map(variantsForAttr.map((v) => [v.id, v]));
    return selectedVariantIds.map((id) => byId.get(id)).filter(Boolean) as VariantRow[];
  }, [variantsForAttr, selectedVariantIds]);

  // When attribute changes -> clear variant selection + matrix
  useEffect(() => {
    onChangeSelectedVariantIds([]);
    onChangeMatrix([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAttributeId]);

  // Ensure matrix rows exist
  useEffect(() => {
    const skuParts = [brandNameForSku ?? "BRAND", productSlugForSku ?? "PRODUCT"].filter(Boolean);
    const next = ensureRows(
      selectedColorIds,
      selectedVariantIds,
      matrix,
      { buying: baseBuyingPrice, selling: baseSellingPrice, discount: baseDiscount },
      skuParts,
    );

    const same =
      next.length === matrix.length && next.every((n, i) => matrix[i]?.key === n.key);

    if (!same) onChangeMatrix(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColorIds, selectedVariantIds]);

  const addColor = (idStr: string) => {
    const id = Number(idStr);
    if (!Number.isFinite(id)) return;
    if (selectedColorIds.includes(id)) return;
    onChangeSelectedColorIds([...selectedColorIds, id]);
    setPendingColorId("");
  };

  const removeColor = (colorId: number) => {
    onChangeSelectedColorIds(selectedColorIds.filter((x) => x !== colorId));
  };

  const toggleVariant = (variantId: number) => {
    const next = selectedVariantIds.includes(variantId)
      ? selectedVariantIds.filter((x) => x !== variantId)
      : [...selectedVariantIds, variantId];
    onChangeSelectedVariantIds(uniqueNumbers(next));
  };

  const updateRow = (key: string, patch: Partial<VariantMatrixRow>) => {
    onChangeMatrix(matrix.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const grouped = useMemo(() => {
    const g = new Map<number, VariantMatrixRow[]>();
    for (const r of matrix) {
      const arr = g.get(r.colorId) ?? [];
      arr.push(r);
      g.set(r.colorId, arr);
    }
    return selectedColorIds
      .map((id) => ({ colorId: id, rows: g.get(id) ?? [] }))
      .filter((x) => x.rows.length > 0);
  }, [matrix, selectedColorIds]);

  return (
    <div className="space-y-6">
      {/* Top selectors */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Color */}
        <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Colors <span className="text-error-500">*</span>
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select a color (unique). It will appear in the matrix.
              </p>
            </div>
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {selectedColorIds.length}
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            <div className="flex-1">
              <Select
                key={`color-dd-${selectedColorIds.join("-")}`}
                options={colorOptions}
                placeholder={colorOptions.length ? "Select color" : "No more colors"}
                defaultValue={pendingColorId}
                onChange={(v) => {
                  setPendingColorId(v);
                  addColor(v);
                }}
              />
            </div>
            <Button variant="outline" onClick={() => setPendingColorId("")} disabled={!pendingColorId}>
              Reset
            </Button>
          </div>

          {selectedColors.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedColors.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-2 rounded-[4px] border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                >
                  <span
                    className="h-3 w-5 rounded-md border border-gray-200 dark:border-gray-800"
                    style={{ backgroundColor: c.hex }}
                    aria-hidden
                  />
                  {c.name}
                  <button
                    type="button"
                    className="text-error-500 hover:text-error-600"
                    onClick={() => removeColor(c.id)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Variants */}
        <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Attribute Variants <span className="text-error-500">*</span>
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Choose variants (IDs). These will be used as `variant_id` in API.
              </p>
            </div>
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {selectedVariantIds.length}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {variantsForAttr.map((v) => {
              const active = selectedVariantIds.includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleVariant(v.id)}
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

            {!variantsForAttr.length ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                No variants found for this attribute.
              </span>
            ) : null}
          </div>

          {selectedVariants.length ? (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Selected: {selectedVariants.map((v) => v.name).join(", ")}
            </p>
          ) : null}
        </div>
      </div>

      {/* Matrix table */}
      <div className="rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-gray-900 dark:text-white">Variations</p>
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {matrix.length}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            API payload uses: color_id + variant_id + prices + stock + sku
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[1200px] border-collapse">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {["Color", "Variant", "Buying", "Selling", "Discount", "Stock", "SKU", "Active", "Action"].map((h) => (
                  <TableCell key={h} isHeader className="px-4 py-4 text-left text-xs font-semibold text-brand-500">
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {!grouped.length ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Select colors and variants to generate variations.
                  </TableCell>
                </TableRow>
              ) : (
                grouped.flatMap((g) => {
                  const color = colors.find((c) => c.id === g.colorId);
                  return g.rows.map((r, idx) => {
                    const variantName = variantsForAttr.find((v) => v.id === r.variantId)?.name ?? `#${r.variantId}`;
                    return (
                      <TableRow key={r.key} className="border-b border-gray-100 dark:border-gray-800">
                        {idx === 0 ? (
                          <TableCell rowSpan={g.rows.length} className="px-4 py-4 align-middle">
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
                          </TableCell>
                        ) : null}

                        <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {variantName}
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <Input
                            type="number"
                            value={r.buyingPrice}
                            onChange={(e) => updateRow(r.key, { buyingPrice: safeNumber(String(e.target.value), r.buyingPrice) })}
                          />
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <Input
                            type="number"
                            value={r.sellingPrice}
                            onChange={(e) => updateRow(r.key, { sellingPrice: safeNumber(String(e.target.value), r.sellingPrice) })}
                          />
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <Input
                            type="number"
                            value={r.discount}
                            onChange={(e) => updateRow(r.key, { discount: safeNumber(String(e.target.value), r.discount) })}
                          />
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <Input
                            type="number"
                            value={r.stock}
                            onChange={(e) => updateRow(r.key, { stock: Math.max(0, safeNumber(String(e.target.value), r.stock)) })}
                          />
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <Input
                            value={r.sku}
                            onChange={(e) => updateRow(r.key, { sku: String(e.target.value) })}
                          />
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <Switch
                            key={`active-${r.key}-${r.active}`}
                            label=""
                            defaultChecked={r.active}
                            onChange={(checked) => updateRow(r.key, { active: checked })}
                          />
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-error-200 bg-white px-3 text-sm font-semibold text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                            onClick={() => updateRow(r.key, { active: false, stock: 0 })}
                          >
                            <Trash2 size={16} className="mr-2" />
                            Disable
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
