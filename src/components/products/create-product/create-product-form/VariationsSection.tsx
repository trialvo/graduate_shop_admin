import { AttributeVariant } from "@/api/attributes.api";
import Section from "./Section";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";

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

const SKU_MAX_LENGTH = 21;
const SKU_PRODUCT_LENGTH = 5;
const SKU_COLOR_LENGTH = 5;
const SKU_SIZE_LENGTH = 4;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{children}</p>;
}

function safeNumber(input: string, fallback: number) {
  const n = Number(input);
  return Number.isFinite(n) ? n : fallback;
}

function cleanSkuPart(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]+/g, "");
}

function fixedPart(input: string, length: number) {
  const cleaned = cleanSkuPart(input).slice(0, length);
  return cleaned.padEnd(length, "X");
}

function buildSku({
  productSlug,
  colorName,
  variantName,
  colorId,
  variantId,
}: {
  productSlug: string;
  colorName?: string;
  variantName?: string;
  colorId: number;
  variantId: number;
}) {
  const productPart = fixedPart(productSlug || "PRODUCT", SKU_PRODUCT_LENGTH);
  const colorPart = fixedPart(colorName ?? `C${colorId}`, SKU_COLOR_LENGTH);
  const sizePart = fixedPart(variantName ?? `V${variantId}`, SKU_SIZE_LENGTH);
  const rand = Math.floor(1000 + Math.random() * 9000);
  const sku = `${productPart}-${colorPart}-${sizePart}-${String(rand)}`;
  return sku.slice(0, SKU_MAX_LENGTH);
}

function VariationsSection({
  colors,
  availableVariants,
  productSlug,

  attributeId,
  setAttributeId,
  attributeOptions,

  selectedColorIds,
  setSelectedColorIds,
  selectedColors,
  colorOptions,

  selectedVariantIds,
  toggleVariantId,

  grouped,
  matrix,
  updateRow,
}: {
  colors: any[];
  availableVariants: AttributeVariant[];
  productSlug: string;

  attributeId: number;
  setAttributeId: (n: number) => void;
  attributeOptions: Option[];

  selectedColorIds: number[];
  setSelectedColorIds: React.Dispatch<React.SetStateAction<number[]>>;
  selectedColors: any[];
  colorOptions: Option[];

  selectedVariantIds: number[];
  toggleVariantId: (id: number) => void;

  grouped: Array<{ colorId: number; rows: VariantRow[] }>;
  matrix: VariantRow[];
  updateRow: (key: string, patch: Partial<VariantRow>) => void;
}) {
  return (
    <Section title="Variations" description="Colors dropdown + variants from selected attribute. Generates variations payload.">
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
            <FieldLabel>Attribute *</FieldLabel>
            <Select options={attributeOptions} placeholder="Select attribute" value={String(attributeId)} onChange={(v) => setAttributeId(Number(v))} />
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
                          <div className="flex items-center gap-2">
                            <Input
                              value={r.sku}
                              onChange={(e) =>
                                updateRow(r.key, {
                                  sku: String(e.target.value).slice(0, SKU_MAX_LENGTH),
                                })
                              }
                              wrapperClassName="min-w-[220px]"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateRow(r.key, {
                                  sku: buildSku({
                                    productSlug,
                                    colorName: color?.name,
                                    variantName,
                                    colorId: r.colorId,
                                    variantId: r.variantId,
                                  }),
                                })
                              }
                            >
                              Generate
                            </Button>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <Switch key={`row-${r.key}-${r.active}`} label="" defaultChecked={r.active} onChange={(checked) => updateRow(r.key, { active: checked })} />
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
  );
}

export default VariationsSection;
