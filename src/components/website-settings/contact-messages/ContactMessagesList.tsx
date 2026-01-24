// src/components/contact-messages/ContactMessagesList.tsx
"use client";

import React from "react";
import { Mail, MessageSquare, Archive } from "lucide-react";

import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import type { ContactMessageRow } from "./types";
import { formatDateTime, formatName } from "./utils";

type Props = {
  rows: ContactMessageRow[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

function StatusPills({ row }: { row: ContactMessageRow }) {
  const unread = row.is_read === 0;
  const unreplied = row.is_replied === 0;
  const archived = row.status === 0;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {archived ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
          <Archive size={12} /> Archived
        </span>
      ) : null}

      {unread ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300">
          <Mail size={12} /> Unread
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
          Read
        </span>
      )}

      {unreplied ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <MessageSquare size={12} /> Unreplied
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
          Replied
        </span>
      )}
    </div>
  );
}

export default function ContactMessagesList({ rows, selectedId, onSelect }: Props) {
  if (!rows.length) {
    return (
      <div className="px-4 py-10 text-sm text-gray-500 dark:text-gray-400">
        No messages found for current filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {rows.map((r) => {
          const isActive = selectedId === r.id;

          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r.id)}
              className={cn(
                "w-full rounded-[6px] border p-4 text-left shadow-theme-xs transition",
                "border-gray-200 bg-white hover:bg-gray-50",
                "dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-white/[0.03]",
                isActive ? "border-brand-200 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10" : ""
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {formatName(r.first_name, r.last_name)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">#{r.id}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(r.created_at)}</p>
              </div>

              <div className="mt-3">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {r.subject || "(No subject)"}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {r.message || "-"}
                </p>
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-xs text-gray-500 dark:text-gray-400">
                  <p className="truncate">{r.email || "-"}</p>
                  <p className="truncate">{r.phone || "-"}</p>
                </div>
                <StatusPills row={r} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-[6px] border border-gray-200 md:block dark:border-gray-800">
        <Table className="min-w-[880px] border-separate border-spacing-0">
          <TableHeader className="bg-gray-50 dark:bg-gray-900/60">
            <TableRow>
              <TableCell isHeader className="w-[260px] px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Customer
              </TableCell>
              <TableCell isHeader className="w-[280px] px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Subject
              </TableCell>
              <TableCell isHeader className="w-[220px] px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Contact
              </TableCell>
              <TableCell isHeader className="w-[220px] px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Status
              </TableCell>
              <TableCell isHeader className="w-[160px] px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Date
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((r) => {
              const isActive = selectedId === r.id;

              return (
                <TableRow
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className={cn(
                    "cursor-pointer border-t border-gray-100 transition-colors dark:border-gray-800",
                    isActive
                      ? "bg-brand-50 dark:bg-brand-500/10"
                      : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <TableCell className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {formatName(r.first_name, r.last_name)}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">#{r.id}</p>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {r.subject || "(No subject)"}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                      {r.message || "-"}
                    </p>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <p className="truncate text-sm text-gray-900 dark:text-white">{r.email || "-"}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{r.phone || "-"}</p>
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <StatusPills row={r} />
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDateTime(r.created_at)}
                    </p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
