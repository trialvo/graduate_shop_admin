import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertTriangle, Bell, BellRing, KeyRound, Lock,
  Mail, MessageSquare, Percent, Save, Settings2,
  ShoppingCart, Smartphone, Zap,
} from "lucide-react";
import PageMeta from "@/components/common/PageMeta";
import { usePermissionConfig, usePatchPermissionConfig } from "@/hooks/usePermissions";
import { useFirebaseCredential } from "@/hooks/useFirebaseConfig";
import {
  useAllAdminNotificationPermissions,
  useSetAdminNotificationPermissions,
} from "@/hooks/useNotificationPermissions";
import { toPublicUrl } from "@/config/env";
import type { AdminNotificationPermission, SetNotificationPermissionsPayload } from "@/api/notification-permissions.api";

// ─── helpers ─────────────────────────────────────────────────────────────── //
type PermRow = AdminNotificationPermission & { dirty: boolean };

function initials(name: string | null | undefined) {
  const p = (name ?? "").trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "A";
}

// ─── Rich metadata derived from PermissionSettingsDB.js ──────────────────── //

/** Display order for sections (top → bottom) */
const SECTION_ORDER = [
  "forgot_pass_method",
  "forget_pass_method_admin",
  "order_place_permission",
  "order_status_notification_user",
  "order__notification_admin",
  "personal_notification_admin",
  "overall_cart_discount",
  "storefront_visibility",
  "announcement",
];

type SectionMeta = {
  label: string;
  description: string;
  icon: React.ReactNode;
};
const SECTION_META: Record<string, SectionMeta> = {
  forgot_pass_method: {
    label: "Forgot Password — Customer",
    description: "How customers can reset their password.",
    icon: <KeyRound size={15} />,
  },
  forget_pass_method_admin: {
    label: "Forgot Password — Admin",
    description: "How admin accounts can reset their password.",
    icon: <Lock size={15} />,
  },
  order_place_permission: {
    label: "Order Placement Requirements",
    description: "Verification requirements before a customer can place an order.",
    icon: <ShoppingCart size={15} />,
  },
  order_status_notification_user: {
    label: "Order Notifications → Customer",
    description: "Channels used to notify customers about order status changes.",
    icon: <BellRing size={15} />,
  },
  order__notification_admin: {
    label: "Order Notifications → Admin",
    description: "Channels used to alert admins when new orders arrive or change status.",
    icon: <Bell size={15} />,
  },
  personal_notification_admin: {
    label: "Personal Notifications → Admin",
    description: "Channels for personal/account-level notifications sent to admins.",
    icon: <MessageSquare size={15} />,
  },
  overall_cart_discount: {
    label: "Cart-Wide Discount",
    description: "Automatic discount applied to the entire cart based on configurable rules.",
    icon: <Percent size={15} />,
  },
  storefront_visibility: {
    label: "Storefront Visibility",
    description: "Control whether optional storefront pages are visible to users.",
    icon: <Settings2 size={15} />,
  },
  announcement: {
    label: "Announcements",
    description: "System behaviour for scheduled and automated announcements.",
    icon: <Zap size={15} />,
  },
};

type KeyMeta = { label: string; description: string };
const KEY_META: Record<string, KeyMeta> = {
  email: { label: "Email", description: "Use email as a delivery channel." },
  sms: { label: "SMS", description: "Use SMS as a delivery channel." },
  firebase_push_notification: { label: "Firebase Push", description: "Use Firebase Cloud Messaging for push notifications." },
  email_verified: { label: "Require Email Verified", description: "Customer must have a verified email address before placing an order." },
  phone_verified_mode: { label: "Phone Verification Mode", description: "Which phone number(s) must be verified to complete an order." },
  is_email_required: { label: "Email Required", description: "Guest must provide an email address at checkout." },
  is_email_verification_required: { label: "Email Verification Required", description: "Guest must verify their email before the order is accepted. Requires 'Email Required' to be on." },
  is_phone_verification_required: { label: "Phone Verification Required", description: "Guest must verify their phone number before placing an order." },
  is_enabled: { label: "Enable Discount", description: "Turn the cart-wide discount on or off globally." },
  min_item_count: { label: "Min Item Count", description: "Minimum number of cart items required for the discount to apply. Set to 0 to disable." },
  min_total_selling_price: { label: "Min Cart Total (৳)", description: "Minimum cart subtotal (selling price) the customer must reach. Set to 0 to disable." },
  discount_type: { label: "Discount Type", description: "Whether the discount is a fixed amount or a percentage of the cart total." },
  discount_value: { label: "Discount Value", description: "The discount amount — flat (৳) or percentage (%) depending on Discount Type." },
  basis: { label: "Apply Based On", description: "Which threshold triggers the discount — item count or cart total price." },
  apply_with_bulk_combo: { label: "Stack With Bulk / Combo Offers", description: "When enabled, this discount applies on top of existing bulk or combo deals." },
  show_megasale: { label: "Show Mega Sale", description: "When enabled, the storefront displays the Mega Sale page and quick links." },
  megasale_campaign_end_at: { label: "Campaign End Time", description: "Set the main Mega Sale countdown date and time." },
  megasale_product_end_at: { label: "Product Timer End Time", description: "Set the product card countdown date and time." },
  megasale_product_timers: {
    label: "Product-wise Timers",
    description: "One per line: productId=YYYY-MM-DDTHH:mm (example: 12=2026-04-05T23:59).",
  },
  megasale_product_ids: { label: "Mega Sale Product IDs (CSV)", description: "Comma-separated product IDs to prioritize/show in Mega Sale. Example: 12,45,78" },
  megasale_product_limit: { label: "Mega Sale Product Limit", description: "Maximum number of products shown on Mega Sale page." },
  auto_send_scheduled_announcement: { label: "Auto-Send Scheduled Announcements", description: "When enabled, the system automatically sends scheduled announcements at their configured time without manual admin action." },
};

const SCOPE_LABELS: Record<string, string> = {
  default: "",
  regular: "Registered Customer Order",
  guest: "Guest Order",
  admin_manual: "Admin-Created Manual Order",
  single_page: "Single-Page Checkout Order",
};

// Human-readable labels for enum option values
const ENUM_OPTION_LABELS: Record<string, string> = {
  // phone_verified_mode
  address_phone_verified: "Shipping Address Phone Verified",
  default_phone_verified: "Account Default Phone Verified",
  both: "Both Phones Verified",
  no_phone_verification_needed: "No Verification Required",
  // discount_type
  flat: "Flat Amount (৳)",
  percentage: "Percentage (%)",
  // basis
  item_count: "Item Count",
  total_selling_price: "Cart Total Price",
};

// Channel icons for notification-type keys
const KEY_ICON: Record<string, React.ReactNode> = {
  email: <Mail size={13} />,
  sms: <Smartphone size={13} />,
  firebase_push_notification: <Bell size={13} />,
};

const MEGASALE_DATE_KEYS = new Set(["megasale_campaign_end_at", "megasale_product_end_at"]);
const MEGASALE_IDS_KEY = "megasale_product_ids";
const MEGASALE_LIMIT_KEY = "megasale_product_limit";
const MEGASALE_TIMERS_KEY = "megasale_product_timers";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateTimeLocalValue(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function toIsoWithOffset(localValue: string): string {
  const trimmed = localValue.trim();
  if (!trimmed) return "";
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return "";

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const offsetHours = pad2(Math.floor(abs / 60));
  const offsetMins = pad2(abs % 60);

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:00${sign}${offsetHours}:${offsetMins}`;
}

function normalizeMegaSaleIds(value: string): string {
  const ids = value
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((id) => Number.isFinite(id) && id > 0);
  return Array.from(new Set(ids)).join(",");
}

function normalizeMegaSaleProductTimers(value: string): string {
  const timerMap = new Map<number, string>();
  const entries = value
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const entry of entries) {
    let pair = entry.split("=");
    if (pair.length < 2) pair = entry.split("|");
    if (pair.length < 2) continue;

    const productId = Number.parseInt((pair[0] || "").trim(), 10);
    if (!Number.isFinite(productId) || productId <= 0) continue;

    const dateRaw = pair.slice(1).join("=").trim();
    const date = new Date(dateRaw);
    if (Number.isNaN(date.getTime())) continue;

    const localValue = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    const isoValue = toIsoWithOffset(localValue);
    if (!isoValue) continue;

    timerMap.set(productId, isoValue);
  }

  return Array.from(timerMap.entries())
    .map(([productId, isoValue]) => `${productId}=${isoValue}`)
    .join(",");
}

function toMegaSaleTimersTextAreaValue(value: string): string {
  if (!value.trim()) return "";
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n");
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) return fallback;
  const err = error as {
    response?: { data?: { error?: unknown; message?: unknown } };
    message?: unknown;
  };
  const apiError = err.response?.data?.error;
  if (typeof apiError === "string" && apiError.trim()) return apiError.trim();
  const apiMessage = err.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) return apiMessage.trim();
  if (typeof err.message === "string" && err.message.trim()) return err.message.trim();
  return fallback;
}


// ─── SystemPermissionsPanel ───────────────────────────────────────────────── //

// Flatten the nested data object into a renderable list of { section, scope, key, value, valueType, enumValues }
type FlatRow = {
  section: string;
  scope: string;   // "default" or a named scope like "regular"
  key: string;
  value: unknown;
};

function flattenPermissionData(data: Record<string, Record<string, unknown>>): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const [section, sectionVal] of Object.entries(data ?? {})) {
    if (sectionVal == null || typeof sectionVal !== "object") continue;
    for (const [scopeOrKey, val] of Object.entries(sectionVal)) {
      if (val !== null && typeof val === "object" && !Array.isArray(val)) {
        // scoped section: { section: { scope: { key: value } } }
        for (const [key, v] of Object.entries(val as Record<string, unknown>)) {
          rows.push({ section, scope: scopeOrKey, key, value: v });
        }
      } else {
        // default scope section: { section: { key: value } }
        rows.push({ section, scope: "default", key: scopeOrKey, value: val });
      }
    }
  }
  return rows;
}

type FlatRowGrouped = { sectionMeta: SectionMeta | null; section: string; scopeLabel: string; groupKey: string; rows: FlatRow[] };

function groupFlatRows(rows: FlatRow[]): FlatRowGrouped[] {
  const map = new Map<string, FlatRow[]>();
  for (const row of rows) {
    const key = `${row.section}||${row.scope}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  const groups = Array.from(map.entries()).map(([groupKey, rows]) => {
    const [section, scope] = groupKey.split("||");
    return {
      groupKey,
      section,
      sectionMeta: SECTION_META[section] ?? null,
      scopeLabel: scope === "default" ? "" : (SCOPE_LABELS[scope] ?? scope.replace(/_/g, " ")),
      rows,
    };
  });
  // Sort by SECTION_ORDER, then alphabetically for unknowns
  groups.sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.section);
    const bi = SECTION_ORDER.indexOf(b.section);
    if (ai === -1 && bi === -1) return a.section.localeCompare(b.section);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return groups;
}


// Actually we can infer type from the JS value since backend parsed it
function inferType(val: unknown): "bool" | "enum" | "number" | "string" {
  if (typeof val === "boolean") return "bool";
  if (typeof val === "number") return "number";
  return "string";
}

function SystemPermissionsPanel({
  onDirtyChange,
  saveRef,
}: {
  onDirtyChange?: (dirty: boolean) => void;
  saveRef?: React.MutableRefObject<((opts?: { onSuccess?: () => void }) => void) | null>;
}) {
  const { data, isLoading, isError } = usePermissionConfig();
  const patchMutation = usePatchPermissionConfig();

  // edits: "section||scope||key" -> new JS value (boolean | number | string)
  const [edits, setEdits] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const eKey = (r: FlatRow) => `${r.section}||${r.scope}||${r.key}`;

  const handleChange = useCallback((r: FlatRow, val: unknown) => {
    setEdits((e) => ({ ...e, [eKey(r)]: val }));
  }, []);

  const handleSave = useCallback(async (opts?: { onSuccess?: () => void }) => {
    setSaving(true);
    const payload: Record<string, Record<string, unknown>> = {};
    for (const [k, val] of Object.entries(edits)) {
      const [section, scope, key] = k.split("||");
      if (!payload[section]) payload[section] = {};
      if (scope === "default") {
        payload[section][key] = val;
      } else {
        if (!payload[section][scope] || typeof payload[section][scope] !== "object") {
          payload[section][scope] = {};
        }
        (payload[section][scope] as Record<string, unknown>)[key] = val;
      }
    }
    try {
      await patchMutation.mutateAsync(payload);
      setEdits({});
      toast.success("System permissions saved.");
      opts?.onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save."));
    } finally {
      setSaving(false);
    }
  }, [edits, patchMutation]);

  // Notify parent whenever dirty state changes
  useEffect(() => {
    onDirtyChange?.(Object.keys(edits).length > 0);
  }, [edits, onDirtyChange]);

  // Keep saveRef current so parent can call it from the modal
  useEffect(() => {
    if (saveRef) saveRef.current = handleSave;
  }, [saveRef, handleSave]);

  // ── Early returns AFTER all hooks ──────────────────────────────────────── //
  if (isLoading)
    return <p className="text-sm text-gray-500 p-4">Loading system permissions…</p>;
  if (isError || !data?.data)
    return <p className="text-sm text-error-500 p-4">Failed to load permission config.</p>;

  const flat = flattenPermissionData(data.data);
  const groups = groupFlatRows(flat);
  const hasChanges = Object.keys(edits).length > 0;
  const currentVal = (r: FlatRow) => eKey(r) in edits ? edits[eKey(r)] : r.value;


  return (
    <div className="space-y-5">
      {groups.map(({ groupKey, section, sectionMeta, scopeLabel, rows }) => (
        <div key={groupKey} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Section header */}
          <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/40">
            {sectionMeta && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                {sectionMeta.icon}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {sectionMeta?.label ?? section.replace(/_/g, " ")}
                {scopeLabel && (
                  <span className="ml-2 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:border-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    {scopeLabel}
                  </span>
                )}
              </p>
              {sectionMeta?.description && (
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sectionMeta.description}</p>
              )}
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((row) => {
              const val = currentVal(row);
              const isDirty = eKey(row) in edits;
              const valType = inferType(row.value);
              const keyMeta = KEY_META[row.key];
              const channelIcon = KEY_ICON[row.key];

              return (
                <div key={row.key} className={`flex items-center justify-between px-5 py-3.5 gap-4 transition-colors ${isDirty ? "bg-amber-50/40 dark:bg-amber-500/5" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {channelIcon && <span className="text-gray-400 dark:text-gray-500">{channelIcon}</span>}
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {keyMeta?.label ?? row.key.replace(/_/g, " ")}
                      </p>
                      {isDirty && (
                        <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                          unsaved
                        </span>
                      )}
                    </div>
                    {keyMeta?.description && (
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 leading-snug">
                        {keyMeta.description}
                      </p>
                    )}
                  </div>

                  {/* Bool toggle */}
                  {valType === "bool" && (
                    <button type="button"
                      onClick={() => handleChange(row, !val)}
                      title={val ? "Enabled — click to disable" : "Disabled — click to enable"}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        val ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        val ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </button>
                  )}

                  {/* Number input */}
                  {valType === "number" && (
                    <input
                      type="number"
                      min={row.key === MEGASALE_LIMIT_KEY ? 1 : 0}
                      max={row.key === MEGASALE_LIMIT_KEY ? 24 : undefined}
                      value={String(val)}
                      onChange={(e) => handleChange(row, Number(e.target.value))}
                      className="w-28 shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-right dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                  )}

                  {/* String / enum — rendered as select if we know the enum values from the DB */}
                  {valType === "string" && (() => {
                    // Known enum options derived from PermissionSettingsDB
                    const KNOWN_ENUMS: Record<string, string[]> = {
                      phone_verified_mode: ["address_phone_verified", "default_phone_verified", "both", "no_phone_verification_needed"],
                      discount_type: ["flat", "percentage"],
                      basis: ["item_count", "total_selling_price"],
                    };
                    const opts = KNOWN_ENUMS[row.key];
                    if (opts) {
                      return (
                        <select value={String(val)}
                          onChange={(e) => handleChange(row, e.target.value)}
                          className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                          {opts.map((o) => (
                            <option key={o} value={o}>
                              {ENUM_OPTION_LABELS[o] ?? o.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      );
                    }

                    const isMegaSaleDateKey = MEGASALE_DATE_KEYS.has(row.key);
                    const isMegaSaleIdsKey = row.key === MEGASALE_IDS_KEY;
                    const isMegaSaleTimersKey = row.key === MEGASALE_TIMERS_KEY;

                    const inputValue = typeof val === "string" ? val : String(val ?? "");
                    const dateValue = isMegaSaleDateKey ? toDateTimeLocalValue(inputValue) : "";
                    const placeholder = isMegaSaleDateKey
                      ? "Select date and time"
                      : isMegaSaleIdsKey
                        ? "12,45,78"
                        : isMegaSaleTimersKey
                          ? "12=2026-04-05T23:59"
                        : undefined;

                    if (isMegaSaleDateKey) {
                      return (
                        <input
                          type="datetime-local"
                          value={dateValue}
                          onChange={(e) => {
                            const normalized = toIsoWithOffset(e.target.value);
                            handleChange(row, normalized);
                          }}
                          className="w-56 shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      );
                    }

                    if (isMegaSaleTimersKey) {
                      return (
                        <textarea
                          rows={3}
                          value={toMegaSaleTimersTextAreaValue(inputValue)}
                          placeholder={placeholder}
                          onChange={(e) => handleChange(row, e.target.value)}
                          onBlur={(e) => {
                            handleChange(row, normalizeMegaSaleProductTimers(e.target.value));
                          }}
                          className="w-72 shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      );
                    }

                    return (
                      <input
                        type="text"
                        value={inputValue}
                        placeholder={placeholder}
                        onChange={(e) => {
                          const next = isMegaSaleIdsKey
                            ? e.target.value.replace(/[^\d,\s]/g, "")
                            : e.target.value;
                          handleChange(row, next);
                        }}
                        onBlur={(e) => {
                          if (isMegaSaleIdsKey) {
                            handleChange(row, normalizeMegaSaleIds(e.target.value));
                            return;
                          }
                        }}
                        className="w-56 shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 flex justify-end">
        <button type="button" onClick={() => handleSave()} disabled={!hasChanges || saving}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow transition-colors ${
            hasChanges && !saving
              ? "bg-brand-500 text-white hover:bg-brand-600"
              : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
          }`}>
          <Save size={15} />
          {saving ? "Saving…" : "Save System Permissions"}
        </button>
      </div>
    </div>
  );
}

// ─── AdminNotifPermissionsPanel ───────────────────────────────────────────── //
function AdminNotifPermissionsPanel() {
  const { data, isLoading, isError } = useAllAdminNotificationPermissions();
  const setPermsMutation = useSetAdminNotificationPermissions();
  // Firebase credential status to reflect push availability
  const { data: firebaseCred, isLoading: fbLoading } = useFirebaseCredential();
  const firebaseActive = !fbLoading && !!firebaseCred?.is_active;
  const firebaseConfigured = !fbLoading && !!firebaseCred;
  // System-level channel flags from getPermissionConfig
  const { data: sysConfig } = usePermissionConfig();

  const [rows, setRows] = useState<PermRow[]>([]);
  const [saving, setSaving] = useState<Record<number, boolean>>({});

  // sync
  useState(() => {
    if (!data?.data) return;
    setRows(data.data.map((p) => ({ ...p, dirty: false })));
  });

  if (isLoading)
    return <p className="text-sm text-gray-500 p-4">Loading admin permissions…</p>;
  if (isError || !data)
    return <p className="text-sm text-error-500 p-4">Failed to load admin permissions.</p>;

  const perms = data.data;
  if (perms.length === 0)
    return <p className="text-sm text-gray-500 p-4">No active admins found.</p>;

  // Extract system-level channel on/off from permission config
  // sysConfig.data shape: { order__notification_admin: { email, sms, firebase_push_notification }, personal_notification_admin: { ... } }
  const sysData = sysConfig?.data as Record<string, Record<string, unknown>> | undefined;
  const orderSys = (sysData?.["order__notification_admin"] ?? {}) as Record<string, unknown>;
  const personalSys = (sysData?.["personal_notification_admin"] ?? {}) as Record<string, unknown>;

  // true = channel is globally ON (or unknown—default open)
  const sysOn = {
    order_email:    sysData ? !!orderSys["email"]    : true,
    order_sms:      sysData ? !!orderSys["sms"]      : true,
    order_push:     sysData ? !!orderSys["firebase_push_notification"] : true,
    personal_email: sysData ? !!personalSys["email"] : true,
    personal_sms:   sysData ? !!personalSys["sms"]   : true,
    personal_push:  sysData ? !!personalSys["firebase_push_notification"] : true,
  };

  // Map admin notification keys to their system channel flag
  const systemChannel: Record<string, boolean> = {
    order_notification_email:             sysOn.order_email,
    order_notification_sms:               sysOn.order_sms,
    order_notification_firebase_push:     sysOn.order_push,
    personal_notification_email:          sysOn.personal_email,
    personal_notification_sms:            sysOn.personal_sms,
    personal_notification_firebase_push:  sysOn.personal_push,
  };

  const toggle = (admin_id: number, key: keyof SetNotificationPermissionsPayload) => {
    setRows((prev) =>
      prev.map((r) => (r.admin_id === admin_id ? { ...r, [key]: !r[key], dirty: true } : r))
    );
  };

  const saveRow = async (row: PermRow) => {
    setSaving((s) => ({ ...s, [row.admin_id]: true }));
    try {
      const payload: SetNotificationPermissionsPayload = {
        order_notification_email: row.order_notification_email,
        order_notification_sms: row.order_notification_sms,
        order_notification_firebase_push: row.order_notification_firebase_push,
        personal_notification_email: row.personal_notification_email,
        personal_notification_sms: row.personal_notification_sms,
        personal_notification_firebase_push: row.personal_notification_firebase_push,
      };
      await setPermsMutation.mutateAsync({ admin_id: row.admin_id, payload });
      setRows((prev) => prev.map((r) => (r.admin_id === row.admin_id ? { ...r, dirty: false } : r)));
      toast.success(`Permissions saved for ${row.admin_name ?? "admin"}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save."));
    } finally {
      setSaving((s) => ({ ...s, [row.admin_id]: false }));
    }
  };

  const rowsState: PermRow[] =
    rows.length === perms.length ? rows : perms.map((p) => ({ ...p, dirty: false }));

  // Helper: toggle colour for a given key + value
  const toggleColour = (key: string, on: boolean) => {
    const isPush = key.includes("firebase_push");
    const sysOff = !systemChannel[key];
    const fbOff = isPush && !firebaseActive;
    if (sysOff || fbOff) return on ? "bg-orange-400" : "bg-gray-200 dark:bg-gray-700";
    return on ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700";
  };

  const toggleTitle = (key: string): string | undefined => {
    const isPush = key.includes("firebase_push");
    if (!systemChannel[key])   return "This channel is globally disabled in System Settings";
    if (isPush && !firebaseActive) return "Firebase is inactive — push won't be sent";
    return undefined;
  };

  // Column-level warning: system off OR (push and firebase off)
  const colWarning = (label: string, i: number): boolean => {
    if (i === 0) return !sysOn.order_email;
    if (i === 1) return !sysOn.order_sms;
    if (i === 2) return !sysOn.order_push || !firebaseActive;
    if (i === 3) return !sysOn.personal_email;
    if (i === 4) return !sysOn.personal_sms;
    if (i === 5) return !sysOn.personal_push || !firebaseActive;
    return false;
  };

  // Global channel status card rows
  type ChanStatus = { label: string; orderOn: boolean; personalOn: boolean; isPush?: boolean };
  const channelRows: ChanStatus[] = [
    { label: "Email",        orderOn: sysOn.order_email,  personalOn: sysOn.personal_email },
    { label: "SMS",          orderOn: sysOn.order_sms,    personalOn: sysOn.personal_sms },
    { label: "Firebase Push",orderOn: sysOn.order_push,   personalOn: sysOn.personal_push, isPush: true },
  ];

  return (
    <div className="space-y-3">
      {/* Global channel status card */}
      {sysData && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/40">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Bell size={14} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Global Channel Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                System-level channel on/off from{" "}
                <button type="button" className="underline hover:no-underline"
                  onClick={() => {/* could switch to system tab */}}>
                  System Settings
                </button>
                . Per-admin toggles only apply when the global channel is active.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-2 text-left font-medium text-gray-500 dark:text-gray-400 w-32">Channel</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-500 dark:text-gray-400">Order Notifications</th>
                  <th className="px-4 py-2 text-center font-medium text-gray-500 dark:text-gray-400">Personal Notifications</th>
                </tr>
              </thead>
              <tbody>
                {channelRows.map(({ label, orderOn, personalOn, isPush }) => {
                  const effectiveOrderOn = isPush ? orderOn && firebaseActive : orderOn;
                  const effectivePersonalOn = isPush ? personalOn && firebaseActive : personalOn;
                  const chip = (on: boolean, fbIssue?: boolean) => (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      on
                        ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
                        : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-success-500" : "bg-error-400"}`} />
                      {on ? "Active" : fbIssue ? "Firebase inactive" : "Disabled"}
                    </span>
                  );
                  return (
                    <tr key={label} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {isPush ? <Bell size={11} className="text-gray-400" /> :
                           label === "Email" ? <Mail size={11} className="text-gray-400" /> :
                           <Smartphone size={11} className="text-gray-400" />}
                          <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {chip(effectiveOrderOn, isPush && orderOn && !firebaseActive)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {chip(effectivePersonalOn, isPush && personalOn && !firebaseActive)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Firebase status banner */}
      {!fbLoading && (
        !firebaseConfigured ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-500/10">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              <strong>Firebase not configured.</strong> Push notification toggles below have no effect until a Firebase credential is added.
              {" "}<Link to="/firebase-credential" className="underline hover:no-underline">Configure Firebase →</Link>
            </p>
          </div>
        ) : !firebaseActive ? (
          <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-700 dark:bg-orange-500/10">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-orange-500" />
            <p className="text-sm text-orange-700 dark:text-orange-400">
              <strong>Firebase credential is inactive.</strong> Push notifications will not be sent until Firebase is activated.
              {" "}<Link to="/firebase-credential" className="underline hover:no-underline">Activate Firebase →</Link>
            </p>
          </div>
        ) : null
      )}

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-x-auto">
      <table className="min-w-[900px] w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold text-brand-500 w-56">Admin</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400" colSpan={3}>
              Order Notifications
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700" colSpan={3}>
              Personal Notifications
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-brand-500 w-20">Save</th>
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <th />
            {["Email", "SMS", "Push", "Email", "SMS", "Push"].map((label, i) => (
              <th key={i} className={`px-2 py-2 text-center text-xs ${i === 3 ? "border-l border-gray-200 dark:border-gray-700" : ""}`}>
                <span className={`inline-flex items-center gap-1 ${colWarning(label, i) ? "text-orange-400 dark:text-orange-500" : "text-gray-400"}`}>
                  {label}
                  {colWarning(label, i) && <AlertTriangle size={10} />}
                </span>
              </th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {rowsState.map((row) => (
            <tr key={row.admin_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {row.profile_img_path ? (
                      <img src={toPublicUrl(row.profile_img_path) ?? ""} alt={row.admin_name ?? ""} className="h-full w-full object-cover" />
                    ) : (
                      initials(row.admin_name)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{row.admin_name ?? "—"}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{row.role_name}</p>
                  </div>
                </div>
              </td>

              {(["order_notification_email", "order_notification_sms", "order_notification_firebase_push"] as const).map((key) => (
                <td key={key} className="px-2 py-3 text-center">
                  <button type="button" aria-label={key}
                    onClick={() => toggle(row.admin_id, key)}
                    title={toggleTitle(key)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${toggleColour(key, !!row[key])}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${row[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </td>
              ))}

              {(["personal_notification_email", "personal_notification_sms", "personal_notification_firebase_push"] as const).map((key, i) => (
                <td key={key} className={`px-2 py-3 text-center ${i === 0 ? "border-l border-gray-200 dark:border-gray-700" : ""}`}>
                  <button type="button" aria-label={key}
                    onClick={() => toggle(row.admin_id, key)}
                    title={toggleTitle(key)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${toggleColour(key, !!row[key])}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${row[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </td>
              ))}

              <td className="px-4 py-3 text-center">
                <button type="button" onClick={() => saveRow(row)} disabled={!row.dirty || saving[row.admin_id]}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    row.dirty
                      ? "border-brand-500 bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
                      : "border-gray-200 bg-white text-gray-300 cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-700"
                  }`}
                  title={row.dirty ? "Save changes" : "No changes"}>
                  {saving[row.admin_id] ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  ) : (
                    <Save size={14} />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ─── Unsaved Changes Modal ────────────────────────────────────────────────── //
function UnsavedChangesModal({
  onSave, onDiscard, onCancel,
}: {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10">
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Unsaved Changes</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You have unsaved system permission changes. What would you like to do?
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button type="button" onClick={onSave}
            className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
            Save &amp; Leave
          </button>
          <button type="button" onClick={onDiscard}
            className="w-full rounded-xl border border-error-200 bg-error-50 px-4 py-2.5 text-sm font-semibold text-error-600 hover:bg-error-100 dark:border-error-800 dark:bg-error-500/10 dark:text-error-400 transition-colors">
            Discard &amp; Leave
          </button>
          <button type="button" onClick={onCancel}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────── //
type Tab = "system" | "admins";

/**
 * Works with BrowserRouter (no data router required).
 * Intercepts pushState / replaceState and popstate to catch SPA nav.
 * Returns { blocked, pendingPath, proceed, cancel }.
 */
function useNavigationGuard(isDirty: boolean) {
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(false);
  const pendingPath = useRef<string | null>(null);
  const bypassRef = useRef(false);

  useEffect(() => {
    if (!isDirty) return;

    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);

    const intercept = (fn: typeof origPush) =>
      (...args: Parameters<typeof origPush>) => {
        if (bypassRef.current) { bypassRef.current = false; return fn(...args); }
        const url = args[2];
        if (url && typeof url === "string") {
          const path = url.startsWith("http") ? new URL(url).pathname : url;
          pendingPath.current = path;
          setBlocked(true);
          return; // stop navigation
        }
        return fn(...args);
      };

    window.history.pushState = intercept(origPush) as typeof origPush;
    window.history.replaceState = intercept(origReplace) as typeof origReplace;

    const onPopState = () => {
      if (bypassRef.current) { bypassRef.current = false; return; }
      // push the state back so we stay on current page
      window.history.forward();
      pendingPath.current = null;
      setBlocked(true);
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      window.removeEventListener("popstate", onPopState);
    };
  }, [isDirty]);

  const proceed = useCallback(() => {
    bypassRef.current = true;
    setBlocked(false);
    if (pendingPath.current) {
      navigate(pendingPath.current);
      pendingPath.current = null;
    }
  }, [navigate]);

  const cancel = useCallback(() => {
    setBlocked(false);
    pendingPath.current = null;
  }, []);

  return { blocked, proceed, cancel };
}

export default function PermissionsPage() {
  const [tab, setTab] = useState<Tab>("system");
  const [systemDirty, setSystemDirty] = useState(false);
  // Ref to call SystemPermissionsPanel's save from the modal
  const panelSaveRef = useRef<((opts?: { onSuccess?: () => void }) => void) | null>(null);

  const handleDirtyChange = useCallback((dirty: boolean) => setSystemDirty(dirty), []);

  // Navigation guard (works with BrowserRouter)
  const { blocked, proceed, cancel } = useNavigationGuard(systemDirty);

  // Warn on tab close / hard refresh
  useEffect(() => {
    if (!systemDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [systemDirty]);

  const handleSaveAndLeave = useCallback(() => {
    if (panelSaveRef.current) {
      panelSaveRef.current({ onSuccess: () => proceed() });
    } else {
      proceed(); // fallback
    }
  }, [proceed]);

  return (
    <>
      <PageMeta
        title="Permissions"
        description="System permission settings and per-admin notification permissions"
      />

      {/* Unsaved changes modal */}
      {blocked && (
        <UnsavedChangesModal
          onSave={handleSaveAndLeave}
          onDiscard={() => proceed()}
          onCancel={() => cancel()}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage system-level feature permissions and per-admin notification preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900 mb-6 w-fit">
        {(
          [
            { id: "system" as Tab, label: "System Settings", icon: <Settings2 size={14} /> },
            { id: "admins" as Tab, label: "Admin Notifications", icon: <Bell size={14} /> },
          ] as const
        ).map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {icon}
            {label}
            {id === "system" && systemDirty && (
              <span className="h-2 w-2 rounded-full bg-amber-400" title="Unsaved changes" />
            )}
          </button>
        ))}
      </div>

      {tab === "system" && (
        <SystemPermissionsPanel
          onDirtyChange={handleDirtyChange}
          saveRef={panelSaveRef}
        />
      )}
      {tab === "admins" && <AdminNotifPermissionsPanel />}
    </>
  );
}
