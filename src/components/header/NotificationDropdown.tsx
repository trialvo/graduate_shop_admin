// src/components/header/NotificationDropdown.tsx
"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Bell, MessageSquareText } from "lucide-react";

import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { cn } from "@/lib/utils";
import { useContactMessageCounts, useContactMessages } from "../website-settings/contact-messages/useContactMessages";
import { formatDateTime, formatName } from "../website-settings/contact-messages/utils";


export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);

  const countsQuery = useContactMessageCounts({ refetchIntervalMs: 30_000 });
  const unreadCount = countsQuery.data?.data?.unread ?? 0;

  const unreadListQuery = useContactMessages(
    {
      status: "active",
      offset: 0,
      limit: 6,
      subject: "",
      search: "",
      is_read: "false",
      is_replied: "all",
    },
    { enabled: isOpen, refetchIntervalMs: 5_000 }
  );

  const items = unreadListQuery.data?.data ?? [];

  function toggleDropdown() {
    setIsOpen((v) => !v);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        className={cn(
          "relative flex items-center justify-center",
          "text-gray-500 transition-colors bg-white border border-gray-200 rounded-full",
          "hover:text-gray-700 h-11 w-11 hover:bg-gray-100",
          "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        )}
        onClick={toggleDropdown}
        aria-label="Open notifications"
      >
        {unreadCount > 0 ? (
          <span className="absolute right-0 top-0.5 z-10 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
        <Bell className="h-5 w-5" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className={cn(
          "absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col",
          "rounded-[4px] border border-gray-200 bg-white p-3 shadow-theme-lg",
          "dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
        )}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifications</h5>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread contact message(s)` : "No unread messages"}
            </p>
          </div>

          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Close notifications"
          >
            <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {unreadListQuery.isLoading ? (
            <div className="px-3 py-8 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
          ) : items.length ? (
            <ul className="flex flex-col">
              {items.map((m) => (
                <li key={m.id}>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    tag="a"
                    to="/contact-page"
                    className={cn(
                      "flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3",
                      "hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                    )}
                  >
                    <span className="relative block h-10 w-10 shrink-0 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                      <span className="flex h-full w-full items-center justify-center">
                        <MessageSquareText size={18} />
                      </span>
                    </span>

                    <span className="block min-w-0">
                      <span className="mb-1 block text-theme-sm text-gray-800 dark:text-white/90">
                        <span className="font-semibold">{formatName(m.first_name, m.last_name)}</span>
                        <span className="text-gray-500 dark:text-gray-400"> — {m.subject || "(No subject)"}</span>
                      </span>

                      <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                        <span className="truncate">{m.email || m.phone || "-"}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span>{formatDateTime(m.created_at)}</span>
                      </span>
                    </span>
                  </DropdownItem>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-8 text-sm text-gray-500 dark:text-gray-400">No unread messages.</div>
          )}
        </div>

        <div className="pt-3">
          <Link
            to="/contact-page"
            onClick={closeDropdown}
            className={cn(
              "block w-full rounded-[4px] border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-semibold",
              "text-gray-800 hover:bg-gray-50",
              "dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:hover:bg-white/[0.03]"
            )}
          >
            Open contact messages
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
