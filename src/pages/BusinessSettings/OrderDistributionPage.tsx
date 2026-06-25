import { useState, useRef, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Settings,
  ClipboardList,
  RefreshCw,
  CheckCircle2,
  Circle,
  ChevronRight,
  Shuffle,
  UserCheck,
  Loader2,
  Info,
  ShieldCheck,
  ListOrdered,
  Search,
  X,
  Package,
  Activity,
  ArrowRightLeft,
  TrendingUp,
  BarChart3,
  Clock,
} from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { useAuth } from "@/context/AuthProvider";
import {
  useDistributionSettings,
  useUpdateDistributionSettings,
  useEligibleAdmins,
  useUpsertAgentByAdminId,
  useRemoveAgent,
  useEditAgent,
  useRedistributeUnassigned,
} from "@/hooks/useOrderDistribution";
import {
  useAssignOrder,
  useAssignmentLogs,
  useAssignableOrders,
} from "@/hooks/useOrderAssignment";
import type { EligibleAdmin } from "@/api/order-distribution.api";
import { toPublicUrl } from "@/config/env";
import { imageFallbackSvgDataUri } from "@/utils/imageFallback";
import { cn } from "@/lib/utils";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";

// ─── Helpers ────────────────────────────────────────────────────────────────

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "A";
}

function Avatar({
  src,
  name,
  size = "md",
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
      ? "h-12 w-12 text-base"
      : "h-10 w-10 text-sm";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-100 to-brand-200 font-bold text-brand-600 dark:from-brand-500/20 dark:to-brand-600/20 dark:text-brand-300",
        sizeClass
      )}
    >
      {src ? (
        <img
          src={toPublicUrl(src) ?? undefined}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              imageFallbackSvgDataUri(name);
          }}
        />
      ) : (
        initials(name)
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colour =
    role === "ADMIN"
      ? "bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20"
      : role === "ORDER_MANAGER"
      ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20"
      : "bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        colour
      )}
    >
      {role.replace("_", " ")}
    </span>
  );
}

function StatPill({
  count,
  label,
  colour,
}: {
  count: number;
  label: string;
  colour: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold gap-1 border",
        colour
      )}
    >
      {count} {label}
    </span>
  );
}

// ─── Order status badge ────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  new: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
  approved:
    "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20",
  processing:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20",
  packaging:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
  on_hold:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  shipped:
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20",
  out_for_delivery:
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20",
  delivered:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/20",
  returned:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  cancelled:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  trash: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500 border-gray-200"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Tab types ───────────────────────────────────────────────────────────────

type Tab = "pool" | "assign" | "logs";

const TAB_OPTIONS: {
  label: string;
  value: Tab;
  icon: React.ReactNode;
}[] = [
  {
    label: "Pool & Settings",
    value: "pool",
    icon: <Settings size={14} />,
  },
  {
    label: "Assign Orders",
    value: "assign",
    icon: <UserCheck size={14} />,
  },
  {
    label: "Activity Log",
    value: "logs",
    icon: <Activity size={14} />,
  },
];

// ─── Summary Metric Card ─────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  colour,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  colour: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          colour
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Pool & Settings Tab ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function PoolSettingsTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { data: settingsRes, isLoading: settingsLoading } =
    useDistributionSettings();
  const { data: adminsRes, isLoading: adminsLoading } = useEligibleAdmins();
  const updateSettings = useUpdateDistributionSettings();
  const upsertAgent = useUpsertAgentByAdminId();
  const removeAgent = useRemoveAgent();
  const editAgent = useEditAgent();
  const redistribute = useRedistributeUnassigned();

  const settings = settingsRes?.data;
  const admins = adminsRes?.data ?? [];

  // Local edits for pool settings per admin
  const [editingPoolId, setEditingPoolId] = useState<number | null>(null);
  const [maxOrders, setMaxOrders] = useState<Record<number, string>>({});
  const [serialVal, setSerialVal] = useState<Record<number, string>>({});

  // Computed metrics
  const poolAdmins = admins.filter((a) => a.pool_id);
  const totalActiveOrders = admins.reduce(
    (sum, a) => sum + a.active_order_count,
    0
  );
  const todayAssigned = admins.reduce(
    (sum, a) => sum + a.today_assigned_count,
    0
  );
  const todayCompleted = admins.reduce(
    (sum, a) => sum + a.today_completed_count,
    0
  );

  const handleToggleInPool = async (admin: EligibleAdmin) => {
    if (!isSuperAdmin) return;
    if (admin.pool_id) {
      try {
        await removeAgent.mutateAsync(admin.pool_id);
        toast.success(`${admin.admin_name} removed from distribution pool`);
      } catch (e: any) {
        toast.error(e?.response?.data?.error ?? "Failed to remove from pool");
      }
    } else {
      try {
        await upsertAgent.mutateAsync({
          adminId: admin.id,
          body: { auto_assign_enabled: true, status: true },
        });
        toast.success(`${admin.admin_name} added to distribution pool`);
      } catch (e: any) {
        toast.error(e?.response?.data?.error ?? "Failed to add to pool");
      }
    }
  };

  const handleToggleAutoAssign = async (admin: EligibleAdmin) => {
    if (!admin.pool_id) return;
    try {
      await editAgent.mutateAsync({
        id: admin.pool_id,
        body: { auto_assign_enabled: !admin.pool_auto_assign },
      });
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to update");
    }
  };

  const handleSavePoolSettings = async (admin: EligibleAdmin) => {
    if (!admin.pool_id) return;
    const max = maxOrders[admin.id];
    const ser = serialVal[admin.id];
    try {
      await editAgent.mutateAsync({
        id: admin.pool_id,
        body: {
          ...(max !== undefined
            ? { max_active_orders: max ? Number(max) : null }
            : {}),
          ...(ser !== undefined ? { serial: Number(ser) || 1 } : {}),
        },
      });
      setEditingPoolId(null);
      toast.success("Pool settings saved");
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to save settings");
    }
  };

  const handleRedistribute = async () => {
    try {
      const res = await redistribute.mutateAsync();
      toast.success(res.message);
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Redistribute failed");
    }
  };

  const handleSettingsToggle = (
    key:
      | "auto_assign_enabled"
      | "assign_on_order_create"
      | "include_admin_role"
      | "include_order_manager_role",
    value: boolean
  ) => {
    updateSettings.mutate(
      { [key]: value },
      {
        onSuccess: () => toast.success("Settings updated"),
        onError: (e: any) =>
          toast.error(e?.response?.data?.error ?? "Failed"),
      }
    );
  };

  if (settingsLoading || adminsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Summary Metrics ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          icon={<Users size={18} className="text-brand-500" />}
          label="In Pool"
          value={poolAdmins.length}
          colour="bg-brand-50 dark:bg-brand-500/10"
        />
        <MetricCard
          icon={<Package size={18} className="text-orange-500" />}
          label="Active Orders"
          value={totalActiveOrders}
          colour="bg-orange-50 dark:bg-orange-500/10"
        />
        <MetricCard
          icon={<TrendingUp size={18} className="text-blue-500" />}
          label="Assigned Today"
          value={todayAssigned}
          colour="bg-blue-50 dark:bg-blue-500/10"
        />
        <MetricCard
          icon={<CheckCircle2 size={18} className="text-emerald-500" />}
          label="Completed Today"
          value={todayCompleted}
          colour="bg-emerald-50 dark:bg-emerald-500/10"
        />
      </div>

      {/* ── Global Settings Card ─────────────────────────────────────── */}
      {isSuperAdmin && (
        <section className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_6px_20px_-14px_rgba(16,24,40,0.14)] dark:bg-gray-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_24px_-14px_rgba(0,0,0,0.45)]">
          <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Settings size={16} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Distribution Settings
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Configure how orders are automatically distributed
                </p>
              </div>
            </div>
            <Button
              size="sm"
              startIcon={
                redistribute.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Shuffle size={13} />
                )
              }
              onClick={handleRedistribute}
              disabled={redistribute.isPending}
            >
              Redistribute
            </Button>
          </header>

          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  {
                    key: "auto_assign_enabled",
                    label: "Auto-Assign Enabled",
                    desc: "Automatically assign new orders to pool agents",
                  },
                  {
                    key: "assign_on_order_create",
                    label: "Assign On Order Create",
                    desc: "Trigger auto-assign immediately when a new order is placed",
                  },
                  {
                    key: "include_admin_role",
                    label: "Include Admin Role",
                    desc: "Allow admins (not just order managers) to be in the pool",
                  },
                  {
                    key: "include_order_manager_role",
                    label: "Include Order Managers",
                    desc: "Allow Order Manager role accounts to be in the pool",
                  },
                ] as const
              ).map(({ key, label, desc }) => {
                const val = settings?.[key] as boolean | undefined;
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 transition-all",
                      val
                        ? "border-brand-200 bg-brand-50/60 dark:border-brand-500/20 dark:bg-brand-500/5"
                        : "border-gray-200 bg-gray-50/60 dark:border-gray-700/60 dark:bg-gray-800/40"
                    )}
                  >
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          val
                            ? "text-brand-700 dark:text-brand-300"
                            : "text-gray-700 dark:text-gray-200"
                        )}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {desc}
                      </p>
                    </div>
                    <Switch
                      checked={!!val}
                      onChange={(checked) => handleSettingsToggle(key, checked)}
                      disabled={updateSettings.isPending}
                      size="sm"
                      color={val ? "brand" : "gray"}
                    />
                  </div>
                );
              })}
            </div>

            {/* Redistribute info */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50">
              <Info
                size={13}
                className="shrink-0 text-gray-400 dark:text-gray-500"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                "Redistribute" bulk assigns all unassigned active orders using
                the current pool configuration.
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ── Admin Pool Table ──────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_6px_20px_-14px_rgba(16,24,40,0.14)] dark:bg-gray-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_24px_-14px_rgba(0,0,0,0.45)]">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users size={16} />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Admin Pool
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {poolAdmins.length} of {admins.length} admins in pool
              </p>
            </div>
          </div>
        </header>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {admins.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users size={32} className="mb-2 opacity-30" />
              <p className="text-sm font-medium text-gray-500">
                No eligible admins found
              </p>
              <p className="text-xs text-gray-400">
                ADMIN or ORDER_MANAGER roles required
              </p>
            </div>
          )}
          {admins.map((admin) => {
            const inPool = !!admin.pool_id;
            const isEditing = editingPoolId === admin.id;

            return (
              <div
                key={admin.id}
                className={cn(
                  "px-5 py-4 transition-colors",
                  inPool
                    ? "bg-emerald-50/30 dark:bg-emerald-500/[0.03]"
                    : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  {/* Avatar + Name */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar
                      src={admin.profile_img_path}
                      name={admin.admin_name}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {admin.admin_name}
                        </p>
                        <RoleBadge role={admin.role_name} />
                        {inPool && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <ShieldCheck size={9} /> In Pool
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-gray-500">
                        {admin.email}
                      </p>
                    </div>
                  </div>

                  {/* Load Pills */}
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <StatPill
                      count={admin.active_order_count}
                      label="active"
                      colour="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20"
                    />
                    <StatPill
                      count={admin.today_assigned_count}
                      label="today"
                      colour="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20"
                    />
                    <StatPill
                      count={admin.today_completed_count}
                      label="done"
                      colour="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
                    />
                    <StatPill
                      count={admin.total_assigned_count}
                      label="total"
                      colour="bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600"
                    />
                  </div>

                  {/* Pool controls (only SUPER_ADMIN) */}
                  {isSuperAdmin && (
                    <div className="flex shrink-0 items-center gap-2">
                      {inPool && !isEditing && (
                        <>
                          {/* Auto-assign toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleAutoAssign(admin)}
                            title={
                              admin.pool_auto_assign
                                ? "Disable auto-assign"
                                : "Enable auto-assign"
                            }
                            className={cn(
                              "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all",
                              admin.pool_auto_assign
                                ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300"
                                : "border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            )}
                          >
                            <Shuffle size={11} />
                            {admin.pool_auto_assign ? "Auto On" : "Auto Off"}
                          </button>

                          {/* Edit settings */}
                          <Button
                            size="xs"
                            variant="outline"
                            startIcon={<ListOrdered size={11} />}
                            onClick={() => {
                              setEditingPoolId(admin.id);
                              setMaxOrders((p) => ({
                                ...p,
                                [admin.id]: String(
                                  admin.max_active_orders ?? ""
                                ),
                              }));
                              setSerialVal((p) => ({
                                ...p,
                                [admin.id]: String(admin.serial ?? 1),
                              }));
                            }}
                          >
                            Configure
                          </Button>
                        </>
                      )}

                      {inPool && isEditing && (
                        <div className="flex flex-col gap-2 rounded-xl border border-brand-200 bg-brand-50/60 p-3 dark:border-brand-500/20 dark:bg-brand-500/5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">
                            Configure Pool Settings
                          </p>
                          <div className="flex items-end gap-3">
                            {/* Priority / Serial */}
                            <div className="flex flex-col gap-1">
                              <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                                Priority (tie-breaker)
                                <span
                                  title="When two admins have equal load, the one with the lower priority number gets the next order. Set 1 for highest priority."
                                  className="cursor-help text-gray-400"
                                >
                                  ⓘ
                                </span>
                              </label>
                              <input
                                type="number"
                                min={1}
                                placeholder="e.g. 1"
                                value={serialVal[admin.id] ?? ""}
                                onChange={(e) =>
                                  setSerialVal((p) => ({
                                    ...p,
                                    [admin.id]: e.target.value,
                                  }))
                                }
                                title="Priority (Serial): Lower number = higher tie-break priority."
                                className="h-8 w-20 rounded-lg border border-gray-200 bg-white px-2 text-[12px] dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                              />
                            </div>

                            {/* Max active orders */}
                            <div className="flex flex-col gap-1">
                              <label className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                                Max active orders
                                <span
                                  title="Hard cap on how many unfinished orders this admin can hold at once. Leave blank for unlimited."
                                  className="cursor-help text-gray-400"
                                >
                                  ⓘ
                                </span>
                              </label>
                              <input
                                type="number"
                                min={0}
                                placeholder="Unlimited"
                                value={maxOrders[admin.id] ?? ""}
                                onChange={(e) =>
                                  setMaxOrders((p) => ({
                                    ...p,
                                    [admin.id]: e.target.value,
                                  }))
                                }
                                title="Max Active Orders: Admin is skipped in assignment once this many active orders are assigned."
                                className="h-8 w-24 rounded-lg border border-gray-200 bg-white px-2 text-[12px] dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 pb-0.5">
                              <Button
                                size="xs"
                                onClick={() => handleSavePoolSettings(admin)}
                              >
                                Save
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setEditingPoolId(null)}
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* In/Out pool toggle */}
                      <Button
                        size="xs"
                        variant={inPool ? "danger" : "success"}
                        disabled={
                          upsertAgent.isPending || removeAgent.isPending
                        }
                        onClick={() => handleToggleInPool(admin)}
                      >
                        {inPool ? "Remove" : "Add to Pool"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Assign Orders Tab ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function AssignOrdersTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { admin } = useAuth();
  const { data: adminsRes } = useEligibleAdmins();
  const { data: ordersRes, isLoading: ordersLoading } = useAssignableOrders();
  const assignOrderMut = useAssignOrder();

  // ── Picker state ─────────────────────────────────────────────────────────
  type PickedOrder = {
    id: number;
    label: string;
    status: string;
    assigned_to: string | null;
  };
  const [selectedOrder, setSelectedOrder] = useState<PickedOrder | null>(null);
  const [targetAdminId, setTargetAdminId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const eligibleForAssign = (adminsRes?.data ?? []).filter((a) => {
    if (!isSuperAdmin) return a.role_name === "ORDER_MANAGER";
    return true;
  });

  // Build the list of selectable orders from the API response
  const allOrders: PickedOrder[] = useMemo(() => {
    const rows = ordersRes?.data ?? [];
    return rows.map((o) => ({
      id: o.id,
      label: o.customer_name || o.customer_phone || `Order #${o.id}`,
      status: o.order_status,
      assigned_to: o.assigned_admin_name ?? null,
    }));
  }, [ordersRes]);

  // Filter by local search query
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allOrders.slice(0, 60);
    return allOrders
      .filter(
        (o) =>
          String(o.id).includes(q) ||
          o.label.toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q)
      )
      .slice(0, 60);
  }, [allOrders, search]);

  const handleAssign = async () => {
    if (!selectedOrder || !targetAdminId) {
      toast.error("Please select an order and an admin");
      return;
    }
    try {
      const res = await assignOrderMut.mutateAsync({
        order_id: selectedOrder.id,
        admin_id: targetAdminId,
      });
      toast.success(res.message);
      setSelectedOrder(null);
      setTargetAdminId(null);
      setSearch("");
      setShowPicker(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Assignment failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Manual Assignment Form ─────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_6px_20px_-14px_rgba(16,24,40,0.14)] dark:bg-gray-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_24px_-14px_rgba(0,0,0,0.45)]">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <ArrowRightLeft size={16} />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Manual Assignment
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isSuperAdmin
                  ? "Assign or reassign any order to a specific admin"
                  : "Reassign an order that is currently assigned to you"}
              </p>
            </div>
          </div>
        </header>

        <div className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* ── Order Picker ─────────────────────────────────────────── */}
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Order
              </label>

              <div className="relative">
                {/* Selected order chip */}
                {selectedOrder ? (
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-brand-400 bg-brand-50 pl-3 pr-2 dark:border-brand-500/50 dark:bg-brand-500/10">
                    <Package
                      size={13}
                      className="shrink-0 text-brand-500"
                    />
                    <span className="flex-1 truncate text-sm font-medium text-brand-700 dark:text-brand-300">
                      #{selectedOrder.id} — {selectedOrder.label}
                    </span>
                    <StatusBadge status={selectedOrder.status} />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrder(null);
                        setSearch("");
                      }}
                      className="shrink-0 rounded-full p-0.5 text-brand-500 hover:bg-brand-100 dark:hover:bg-brand-500/20"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPicker((v) => !v)}
                    className="flex h-10 w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-500 hover:border-brand-400 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  >
                    <Search
                      size={14}
                      className="shrink-0 text-gray-400"
                    />
                    <span className="flex-1 text-left">
                      {ordersLoading
                        ? "Loading orders…"
                        : "Search orders by ID or customer name…"}
                    </span>
                  </button>
                )}

                {/* Dropdown picker */}
                {showPicker && !selectedOrder && (
                  <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    {/* Search input */}
                    <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                      <div className="relative">
                        <Search
                          size={13}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          autoFocus
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search by order #ID, customer name or status…"
                          className="h-8 w-full rounded-lg bg-gray-50 pl-8 pr-3 text-xs text-gray-700 outline-none dark:bg-gray-800 dark:text-gray-200"
                        />
                      </div>
                    </div>

                    {/* Orders list */}
                    <div className="max-h-60 overflow-y-auto">
                      {ordersLoading ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-gray-400">
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />{" "}
                          Loading orders…
                        </div>
                      ) : filteredOrders.length === 0 ? (
                        <p className="px-4 py-6 text-center text-xs text-gray-400">
                          No orders found
                        </p>
                      ) : (
                        filteredOrders.map((order) => (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowPicker(false);
                              setSearch("");
                            }}
                            className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                          >
                            <span className="mt-0.5 flex h-5 w-14 shrink-0 items-center justify-center rounded-md bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                              #{order.id}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-gray-800 dark:text-white">
                                {order.label}
                              </p>
                              {order.assigned_to && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                                  Currently: {order.assigned_to}
                                </p>
                              )}
                            </div>
                            <StatusBadge status={order.status} />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Target Admin ─────────────────────────────────────────── */}
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Assign To
              </label>
              <select
                value={targetAdminId ?? ""}
                onChange={(e) =>
                  setTargetAdminId(Number(e.target.value) || null)
                }
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="">-- Select Admin --</option>
                {eligibleForAssign.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.admin_name} ({a.role_name.replace("_", " ")}) —{" "}
                    {a.active_order_count} active
                    {a.id === admin?.id ? " (you)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <Button
              disabled={
                assignOrderMut.isPending ||
                !selectedOrder ||
                !targetAdminId
              }
              onClick={handleAssign}
              isLoading={assignOrderMut.isPending}
              loadingText="Assigning…"
              startIcon={<ChevronRight size={15} />}
            >
              Assign
            </Button>
          </div>
        </div>
      </section>

      {/* ── Eligible Admins Quick Overview ─────────────────────────── */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_6px_20px_-14px_rgba(16,24,40,0.14)] dark:bg-gray-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_24px_-14px_rgba(0,0,0,0.45)]">
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <BarChart3 size={16} />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Admin Workload
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Current order load per agent
              </p>
            </div>
          </div>
        </header>

        <div className="p-5">
          {eligibleForAssign.length === 0 ? (
            <p className="text-center text-sm text-gray-400">
              No eligible admins available
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {eligibleForAssign.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors",
                    targetAdminId === a.id
                      ? "border-brand-400 bg-brand-50/60 dark:border-brand-500/40 dark:bg-brand-500/5"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800/40 dark:hover:border-gray-600",
                    "cursor-pointer"
                  )}
                  onClick={() => setTargetAdminId(a.id)}
                >
                  <Avatar
                    src={a.profile_img_path}
                    name={a.admin_name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800 dark:text-white">
                      {a.admin_name}
                      {a.id === admin?.id ? (
                        <span className="ml-1 text-brand-500">(you)</span>
                      ) : null}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                        {a.active_order_count} active
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">
                        ·
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {a.today_assigned_count} today
                      </span>
                    </div>
                  </div>
                  {targetAdminId === a.id && (
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-brand-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Activity Log Tab ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function ActivityLogTab() {
  const { data: logsRes, isLoading: logsLoading } = useAssignmentLogs({
    limit: 50,
  });
  const logs = logsRes?.data ?? [];

  const ACTION_LABELS: Record<string, string> = {
    auto_assign: "Auto Assigned",
    manual: "Manually Assigned",
    manual_assign: "Manually Assigned",
    redistribute: "Redistributed",
    unassign: "Unassigned",
  };
  const ACTION_COLORS: Record<string, string> = {
    auto_assign:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    manual:
      "bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20",
    manual_assign:
      "bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20",
    redistribute:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    unassign:
      "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  };

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_6px_20px_-14px_rgba(16,24,40,0.14)] dark:bg-gray-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_24px_-14px_rgba(0,0,0,0.45)]">
      <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400">
            <ClipboardList size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Assignment History
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last 50 assignment actions
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {logs.length} entries
        </span>
      </header>

      {logsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-brand-500" size={24} />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Clock size={32} className="mb-2 opacity-30" />
          <p className="text-sm font-medium text-gray-500">
            No assignment logs yet
          </p>
          <p className="text-xs text-gray-400">
            Logs will appear here when orders are assigned
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[680px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {[
                  "Action",
                  "Order",
                  "From",
                  "To",
                  "Changed By",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-brand-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  className={cn(
                    "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    i === logs.length - 1 && "border-b-0"
                  )}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        ACTION_COLORS[log.action_type] ??
                          "bg-gray-100 text-gray-500 border border-gray-200"
                      )}
                    >
                      {ACTION_LABELS[log.action_type] ?? log.action_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-md bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                      #{log.order_id}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {log.from_admin_name ?? (
                      <span className="text-gray-300 dark:text-gray-600">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-800 dark:text-gray-200">
                    {log.to_admin_name ?? (
                      <span className="text-gray-300 dark:text-gray-600">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {log.changed_by_name ?? (
                      <span className="text-gray-300 dark:text-gray-600">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Page ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function OrderDistributionPage() {
  const { hasRole } = useAuth();
  const isSuperAdmin = hasRole("SUPER_ADMIN");
  const isAdmin = hasRole("ADMIN");
  const canAccess = isSuperAdmin || isAdmin;

  const [activeTab, setActiveTab] = useState<Tab>("pool");

  // ── Animated sliding pill (same pattern as DiscountRulesPage) ────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const activeIndex = TAB_OPTIONS.findIndex((o) => o.value === activeTab);
    const btn = buttonRefs.current[activeIndex];
    const container = containerRef.current;
    if (!btn || !container) return;
    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setPillStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    });
  }, [activeTab]);

  if (!canAccess) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-gray-500">Access denied</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Order Distribution | Graduate Fashion Admin"
        description="Manage order distribution pool and manual assignment"
      />

      {/* ── Page Header (matches DiscountRulesPage) ─────────────────── */}
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Order Distribution
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage automated distribution settings, assign orders to admins, and
          track assignment history.
        </p>
      </div>

      {/* ── Animated Sliding Pill Tabs (matches DiscountRulesPage) ──── */}
      <div className="mb-6">
        <div
          ref={containerRef}
          className="relative inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800"
        >
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
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              type="button"
              onClick={() => setActiveTab(opt.value)}
              className={cn(
                "relative z-10 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold",
                "transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                activeTab === opt.value
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

      {/* ── Tab Content ─────────────────────────────────────────────── */}
      {activeTab === "pool" && (
        <PoolSettingsTab isSuperAdmin={isSuperAdmin} />
      )}
      {activeTab === "assign" && (
        <AssignOrdersTab isSuperAdmin={isSuperAdmin} />
      )}
      {activeTab === "logs" && <ActivityLogTab />}
    </>
  );
}
