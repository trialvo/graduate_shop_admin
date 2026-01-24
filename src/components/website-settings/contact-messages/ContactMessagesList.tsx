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
    <div className="overflow-x-auto">
      <Table className="min-w-[880px]">
        <TableHeader>
          <TableRow>
            <TableCell isHeader className="w-[260px]">
              Customer
            </TableCell>
            <TableCell isHeader className="w-[280px]">
              Subject
            </TableCell>
            <TableCell isHeader className="w-[220px]">
              Contact
            </TableCell>
            <TableCell isHeader className="w-[220px]">
              Status
            </TableCell>
            <TableCell isHeader className="w-[160px]">
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
                  "cursor-pointer",
                  isActive
                    ? "bg-brand-50 dark:bg-brand-500/10"
                    : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                )}
              >
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {formatName(r.first_name, r.last_name)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                      #{r.id}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {r.subject || "(No subject)"}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                    {r.message || "-"}
                  </p>
                </TableCell>

                <TableCell>
                  <p className="truncate text-sm text-gray-900 dark:text-white">
                    {r.email || "-"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                    {r.phone || "-"}
                  </p>
                </TableCell>

                <TableCell>
                  <StatusPills row={r} />
                </TableCell>

                <TableCell>
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
  );
}
