import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  useBulkRules, useCreateBulkRule, useEditBulkRule, useDeleteBulkRule,
  useComboRules, useCreateComboRule, useEditComboRule, useDeleteComboRule,
} from "@/hooks/useDiscountRules";
import type { BulkRule, BulkRulePayload, ComboRule, ComboRulePayload } from "@/api/discount-rules.api";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Modal from "@/components/ui/modal/Modal";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DISCOUNT_TYPE_LABEL = (t: 0 | 1) => (t === 0 ? "Flat ৳" : "Percentage %");

function StatusBadge({ on }: { on: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${on ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
      {on ? "Active" : "Inactive"}
    </span>
  );
}

// ─── Bulk Rules Tab ───────────────────────────────────────────────────────────

function BulkRulesManager() {
  const { data: rules = [], isLoading } = useBulkRules();
  const createM = useCreateBulkRule();
  const editM = useEditBulkRule();
  const deleteM = useDeleteBulkRule();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BulkRule | null>(null);
  const [form, setForm] = useState<BulkRulePayload>({
    name: "", product_sku_id: 0, min_quantity: 1, discount_type: 1, discount_value: 0, status: true,
  });
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "", product_sku_id: 0, min_quantity: 1, discount_type: 1, discount_value: 0, status: true });
    setModalOpen(true);
  };
  const openEdit = (r: BulkRule) => {
    setEditTarget(r);
    setForm({ name: r.name, product_sku_id: r.product_sku_id, min_quantity: r.min_quantity, discount_type: r.discount_type, discount_value: r.discount_value, status: r.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
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
    try {
      await deleteM.mutateAsync(confirmId);
      toast.success("Deleted.");
      setConfirmId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed.");
    }
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
              {["Name", "SKU ID", "Min Qty", "Discount", "Value", "Status", ""].map((h) => (
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
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.product_sku_id}</td>
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
          <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: String(e.target.value) }))} placeholder="Buy 3 Get 10% Off" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>SKU ID *</Label><Input type="number" value={form.product_sku_id} onChange={(e) => setForm((f) => ({ ...f, product_sku_id: Number(e.target.value) }))} /></div>
            <div className="space-y-2"><Label>Min Quantity *</Label><Input type="number" value={form.min_quantity} onChange={(e) => setForm((f) => ({ ...f, min_quantity: Number(e.target.value) }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: Number(e.target.value) as 0 | 1 }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
                <option value={0}>Flat Amount (৳)</option>
                <option value={1}>Percentage (%)</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Value *</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))} /></div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="bulk-status" checked={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked }))} className="rounded" />
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
  const [skuInput, setSkuInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "", discount_type: 0, discount_value: 0, status: true, items: [] });
    setSkuInput("");
    setModalOpen(true);
  };
  const openEdit = (r: ComboRule) => {
    setEditTarget(r);
    setForm({ name: r.name, discount_type: r.discount_type, discount_value: r.discount_value, status: r.status, items: r.items.map((i) => ({ product_sku_id: i.product_sku_id })) });
    setSkuInput("");
    setModalOpen(true);
  };

  const addSku = () => {
    const id = parseInt(skuInput.trim(), 10);
    if (!id || form.items.find((i) => i.product_sku_id === id)) return;
    setForm((f) => ({ ...f, items: [...f.items, { product_sku_id: id }] }));
    setSkuInput("");
  };
  const removeSku = (id: number) => setForm((f) => ({ ...f, items: f.items.filter((i) => i.product_sku_id !== id) }));

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
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.items.map((i) => i.product_sku_id).join(", ")}</td>
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
          <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: String(e.target.value) }))} placeholder="Shirt + Pant Bundle" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: Number(e.target.value) as 0 | 1 }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
                <option value={0}>Flat Amount (৳)</option>
                <option value={1}>Percentage (%)</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Discount Value *</Label><Input type="number" value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))} /></div>
          </div>
          <div className="space-y-2">
            <Label>SKU IDs (min 2 required)</Label>
            <div className="flex gap-2">
              <Input type="number" value={skuInput} onChange={(e) => setSkuInput(e.target.value)} placeholder="Enter SKU ID" />
              <Button variant="outline" onClick={addSku}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.items.map((i) => (
                <span key={i.product_sku_id} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                  SKU {i.product_sku_id}
                  <button type="button" onClick={() => removeSku(i.product_sku_id)} className="ml-0.5 hover:text-error-500">×</button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="combo-status" checked={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked }))} className="rounded" />
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
