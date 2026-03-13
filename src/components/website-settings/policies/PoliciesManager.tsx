import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, FileText, X, Check } from "lucide-react";
import { usePolicies, useSavePolicy, useDeletePolicy, usePolicyByKey } from "@/hooks/usePolicies";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";
import Modal from "@/components/ui/modal/Modal";

type PolicyForm = { key: string; title: string; content: string };

const EMPTY_FORM: PolicyForm = { key: "", title: "", content: "" };

export default function PoliciesManager() {
  const { data: policies = [], isLoading, isError } = usePolicies();
  const saveMutation = useSavePolicy();
  const deleteMutation = useDeletePolicy();

  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<PolicyForm>(EMPTY_FORM);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingKey(null);
    setEditorOpen(true);
  };

  const openEdit = (key: string, title: string, content = "") => {
    setForm({ key, title, content });
    setEditingKey(key);
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.key.trim() || !form.title.trim()) {
      toast.error("Key and title are required.");
      return;
    }
    setSaving(true);
    try {
      await saveMutation.mutateAsync(form);
      toast.success("Policy saved.");
      setEditorOpen(false);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteMutation.mutateAsync(confirmDelete);
      toast.success("Policy deleted.");
      setConfirmDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{policies.length} policies configured</p>
        <Button startIcon={<Plus size={15} />} onClick={openCreate}>Add Policy</Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">Loading policies...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-error-500">Failed to load policies.</p>
        ) : policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-10 text-gray-400">
            <FileText size={32} />
            <p className="text-sm">No policies yet. Create your first policy.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  {["Key", "Title", "Updated At", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.key} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{p.key}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{p.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p.key, p.title)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p.key)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <Modal
        open={editorOpen}
        title={editingKey ? "Edit Policy" : "Create Policy"}
        onClose={() => { setEditorOpen(false); setForm(EMPTY_FORM); }}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policy-key">Key (slug) <span className="text-error-500">*</span></Label>
              <Input
                id="policy-key"
                value={form.key}
                disabled={Boolean(editingKey)}
                onChange={(e) => setForm((f) => ({ ...f, key: String(e.target.value).toLowerCase().replace(/\s+/g, "_") }))}
                placeholder="return_policy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-title">Title <span className="text-error-500">*</span></Label>
              <Input
                id="policy-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: String(e.target.value) }))}
                placeholder="Return Policy"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="policy-content">Content (HTML)</Label>
            <textarea
              id="policy-content"
              rows={10}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="<p>Policy content here...</p>"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-200"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setEditorOpen(false); setForm(EMPTY_FORM); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Policy"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Policy"
        message={`Delete policy "${confirmDelete}"? This cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        tone="danger"
        onClose={() => !deleting && setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
