import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Search, X, Loader2 } from "lucide-react";
import {
  useBulkRules, useCreateBulkRule, useEditBulkRule, useDeleteBulkRule,
  useComboRules, useCreateComboRule, useEditComboRule, useDeleteComboRule,
} from "@/hooks/useDiscountRules";
import type { BulkRule, BulkRulePayload, ComboRule, ComboRulePayload } from "@/api/discount-rules.api";
import { api } from "@/api/client";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Modal from "@/components/ui/modal/Modal";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import { useQuery } from "@tanstack/react-query";

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

// ─── Bulk Rules Tab ───────────────────────────────────────────────────────────

function BulkRulesManager() {
  const { data: rules = [], isLoading } = useBulkRules();
  const createM = useCreateBulkRule();
  const editM = useEditBulkRule();
  const deleteM = useDeleteBulkRule();

  const EMPTY: BulkRulePayload = { name: "", product_sku_id: 0, min_quantity: 1, discount_type: 1, discount_value: 0, status: true };

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BulkRule | null>(null);
  const [form, setForm] = useState<BulkRulePayload>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (r: BulkRule) => {
    setEditTarget(r);
    setForm({ name: r.name, product_sku_id: r.product_sku_id, min_quantity: r.min_quantity, discount_type: r.discount_type, discount_value: r.discount_value, status: r.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.product_sku_id) { toast.error("Please select a SKU."); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await editM.mutateAsync({ id: editTarget.id, body: form });
        toast.success("Bulk rule updated.");
      } else {
        await createM.mutateAsync(form);
        toast.success("Bulk rule created.");
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    try { await deleteM.mutateAsync(confirmId); toast.success("Deleted."); setConfirmId(null); }
    catch (err: any) { toast.error(err?.response?.data?.error || "Failed."); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button startIcon={<Plus size={15} />} onClick={openCreate}>Add Bulk Rule</Button>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {["Name", "SKU", "Min Qty", "Discount", "Value", "Status", ""].map((h) => (
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
                <td className="px-4 py-3"><StatusBadge on={r.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"><Pencil size={13} /></button>
                    <button onClick={() => setConfirmId(r.id)} className="h-7 w-7 flex items-center justify-center rounded border border-error-200 text-error-600 hover:bg-error-50"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editTarget ? "Edit Bulk Rule" : "Create Bulk Rule"} onClose={() => setModalOpen(false)} size="md">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Buy 3 Get 10% Off"
            />
          </div>

          {/* SKU picker */}
          <div className="space-y-2">
            <Label>SKU *</Label>
            <SkuDropdown
              value={form.product_sku_id || null}
              onSelect={(id) => setForm(f => ({ ...f, product_sku_id: id }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Quantity *</Label>
              <NumInput
                value={form.min_quantity}
                onChange={n => setForm(f => ({ ...f, min_quantity: Math.max(1, Math.floor(n)) }))}
                placeholder="e.g. 3"
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Discount Value *</Label>
              <NumInput
                value={form.discount_value}
                onChange={n => setForm(f => ({ ...f, discount_value: Math.max(0, n) }))}
                placeholder="e.g. 10"
                min={0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Discount Type</Label>
            <select
              value={form.discount_type}
              onChange={e => setForm(f => ({ ...f, discount_type: Number(e.target.value) as 0 | 1 }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value={0}>Flat Amount (৳)</option>
              <option value={1}>Percentage (%)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="bulk-status" checked={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.checked }))} className="rounded" />
            <Label htmlFor="bulk-status">Active</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirmId)} title="Delete Bulk Rule" message="Delete this bulk rule?" confirmText="Delete" cancelText="Cancel" tone="danger" onClose={() => setConfirmId(null)} onConfirm={handleDelete} />
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
  const [form, setForm] = useState<ComboRulePayload>({ name: "", discount_type: 0, discount_value: 0, status: true, items: [] });
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // selected SKU for adding to combo
  const [pendingSku, setPendingSku] = useState<{ id: number; sku: string } | null>(null);
  const [pendingQty, setPendingQty] = useState(1);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "", discount_type: 0, discount_value: 0, status: true, items: [] });
    setPendingSku(null);
    setPendingQty(1);
    setModalOpen(true);
  };
  const openEdit = (r: ComboRule) => {
    setEditTarget(r);
    setForm({ name: r.name, discount_type: r.discount_type, discount_value: r.discount_value, status: r.status, items: r.items.map(i => ({ product_sku_id: i.product_sku_id, required_qty: i.required_qty ?? 1 })) });
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
    if (!confirmId) return;
    try { await deleteM.mutateAsync(confirmId); toast.success("Deleted."); setConfirmId(null); }
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
              {["Name", "Discount", "Value", "SKUs", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
              : rules.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No combo rules yet.</td></tr>
                : rules.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{DISCOUNT_TYPE_LABEL(r.discount_type)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.discount_value}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{r.items.map(i => i.product_sku_id).join(", ")}</td>
                    <td className="px-4 py-3"><StatusBadge on={r.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(r)} className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"><Pencil size={13} /></button>
                        <button onClick={() => setConfirmId(r.id)} className="h-7 w-7 flex items-center justify-center rounded border border-error-200 text-error-600 hover:bg-error-50"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editTarget ? "Edit Combo Rule" : "Create Combo Rule"} onClose={() => setModalOpen(false)} size="md">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <input
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Shirt + Pant Bundle"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <select
                value={form.discount_type}
                onChange={e => setForm(f => ({ ...f, discount_type: Number(e.target.value) as 0 | 1 }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value={0}>Flat Amount (৳)</option>
                <option value={1}>Percentage (%)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Discount Value *</Label>
              <NumInput
                value={form.discount_value}
                onChange={n => setForm(f => ({ ...f, discount_value: Math.max(0, n) }))}
                placeholder="e.g. 200"
                min={0}
              />
            </div>
          </div>

          {/* SKU picker for combo items */}
          <div className="space-y-2">
            <Label>Add SKU Items (min 2 required)</Label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <SkuDropdown
                  value={pendingSku?.id ?? null}
                  onSelect={(id, sku) => setPendingSku({ id, sku })}
                  placeholder="Search SKU to add…"
                />
              </div>
              <div className="w-24 shrink-0">
                <Label className="text-xs mb-1 block">Qty</Label>
                <NumInput
                  key={`pending-qty-${modalOpen}`}
                  value={pendingQty}
                  onChange={n => setPendingQty(Math.max(1, Math.floor(n)))}
                  placeholder="1"
                  min={1}
                />
              </div>
              <Button variant="outline" onClick={addSku} disabled={!pendingSku}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {form.items.map(i => (
                <span key={i.product_sku_id} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                  SKU {i.product_sku_id} <span className="opacity-70">(qty×{i.required_qty})</span>
                  <button type="button" onClick={() => removeSku(i.product_sku_id)} className="ml-0.5 hover:text-error-500">×</button>
                </span>
              ))}
              {form.items.length === 0 && <p className="text-xs text-gray-400">No SKUs added yet.</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="combo-status" checked={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.checked }))} className="rounded" />
            <Label htmlFor="combo-status">Active</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirmId)} title="Delete Combo Rule" message="Delete this combo rule?" confirmText="Delete" cancelText="Cancel" tone="danger" onClose={() => setConfirmId(null)} onConfirm={handleDelete} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DiscountRulesPage() {
  const [tab, setTab] = useState<"bulk" | "combo">("bulk");
  return (
    <>
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discount Rules</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage bulk and combo discount rules.</p>
      </div>
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
        {(["bulk", "combo"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab === t ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
            {t === "bulk" ? "Bulk Rules (Buy N Get Discount)" : "Combo Rules (Buy A+B Together)"}
          </button>
        ))}
      </div>
      {tab === "bulk" ? <BulkRulesManager /> : <ComboRulesManager />}
    </>
  );
}
