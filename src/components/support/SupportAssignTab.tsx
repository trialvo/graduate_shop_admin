// src/components/support/SupportAssignTab.tsx — V2-038
// Reusable "Assign / Reassign" tab for Report and Contact Message distribution.
// Identical layout to OrderDistributionPage > AssignOrdersTab.

import { useState } from "react";
import { ClipboardList, ChevronRight, UserCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────── //

export type AssignableAdmin = {
  id: number;
  admin_name: string;
  role_name: string;
  active_count: number; // active_report_count | active_message_count
};

export type SupportAssignmentLog = {
  id: number;
  entity_id: number;
  action_type: "auto_assign" | "manual" | "redistribute" | "unassign";
  from_admin_name: string | null;
  to_admin_name:   string | null;
  changed_by_name: string | null;
  created_at: string;
};

type Props = {
  domain: "reports" | "contact";
  isSuperAdmin: boolean;
  currentAdminId: number; // self — for ADMIN scope
  admins: AssignableAdmin[];  // eligible admins the current user can assign to
  logs: SupportAssignmentLog[];
  logsLoading: boolean;
  isPending: boolean;
  onAssign: (entityId: number, adminId: number) => Promise<void>;
};

const ACTION_LABELS: Record<SupportAssignmentLog["action_type"], string> = {
  auto_assign: "Auto Assigned",
  manual:      "Manually Assigned",
  redistribute:"Redistributed",
  unassign:    "Unassigned",
};

const ACTION_COLORS: Record<SupportAssignmentLog["action_type"], string> = {
  auto_assign:  "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  manual:       "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
  redistribute: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  unassign:     "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

export default function SupportAssignTab({
  domain, isSuperAdmin, currentAdminId,
  admins, logs, logsLoading, isPending, onAssign,
}: Props) {
  const entityLabel = domain === "reports" ? "Report" : "Message";

  const [entityId, setEntityId]     = useState<string>("");
  const [targetAdmin, setTargetAdmin] = useState<number | null>(null);

  // ADMIN can only assign to ORDER_MANAGER (not SUPER_ADMIN)
  const eligibleForAssign = isSuperAdmin
    ? admins
    : admins.filter(a => a.role_name !== "SUPER_ADMIN");

  const handleAssign = async () => {
    const id = Number(entityId);
    if (!id || !targetAdmin) return;
    await onAssign(id, targetAdmin);
    setEntityId("");
    setTargetAdmin(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Manual Assignment Form ─────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <UserCheck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Manual Assignment</h3>
            <p className="text-xs text-gray-500">
              {isSuperAdmin
                ? `Assign or reassign a ${entityLabel.toLowerCase()} to any admin`
                : `Reassign a ${entityLabel.toLowerCase()} that is currently assigned to you`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Entity ID */}
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              {entityLabel} ID
            </label>
            <input
              type="number"
              min={1}
              value={entityId}
              onChange={e => setEntityId(e.target.value)}
              placeholder={`e.g. 42`}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          {/* Target Admin */}
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Assign To
            </label>
            <select
              value={targetAdmin ?? ""}
              onChange={e => setTargetAdmin(Number(e.target.value) || null)}
              className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">-- Select Admin --</option>
              {eligibleForAssign.map(a => (
                <option key={a.id} value={a.id}>
                  {a.admin_name} ({a.role_name.replace("_", " ")}) — {a.active_count} active
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={isPending || !entityId || !targetAdmin}
            onClick={handleAssign}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 text-sm font-semibold text-white shadow-sm hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 transition-all"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <ChevronRight size={15} />}
            Assign
          </button>
        </div>
      </div>

      {/* ── Assignment Logs ────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-500/10 text-slate-600">
              <ClipboardList size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Recent Assignment Log
              </h3>
              <p className="text-xs text-gray-500">Last 20 assignment actions</p>
            </div>
          </div>
        </div>

        {logsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-brand-500" size={24} />
          </div>
        ) : logs.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-400">No assignment logs yet</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map(log => (
              <div key={log.id} className="flex flex-wrap items-center gap-3 px-6 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", ACTION_COLORS[log.action_type])}>
                  {ACTION_LABELS[log.action_type]}
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {entityLabel} #{log.entity_id}
                </span>
                {log.from_admin_name && (
                  <span className="text-xs text-gray-500">
                    from <strong>{log.from_admin_name}</strong>
                  </span>
                )}
                {log.to_admin_name && (
                  <span className="text-xs text-gray-500">
                    → <strong>{log.to_admin_name}</strong>
                  </span>
                )}
                {log.changed_by_name && (
                  <span className="ml-auto text-xs text-gray-400">by {log.changed_by_name}</span>
                )}
                <span className="shrink-0 text-xs text-gray-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
