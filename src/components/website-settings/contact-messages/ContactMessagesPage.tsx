// src/components/contact-messages/ContactMessagesPage.tsx
"use client";

import React from "react";

import Pagination from "@/components/common/Pagination";
import { cn } from "@/lib/utils";

import ContactMessagesFiltersBar from "./ContactMessagesFiltersBar";
import ContactMessagesList from "./ContactMessagesList";
import ContactMessageDetailsPanel from "./ContactMessageDetailsPanel";
import ReplyModal, { type ReplyType } from "./ReplyModal";
import type { ContactMessageFilters, ContactMessagePageState } from "./types";
import { useContactMessage, useContactMessageCounts, useContactMessages, useDeleteContactMessage, useReplyContactMessage, useToggleContactMessageStatus } from "./useContactMessages";


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
  const [filters, setFilters] = React.useState<ContactMessageFilters>(DEFAULT_FILTERS);
  const [state, setState] = React.useState<ContactMessagePageState>(DEFAULT_STATE);

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
      if (!stillExists && rows.length > 0) setState((s) => ({ ...s, selectedId: rows[0].id }));
      if (!stillExists && rows.length === 0) setState((s) => ({ ...s, selectedId: null }));
    } else if (!state.selectedId && rows.length > 0) {
      setState((s) => ({ ...s, selectedId: rows[0].id }));
    }
  }, [rows, state.selectedId]);

  const selectedId = state.selectedId;
  const singleQuery = useContactMessage(selectedId, { enabled: !!selectedId });
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
      <div
        className={cn(
          "rounded-[4px] border border-gray-200 bg-white p-5 shadow-theme-xs",
          "dark:border-gray-800 dark:bg-gray-900"
        )}
      >
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Contact Messages</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage customer inquiries, reply via Email/SMS, archive or delete messages.
          </p>
        </div>

        <div className="mt-5">
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
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div
              className={cn(
                "rounded-[4px] border border-gray-200 bg-white shadow-theme-xs",
                "dark:border-gray-800 dark:bg-gray-900"
              )}
            >
              <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Inbox</p>
              </div>

              <div className="min-h-[320px]">
                {isLoading ? (
                  <div className="px-4 py-10 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
                ) : (
                  <ContactMessagesList rows={rows} selectedId={selectedId} onSelect={onSelect} />
                )}
              </div>
            </div>

            <div className="mt-4">
              <Pagination
                totalItems={total}
                page={state.page}
                pageSize={state.pageSize}
                onPageChange={(p) => setState((s) => ({ ...s, page: p }))}
                onPageSizeChange={(n) => setState((s) => ({ ...s, page: 1, pageSize: n }))}
              />
            </div>
          </div>

          <div className="lg:col-span-6">
            <div
              className={cn(
                "rounded-[4px] border border-gray-200 bg-white shadow-theme-xs",
                "dark:border-gray-800 dark:bg-gray-900",
                "min-h-[520px]"
              )}
            >
              {selected ? (
                <ContactMessageDetailsPanel
                  data={selected}
                  onReply={() => setReplyOpen(true)}
                  onToggleArchive={() => toggleStatus.mutate(selected.id)}
                  onDelete={() => {
                    deleteMsg.mutate(selected.id, {
                      onSuccess: () => setState((s) => ({ ...s, selectedId: null })),
                    });
                  }}
                  isDeleting={deleteMsg.isPending}
                  isToggling={toggleStatus.isPending}
                />
              ) : (
                <div className="px-5 py-10 text-sm text-gray-500 dark:text-gray-400">
                  {rows.length ? "Select a message to view details." : "No messages to show."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReplyModal
        open={replyOpen}
        onClose={() => setReplyOpen(false)}
        toLabel={selected ? selected.email || selected.phone || "Guest" : undefined}
        isSubmitting={replyMsg.isPending}
        onSubmit={({ replyText, type }: { replyText: string; type: ReplyType }) => {
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
