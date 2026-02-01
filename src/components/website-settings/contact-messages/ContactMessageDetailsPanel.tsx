// src/components/contact-messages/ContactMessageDetailsPanel.tsx
"use client";

import React from "react";
import { Archive, ArchiveRestore, Mail, MessageCircle, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import Button from "@/components/ui/button/Button";
import ConfirmDeleteModal from "@/components/ui/modal/ConfirmDeleteModal";
import { cn } from "@/lib/utils";

import type { ContactMessageDetails } from "./types";
import { formatDateTime, formatName } from "./utils";

type Props = {
  data: ContactMessageDetails;
  onReply: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  isToggling?: boolean;
  isDeleting?: boolean;
};

export default function ContactMessageDetailsPanel({
  data,
  onReply,
  onToggleArchive,
  onDelete,
  isToggling,
  isDeleting,
}: Props) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const name = formatName(data.first_name, data.last_name);
  const email = data.email ?? "-";
  const phone = data.phone ?? "-";
  const subject = data.subject ?? "-";
  const msg = data.message ?? "-";
  const isArchived = data.status === 0;
  const isReplied = data.is_replied === 1;

  return (
    <div className={cn("h-full w-full", "flex flex-col")}>
      <div
        className={cn(
          "flex items-start justify-between gap-3",
          "border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900"
        )}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDateTime(data.created_at)}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReply}
            disabled={isArchived}
            startIcon={isReplied ? <Mail size={16} /> : <MessageCircle size={16} />}
          >
            {t("contactMessages.details.reply")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleArchive}
            disabled={isToggling}
            startIcon={isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          >
            {isArchived
              ? t("contactMessages.details.unarchive")
              : t("contactMessages.details.archive")}
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting}
            startIcon={<Trash2 size={16} />}
          >
            {t("contactMessages.details.delete")}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-[4px] border border-gray-200 bg-white px-4 py-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              {t("contactMessages.details.contact")}
            </p>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("contactMessages.details.email")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{email}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("contactMessages.details.phone")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{phone}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("contactMessages.details.orders")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{data.total_orders ?? 0}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("contactMessages.details.totalSpent")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{data.total_spent ?? 0} BDT</span>
              </div>
            </div>
          </div>

          <div className="rounded-[4px] border border-gray-200 bg-white px-4 py-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              {t("contactMessages.details.status")}
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("contactMessages.details.read")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.is_read === 1 ? t("contactMessages.details.yes") : t("contactMessages.details.no")}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("contactMessages.details.replied")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.is_replied === 1 ? t("contactMessages.details.yes") : t("contactMessages.details.no")}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("contactMessages.details.inbox")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {isArchived ? t("contactMessages.details.archived") : t("contactMessages.details.active")}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500 dark:text-gray-400">
                  {t("contactMessages.details.lastUpdate")}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDateTime(data.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[4px] border border-gray-200 bg-white px-5 py-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-900 dark:text-white">
            {t("contactMessages.details.subject")}
          </p>
          <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{subject}</p>

          <p className="mt-4 text-xs font-semibold text-gray-900 dark:text-white">
            {t("contactMessages.details.message")}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">{msg}</p>
        </div>

        <div className="mt-5 rounded-[4px] border border-gray-200 bg-white px-5 py-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold text-gray-900 dark:text-white">
            {t("contactMessages.details.replies")}
          </p>
          {data.replies?.length ? (
            <div className="mt-3 space-y-3">
              {data.replies.map((r) => (
                <div
                  key={r.id}
                  className="rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {(r.type ?? t("contactMessages.details.replyType")).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(r.created_at)}</p>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">{r.reply_text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {t("contactMessages.details.noReplies")}
            </p>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("contactMessages.details.confirmDeleteTitle")}
        description={t("contactMessages.details.confirmDeleteDescription")}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete();
        }}
        loading={isDeleting}
      />
    </div>
  );
}
