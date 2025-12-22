import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import { CATEGORIES, CUSTOMERS, PRODUCTS } from "./mockData";
import type {
  CouponRow,
  CouponTarget,
  CouponType,
  DiscountType,
} from "./types";
import { safeNumber } from "./types";
import Modal from "@/components/ui/modal/Modal";

type Option = { value: string; label: string };

const TYPE_OPTIONS: Option[] = [
  { value: "GENERAL", label: "General" },
  { value: "CUSTOMER", label: "Customer Wise" },
  { value: "FREE_DELIVERY", label: "Free Delivery" },
  { value: "CATEGORY", label: "Category Wise" },
  { value: "PRODUCT", label: "Product Wise" },
];

const DISCOUNT_OPTIONS: Option[] = [
  { value: "AMOUNT", label: "Amount" },
  { value: "PERCENT", label: "Percent" },
  { value: "FREE_DELIVERY", label: "Free Delivery" },
];

function todayYmd(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function randomCode(len = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i += 1)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function nowText(): string {
  const d = new Date();
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CouponModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  readOnly = false,
}: {
  open: boolean;
  mode: "create" | "edit" | "view";
  initial?: CouponRow | null;
  onClose: () => void;
  onSubmit: (payload: CouponRow) => void;
  readOnly?: boolean;
}) {
  const [activeLang, setActiveLang] = useState<"default" | "en" | "ar">(
    "default"
  );

  const [titleDefault, setTitleDefault] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");

  const [type, setType] = useState<CouponType>("GENERAL");
  const [codeMode, setCodeMode] = useState<"auto" | "manual">("auto");
  const [code, setCode] = useState("");

  const [discountType, setDiscountType] = useState<DiscountType>("AMOUNT");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [minPurchase, setMinPurchase] = useState<number>(0);

  const [usageLimitTotal, setUsageLimitTotal] = useState<number>(0);
  const [usageLimitPerUser, setUsageLimitPerUser] = useState<number>(0);

  const [startDate, setStartDate] = useState<string>(todayYmd());
  const [expireDate, setExpireDate] = useState<string>(todayYmd());

  const [status, setStatus] = useState(true);
  const [stackable, setStackable] = useState(false);
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [newCustomerOnly, setNewCustomerOnly] = useState(false);

  // Targets
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const isView = mode === "view" || readOnly;

  useEffect(() => {
    if (!open) return;

    if (!initial) {
      setActiveLang("default");
      setTitleDefault("");
      setTitleEn("");
      setTitleAr("");

      setType("GENERAL");
      setCodeMode("auto");
      setCode(randomCode(8));

      setDiscountType("AMOUNT");
      setDiscountValue(0);
      setMaxDiscount(0);
      setMinPurchase(0);

      setUsageLimitTotal(0);
      setUsageLimitPerUser(0);

      const t = todayYmd();
      setStartDate(t);
      setExpireDate(t);

      setStatus(true);
      setStackable(false);
      setFirstOrderOnly(false);
      setNewCustomerOnly(false);

      setCustomerSearch("");
      setSelectedCustomers([]);
      setCategorySearch("");
      setSelectedCategories([]);
      setProductSearch("");
      setSelectedProducts([]);

      return;
    }

    setActiveLang("default");
    setTitleDefault(initial.titles.default);
    setTitleEn(initial.titles.en);
    setTitleAr(initial.titles.ar);

    setType(initial.type);
    setCodeMode("manual");
    setCode(initial.code);

    setDiscountType(initial.discountType);
    setDiscountValue(initial.discountValue);
    setMaxDiscount(initial.maxDiscount);
    setMinPurchase(initial.minPurchase);

    setUsageLimitTotal(initial.usageLimitTotal);
    setUsageLimitPerUser(initial.usageLimitPerUser);

    setStartDate(initial.startDate);
    setExpireDate(initial.expireDate);

    setStatus(initial.status);
    setStackable(initial.stackable);
    setFirstOrderOnly(initial.firstOrderOnly);
    setNewCustomerOnly(initial.newCustomerOnly);

    setCustomerSearch("");
    setCategorySearch("");
    setProductSearch("");

    if (initial.target.kind === "CUSTOMERS")
      setSelectedCustomers(initial.target.customerIds);
    else setSelectedCustomers([]);

    if (initial.target.kind === "CATEGORIES")
      setSelectedCategories(initial.target.categoryIds);
    else setSelectedCategories([]);

    if (initial.target.kind === "PRODUCTS")
      setSelectedProducts(initial.target.productIds);
    else setSelectedProducts([]);
  }, [open, initial]);

  useEffect(() => {
    if (type === "FREE_DELIVERY") {
      setDiscountType("FREE_DELIVERY");
      setDiscountValue(0);
      setMaxDiscount(0);
    } else if (discountType === "FREE_DELIVERY") {
      setDiscountType("AMOUNT");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const target: CouponTarget = useMemo(() => {
    if (type === "CUSTOMER")
      return { kind: "CUSTOMERS", customerIds: selectedCustomers };
    if (type === "CATEGORY")
      return { kind: "CATEGORIES", categoryIds: selectedCategories };
    if (type === "PRODUCT")
      return { kind: "PRODUCTS", productIds: selectedProducts };
    return { kind: "ALL" };
  }, [type, selectedCustomers, selectedCategories, selectedProducts]);

  const errors = useMemo(() => {
    const t = titleDefault.trim();
    const c = code.trim();

    const dateOk = startDate && expireDate ? startDate <= expireDate : true;

    let targetOk = true;
    if (type === "CUSTOMER") targetOk = selectedCustomers.length > 0;
    if (type === "CATEGORY") targetOk = selectedCategories.length > 0;
    if (type === "PRODUCT") targetOk = selectedProducts.length > 0;

    let discOk = true;
    if (discountType === "AMOUNT") discOk = discountValue > 0;
    if (discountType === "PERCENT")
      discOk = discountValue > 0 && discountValue <= 100;

    return {
      title: !t ? "Title (Default) is required." : "",
      code: !c ? "Code is required." : "",
      date: !dateOk ? "Expire date must be after start date." : "",
      target: !targetOk ? "Please select at least one target item." : "",
      discount: !discOk
        ? discountType === "PERCENT"
          ? "Percent must be 1-100."
          : "Discount must be greater than 0."
        : "",
    };
  }, [
    titleDefault,
    code,
    startDate,
    expireDate,
    type,
    selectedCustomers.length,
    selectedCategories.length,
    selectedProducts.length,
    discountType,
    discountValue,
  ]);

  const canSubmit = useMemo(() => {
    if (isView) return false;
    return (
      !errors.title &&
      !errors.code &&
      !errors.date &&
      !errors.target &&
      !errors.discount
    );
  }, [errors, isView]);

  const submit = () => {
    if (!canSubmit) return;

    const payload: CouponRow = {
      id: initial?.id ?? Date.now(),
      titles: {
        default: titleDefault.trim(),
        en: titleEn.trim(),
        ar: titleAr.trim(),
      },
      code: code.trim().toUpperCase(),
      type,
      target,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      usageLimitTotal,
      usageLimitPerUser,
      totalUses: initial?.totalUses ?? 0,
      startDate,
      expireDate,
      stackable,
      firstOrderOnly,
      newCustomerOnly,
      status,
      createdAt: initial?.createdAt ?? nowText(),
      updatedAt: nowText(),
    };

    onSubmit(payload);
    onClose();
  };

  const titleText =
    mode === "create"
      ? "Add New Coupon"
      : mode === "view"
      ? "Coupon Details"
      : "Edit Coupon";

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return CUSTOMERS;
    return CUSTOMERS.filter(
      (x) =>
        x.name.toLowerCase().includes(q) || x.phone.toLowerCase().includes(q)
    );
  }, [customerSearch]);

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter((x) => x.name.toLowerCase().includes(q));
  }, [categorySearch]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter(
      (x) => x.name.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q)
    );
  }, [productSearch]);

  const langTabs: { key: "default" | "en" | "ar"; label: string }[] = [
    { key: "default", label: "Default" },
    { key: "en", label: "English(EN)" },
    { key: "ar", label: "Arabic (AR)" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={titleText}
      description="Create advanced coupons with targeting, limits and rules."
      size="xl"
      footer={
        mode === "view" ? (
          <Button onClick={onClose}>Close</Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canSubmit}>
              {mode === "create" ? "Submit" : "Update"}
            </Button>
          </>
        )
      }
    >
      <div className="max-h-[500px] overflow-y-auto pr-2">
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </p>

            <>
              <Input
                value={titleDefault}
                onChange={(e) => setTitleDefault(String(e.target.value))}
                placeholder="New coupon"
                disabled={isView}
              />
              {errors.title ? (
                <p className="text-xs text-error-500">{errors.title}</p>
              ) : null}
            </>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Coupon Type
              </p>
              <Select
                options={TYPE_OPTIONS}
                placeholder="Select coupon type"
                defaultValue={type}
                onChange={(v) => setType(v as CouponType)}
                disabled={isView}
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Code <span className="text-error-500">*</span>
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    className={[
                      "px-4 py-2 text-sm font-semibold",
                      codeMode === "auto"
                        ? "bg-brand-500 text-white"
                        : "bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-200",
                    ].join(" ")}
                    onClick={() => {
                      if (isView) return;
                      setCodeMode("auto");
                      setCode(randomCode(8));
                    }}
                    disabled={isView}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    className={[
                      "px-4 py-2 text-sm font-semibold",
                      codeMode === "manual"
                        ? "bg-brand-500 text-white"
                        : "bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-200",
                    ].join(" ")}
                    onClick={() => {
                      if (isView) return;
                      setCodeMode("manual");
                    }}
                    disabled={isView}
                  >
                    Manual
                  </button>
                </div>

                <div className="flex-1">
                  <Input
                    value={code}
                    onChange={(e) => setCode(String(e.target.value))}
                    placeholder="ABC123"
                    disabled={isView || codeMode === "auto"}
                  />
                  {errors.code ? (
                    <p className="text-xs text-error-500">{errors.code}</p>
                  ) : null}
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    if (isView) return;
                    setCodeMode("auto");
                    setCode(randomCode(8));
                  }}
                  disabled={isView}
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </p>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(String(e.target.value))}
                disabled={isView}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Expire Date
              </p>
              <Input
                type="date"
                value={expireDate}
                onChange={(e) => setExpireDate(String(e.target.value))}
                disabled={isView}
              />
              {errors.date ? (
                <p className="text-xs text-error-500">{errors.date}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Discount Type
              </p>
              <Select
                options={DISCOUNT_OPTIONS}
                placeholder="Select discount type"
                defaultValue={discountType}
                onChange={(v) => setDiscountType(v as DiscountType)}
                disabled={isView || type === "FREE_DELIVERY"}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Discount{" "}
                {discountType === "PERCENT"
                  ? "(%)"
                  : discountType === "AMOUNT"
                  ? "(Amount)"
                  : ""}
              </p>
              <Input
                type="number"
                value={String(discountValue)}
                onChange={(e) =>
                  setDiscountValue(safeNumber(String(e.target.value), 0))
                }
                disabled={isView || discountType === "FREE_DELIVERY"}
              />
              {errors.discount ? (
                <p className="text-xs text-error-500">{errors.discount}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Min Purchase
              </p>
              <Input
                type="number"
                value={String(minPurchase)}
                onChange={(e) =>
                  setMinPurchase(safeNumber(String(e.target.value), 0))
                }
                disabled={isView}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Discount (0 = none)
              </p>
              <Input
                type="number"
                value={String(maxDiscount)}
                onChange={(e) =>
                  setMaxDiscount(safeNumber(String(e.target.value), 0))
                }
                disabled={isView || discountType === "FREE_DELIVERY"}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Limit Per User (0 = unlimited)
              </p>
              <Input
                type="number"
                value={String(usageLimitPerUser)}
                onChange={(e) =>
                  setUsageLimitPerUser(safeNumber(String(e.target.value), 0))
                }
                disabled={isView}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Limit (0 = unlimited)
              </p>
              <Input
                type="number"
                value={String(usageLimitTotal)}
                onChange={(e) =>
                  setUsageLimitTotal(safeNumber(String(e.target.value), 0))
                }
                disabled={isView}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable/disable this coupon
                  </p>
                </div>
                <Switch
                  label=""
                  defaultChecked={status}
                  onChange={setStatus}
                  disabled={isView}
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Stackable
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Can combine with other promos
                  </p>
                </div>
                <Switch
                  label=""
                  defaultChecked={stackable}
                  onChange={setStackable}
                  disabled={isView}
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    First Order Only
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Apply only on first purchase
                  </p>
                </div>
                <Switch
                  label=""
                  defaultChecked={firstOrderOnly}
                  onChange={setFirstOrderOnly}
                  disabled={isView}
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    New Customer Only
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Apply only for new customers
                  </p>
                </div>
                <Switch
                  label=""
                  defaultChecked={newCustomerOnly}
                  onChange={setNewCustomerOnly}
                  disabled={isView}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Target selection blocks (same as earlier; shortened here for readability) */}
        {type === "CUSTOMER" ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Select Customer <span className="text-error-500">*</span>
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Search size={16} className="text-gray-400" />
                </div>
                <Input
                  className="pl-9"
                  placeholder="Search customer"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(String(e.target.value))}
                  disabled={isView}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selected:{" "}
                <span className="font-semibold">
                  {selectedCustomers.length}
                </span>
              </p>
            </div>

            {errors.target ? (
              <p className="mt-2 text-xs text-error-500">{errors.target}</p>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredCustomers.map((c) => {
                const checked = selectedCustomers.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {c.phone}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (isView) return;
                        setSelectedCustomers((prev) =>
                          checked
                            ? prev.filter((x) => x !== c.id)
                            : [...prev, c.id]
                        );
                      }}
                      disabled={isView}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {type === "CATEGORY" ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Select Category <span className="text-error-500">*</span>
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Search size={16} className="text-gray-400" />
                </div>
                <Input
                  className="pl-9"
                  placeholder="Search category"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(String(e.target.value))}
                  disabled={isView}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selected:{" "}
                <span className="font-semibold">
                  {selectedCategories.length}
                </span>
              </p>
            </div>

            {errors.target ? (
              <p className="mt-2 text-xs text-error-500">{errors.target}</p>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredCategories.map((c) => {
                const checked = selectedCategories.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {c.name}
                    </p>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (isView) return;
                        setSelectedCategories((prev) =>
                          checked
                            ? prev.filter((x) => x !== c.id)
                            : [...prev, c.id]
                        );
                      }}
                      disabled={isView}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}

        {type === "PRODUCT" ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Select Product <span className="text-error-500">*</span>
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Search size={16} className="text-gray-400" />
                </div>
                <Input
                  className="pl-9"
                  placeholder="Search product"
                  value={productSearch}
                  onChange={(e) => setProductSearch(String(e.target.value))}
                  disabled={isView}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selected:{" "}
                <span className="font-semibold">{selectedProducts.length}</span>
              </p>
            </div>

            {errors.target ? (
              <p className="mt-2 text-xs text-error-500">{errors.target}</p>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredProducts.map((p) => {
                const checked = selectedProducts.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {p.sku}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (isView) return;
                        setSelectedProducts((prev) =>
                          checked
                            ? prev.filter((x) => x !== p.id)
                            : [...prev, p.id]
                        );
                      }}
                      disabled={isView}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
