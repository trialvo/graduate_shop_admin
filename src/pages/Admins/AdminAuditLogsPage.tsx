import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Calendar, X } from "lucide-react";
import { useAdminAuditLogs, useAdminActionKeys } from "@/hooks/useAuditLogs";
import type { AdminAuditLogParams } from "@/api/audit.api";
import Input from "@/components/form/input/InputField";
import PageMeta from "@/components/common/PageMeta";
import { toPublicUrl } from "@/utils/toPublicUrl";
import DatePicker from "@/components/form/date-picker";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function initials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

/** Prettify a resource table name into a readable label */
function resourceLabel(resource: string | null | undefined): string {
  if (!resource) return "";
  return resource
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Smart details panel — handles the diverse meta shapes across all controllers:
 * - CHANGE_ORDER_STATUS: { old_status, new_status, note }
 * - EDIT_ADMIN: { email: {old, new}, role: {old, new}, first_name: {new}, ... }
 * - UPDATE_PERMISSION_CONFIG: { changed: [{key, section, scope, old, new}] }
 * - Generic: arbitrary k/v fallback rendered as key-value pills
 */
function DetailsCell({
  resource,
  resource_id,
  meta,
}: {
  resource: string | null;
  resource_id: number | string | null;
  meta: Record<string, unknown> | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasContent = resource || resource_id != null || (meta && Object.keys(meta).length > 0);
  if (!hasContent) return <span className="text-gray-400 text-xs">—</span>;

  // Determine if a meta has old/new diff pattern (EDIT_ADMIN style)
  const metaKeys = meta ? Object.keys(meta) : [];
  const isOldNewStyle = metaKeys.length > 0 && metaKeys.every(
    (k) => meta![k] !== null && typeof meta![k] === "object" &&
      ("old" in (meta![k] as object) || "new" in (meta![k] as object))
  );
  const isStatusChange = meta && "old_status" in meta && "new_status" in meta;
  const isChangedArray = meta && Array.isArray((meta as any).changed);

  // Collapsed summary
  const summary = (() => {
    if (isStatusChange) {
      return (
        <span className="flex items-center gap-1 flex-wrap">
          <span className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[11px] text-gray-600 dark:text-gray-300 font-mono line-through">
            {String((meta as any).old_status).replace(/_/g, " ")}
          </span>
          <span className="text-gray-400">→</span>
          <span className="rounded bg-brand-50 dark:bg-brand-500/10 px-1.5 py-0.5 text-[11px] text-brand-700 dark:text-brand-300 font-mono font-semibold">
            {String((meta as any).new_status).replace(/_/g, " ")}
          </span>
        </span>
      );
    }
    if (isChangedArray) {
      const arr = (meta as any).changed as unknown[];
      return (
        <span className="text-xs text-gray-500">
          {arr.length} field{arr.length !== 1 ? "s" : ""} changed
        </span>
      );
    }
    if (isOldNewStyle) {
      return (
        <span className="text-xs text-gray-500">
          {metaKeys.length} field{metaKeys.length !== 1 ? "s" : ""} changed
        </span>
      );
    }
    if (meta && metaKeys.length > 0) {
      // Generic: first key=value pair
      const firstKey = metaKeys[0];
      const firstVal = String(meta[firstKey]).slice(0, 40);
      return (
        <span className="text-xs text-gray-500 font-mono">
          {firstKey}: {firstVal}{metaKeys.length > 1 ? ` +${metaKeys.length - 1} more` : ""}
        </span>
      );
    }
    return null;
  })();

  return (
    <div className="space-y-1">
      {/* Target entity chip */}
      {(resource || resource_id != null) && (
        <div className="flex items-center gap-1 flex-wrap">
          {resource && (
            <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300">
              {resourceLabel(resource)}
            </span>
          )}
          {resource_id != null && typeof resource_id === "number" && (
            <span className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-[11px] font-mono text-gray-500 dark:text-gray-400">
              #{resource_id}
            </span>
          )}
        </div>
      )}

      {/* Collapsed summary + expand toggle */}
      {meta && metaKeys.length > 0 && (
        <div>
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 text-left hover:opacity-80"
            >
              <span>{summary}</span>
              <ChevronDown size={12} className="text-gray-400 shrink-0" />
            </button>
          )}

          {expanded && (
            <div className="mt-1 space-y-1.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-2">
              {/* STATUS CHANGE */}
              {isStatusChange && (
                <>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide w-16 shrink-0">Status</span>
                    <span className="rounded bg-error-50 dark:bg-error-500/10 px-1.5 py-0.5 text-[11px] text-error-700 dark:text-error-300 font-mono line-through">
                      {String((meta as any).old_status).replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-400 text-xs">→</span>
                    <span className="rounded bg-success-50 dark:bg-success-500/10 px-1.5 py-0.5 text-[11px] text-success-700 dark:text-success-300 font-mono font-semibold">
                      {String((meta as any).new_status).replace(/_/g, " ")}
                    </span>
                  </div>
                  {(meta as any).note && (
                    <p className="text-[11px] text-gray-500 italic">Note: {String((meta as any).note)}</p>
                  )}
                </>
              )}

              {/* CHANGED ARRAY — handles two shapes:
                  1. { section, key_name, value }  — UPDATE_PERMISSION_CONFIG
                  2. { key, old, new }              — generic changed list */}
              {isChangedArray && (
                <div className="space-y-1">
                  {((meta as any).changed as any[]).map((c: any, i: number) => {
                    // Shape 1: permission config — { section, scope, key_name, value }
                    const hasKeyName = c.key_name !== undefined;
                    if (hasKeyName) {
                      const isEnabled = c.value === true || c.value === 1 || c.value === "true";
                      const label = [c.section, c.key_name].filter(Boolean).join(" → ").replace(/_/g, " ");
                      return (
                        <div key={i} className="flex items-center gap-1.5 flex-wrap text-[11px]">
                          <span className="font-mono text-gray-500 shrink-0">{label}:</span>
                          <span className={`rounded px-1.5 py-0.5 font-semibold ${
                            isEnabled
                              ? "bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-300"
                              : "bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-300"
                          }`}>
                            {isEnabled ? "enabled" : "disabled"}
                          </span>
                          {c.scope && c.scope !== "default" && (
                            <span className="text-gray-400">({c.scope})</span>
                          )}
                        </div>
                      );
                    }
                    // Shape 2: generic { key, old, new }
                    return (
                      <div key={i} className="flex items-start gap-1.5 flex-wrap text-[11px]">
                        <span className="font-mono text-gray-500 shrink-0">{c.key ?? c.section ?? i}:</span>
                        {c.old !== undefined && (
                          <span className="rounded bg-error-50 dark:bg-error-500/10 px-1 text-error-600 dark:text-error-300 line-through font-mono">
                            {String(c.old)}
                          </span>
                        )}
                        {c.new !== undefined && (
                          <span className="rounded bg-success-50 dark:bg-success-500/10 px-1 text-success-700 dark:text-success-300 font-mono font-semibold">
                            {String(c.new)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* OLD/NEW STYLE (EDIT_ADMIN style) */}
              {isOldNewStyle && !isStatusChange && (
                <div className="space-y-1">
                  {metaKeys.map((k) => {
                    const v = meta![k] as Record<string, unknown>;
                    return (
                      <div key={k} className="flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="font-mono text-gray-500 shrink-0 w-20 truncate">{k.replace(/_/g, " ")}:</span>
                        {v.old !== undefined && (
                          <span className="rounded bg-error-50 dark:bg-error-500/10 px-1 text-error-600 dark:text-error-300 line-through font-mono">
                            {String(v.old)}
                          </span>
                        )}
                        {v.new !== undefined && (
                          <span className="rounded bg-success-50 dark:bg-success-500/10 px-1 text-success-700 dark:text-success-300 font-mono font-semibold">
                            {String(v.new)}
                          </span>
                        )}
                        {v.old === undefined && v.new === undefined && (
                          <span className="text-gray-400 italic">{String(v)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* GENERIC fallback */}
              {!isStatusChange && !isChangedArray && !isOldNewStyle && (
                <div className="space-y-1">
                  {metaKeys.map((k) => (
                    <div key={k} className="flex items-start gap-1.5 text-[11px]">
                      <span className="font-mono text-gray-500 shrink-0">{k}:</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300 break-all">
                        {typeof meta![k] === "object"
                          ? JSON.stringify(meta![k])
                          : String(meta![k])}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setExpanded(false)}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-1"
              >
                <ChevronUp size={10} /> collapse
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: actionKeys = [] } = useAdminActionKeys();

  const params: AdminAuditLogParams = useMemo(
    () => ({
      search: search || undefined,
      action: action || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      limit,
      page,
    }),
    [search, action, dateFrom, dateTo, page]
  );

  const { data, isLoading, isError } = useAdminAuditLogs(params);
  const logs = data?.data ?? [];
  const hasMore = data?.has_more ?? false;
  const count = data?.count ?? 0;

  return (
    <>
      <PageMeta title="Admin Audit Logs" description="Track all admin actions in the system" />
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Audit Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Full activity trail of all administrator actions.{" "}
          {count > 0 && (
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {count.toLocaleString()} record{count !== 1 ? "s" : ""} found.
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        {/* Search */}
        <div className="min-w-[200px] flex-1">
          <Input
            startIcon={<Search size={15} className="text-gray-400" />}
            placeholder="Search actor..."
            value={search}
            onChange={(e) => { setSearch(String(e.target.value)); setPage(1); }}
          />
        </div>

        {/* Action filter */}
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="h-11 min-w-[180px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        >
          <option value="">All Actions</option>
          {actionKeys.map((k) => (
            <option key={k.action_key} value={k.action_key}>{k.display_name}</option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-900">
          <Calendar size={15} className="shrink-0 text-gray-400" />
          <div className="flex items-center gap-1.5 py-1.5">
            <div className="w-[130px]">
              <DatePicker
                placeholder="From"
                value={dateFrom}
                onChange={(v) => { setDateFrom(v); setPage(1); }}
                max={dateTo || undefined}
                showToday={false}
                className="border-0 shadow-none bg-transparent"
              />
            </div>
            <span className="text-xs text-gray-400 select-none">→</span>
            <div className="w-[130px]">
              <DatePicker
                placeholder="To"
                value={dateTo}
                onChange={(v) => { setDateTo(v); setPage(1); }}
                min={dateFrom || undefined}
                showToday
                className="border-0 shadow-none bg-transparent"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
                className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                title="Clear date range"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[780px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {["#", "Actor", "Action", "Details", "Date / Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">Loading audit logs...</td></tr>
              ) : isError ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-error-500">Failed to load audit logs.</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">No audit logs found.</td></tr>
              ) : logs.map((log, idx) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 align-top">
                  {/* # */}
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {(page - 1) * limit + idx + 1}
                  </td>

                  {/* Actor — avatar + name + email */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {log.actor_img_path ? (
                          <img src={toPublicUrl(log.actor_img_path)} alt={log.actor_name ?? ""} className="h-full w-full object-cover" />
                        ) : (
                          initials(log.actor_name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{log.actor_name || "—"}</p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{log.actor_email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {log.action_display_name ?? log.action.replace(/_/g, " ")}
                      </p>
                      {log.action_display_name && (
                        <p className="mt-0.5 font-mono text-[10px] text-gray-400 dark:text-gray-500">{log.action}</p>
                      )}
                    </div>
                  </td>

                  {/* Details — merged Resource + ID + smart Meta */}
                  <td className="px-4 py-3 max-w-xs">
                    <DetailsCell
                      resource={log.resource}
                      resource_id={log.resource_id}
                      meta={log.meta}
                    />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-gray-800">
          <p className="text-xs text-gray-500">Page {page} — {logs.length} entr{logs.length !== 1 ? "ies" : "y"}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-800 dark:text-gray-300">
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={!hasMore}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-800 dark:text-gray-300">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
