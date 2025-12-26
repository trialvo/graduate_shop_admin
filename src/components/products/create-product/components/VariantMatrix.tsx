import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

import type { AttributeDefinition, ColorRow, Option, VariantMatrixRow } from "../types";
import { safeNumber } from "../utils";

type Props = {
  colors: ColorRow[];
  attributeDefs: AttributeDefinition[];

  baseBuyPrice: number;
  baseOldPrice: number;
  baseNewPrice: number;

  selectedColorIds: number[];
  onChangeSelectedColorIds: (next: number[]) => void;

  activeAttributeId: number;
  onChangeActiveAttributeId: (next: number) => void;

  selectedValues: string[];
  onChangeSelectedValues: (next: string[]) => void;

  matrix: VariantMatrixRow[];
  onChangeMatrix: (next: VariantMatrixRow[]) => void;
};

function makeKey(colorId: number, value: string): string {
  return `${colorId}__${value}`;
}

function uniqueStrings(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function ensureRows(
  colors: ColorRow[],
  selectedColorIds: number[],
  selectedValues: string[],
  prev: VariantMatrixRow[],
  defaults: { buy: number; old: number; neu: number }
): VariantMatrixRow[] {
  const map = new Map(prev.map((r) => [r.key, r]));

  const next: VariantMatrixRow[] = [];
  for (const colorId of selectedColorIds) {
    for (const v of selectedValues) {
      const key = makeKey(colorId, v);
      const existing = map.get(key);
      next.push(
        existing ?? {
          key,
          colorId,
          value: v,
          buyPrice: defaults.buy,
          oldPrice: defaults.old,
          newPrice: defaults.neu,
          stock: 0,
          available: true,
        }
      );
    }
  }

  // keep stable sort: by color order then value order
  const valueIndex = new Map(selectedValues.map((v, i) => [v, i]));
  const colorIndex = new Map(selectedColorIds.map((id, i) => [id, i]));

  next.sort((a, b) => {
    const ci = (colorIndex.get(a.colorId) ?? 0) - (colorIndex.get(b.colorId) ?? 0);
    if (ci !== 0) return ci;
    return (valueIndex.get(a.value) ?? 0) - (valueIndex.get(b.value) ?? 0);
  });

  return next;
}

export default function VariantMatrix({
  colors,
  attributeDefs,

  baseBuyPrice,
  baseOldPrice,
  baseNewPrice,

  selectedColorIds,
  onChangeSelectedColorIds,

  activeAttributeId,
  onChangeActiveAttributeId,

  selectedValues,
  onChangeSelectedValues,

  matrix,
  onChangeMatrix,
}: Props) {
  const [pendingColorId, setPendingColorId] = useState<string>("");

  const activeAttr = useMemo(
    () => attributeDefs.find((a) => a.id === activeAttributeId) ?? attributeDefs[0],
    [attributeDefs, activeAttributeId]
  );

  // Remaining colors for dropdown (unique enforcement)
  const remainingColors = useMemo(() => {
    return colors.filter((c) => !selectedColorIds.includes(c.id));
  }, [colors, selectedColorIds]);

  const colorOptions: Option[] = useMemo(() => {
    return remainingColors.map((c) => ({ value: String(c.id), label: c.name }));
  }, [remainingColors]);

  const attributeOptions: Option[] = useMemo(() => {
    return attributeDefs.map((a) => ({ value: String(a.id), label: a.name }));
  }, [attributeDefs]);

  const selectedColors = useMemo(() => {
    const byId = new Map(colors.map((c) => [c.id, c]));
    return selectedColorIds.map((id) => byId.get(id)).filter(Boolean) as ColorRow[];
  }, [colors, selectedColorIds]);

  // When attribute changes, clear values + matrix (fresh)
  useEffect(() => {
    if (!activeAttr) return;
    // keep selectedValues that still exist in attr.values (if any)
    const allowed = new Set(activeAttr.values);
    const nextValues = selectedValues.filter((v) => allowed.has(v));
    if (nextValues.length !== selectedValues.length) {
      onChangeSelectedValues(nextValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAttributeId]);

  // Ensure matrix rows exist whenever selections change
  useEffect(() => {
    const next = ensureRows(
      colors,
      selectedColorIds,
      selectedValues,
      matrix,
      { buy: baseBuyPrice, old: baseOldPrice, neu: baseNewPrice }
    );
    // only update if different shape
    const same =
      next.length === matrix.length &&
      next.every((n, i) => matrix[i]?.key === n.key);
    if (!same) onChangeMatrix(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColorIds, selectedValues]);

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

  const toggleValue = (v: string) => {
    const next = selectedValues.includes(v)
      ? selectedValues.filter((x) => x !== v)
      : [...selectedValues, v];
    onChangeSelectedValues(uniqueStrings(next));
  };

  const selectAllValues = () => {
    onChangeSelectedValues(uniqueStrings([...(activeAttr?.values ?? []), ...selectedValues]));
  };

  const clearValues = () => {
    onChangeSelectedValues([]);
  };

  const totalStock = useMemo(() => {
    return matrix.reduce((sum, r) => sum + Math.max(0, r.stock), 0);
  }, [matrix]);

  const updateRow = (key: string, patch: Partial<VariantMatrixRow>) => {
    onChangeMatrix(matrix.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const syncPricesToAll = () => {
    onChangeMatrix(
      matrix.map((r) => ({
        ...r,
        buyPrice: baseBuyPrice,
        oldPrice: baseOldPrice,
        newPrice: baseNewPrice,
      }))
    );
  };

  // Table grouping (rowspan per color)
  const grouped = useMemo(() => {
    const g = new Map<number, VariantMatrixRow[]>();
    for (const r of matrix) {
      const arr = g.get(r.colorId) ?? [];
      arr.push(r);
      g.set(r.colorId, arr);
    }
    // keep color order
    return selectedColorIds
      .map((id) => ({ colorId: id, rows: g.get(id) ?? [] }))
      .filter((x) => x.rows.length > 0);
  }, [matrix, selectedColorIds]);

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Color dropdown incremental */}
        <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Colors (dropdown) <span className="text-error-500">*</span>
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select one color, it will auto add to the table. Then you can select another unique color.
              </p>
            </div>

            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Selected: {selectedColorIds.length}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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

            <Button
              variant="outline"
              onClick={() => setPendingColorId("")}
              disabled={!pendingColorId}
            >
              Reset
            </Button>
          </div>

          {selectedColors.length > 0 ? (
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
                    aria-label="Remove color"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Attribute -> values */}
        <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Attribute (e.g. Size) <span className="text-error-500">*</span>
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select attribute then choose values. Values will apply under each selected color.
              </p>
            </div>

            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Values: {selectedValues.length}
            </span>
          </div>

          <div className="mt-4">
            <Select
              key={`attr-dd-${activeAttributeId}`}
              options={attributeOptions}
              placeholder="Select attribute"
              defaultValue={String(activeAttributeId)}
              onChange={(v) => onChangeActiveAttributeId(Number(v))}
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {activeAttr?.name ?? "Values"}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  onClick={clearValues}
                  disabled={selectedValues.length === 0}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  onClick={selectAllValues}
                  disabled={!activeAttr?.values?.length}
                >
                  Select All
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(activeAttr?.values ?? []).map((v) => {
                const active = selectedValues.includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => toggleValue(v)}
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

              {(activeAttr?.values ?? []).length === 0 ? (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  No values found for this attribute.
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              Variant Price Matrix
            </p>
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Rows: {matrix.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Total stock: <span className="font-semibold">{totalStock}</span>
            </span>
            <Button
              variant="outline"
              onClick={syncPricesToAll}
              disabled={matrix.length === 0}
            >
              Sync base prices
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[1100px] border-collapse">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {["Color", activeAttr?.name ?? "Value", "Purchase Price", "Old Price", "New Price", "Stock", "Availability", "Action"].map(
                  (h) => (
                    <TableCell
                      key={h}
                      isHeader
                      className="px-4 py-4 text-left text-xs font-semibold text-brand-500"
                    >
                      {h}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {grouped.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Select colors and attribute values to generate the matrix.
                  </TableCell>
                </TableRow>
              ) : (
                grouped.map((g) => {
                  const color = colors.find((c) => c.id === g.colorId);
                  return g.rows.map((r, idx) => (
                    <TableRow key={r.key} className="border-b border-gray-100 dark:border-gray-800">
                      {/* Color with rowSpan */}
                      {idx === 0 ? (
                        <TableCell
                          rowSpan={g.rows.length}
                          className="px-4 py-4 align-middle"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-4 w-6 rounded-md border border-gray-200 dark:border-gray-800"
                              style={{ backgroundColor: color?.hex ?? "#111827" }}
                              aria-hidden
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {color?.name ?? "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {g.rows.length} values
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      ) : null}

                      <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {r.value}
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <Input
                          type="number"
                          value={r.buyPrice}
                          onChange={(e) =>
                            updateRow(r.key, { buyPrice: safeNumber(String(e.target.value), r.buyPrice) })
                          }
                        />
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <Input
                          type="number"
                          value={r.oldPrice}
                          onChange={(e) =>
                            updateRow(r.key, { oldPrice: safeNumber(String(e.target.value), r.oldPrice) })
                          }
                        />
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <Input
                          type="number"
                          value={r.newPrice}
                          onChange={(e) =>
                            updateRow(r.key, { newPrice: safeNumber(String(e.target.value), r.newPrice) })
                          }
                        />
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <Input
                          type="number"
                          value={r.stock}
                          onChange={(e) =>
                            updateRow(r.key, { stock: Math.max(0, safeNumber(String(e.target.value), r.stock)) })
                          }
                        />
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <Switch
                          key={`avail-${r.key}-${r.available}`}
                          label=""
                          defaultChecked={r.available}
                          onChange={(checked) => updateRow(r.key, { available: checked })}
                        />
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <button
                          type="button"
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-error-200 bg-white px-3 text-sm font-semibold text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                          onClick={() => updateRow(r.key, { available: false, stock: 0 })}
                          aria-label="Disable row"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Disable
                        </button>
                      </TableCell>
                    </TableRow>
                  ));
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer helper */}
        <div className="border-t border-gray-200 p-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          Note: Color is unique. Attribute values are applied under each selected color (like your screenshot).
        </div>
      </div>
    </div>
  );
}
