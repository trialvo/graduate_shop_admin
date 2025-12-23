import React, { useEffect, useMemo, useState } from "react";
import { X, Search } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import type {
  CouponRow,
  CouponScope,
  CustomerLite,
  DiscountType,
  Option,
  ProductLite,
} from "./types";
import { normalizeCode, safeNumber, todayISO } from "./types";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: CouponRow | null;

  products: ProductLite[];
  customers: CustomerLite[];

  onClose: () => void;
  onSave: (payload: Omit<CouponRow, "id" | "totalUses">) => void;
};

const DISCOUNT_TYPE_OPTIONS: Option[] = [
  { value: "flat", label: "Amount (৳)" },
  { value: "percent", label: "Percent (%)" },
];

const SCOPE_OPTIONS: Option[] = [
  { value: "all", label: "All" },
  { value: "specific", label: "Specific" },
];

function makeRandomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function includesQuery(text: string, q: string): boolean {
  return text.toLowerCase().includes(q.toLowerCase());
}

export default function CouponModal({
  open,
  mode,
  initial,
  products,
  customers,
  onClose,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("flat");
  const [discountValue, setDiscountValue] = useState<number>(0);

  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [limitPerUser, setLimitPerUser] = useState<number>(1);

  const [startDate, setStartDate] = useState<string>(todayISO());
  const [expireDate, setExpireDate] = useState<string>(todayISO());
  const [status, setStatus] = useState<boolean>(true);

  // NEW: scope
  const [productScope, setProductScope] = useState<CouponScope>("all");
  const [productIds, setProductIds] = useState<number[]>([]);
  const [customerScope, setCustomerScope] = useState<CouponScope>("all");
  const [customerIds, setCustomerIds] = useState<number[]>([]);

  // pickers search
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setTitle(initial.title);
      setCode(initial.code);
      setDiscountType(initial.discountType);
      setDiscountValue(initial.discountValue);
      setMinPurchase(initial.minPurchase);
      setMaxDiscount(initial.maxDiscount);
      setLimitPerUser(initial.limitPerUser);
      setStartDate(initial.startDate);
      setExpireDate(initial.expireDate);
      setStatus(initial.status);

      setProductScope(initial.productScope);
      setProductIds(initial.productIds);

      setCustomerScope(initial.customerScope);
      setCustomerIds(initial.customerIds);

      setProductSearch("");
      setCustomerSearch("");
      return;
    }

    // create defaults
    setTitle("");
    setCode(makeRandomCode());
    setDiscountType("flat");
    setDiscountValue(0);
    setMinPurchase(0);
    setMaxDiscount(0);
    setLimitPerUser(1);
    setStartDate(todayISO());
    setExpireDate(todayISO());
    setStatus(true);

    setProductScope("all");
    setProductIds([]);
    setCustomerScope("all");
    setCustomerIds([]);

    setProductSearch("");
    setCustomerSearch("");
  }, [open, mode, initial]);

  // when scope switches to all -> clear selected ids
  useEffect(() => {
    if (productScope === "all") setProductIds([]);
  }, [productScope]);

  useEffect(() => {
    if (customerScope === "all") setCustomerIds([]);
  }, [customerScope]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim();
    if (!q) return products;
    return products.filter(
      (p) => includesQuery(p.name, q) || includesQuery(p.sku, q) || String(p.id).includes(q)
    );
  }, [products, productSearch]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        includesQuery(c.name, q) ||
        includesQuery(c.phone, q) ||
        String(c.id).includes(q)
    );
  }, [customers, customerSearch]);

  const selectedProductCount = productScope === "all" ? products.length : productIds.length;
  const selectedCustomerCount = customerScope === "all" ? customers.length : customerIds.length;

  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (!normalizeCode(code)) return false;
    if (discountValue <= 0) return false;
    if (startDate && expireDate && startDate > expireDate) return false;

    if (productScope === "specific" && productIds.length === 0) return false;
    if (customerScope === "specific" && customerIds.length === 0) return false;

    if (discountType === "percent" && discountValue > 100) return false;
    return true;
  }, [
    title,
    code,
    discountValue,
    startDate,
    expireDate,
    productScope,
    productIds.length,
    customerScope,
    customerIds.length,
    discountType,
  ]);

  const toggleId = (list: number[], id: number): number[] => {
    if (list.includes(id)) return list.filter((x) => x !== id);
    return [...list, id];
  };

  const setAllProducts = () => {
    setProductIds(products.map((p) => p.id));
  };

  const clearProducts = () => setProductIds([]);

  const setAllCustomers = () => {
    setCustomerIds(customers.map((c) => c.id));
  };

  const clearCustomers = () => setCustomerIds([]);

  const submit = () => {
    const payload: Omit<CouponRow, "id" | "totalUses"> = {
      title: title.trim(),
      code: normalizeCode(code),
      discountType,
      discountValue,
      minPurchase,
      maxDiscount: discountType === "percent" ? maxDiscount : 0,
      limitPerUser,
      startDate,
      expireDate,
      status,

      productScope,
      productIds: productScope === "specific" ? productIds : [],
      customerScope,
      customerIds: customerScope === "specific" ? customerIds : [],
    };

    onSave(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close overlay"
      />

      <div className="relative w-[95vw] max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === "create" ? "Add New Coupon" : "Edit Coupon"}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Advanced coupon rules (products + customers scope)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body scroll */}
        <div className="max-h-[800px] overflow-y-auto px-6 py-5">
          {/* Main form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="space-y-2 lg:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title <span className="text-error-500">*</span>
                </p>
                <Input
                  placeholder="New coupon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Code <span className="text-error-500">*</span>
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="CODE"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setCode(makeRandomCode())}
                    className="shrink-0"
                  >
                    Regenerate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount Type
                </p>
                <Select
                  options={DISCOUNT_TYPE_OPTIONS}
                  placeholder="Select type"
                  defaultValue={discountType}
                  onChange={(v) => setDiscountType(v as DiscountType)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Discount <span className="text-error-500">*</span>
                </p>
                <Input
                  type="number"
                  value={String(discountValue)}
                  onChange={(e) => setDiscountValue(safeNumber(e.target.value, 0))}
                  placeholder={discountType === "percent" ? "e.g. 10" : "e.g. 200"}
                />
                {discountType === "percent" && discountValue > 100 ? (
                  <p className="text-xs text-error-500">Percent cannot be more than 100</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Min Purchase (৳)
                </p>
                <Input
                  type="number"
                  value={String(minPurchase)}
                  onChange={(e) => setMinPurchase(safeNumber(e.target.value, 0))}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Discount (৳)
                </p>
                <Input
                  type="number"
                  value={String(maxDiscount)}
                  onChange={(e) => setMaxDiscount(safeNumber(e.target.value, 0))}
                  disabled={discountType !== "percent"}
                />
                {discountType !== "percent" ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Only for percent discount
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Limit per user
                </p>
                <Input
                  type="number"
                  value={String(limitPerUser)}
                  onChange={(e) => setLimitPerUser(safeNumber(e.target.value, 1))}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </p>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expire Date
                </p>
                <Input
                  type="date"
                  value={expireDate}
                  onChange={(e) => setExpireDate(e.target.value)}
                />
                {startDate && expireDate && startDate > expireDate ? (
                  <p className="text-xs text-error-500">Expire date must be after start date</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </p>
                <div className="h-11 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {status ? "Active" : "Inactive"}
                  </p>
                  <Switch label="" defaultChecked={status} onChange={(c) => setStatus(c)} />
                </div>
              </div>
            </div>
          </div>

          {/* Product scope */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Product Scope
                </h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Apply coupon on {productScope === "all" ? "all products" : "specific products"} (
                  selected: <span className="font-semibold">{selectedProductCount}</span>)
                </p>
              </div>

              <div className="w-full md:w-[240px]">
                <Select
                  options={SCOPE_OPTIONS}
                  placeholder="Select scope"
                  defaultValue={productScope}
                  onChange={(v) => setProductScope(v as CouponScope)}
                />
              </div>
            </div>

            {productScope === "specific" ? (
              <div className="mt-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:w-[320px]">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <Input
                      className="pl-9"
                      placeholder="Search product by name / sku..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={setAllProducts}>
                      Select All
                    </Button>
                    <Button variant="outline" onClick={clearProducts}>
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="mt-4 max-h-[240px] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800">
                  {filteredProducts.map((p) => {
                    const checked = productIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex cursor-pointer items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0 dark:border-gray-800"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.sku}</p>
                        </div>

                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setProductIds((prev) => toggleId(prev, p.id))}
                          className="h-4 w-4 accent-[var(--brand-500)]"
                        />
                      </label>
                    );
                  })}

                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No products found.
                    </div>
                  ) : null}
                </div>

                {productIds.length === 0 ? (
                  <p className="mt-2 text-xs text-error-500">Select at least one product.</p>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Customer scope */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Customer Scope
                </h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Apply coupon for {customerScope === "all" ? "all customers" : "specific customers"} (
                  selected: <span className="font-semibold">{selectedCustomerCount}</span>)
                </p>
              </div>

              <div className="w-full md:w-[240px]">
                <Select
                  options={SCOPE_OPTIONS}
                  placeholder="Select scope"
                  defaultValue={customerScope}
                  onChange={(v) => setCustomerScope(v as CouponScope)}
                />
              </div>
            </div>

            {customerScope === "specific" ? (
              <div className="mt-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:w-[320px]">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <Input
                      className="pl-9"
                      placeholder="Search customer by name / phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={setAllCustomers}>
                      Select All
                    </Button>
                    <Button variant="outline" onClick={clearCustomers}>
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="mt-4 max-h-[240px] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800">
                  {filteredCustomers.map((c) => {
                    const checked = customerIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex cursor-pointer items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0 dark:border-gray-800"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{c.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{c.phone}</p>
                        </div>

                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setCustomerIds((prev) => toggleId(prev, c.id))}
                          className="h-4 w-4 accent-[var(--brand-500)]"
                        />
                      </label>
                    );
                  })}

                  {filteredCustomers.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No customers found.
                    </div>
                  ) : null}
                </div>

                {customerIds.length === 0 ? (
                  <p className="mt-2 text-xs text-error-500">Select at least one customer.</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSave}>
            {mode === "create" ? "Create Coupon" : "Update Coupon"}
          </Button>
        </div>
      </div>
    </div>
  );
}
