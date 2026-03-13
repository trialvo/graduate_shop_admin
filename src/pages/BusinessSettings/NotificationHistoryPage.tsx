import { useState } from "react";
import { useNotificationBatches, useEmailLogs, useSmsLogs, usePushLogs } from "@/hooks/useNotificationHistory";
import PageMeta from "@/components/common/PageMeta";

type Tab = "batches" | "email" | "sms" | "push";

const TABS: { key: Tab; label: string }[] = [
  { key: "batches", label: "Batches" },
  { key: "email", label: "Email Logs" },
  { key: "sms", label: "SMS Logs" },
  { key: "push", label: "Push Logs" },
];

function TableWrapper({ isLoading, isEmpty, emptyMsg, children }: {
  isLoading: boolean; isEmpty: boolean; emptyMsg: string; children: React.ReactNode;
}) {
  if (isLoading) return <p className="px-5 py-8 text-sm text-gray-400">Loading...</p>;
  if (isEmpty) return <p className="px-5 py-8 text-sm text-gray-400">{emptyMsg}</p>;
  return <div className="overflow-x-auto">{children}</div>;
}

function BatchesTab() {
  const { data: rows = [], isLoading } = useNotificationBatches({ limit: 50 });
  return (
    <TableWrapper isLoading={isLoading} isEmpty={rows.length === 0} emptyMsg="No notification batches yet.">
      <table className="w-full border-collapse text-sm min-w-[600px]">
        <thead><tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {["Type", "Subject", "Sent", "Failed", "Date"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="px-4 py-3"><span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">{r.type}</span></td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">{r.subject ?? "-"}</td>
              <td className="px-4 py-3 text-success-600 dark:text-success-400">{r.sent_count}</td>
              <td className="px-4 py-3 text-error-600 dark:text-error-400">{r.failed_count}</td>
              <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

function EmailTab() {
  const { data: rows = [], isLoading } = useEmailLogs({ limit: 50 });
  return (
    <TableWrapper isLoading={isLoading} isEmpty={rows.length === 0} emptyMsg="No email logs yet.">
      <table className="w-full border-collapse text-sm min-w-[600px]">
        <thead><tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {["To", "Subject", "Status", "Date"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{r.to}</td>
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">{r.subject}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === "sent" ? "bg-success-50 text-success-700" : "bg-error-50 text-error-700"}`}>{r.status}</span></td>
              <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

function SmsTab() {
  const { data: rows = [], isLoading } = useSmsLogs({ limit: 50 });
  return (
    <TableWrapper isLoading={isLoading} isEmpty={rows.length === 0} emptyMsg="No SMS logs yet.">
      <table className="w-full border-collapse text-sm min-w-[600px]">
        <thead><tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {["To", "Message", "Provider", "Status", "Date"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{r.to}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{r.message}</td>
              <td className="px-4 py-3 text-xs text-gray-500">{r.provider}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === "sent" ? "bg-success-50 text-success-700" : "bg-error-50 text-error-700"}`}>{r.status}</span></td>
              <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

function PushTab() {
  const { data: rows = [], isLoading } = usePushLogs({ limit: 50 });
  return (
    <TableWrapper isLoading={isLoading} isEmpty={rows.length === 0} emptyMsg="No push notification logs yet.">
      <table className="w-full border-collapse text-sm min-w-[500px]">
        <thead><tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {["Title", "Body", "Status", "Date"].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-500">{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.title}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{r.body}</td>
              <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === "sent" ? "bg-success-50 text-success-700" : "bg-error-50 text-error-700"}`}>{r.status}</span></td>
              <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

export default function NotificationHistoryPage() {
  const [tab, setTab] = useState<Tab>("batches");
  return (
    <>
      <PageMeta title="Notification History" description="View email, SMS and push notification logs" />
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Logs of all emails, SMS, and push notifications sent by the system.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "batches" && <BatchesTab />}
        {tab === "email" && <EmailTab />}
        {tab === "sms" && <SmsTab />}
        {tab === "push" && <PushTab />}
      </div>
    </>
  );
}
