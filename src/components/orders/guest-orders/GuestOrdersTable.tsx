"use client";

import React from "react";
import { Copy, Trash2 } from "lucide-react";

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

const statusBadgeClass = (status: GuestOrder["status"]) => {
  if (status === "pending") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  if (status === "complete") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  return "bg-rose-500/15 text-rose-300 border-rose-500/30";
};

const statusLabel = (status: GuestOrder["status"]) => {
  if (status === "pending") return "Pending";
  if (status === "complete") return "Complete";
  return "Cancelled";
};

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
    <div className="rounded-2xl border border-border bg-gradient-to-b from-background to-background/60 shadow-sm">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableCell isHeader className="w-[70px] text-muted-foreground">
                SN
              </TableCell>
              <TableCell isHeader className="min-w-[280px] text-muted-foreground">
                NAME
              </TableCell>
              <TableCell isHeader className="min-w-[260px] text-muted-foreground">
                EMAIL
              </TableCell>
              <TableCell isHeader className="min-w-[180px] text-muted-foreground">
                PHONE NUMBER
              </TableCell>
              <TableCell isHeader className="min-w-[140px] text-muted-foreground">
                DATE
              </TableCell>
              <TableCell isHeader className="min-w-[140px] text-muted-foreground">
                TIME
              </TableCell>
              <TableCell isHeader className="min-w-[150px] text-muted-foreground">
                CART TOTAL
              </TableCell>
              <TableCell isHeader className="min-w-[220px] text-muted-foreground">
                TOUR PREFERENCE
              </TableCell>
              <TableCell isHeader className="min-w-[140px] text-muted-foreground">
                STATUS
              </TableCell>
              <TableCell isHeader className="w-[90px] text-muted-foreground text-right">
                ACTION
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.map((o, idx) => (
              <TableRow key={o.id} className="hover:bg-white/5">
                <TableCell className="text-sm">{idx + 1}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white font-semibold">
                      {initials(o.customerName)}
                    </div>
                    <div className="leading-tight">
                      <div className="font-semibold">{o.customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.id}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm">{o.email}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCopy(o.email)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm">{o.phone}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onCopy(o.phone)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>

                <TableCell className="text-sm">{formatDate(o.createdAt)}</TableCell>
                <TableCell className="text-sm">{o.timeLabel}</TableCell>

                <TableCell className="font-semibold">{o.cartTotal}</TableCell>

                <TableCell className="text-sm">{o.tourPreference}</TableCell>

                <TableCell>
                  <Badge
                    className={[
                      "rounded-full px-4 py-1 text-xs font-semibold border inline-flex",
                      statusBadgeClass(o.status),
                    ].join(" ")}
                  >
                    {statusLabel(o.status)}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => console.log("delete", o.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {orders.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell className="py-10 text-center text-muted-foreground" isHeader={false}>
                  No guest orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GuestOrdersTable;
export { GuestOrdersTable };
