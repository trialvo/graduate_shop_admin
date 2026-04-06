import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, Search, X, Loader2,
  Layers, PackagePlus, Tag, Percent, DollarSign,
  Truck, Hash, SquarePen,
} from "lucide-react";
import {
  useBulkRules, useCreateBulkRule, useEditBulkRule, useDeleteBulkRule,
  useComboRules, useCreateComboRule, useEditComboRule, useDeleteComboRule,
} from "@/hooks/useDiscountRules";
import type { BulkRule, BulkRulePayload, ComboRule, ComboRulePayload } from "@/api/discount-rules.api";
import { api } from "@/api/client";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import ConfirmModal from "@/components/ui/modal/ConfirmModal";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { lockBodyScroll, unlockBodyScroll } from "@/components/ui/modal/useModalTransition";

// ─── Easings ─────────────────────────────────────────────────────────────────

const OPEN_EASE  = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const CLOSE_EASE = "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
const EASE_STD   = "cubic-bezier(0.4, 0, 0.2, 1)";

// ─── SKU types ───────────────────────────────────────────────────────────────

type SkuOption = {
  id: number;
  sku: string;
  product_name: string;
  color_name: string | null;
  variant_name: string | null;
  selling_price: number;
  stock: number;
};

async function fetchSkuSuggestions(q: string): Promise<SkuOption[]> {
  const res = await api.get("/admin/discount/skus", { params: { q } });
  return res.data?.data ?? [];
}

// ─── SKU Searchable Dropdown ─────────────────────────────────────────────────

function SkuDropdown({
  value,
  onSelect,
  placeholder,
}: {
  value: number | null;
  onSelect: (id: number, sku: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  // Keep track of the full option object for the selected item so we can show a nice label
  const [selectedOpt, setSelectedOpt] = useState<SkuOption | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced query so we don't fire on every keystroke
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ["sku-search", debouncedQ],
    queryFn: () => fetchSkuSuggestions(debouncedQ),
    enabled: open && debouncedQ.length >= 1,
    staleTime: 15_000,
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset selectedOpt when value is cleared from outside
  useEffect(() => {
    if (!value) setSelectedOpt(null);
  }, [value]);

  const handleSelect = (opt: SkuOption) => {
    setSelectedOpt(opt);
    onSelect(opt.id, opt.sku);
    setQuery("");
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOpt(null);
    onSelect(0, "");
    setQuery("");
  };

  const openDropdown = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Build a nice human-readable label for the selected item
  const selectedLabel = selectedOpt
    ? [
        selectedOpt.product_name,
        [selectedOpt.color_name, selectedOpt.variant_name].filter(Boolean).join(" / "),
      ].filter(Boolean).join(" — ")
    : null;

  // Group results by product name
  const grouped = options.reduce<Record<string, SkuOption[]>>((acc, opt) => {
    const key = opt.product_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(opt);
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger / Input */}
      <div
        className="flex items-center gap-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm cursor-text dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        onClick={openDropdown}
      >
        <Search size={13} className="shrink-0 text-gray-400" />

        {open ? (
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="Type product name or SKU code…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        ) : (
          <span className={`flex-1 truncate ${selectedLabel ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
            {selectedLabel ?? (placeholder ?? "Select a product SKU…")}
          </span>
        )}

        {value ? (
          <button type="button" onClick={handleClear} className="text-gray-400 hover:text-error-500" title="Clear">
            <X size={12} />
          </button>
        ) : null}
        {isFetching && <Loader2 size={12} className="animate-spin text-brand-500 shrink-0" />}
      </div>

      {/* Dropdown */}
      {open && (
        <ul className="absolute z-50 top-full mt-1 left-0 right-0 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          {debouncedQ.length === 0 ? (
            <li className="px-4 py-4 text-center text-sm text-gray-400">
              Start typing a <span className="font-medium text-brand-500">product name</span> or SKU code…
            </li>
          ) : isFetching ? (
            <li className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin" /> Searching…
            </li>
          ) : options.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400">No matching products found.</li>
          ) : (
            Object.entries(grouped).map(([productName, variants]) => (
              <li key={productName}>
                {/* Product group header */}
                <div className="sticky top-0 px-4 py-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 uppercase tracking-wide">
                  {productName}
                </div>
                {/* Variant options */}
                {variants.map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                        {[opt.color_name, opt.variant_name].filter(Boolean).join(" / ") || "Default"}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{opt.sku}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="text-brand-600 dark:text-brand-400 font-semibold">৳{opt.selling_price}</span>
                      <span className={`px-1.5 py-0.5 rounded font-medium ${opt.stock > 0 ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400" : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"}`}>
                        {opt.stock > 0 ? `${opt.stock} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </div>
                ))}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DISCOUNT_TYPE_LABEL = (t: 0 | 1) => (t === 0 ? "Flat ৳" : "Percentage %");

function StatusBadge({ on }: { on: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${on ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
      {on ? "Active" : "Inactive"}
    </span>
  );
}

/** Controlled numeric text input — shows "" when 0, parses on change */
function NumInput({
  value,
  onChange,
  placeholder,
  min,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  min?: number;
  className?: string;
}) {
  const [raw, setRaw] = useState(value === 0 ? "" : String(value));

  // sync when external value changes (e.g. modal open)
  useEffect(() => {
    setRaw(value === 0 ? "" : String(value));
  }, [value]);

  return (
    <input
      type="number"
      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${className ?? ""}`}
      value={raw}
      min={min}
      placeholder={placeholder}
      onChange={e => {
        const str = e.target.value;
        setRaw(str);
        const n = parseFloat(str);
        if (!isNaN(n)) onChange(n);
        else if (str === "" || str === "-") onChange(0);
      }}
      onBlur={() => setRaw(value === 0 ? "" : String(value))}
    />
  );
}

// ─── Premium Edit Modal with spring transition ───────────────────────────────

type EditModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

function EditModal({ open, onClose, title, subtitle, icon, children }: EditModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      const id = window.requestAnimationFrame(() =>
        window.requestAnimationFrame(() => setIsVisible(true))
      );
      return () => window.cancelAnimationFrame(id);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (!open) setIsMounted(false);
    },
    [open],
  );

  useEffect(() => {
    if (!isMounted) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [isMounted]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!isMounted) return null;

  const modalNode = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        aria-hidden
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: isVisible ? `opacity 220ms ${EASE_STD}` : `opacity 180ms ${CLOSE_EASE}`,
        }}
      />
      <div
        onTransitionEnd={handleTransitionEnd}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
          transition: isVisible
            ? `opacity 260ms ${OPEN_EASE}, transform 320ms ${OPEN_EASE}`
            : `opacity 180ms ${CLOSE_EASE}, transform 180ms ${CLOSE_EASE}`,
          willChange: "opacity, transform",
        }}
        className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl dark:border-gray-700/60 dark:bg-gray-900"
      >
        {/* ── Header ── */}
        <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-r from-brand-50 via-white to-brand-50/40 px-6 py-5 dark:border-gray-800 dark:from-brand-900/20 dark:via-gray-900 dark:to-brand-900/10">
          <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-brand-100/40 dark:bg-brand-500/5" />
          <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-brand-100/30 dark:bg-brand-500/5" />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/25">
                {icon ?? <SquarePen size={18} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {title}
                </h3>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white/80 p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return modalNode;
  return createPortal(modalNode, document.body);
}

// ─── Bulk Rules Tab ───────────────────────────────────────────────────────────

function BulkRulesManager() {
  const { data: rules = [], isLoading } = useBulkRules();
  const createM = useCreateBulkRule();
  const editM = useEditBulkRule();
  const deleteM = useDeleteBulkRule();

  const EMPTY: BulkRulePayload = { name: "", product_sku_id: 0, min_quantity: 1, discount_type: 1, discount_value: 0, status: true, free_delivery: false };

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BulkRule | null>(null);
  const [form, setForm] = useState<BulkRulePayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; rule: BulkRule | null }>({ open: false, rule: null });

  // ── Multi-tier state (create mode only) ──────────────────────────────────
  type Tier = { id: number; name: string; min_quantity: number; discount_value: number };
  const [skuId, setSkuId] = useState<number>(0);
  const [discountType, setDiscountType] = useState<0 | 1>(1);
  const [status, setStatus] = useState(true);
  const [bulkFreeDelivery, setBulkFreeDelivery] = useState(false);
  const [tiers, setTiers] = useState<Tier[]>([{ id: Date.now(), name: "", min_quantity: 1, discount_value: 0 }]);

  const addTier = () =>
    setTiers(ts => [...ts, { id: Date.now(), name: "", min_quantity: 1, discount_value: 0 }]);

  const removeTier = (id: number) =>
    setTiers(ts => ts.length > 1 ? ts.filter(t => t.id !== id) : ts);

  const updateTier = (id: number, patch: Partial<Omit<Tier, "id">>) =>
    setTiers(ts => ts.map(t => t.id === id ? { ...t, ...patch } : t));

  // ── Open helpers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setSkuId(0);
    setDiscountType(1);
    setStatus(true);
    setBulkFreeDelivery(false);
    setTiers([{ id: Date.now(), name: "", min_quantity: 1, discount_value: 0 }]);
    setModalOpen(true);
  };

  const openEdit = (r: BulkRule) => {
    setEditTarget(r);
    setForm({ name: r.name, product_sku_id: r.product_sku_id, min_quantity: r.min_quantity, discount_type: r.discount_type, discount_value: r.discount_value, status: r.status, free_delivery: r.free_delivery });
    setModalOpen(true);
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (editTarget) {
      // Edit mode: single rule
      if (!form.product_sku_id) { toast.error("Please select a SKU."); return; }
      setSaving(true);
      try {
        await editM.mutateAsync({ id: editTarget.id, body: form });
        toast.success("Bulk rule updated.");
        setModalOpen(false);
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "Failed.");
      } finally { setSaving(false); }
    } else {
      // Create mode: multi-tier
      if (!skuId) { toast.error("Please select a SKU."); return; }
      const invalid = tiers.find(t => !t.name.trim() || t.min_quantity < 1 || t.discount_value <= 0);
      if (invalid) { toast.error("Each tier needs a name, min quantity ≥ 1, and discount value > 0."); return; }
      setSaving(true);
      try {
        const results = await Promise.allSettled(
          tiers.map(t =>
            createM.mutateAsync({
              name: t.name.trim(),
              product_sku_id: skuId,
              min_quantity: t.min_quantity,
              discount_type: discountType,
              discount_value: t.discount_value,
              status,
              free_delivery: bulkFreeDelivery,
            })
          )
        );
        const succeeded = results.filter(r => r.status === "fulfilled").length;
        const failed = results.filter(r => r.status === "rejected") as PromiseRejectedResult[];

        if (failed.length === 0) {
          toast.success(tiers.length > 1 ? `${tiers.length} bulk rules created.` : "Bulk rule created.");
          setModalOpen(false);
        } else if (succeeded > 0) {
          toast.success(`${succeeded} rule(s) created.`);
          failed.forEach(f => toast.error(f.reason?.response?.data?.error || "One tier failed."));
          setModalOpen(false);
        } else {
          // All failed
          failed.forEach(f => toast.error(f.reason?.response?.data?.error || "Failed."));
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.error || "Failed.");
      } finally { setSaving(false); }
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.rule) return;
    try { await deleteM.mutateAsync(deleteConfirm.rule.id); toast.success("Deleted."); setDeleteConfirm({ open: false, rule: null }); }
    catch (err: any) { toast.error(err?.response?.data?.error || "Failed."); }
  };

  const typeLabel = discountType === 0 ? "৳" : "%";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button startIcon={<Plus size={15} />} onClick={openCreate}>Add Bulk Rule</Button>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {["Name", "SKU", "Min Qty", "Discount", "Value", "Delivery", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No bulk rules yet.</td></tr>
            ) : rules.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{(r as any).sku ?? r.product_sku_id}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.min_quantity}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{DISCOUNT_TYPE_LABEL(r.discount_type)}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.discount_value}</td>
                <td className="px-4 py-3">
                  {r.free_delivery
                    ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full"><Truck size={11} /> Free</span>
                    : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full"><X size={11} /> Paid</span>}
                </td>
                <td className="px-4 py-3"><StatusBadge on={r.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteConfirm({ open: true, rule: r })} className="h-7 w-7 flex items-center justify-center rounded border border-error-200 text-error-600 hover:bg-error-50"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Edit Modal with spring transition ── */}
      <EditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Bulk Rule" : "Add Bulk Rules"}
        subtitle={editTarget ? `Editing rule "${editTarget.name}"` : "Create one or multiple bulk discount tiers"}
        icon={editTarget ? <Pencil size={18} /> : <Layers size={18} />}
      >
        {editTarget ? (
          /* ── Edit: single-tier form ── */
          <div className="space-y-6">
            {/* Section 1: Basic Info */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">1</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Basic Information</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700/60" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Tag size={13} className="text-gray-400" /> Rule Name <span className="text-error-500">*</span>
                  </label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Buy 3 Get 10% Off"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Search size={13} className="text-gray-400" /> Product SKU <span className="text-error-500">*</span>
                  </label>
                  <SkuDropdown
                    value={form.product_sku_id || null}
                    onSelect={(id) => setForm(f => ({ ...f, product_sku_id: id }))}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Discount Config */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">2</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Discount Configuration</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700/60" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Hash size={13} className="text-gray-400" /> Min Quantity <span className="text-error-500">*</span>
                  </label>
                  <NumInput value={form.min_quantity} onChange={n => setForm(f => ({ ...f, min_quantity: Math.max(1, Math.floor(n)) }))} placeholder="e.g. 3" min={1} />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {form.discount_type === 1 ? <Percent size={13} className="text-gray-400" /> : <DollarSign size={13} className="text-gray-400" />} Discount Value <span className="text-error-500">*</span>
                  </label>
                  <NumInput value={form.discount_value} onChange={n => setForm(f => ({ ...f, discount_value: Math.max(0, n) }))} placeholder="e.g. 10" min={0} />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Percent size={13} className="text-gray-400" /> Discount Type
                  </label>
                  <Select
                    options={[
                      { value: "0", label: "Flat Amount (৳)" },
                      { value: "1", label: "Percentage (%)" },
                    ]}
                    value={String(form.discount_type)}
                    onChange={(v) => setForm(f => ({ ...f, discount_type: Number(v) as 0 | 1 }))}
                    searchable={false}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Options */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">3</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Options</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700/60" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 dark:border-gray-700/60 dark:bg-gray-800/40">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", form.status ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>{form.status ? "Active" : "Inactive"}</span>
                  </div>
                  <Switch key={`bs-${form.status}`} label="" defaultChecked={form.status} onChange={(checked) => setForm(f => ({ ...f, status: checked }))} />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 dark:border-gray-700/60 dark:bg-gray-800/40">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-emerald-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Delivery</span>
                  </div>
                  <Switch key={`bfd-${form.free_delivery}`} label="" defaultChecked={!!form.free_delivery} onChange={(checked) => setForm(f => ({ ...f, free_delivery: checked }))} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Editing bulk rule #{editTarget.id}</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving} startIcon={saving ? undefined : <Pencil size={14} />}>{saving ? "Saving..." : "Save Changes"}</Button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Create: multi-tier form ── */
          <div className="space-y-5">
            {/* SKU (shared) */}
            <div className="space-y-2">
              <Label>Product SKU *</Label>
              <SkuDropdown value={skuId || null} onSelect={(id) => setSkuId(id)} />
            </div>

            {/* Discount type (shared) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Percent size={13} className="text-gray-400" /> Discount Type
                </label>
                <Select
                  options={[
                    { value: "1", label: "Percentage (%)" },
                    { value: "0", label: "Flat Amount (৳)" },
                  ]}
                  value={String(discountType)}
                  onChange={(v) => setDiscountType(Number(v) as 0 | 1)}
                  searchable={false}
                />
              </div>
              <div className="flex flex-col gap-3 items-start justify-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch key={`cs-${status}`} label="" defaultChecked={status} onChange={(checked) => setStatus(checked)} />
                  <span className={cn("text-sm font-medium", status ? "text-gray-700 dark:text-gray-300" : "text-gray-400")}>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch key={`cfd-${bulkFreeDelivery}`} label="" defaultChecked={bulkFreeDelivery} onChange={(checked) => setBulkFreeDelivery(checked)} />
                  <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400"><Truck size={13} /> Free Delivery</span>
                </div>
              </div>
            </div>

            {/* Tiers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Quantity Tiers</Label>
                <button
                  type="button"
                  onClick={addTier}
                  className="flex items-center gap-1 rounded-lg border border-brand-300 px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-900/20 transition-colors"
                >
                  <Plus size={12} /> Add Tier
                </button>
              </div>

              {/* Header row */}
              <div className="grid grid-cols-[1fr_100px_100px_28px] gap-2 px-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Rule Name</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Min Qty</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Discount ({typeLabel})</span>
                <span />
              </div>

              {tiers.map((t, idx) => (
                <div key={t.id} className="grid grid-cols-[1fr_100px_100px_28px] gap-2 items-center">
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={`Tier ${idx + 1} name…`}
                    value={t.name}
                    onChange={e => updateTier(t.id, { name: e.target.value })}
                  />
                  <NumInput
                    value={t.min_quantity}
                    onChange={n => updateTier(t.id, { min_quantity: Math.max(1, Math.floor(n)) })}
                    placeholder="e.g. 100"
                    min={1}
                  />
                  <NumInput
                    value={t.discount_value}
                    onChange={n => updateTier(t.id, { discount_value: Math.max(0, n) })}
                    placeholder={discountType === 1 ? "e.g. 20" : "e.g. 50"}
                    min={0}
                  />
                  <button
                    type="button"
                    onClick={() => removeTier(t.id)}
                    disabled={tiers.length === 1}
                    className="h-7 w-7 flex items-center justify-center rounded border border-error-200 text-error-500 hover:bg-error-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove tier"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Preview pill */}
              {tiers.length > 1 && (
                <p className="text-xs text-gray-400 pt-1">
                  This will create <span className="font-semibold text-brand-600">{tiers.length} separate rules</span> for the selected SKU.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : tiers.length > 1 ? `Save ${tiers.length} Rules` : "Save Rule"}
              </Button>
            </div>
          </div>
        )}
      </EditModal>

      {/* ── Premium Delete Modal ── */}
      <ConfirmModal
        open={deleteConfirm.open}
        onClose={() => {
          if (deleteM.isPending) return;
          setDeleteConfirm({ open: false, rule: null });
        }}
        onConfirm={handleDelete}
        loading={deleteM.isPending}
        title="Delete Bulk Rule?"
        subtitle="This action is permanent and cannot be undone."
        message={
          deleteConfirm.rule ? (
            <span>
              <span className="font-normal text-gray-500 dark:text-gray-400">Bulk Rule&nbsp;·&nbsp;</span>
              <span className="font-semibold">{deleteConfirm.rule.name}</span>
            </span>
          ) : undefined
        }
        consequenceLines={[
          "This bulk discount rule will be permanently removed",
          "Customers will no longer receive this discount",
          "This action cannot be recovered or reversed",
        ]}
        confirmLabel="Delete Rule"
      />
    </div>
  );
}

// ─── Combo Rules Tab ──────────────────────────────────────────────────────────

function ComboRulesManager() {
  const { data: rules = [], isLoading } = useComboRules();
  const createM = useCreateComboRule();
  const editM = useEditComboRule();
  const deleteM = useDeleteComboRule();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ComboRule | null>(null);
  const [form, setForm] = useState<ComboRulePayload>({ name: "", discount_type: 0, discount_value: 0, status: true, free_delivery: false, items: [] });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; rule: ComboRule | null }>({ open: false, rule: null });

  // selected SKU for adding to combo
  const [pendingSku, setPendingSku] = useState<{ id: number; sku: string } | null>(null);
  const [pendingQty, setPendingQty] = useState(1);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "", discount_type: 0, discount_value: 0, status: true, free_delivery: false, items: [] });
    setPendingSku(null);
    setPendingQty(1);
    setModalOpen(true);
  };
  const openEdit = (r: ComboRule) => {
    setEditTarget(r);
    setForm({ name: r.name, discount_type: r.discount_type, discount_value: r.discount_value, status: r.status, free_delivery: r.free_delivery, items: r.items.map(i => ({ product_sku_id: i.product_sku_id, required_qty: i.required_qty ?? 1 })) });
    setPendingSku(null);
    setPendingQty(1);
    setModalOpen(true);
  };

  const addSku = () => {
    if (!pendingSku || form.items.find(i => i.product_sku_id === pendingSku.id)) {
      toast.error("SKU already added or none selected.");
      return;
    }
    setForm(f => ({ ...f, items: [...f.items, { product_sku_id: pendingSku.id, required_qty: Math.max(1, pendingQty) }] }));
    setPendingSku(null);
    setPendingQty(1);
  };
  const removeSku = (id: number) => setForm(f => ({ ...f, items: f.items.filter(i => i.product_sku_id !== id) }));

  const handleSave = async () => {
    if (form.items.length < 2) { toast.error("At least 2 SKUs are required."); return; }
    setSaving(true);
    try {
      if (editTarget) { await editM.mutateAsync({ id: editTarget.id, body: form }); toast.success("Updated."); }
      else { await createM.mutateAsync(form); toast.success("Created."); }
      setModalOpen(false);
    } catch (err: any) { toast.error(err?.response?.data?.error || "Failed."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.rule) return;
    try { await deleteM.mutateAsync(deleteConfirm.rule.id); toast.success("Deleted."); setDeleteConfirm({ open: false, rule: null }); }
    catch (err: any) { toast.error(err?.response?.data?.error || "Failed."); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button startIcon={<Plus size={15} />} onClick={openCreate}>Add Combo Rule</Button>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {["Name", "Discount", "Value", "SKUs", "Delivery", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              : rules.length === 0 ? <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No combo rules yet.</td></tr>
                : rules.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{DISCOUNT_TYPE_LABEL(r.discount_type)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.discount_value}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{r.items.map(i => i.product_sku_id).join(", ")}</td>
                    <td className="px-4 py-3">
                      {r.free_delivery
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full"><Truck size={11} /> Free</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full"><X size={11} /> Paid</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge on={r.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(r)} className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteConfirm({ open: true, rule: r })} className="h-7 w-7 flex items-center justify-center rounded border border-error-200 text-error-600 hover:bg-error-50"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* ── Edit Modal with spring transition ── */}
      <EditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Combo Rule" : "Create Combo Rule"}
        subtitle={editTarget ? `Editing rule "${editTarget.name}"` : "Create a combo discount for buying products together"}
        icon={editTarget ? <Pencil size={18} /> : <PackagePlus size={18} />}
      >
        <div className="space-y-6">
          {/* Section 1: Basic Info */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">1</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Basic Information</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700/60" />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Tag size={13} className="text-gray-400" /> Rule Name <span className="text-error-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Shirt + Pant Bundle"
              />
            </div>
          </div>

          {/* Section 2: Discount Config */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">2</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Discount Configuration</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700/60" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Percent size={13} className="text-gray-400" /> Discount Type
                </label>
                <Select
                  options={[
                    { value: "0", label: "Flat Amount (৳)" },
                    { value: "1", label: "Percentage (%)" },
                  ]}
                  value={String(form.discount_type)}
                  onChange={(v) => setForm(f => ({ ...f, discount_type: Number(v) as 0 | 1 }))}
                  searchable={false}
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {form.discount_type === 1 ? <Percent size={13} className="text-gray-400" /> : <DollarSign size={13} className="text-gray-400" />} Discount Value <span className="text-error-500">*</span>
                </label>
                <NumInput
                  value={form.discount_value}
                  onChange={n => setForm(f => ({ ...f, discount_value: Math.max(0, n) }))}
                  placeholder="e.g. 200"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Section 3: SKU picker */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">3</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Combo Items</span>
              <span className="rounded-full bg-gray-100 px-1.5 py-px text-[9px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">Min 2</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700/60" />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <SkuDropdown
                  value={pendingSku?.id ?? null}
                  onSelect={(id, sku) => setPendingSku({ id, sku })}
                  placeholder="Search SKU to add…"
                />
              </div>
              <div className="w-24 shrink-0">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Qty</label>
                <NumInput
                  key={`pending-qty-${modalOpen}`}
                  value={pendingQty}
                  onChange={n => setPendingQty(Math.max(1, Math.floor(n)))}
                  placeholder="1"
                  min={1}
                />
              </div>
              <Button variant="outline" onClick={addSku} disabled={!pendingSku} startIcon={<Plus size={14} />}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.items.map(i => (
                <span key={i.product_sku_id} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                  SKU {i.product_sku_id} <span className="opacity-70">(qty×{i.required_qty})</span>
                  <button type="button" onClick={() => removeSku(i.product_sku_id)} className="ml-0.5 hover:text-error-500">×</button>
                </span>
              ))}
              {form.items.length === 0 && <p className="text-xs text-gray-400">No SKUs added yet.</p>}
            </div>
          </div>

          {/* Section 4: Options */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">4</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Options</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700/60" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 dark:border-gray-700/60 dark:bg-gray-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", form.status ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400")}>{form.status ? "Active" : "Inactive"}</span>
                </div>
                <Switch key={`cos-${form.status}`} label="" defaultChecked={form.status} onChange={(checked) => setForm(f => ({ ...f, status: checked }))} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 dark:border-gray-700/60 dark:bg-gray-800/40">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Delivery</span>
                </div>
                <Switch key={`cofd-${form.free_delivery}`} label="" defaultChecked={!!form.free_delivery} onChange={(checked) => setForm(f => ({ ...f, free_delivery: checked }))} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              {editTarget ? `Editing combo rule #${editTarget.id}` : "Fill in the details to create a new combo rule"}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} startIcon={saving ? undefined : (editTarget ? <Pencil size={14} /> : <Plus size={14} />)}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </div>
      </EditModal>

      {/* ── Premium Delete Modal ── */}
      <ConfirmModal
        open={deleteConfirm.open}
        onClose={() => {
          if (deleteM.isPending) return;
          setDeleteConfirm({ open: false, rule: null });
        }}
        onConfirm={handleDelete}
        loading={deleteM.isPending}
        title="Delete Combo Rule?"
        subtitle="This action is permanent and cannot be undone."
        message={
          deleteConfirm.rule ? (
            <span>
              <span className="font-normal text-gray-500 dark:text-gray-400">Combo Rule&nbsp;·&nbsp;</span>
              <span className="font-semibold">{deleteConfirm.rule.name}</span>
            </span>
          ) : undefined
        }
        consequenceLines={[
          "This combo discount rule will be permanently removed",
          "Customers will no longer receive this bundle discount",
          "This action cannot be recovered or reversed",
        ]}
        confirmLabel="Delete Rule"
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TAB_OPTIONS: { label: string; value: "bulk" | "combo"; icon: React.ReactNode }[] = [
  { label: "Bulk Rules", value: "bulk", icon: <Layers size={14} /> },
  { label: "Combo Rules", value: "combo", icon: <PackagePlus size={14} /> },
];

export default function DiscountRulesPage() {
  const [tab, setTab] = useState<"bulk" | "combo">("bulk");

  // ── Sliding indicator ──
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeIndex = TAB_OPTIONS.findIndex((o) => o.value === tab);
    const btn = buttonRefs.current[activeIndex];
    const container = containerRef.current;
    if (!btn || !container) return;

    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setPillStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    });
  }, [tab]);

  return (
    <>
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discount Rules</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage bulk and combo discount rules for your store.</p>
      </div>

      {/* ── Sliding tab indicator ── */}
      <div className="mb-6">
        <div
          ref={containerRef}
          className="relative inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800"
        >
          {/* Sliding pill */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1 bottom-1 rounded-lg",
              "bg-white shadow-sm ring-1 ring-gray-200",
              "dark:bg-gray-700 dark:ring-white/10",
              "transition-[left,width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
            )}
            style={{ left: pillStyle.left, width: pillStyle.width }}
          />

          {TAB_OPTIONS.map((opt, i) => (
            <button
              key={opt.value}
              ref={(el) => { buttonRefs.current[i] = el; }}
              type="button"
              onClick={() => setTab(opt.value)}
              className={cn(
                "relative z-10 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold",
                "transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                tab === opt.value
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "bulk" ? <BulkRulesManager /> : <ComboRulesManager />}
    </>
  );
}
