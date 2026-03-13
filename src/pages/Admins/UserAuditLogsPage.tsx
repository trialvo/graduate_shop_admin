import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useUserAuditLogs, useUserActionKeys } from "@/hooks/useAuditLogs";
import type { UserAuditLogParams } from "@/api/audit.api";
import Input from "@/components/form/input/InputField";
import PageMeta from "@/components/common/PageMeta";

/** Side-by-side diff showing old vs new values */
function ValuesDiff({ old_values, new_values }: {
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
}) {
  if (!old_values && !new_values) return <span className="text-gray-400">—</span>;
  const [expanded, setExpanded] = useState(false);

  const allKeys = Array.from(
    new Set([...Object.keys(old_values ?? {}), ...Object.keys(new_values ?? {})])
  );

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} className="font-mono text-xs text-brand-500 hover:underline">
        {allKeys.length} field{allKeys.length !== 1 ? "s" : ""} changed
      </button>
    );
  }

  return (
    <div className="space-y-1">
      {allKeys.map((k) => (
        <div key={k} className="flex gap-1 text-xs font-mono">
          <span className="text-gray-500 shrink-0">{k}:</span>
          {old_values?.[k] !== undefined && (
            <span className="rounded bg-error-50 px-1 text-error-700 dark:bg-error-500/10 dark:text-error-300 line-through">
              {String(old_values[k])}
            </span>
          )}
          {new_values?.[k] !== undefined && (
            <span className="rounded bg-success-50 px-1 text-success-700 dark:bg-success-500/10 dark:text-success-400">
              {String(new_values[k])}
            </span>
          )}
        </div>
      ))}
      <button onClick={() => setExpanded(false)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">collapse</button>
    </div>
  );
}

export default function UserAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data: actionKeys = [] } = useUserActionKeys();

  const params: UserAuditLogParams = useMemo(() => ({
    search: search || undefined,
    action: action || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    limit,
    page,
  }), [search, action, dateFrom, dateTo, page]);

  const { data, isLoading, isError } = useUserAuditLogs(params);
  const logs = data?.data ?? [];
  const hasMore = data?.has_more ?? false;
  const count = data?.count ?? 0;

  return (
    <>
      <PageMeta title="User Audit Logs" description="Track all user actions in the system" />
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Audit Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Full activity trail of user actions including profile changes, orders, and more.
          {count > 0 && <span className="font-medium text-gray-700 dark:text-gray-300"> {count} records found.</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          startIcon={<Search size={15} className="text-gray-400" />}
          placeholder="Search user email / name..."
          value={search}
          onChange={(e) => { setSearch(String(e.target.value)); setPage(1); }}
        />
        <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
          <option value="">All Actions</option>
          {actionKeys.map((k) => <option key={k.action_key} value={k.action_key}>{k.display_name}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white" />
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {["#", "User", "Action", "IP Address", "Changes", "Date / Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">Loading user audit logs...</td></tr>
              ) : isError ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-error-500">Failed to load user audit logs.</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No user audit logs found.</td></tr>
              ) : logs.map((log, idx) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-xs text-gray-400">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {[log.first_name, log.last_name].filter(Boolean).join(" ") || "—"}
                    </p>
                    <p className="text-xs text-gray-500">{log.user_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-md bg-violet-50 px-2 py-1 font-mono text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                      {log.action_display_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{log.ip_address ?? "—"}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <ValuesDiff old_values={log.old_values} new_values={log.new_values} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-gray-800">
          <p className="text-xs text-gray-500">Page {page} — {logs.length} entries</p>
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
