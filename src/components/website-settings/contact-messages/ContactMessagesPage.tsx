// src/components/contact-messages/ContactMessagesPage.tsx
"use client";

import React from "react";
import { Inbox, MessageSquareText } from "lucide-react";
import { useTranslation } from "react-i18next";

import Pagination from "@/components/common/Pagination";
import { cn } from "@/lib/utils";

import ContactMessagesFiltersBar from "./ContactMessagesFiltersBar";
import ContactMessagesList from "./ContactMessagesList";
import ContactMessageDetailsPanel from "./ContactMessageDetailsPanel";
import ReplyModal, { type ReplyType } from "./ReplyModal";
import type { ContactMessageFilters, ContactMessagePageState } from "./types";
import {
  useContactMessage,
  useContactMessageCounts,
  useContactMessages,
  useDeleteContactMessage,
  useReplyContactMessage,
  useToggleContactMessageStatus,
} from "./useContactMessages";

const DEFAULT_FILTERS: ContactMessageFilters = {
  tab: "all",
  status: "active",
  is_read: "all",
  is_replied: "all",
  search: "",
  subject: "",
};

const DEFAULT_STATE: ContactMessagePageState = {
  page: 1,
  pageSize: 20,
  selectedId: null,
};

export default function ContactMessagesPage() {
  const { t } = useTranslation();
  const [filters, setFilters] =
    React.useState<ContactMessageFilters>(DEFAULT_FILTERS);
  const [state, setState] =
    React.useState<ContactMessagePageState>(DEFAULT_STATE);

  const offset = (state.page - 1) * state.pageSize;

  const countsQuery = useContactMessageCounts();

  const listQuery = useContactMessages(
    {
      status: filters.status,
      offset,
      limit: state.pageSize,
      subject: filters.subject,
      search: filters.search,
      is_read: filters.is_read,
      is_replied: filters.is_replied,
    },
    { enabled: true }
  );

  const rows = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;

  React.useEffect(() => {
    if (state.selectedId) {
      const stillExists = rows.some((r) => r.id === state.selectedId);
      if (!stillExists && rows.length > 0)
        setState((s) => ({ ...s, selectedId: rows[0].id }));
      if (!stillExists && rows.length === 0)
        setState((s) => ({ ...s, selectedId: null }));
    } else if (!state.selectedId && rows.length > 0) {
      setState((s) => ({ ...s, selectedId: rows[0].id }));
    }
  }, [rows, state.selectedId]);

  const selectedId = state.selectedId;
  const singleQuery = useContactMessage(selectedId, {
    enabled: !!selectedId,
  });
  const selected = singleQuery.data?.data ?? null;

  const toggleStatus = useToggleContactMessageStatus();
  const deleteMsg = useDeleteContactMessage();
  const replyMsg = useReplyContactMessage();

  const [replyOpen, setReplyOpen] = React.useState(false);

  const applyFilters = (patch: Partial<ContactMessageFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setState((s) => ({ ...s, page: 1 }));
  };

  const onSelect = (id: number) => {
    setState((s) => ({ ...s, selectedId: id }));
  };

  const isLoading = listQuery.isLoading;
  const isRefetching = listQuery.isFetching && !listQuery.isLoading;

  return (
    <div className="w-full px-4 py-6 md:px-8">
      {/* ── Page Header ── */}
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <MessageSquareText className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("contactMessages.title")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("contactMessages.subtitle")}
          </p>
        </div>
      </div>

      {/* ── Stat Cards + Filters ── */}
      <ContactMessagesFiltersBar
        counts={countsQuery.data?.data ?? null}
        filters={filters}
        onChange={applyFilters}
        onRefetch={() => {
          countsQuery.refetch();
          listQuery.refetch();
          if (selectedId) singleQuery.refetch();
        }}
        isRefetching={isRefetching}
      />

      {/* ── Main Content: Inbox + Detail ── */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left — Inbox List */}
        <div className="flex flex-col lg:col-span-5">
          <div
            className={cn(
              "flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm",
              "dark:border-gray-800 dark:bg-gray-900"
            )}
          >
            {/* Inbox Header */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-3.5 dark:border-gray-800 dark:from-white/[0.03] dark:to-white/[0.01]">
              <Inbox size={16} className="text-brand-500" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {t("contactMessages.inbox")}
              </p>
              <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                {total}
              </span>
            </div>

            {/* List */}
            <div className="min-h-[320px] flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="space-y-2 rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-white/[0.02]"
                    >
                      <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                  ))}
                </div>
              ) : (
                <ContactMessagesList
                  rows={rows}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-3">
            <Pagination
              totalItems={total}
              page={state.page}
              pageSize={state.pageSize}
              onPageChange={(p) => setState((s) => ({ ...s, page: p }))}
              onPageSizeChange={(n) =>
                setState((s) => ({ ...s, page: 1, pageSize: n }))
              }
            />
          </div>
        </div>

        {/* Right — Detail Panel */}
        <div className="lg:col-span-7">
          <div
            className={cn(
              "min-h-[520px] overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm",
              "dark:border-gray-800 dark:bg-gray-900"
            )}
          >
            {selected ? (
              <ContactMessageDetailsPanel
                data={selected}
                onReply={() => setReplyOpen(true)}
                onToggleArchive={() => toggleStatus.mutate(selected.id)}
                onDelete={() => {
                  deleteMsg.mutate(selected.id, {
                    onSuccess: () =>
                      setState((s) => ({ ...s, selectedId: null })),
                  });
                }}
                isDeleting={deleteMsg.isPending}
                isToggling={toggleStatus.isPending}
              />
            ) : (
              <div className="flex h-full min-h-[520px] flex-col items-center justify-center gap-3 px-5 py-10">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <Inbox className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </span>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {rows.length
                    ? t("contactMessages.selectMessage")
                    : t("contactMessages.noMessages")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReplyModal
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        toLabel={
          selected
            ? selected.email ||
            selected.phone ||
            t("contactMessages.guest")
            : undefined
        }
        isSubmitting={replyMsg.isPending}
        onSubmit={({
          replyText,
          type,
        }: {
          replyText: string;
          type: ReplyType;
        }) => {
          if (!selected) return;
          replyMsg.mutate(
            { message_id: selected.id, reply_text: replyText, type },
            { onSuccess: () => setReplyOpen(false) }
          );
        }}
      />
    </div>
  );
}
