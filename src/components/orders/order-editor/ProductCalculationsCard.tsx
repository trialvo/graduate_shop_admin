import type React from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";

import type { OrderProductLine } from "./types";

interface ProductCalculationsCardProps {
  products: OrderProductLine[];
  onChangeLine: (id: string, patch: Partial<OrderProductLine>) => void;
  onDeleteLine: (id: string) => void;
  onAddLine: () => void;

  deliveryCharge: number;
  specialDiscount: number;
  advancePayment: number;
  onChangeTotals: (patch: {
    deliveryCharge?: number;
    specialDiscount?: number;
    advancePayment?: number;
  }) => void;

  totals: {
    itemCount: number;
    subTotal: number;
    taxTotal: number;
    grandTotal: number;
    payable: number;
  };

  onSubmit: () => void;
}

const formatBDT = (value: number): string => {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const ProductCalculationsCard: React.FC<ProductCalculationsCardProps> = ({
  products,
  onChangeLine,
  onDeleteLine,
  onAddLine,
  deliveryCharge,
  specialDiscount,
  advancePayment,
  onChangeTotals,
  totals,
  onSubmit,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.5)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            Line Items
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Products & pricing
          </div>
        </div>

        <Button onClick={onAddLine} size="sm" variant="outline">
          Add product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-gray-800">
        <table className="min-w-[980px] w-full border-separate border-spacing-0">
          <thead className="bg-slate-50/80 dark:bg-gray-900/60">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3">SN</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Color</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Unit price</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Tax</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Delete</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p, idx) => {
              const lineBaseTotal =
                Math.max(0, p.unitPrice - p.discount) * p.quantity;
              const lineTax = (lineBaseTotal * p.taxPercent) / 100;
              const lineTotal = lineBaseTotal + lineTax;

              return (
                <tr
                  key={p.id}
                  className="border-t border-slate-200/80 text-sm hover:bg-slate-50/70 dark:border-gray-800 dark:hover:bg-gray-900/40"
                >
                  <td className="px-4 py-4 align-top text-gray-500 dark:text-gray-400">
                    {String(idx + 1).padStart(2, "0")}
                  </td>

                  <td className="px-4 py-4 align-top">{p.id}</td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-gray-800 dark:bg-gray-800">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-[220px]">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          SKU: {p.sku}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="w-[120px]">
                      <Select
                        options={[
                          { value: "Red", label: "Red" },
                          { value: "Silver", label: "Silver" },
                          { value: "Black", label: "Black" },
                          { value: "White", label: "White" },
                        ]}
                        defaultValue={p.color}
                        onChange={(v) => onChangeLine(p.id, { color: v })}
                        className="bg-white/90 dark:bg-gray-900/70"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="w-[92px]">
                      <Select
                        options={[
                          { value: "S", label: "S" },
                          { value: "M", label: "M" },
                          { value: "L", label: "L" },
                          { value: "XL", label: "XL" },
                          { value: "36", label: "36" },
                          { value: "37", label: "37" },
                          { value: "38", label: "38" },
                        ]}
                        defaultValue={p.size}
                        onChange={(v) => onChangeLine(p.id, { size: v })}
                        className="bg-white/90 dark:bg-gray-900/70"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="w-[110px]">
                      <Input
                        type="number"
                        value={p.discount}
                        onChange={(e) =>
                          onChangeLine(p.id, {
                            discount: Number(e.target.value),
                          })
                        }
                        className="bg-white/90 dark:bg-gray-900/70"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="min-w-[120px] font-semibold text-gray-900 dark:text-white">
                      {formatBDT(p.unitPrice)} BDT
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="w-[90px]">
                      <Input
                        type="number"
                        value={p.quantity}
                        onChange={(e) =>
                          onChangeLine(p.id, {
                            quantity: Math.max(1, Number(e.target.value)),
                          })
                        }
                        className="bg-white/90 dark:bg-gray-900/70"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="min-w-[90px] text-gray-900 dark:text-white">
                      {p.taxPercent.toFixed(2)}%
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top text-right">
                    <div className="min-w-[120px] font-extrabold text-gray-900 dark:text-white">
                      {formatBDT(lineTotal)} BDT
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteLine(p.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-[11px] font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                      aria-label="Delete line item"
                      title="Delete"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="font-semibold text-gray-900 dark:text-white">
              Product Total:
            </div>
            <div className="font-extrabold text-gray-900 dark:text-white">
              {formatBDT(totals.subTotal + totals.taxTotal)} BDT
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="font-semibold text-gray-900 dark:text-white">
              Delivery Charge:
            </div>
            <div className="flex items-center gap-3">
              <div className="w-[120px]">
                <Input
                  type="number"
                  value={deliveryCharge}
                  onChange={(e) =>
                    onChangeTotals({ deliveryCharge: Number(e.target.value) })
                  }
                  className="bg-white/90 dark:bg-gray-900/70"
                />
              </div>
              <div className="min-w-[80px] text-right font-extrabold text-gray-900 dark:text-white">
                {formatBDT(deliveryCharge)} BDT
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="font-semibold text-gray-900 dark:text-white">
              Special Discount:
            </div>
            <div className="flex items-center gap-3">
              <div className="w-[120px]">
                <Input
                  type="number"
                  value={specialDiscount}
                  onChange={(e) =>
                    onChangeTotals({ specialDiscount: Number(e.target.value) })
                  }
                  className="bg-white/90 dark:bg-gray-900/70"
                />
              </div>
              <div className="min-w-[80px] text-right font-extrabold text-gray-900 dark:text-white">
                {formatBDT(specialDiscount)} BDT
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="font-semibold text-gray-900 dark:text-white">
              Advance Payment:
            </div>
            <div className="flex items-center gap-3">
              <div className="w-[120px]">
                <Input
                  type="number"
                  value={advancePayment}
                  onChange={(e) =>
                    onChangeTotals({ advancePayment: Number(e.target.value) })
                  }
                  className="bg-white/90 dark:bg-gray-900/70"
                />
              </div>
              <div className="min-w-[80px] text-right font-extrabold text-gray-900 dark:text-white">
                {formatBDT(advancePayment)} BDT
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-500 dark:text-gray-400">Items</div>
            <div className="text-right font-semibold text-gray-900 dark:text-white">
              {totals.itemCount}
            </div>

            <div className="text-gray-500 dark:text-gray-400">Sub Total</div>
            <div className="text-right font-semibold text-gray-900 dark:text-white">
              {formatBDT(totals.subTotal)} BDT
            </div>

            <div className="text-gray-500 dark:text-gray-400">Tax</div>
            <div className="text-right font-semibold text-gray-900 dark:text-white">
              {formatBDT(totals.taxTotal)} BDT
            </div>

            <div className="text-gray-500 dark:text-gray-400">Grand Total</div>
            <div className="text-right font-extrabold text-gray-900 dark:text-white">
              {formatBDT(totals.grandTotal)} BDT
            </div>

            <div className="text-gray-500 dark:text-gray-400">
              Payable (After discount & advance)
            </div>
            <div className="text-right text-lg font-extrabold text-brand-600 dark:text-brand-400">
              {formatBDT(totals.payable)} BDT
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={onSubmit} size="md" variant="primary">
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCalculationsCard;
