"use client";

import React from "react";
import { Copy, Trash2, Mail, Phone, CalendarDays, Clock, MapPin } from "lucide-react";

import type { GuestOrder } from "./types";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

const initials = (name: string) => {
  const parts = name.trim().split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "G";
  const b = parts[1]?.[0] ?? "O";
  return (a + b).toUpperCase();
};

const formatDate = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

function statusUi(status: GuestOrder["status"]) {
  if (status === "pending") return { label: "Pending", color: "warning" as const };
  if (status === "complete") return { label: "Complete", color: "success" as const };
  return { label: "Cancelled", color: "error" as const };
}

type Props = {
  orders: GuestOrder[];
};

const GuestOrdersTable: React.FC<Props> = ({ orders }) => {
  const onCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      {/* ✅ Mobile / Small screens: Card list */}
      <div className="block md:hidden">
        {orders.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            No guest orders found.
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {orders.map((o) => {
              const s = statusUi(o.status);

              return (
                <div
                  key={o.id}
                  className="rounded-[4px] border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white font-semibold shrink-0">
                        {initials(o.customerName)}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-gray-900 dark:text-white">
                          {o.customerName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{o.id}</div>
                      </div>
                    </div>

                    <Badge
                      variant="light"
                      color={s.color}
                      className="px-3 py-1 text-xs font-semibold shrink-0"
                    >
                      {s.label}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-3">
                    {/* Email */}
                    <div className="flex items-center justify-between gap-3 rounded-[4px] border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate text-sm text-gray-700 dark:text-gray-200">
                          {o.email}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        ariaLabel="Copy email"
                        onClick={() => onCopy(o.email)}
                        className="h-9 w-9 shrink-0"
                      >
                        <Copy size={16} />
                      </Button>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center justify-between gap-3 rounded-[4px] border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">{o.phone}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        ariaLabel="Copy phone"
                        onClick={() => onCopy(o.phone)}
                        className="h-9 w-9 shrink-0"
                      >
                        <Copy size={16} />
                      </Button>
                    </div>

                    {/* Date + Time + Total */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <CalendarDays className="h-4 w-4" />
                          Date
                        </div>
                        <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatDate(o.createdAt)}
                        </div>
                      </div>

                      <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          Time
                        </div>
                        <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {o.timeLabel}
                        </div>
                      </div>

                      <div className="col-span-2 rounded-[4px] border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Cart Total</div>
                        <div className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                          {o.cartTotal}
                        </div>
                      </div>
                    </div>

                    {/* Tour preference */}
                    <div className="rounded-[4px] border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        Tour Preference
                      </div>
                      <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {o.tourPreference}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        ariaLabel="Delete order"
                        onClick={() => console.log("delete", o.id)}
                        className="h-10 w-10 text-error-500 hover:text-error-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Desktop / md+ screens: FULL table but container-safe */}
      <div className="hidden md:block w-full max-w-full min-w-0">
        <div className="w-full max-w-full overflow-x-auto">
          <Table className="w-full table-fixed border-collapse">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950">
                <TableCell isHeader className="w-[64px] px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  SN
                </TableCell>

                <TableCell isHeader className="w-[240px] px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  NAME
                </TableCell>

                {/* ✅ hide email on md, show on lg+ */}
                <TableCell
                  isHeader
                  className="hidden lg:table-cell w-[260px] px-4 py-4 text-left text-xs font-semibold text-brand-500"
                >
                  EMAIL
                </TableCell>

                <TableCell isHeader className="w-[190px] px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  PHONE
                </TableCell>

                <TableCell isHeader className="w-[120px] px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  DATE
                </TableCell>

                {/* ✅ hide time on md, show on lg+ */}
                <TableCell
                  isHeader
                  className="hidden lg:table-cell w-[120px] px-4 py-4 text-left text-xs font-semibold text-brand-500"
                >
                  TIME
                </TableCell>

                <TableCell isHeader className="w-[140px] px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  TOTAL
                </TableCell>

                {/* ✅ hide tour on md/lg, show on xl+ */}
                <TableCell
                  isHeader
                  className="hidden xl:table-cell w-[260px] px-4 py-4 text-left text-xs font-semibold text-brand-500"
                >
                  TOUR
                </TableCell>

                <TableCell isHeader className="w-[130px] px-4 py-4 text-left text-xs font-semibold text-brand-500">
                  STATUS
                </TableCell>

                <TableCell isHeader className="w-[90px] px-4 py-4 text-right text-xs font-semibold text-brand-500">
                  ACTION
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((o, idx) => {
                const s = statusUi(o.status);

                return (
                  <TableRow
                    key={o.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">
                      {idx + 1}
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white font-semibold shrink-0">
                          {initials(o.customerName)}
                        </div>
                        <div className="min-w-0 leading-tight">
                          <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {o.customerName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {o.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email (lg+) */}
                    <TableCell className="hidden lg:table-cell px-4 py-4">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                          {o.email}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          ariaLabel="Copy email"
                          onClick={() => onCopy(o.email)}
                          className="h-9 w-9 shrink-0"
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                          {o.phone}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          ariaLabel="Copy phone"
                          onClick={() => onCopy(o.phone)}
                          className="h-9 w-9 shrink-0"
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </TableCell>

                    {/* Time (lg+) */}
                    <TableCell className="hidden lg:table-cell px-4 py-4 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {o.timeLabel}
                    </TableCell>

                    <TableCell className="px-4 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {o.cartTotal}
                    </TableCell>

                    {/* Tour (xl+) */}
                    <TableCell className="hidden xl:table-cell px-4 py-4 text-sm text-gray-700 dark:text-gray-200 truncate">
                      {o.tourPreference}
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <Badge
                        variant="light"
                        color={s.color}
                        className="px-3 py-1 text-xs font-semibold whitespace-nowrap"
                      >
                        {s.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        ariaLabel="Delete order"
                        onClick={() => console.log("delete", o.id)}
                        className="h-9 w-9 text-error-500 hover:text-error-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {orders.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                    isHeader={false}
                  >
                    No guest orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default GuestOrdersTable;
export { GuestOrdersTable };
