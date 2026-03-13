import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Settings2, Users2 } from "lucide-react";
import {
  useDistributionSettings, useUpdateDistributionSettings,
  useDeliveryAgents, useAddAgent, useEditAgent, useRemoveAgent,
} from "@/hooks/useOrderDistribution";
import type { AgentPayload, DistributionSettings } from "@/api/order-distribution.api";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Modal from "@/components/ui/modal/Modal";
import ConfirmDialog from "@/components/ui/modal/ConfirmDialog";

function StatusBadge({ on }: { on: boolean }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${on ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>{on ? "Active" : "Inactive"}</span>;
}

export default function OrderDistributionPage() {
  // Settings
  const { data: settings, isLoading: settingsLoading } = useDistributionSettings();
  const updateSettings = useUpdateDistributionSettings();
  const [localSettings, setLocalSettings] = useState<DistributionSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const effectiveSettings = localSettings ?? settings;

  const handleSaveSettings = async () => {
    if (!effectiveSettings) return;
    setSavingSettings(true);
    try {
      await updateSettings.mutateAsync(effectiveSettings);
      toast.success("Distribution settings saved.");
      setLocalSettings(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Agents
  const { data: agents = [], isLoading: agentsLoading } = useDeliveryAgents();
  const addAgent = useAddAgent();
  const editAgent = useEditAgent();
  const removeAgent = useRemoveAgent();

  const [agentModal, setAgentModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [agentForm, setAgentForm] = useState<AgentPayload>({ name: "", phone: "", max_orders: 10 });
  const [savingAgent, setSavingAgent] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const openCreate = () => { setEditId(null); setAgentForm({ name: "", phone: "", max_orders: 10 }); setAgentModal(true); };
  const openEdit = (a: typeof agents[0]) => { setEditId(a.id); setAgentForm({ name: a.name, phone: a.phone, max_orders: a.max_orders }); setAgentModal(true); };

  const handleSaveAgent = async () => {
    if (!agentForm.name.trim() || !agentForm.phone.trim()) { toast.error("Name and phone are required."); return; }
    setSavingAgent(true);
    try {
      if (editId) { await editAgent.mutateAsync({ id: editId, body: agentForm }); toast.success("Agent updated."); }
      else { await addAgent.mutateAsync(agentForm); toast.success("Agent added."); }
      setAgentModal(false);
    } catch (err: any) { toast.error(err?.response?.data?.error || "Failed."); }
    finally { setSavingAgent(false); }
  };

  const handleDeleteAgent = async () => {
    if (!confirmDeleteId) return;
    try { await removeAgent.mutateAsync(confirmDeleteId); toast.success("Removed."); setConfirmDeleteId(null); }
    catch (err: any) { toast.error(err?.response?.data?.error || "Failed."); }
  };

  return (
    <>
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Distribution</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure auto-assignment mode and manage delivery agents.</p>
      </div>

      {/* Settings Card */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 mb-6">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <Settings2 size={18} className="text-brand-500" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Distribution Settings</p>
        </div>
        <div className="p-5">
          {settingsLoading ? <p className="text-sm text-gray-400">Loading...</p> : effectiveSettings ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Mode</Label>
                <select value={effectiveSettings.mode} onChange={(e) => setLocalSettings({ ...effectiveSettings, mode: e.target.value as "manual" | "auto" })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
                  <option value="manual">Manual</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Max Orders Per Agent</Label>
                <Input type="number" value={effectiveSettings.max_orders_per_agent}
                  onChange={(e) => setLocalSettings({ ...effectiveSettings, max_orders_per_agent: Number(e.target.value) })} />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="auto-assign" checked={effectiveSettings.auto_assign}
                    onChange={(e) => setLocalSettings({ ...effectiveSettings, auto_assign: e.target.checked })} className="rounded" />
                  <Label htmlFor="auto-assign">Enable Auto-Assign</Label>
                </div>
              </div>
            </div>
          ) : null}
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveSettings} disabled={savingSettings || !localSettings}>{savingSettings ? "Saving..." : "Save Settings"}</Button>
          </div>
        </div>
      </div>

      {/* Agents */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Users2 size={18} className="text-brand-500" />
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Delivery Agents</p>
          </div>
          <Button startIcon={<Plus size={14} />} onClick={openCreate}>Add Agent</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {["Name", "Phone", "Max Orders", "Active Orders", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agentsLoading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">Loading...</td></tr>
                : agents.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No agents yet.</td></tr>
                : agents.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.phone}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.max_orders}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.active_order_count}</td>
                    <td className="px-4 py-3"><StatusBadge on={a.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(a)} className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300"><Pencil size={13} /></button>
                        <button onClick={() => setConfirmDeleteId(a.id)} className="h-7 w-7 flex items-center justify-center rounded border border-error-200 text-error-600 hover:bg-error-50"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={agentModal} title={editId ? "Edit Agent" : "Add Agent"} onClose={() => setAgentModal(false)} size="sm">
        <div className="space-y-4">
          <div className="space-y-2"><Label>Name *</Label><Input value={agentForm.name} onChange={(e) => setAgentForm((f) => ({ ...f, name: String(e.target.value) }))} placeholder="Agent name" /></div>
          <div className="space-y-2"><Label>Phone *</Label><Input value={agentForm.phone} onChange={(e) => setAgentForm((f) => ({ ...f, phone: String(e.target.value) }))} placeholder="01xxxxxxxxx" /></div>
          <div className="space-y-2"><Label>Max Orders</Label><Input type="number" value={agentForm.max_orders} onChange={(e) => setAgentForm((f) => ({ ...f, max_orders: Number(e.target.value) }))} /></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setAgentModal(false)}>Cancel</Button>
            <Button onClick={handleSaveAgent} disabled={savingAgent}>{savingAgent ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirmDeleteId)} title="Remove Agent" message="Remove this delivery agent?" confirmText="Remove" cancelText="Cancel" tone="danger" onClose={() => setConfirmDeleteId(null)} onConfirm={handleDeleteAgent} />
    </>
  );
}
