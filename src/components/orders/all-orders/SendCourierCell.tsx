import React, { useMemo, useState } from "react";
import type { CourierProviderId, OrderRow } from "./types";
import CourierRequestModal from "@/components/ui/modal/CourierRequestModal";
import { cn } from "@/lib/utils";

type Props = {
  order: OrderRow;

  onAutoDispatch: (
    orderId: number,
    payload: { provider: Exclude<CourierProviderId, "select" | "manual">; weightKg?: number }
  ) => Promise<void>;

  onManualDispatch: (
    orderId: number,
    payload: {
      provider: Exclude<CourierProviderId, "select" | "manual">;
      trackingNumber?: string;
      referenceId?: string;
      memo?: string;
      weightKg?: number;
    }
  ) => Promise<void>;
};

type CourierProviderIdSafe = CourierProviderId | "unknown";

function providerLabel(id?: CourierProviderIdSafe) {
  switch (id) {
    case "pathao":
      return "Pathao";
    case "redx":
      return "RedX";
    case "paperfly":
      return "Paperfly";
    case "steadfast":
      return "Steadfast";
    case "manual":
      return "Manual Courier";
    case "select":
      return "Select Courier";
    default:
      return "Select Courier";
  }
}

export default function SendCourierCell({ order, onAutoDispatch, onManualDispatch }: Props) {
  const [open, setOpen] = useState(false);

  const apiConfigured = Boolean(order.courier?.apiConfigured);

  const connectedAutoProviders =
    order.courier?.availableAutoCouriers?.filter((x) => x.connected) ?? [];

  const canAutoRequest = apiConfigured && connectedAutoProviders.length > 0;

  const providerId = (order.courier?.providerId as CourierProviderIdSafe) || "select";
  const memoNo = order.courier?.memoNo ?? "";
  const trackingNo = order.courier?.trackingNo ?? "";

  const label = useMemo(() => {
    const byName = (order.courier?.providerName || "").trim();
    if (byName) return byName;
    return providerLabel(providerId);
  }, [providerId, order.courier?.providerName]);

  const statusPill = useMemo(() => {
    if (canAutoRequest)
      return {
        text: "AUTO",
        cls: "bg-success-50 text-success-700 ring-success-200 dark:bg-success-500/10 dark:text-success-200 dark:ring-success-500/30",
      };
    if (apiConfigured)
      return {
        text: "MANUAL",
        cls: "bg-gray-50 text-gray-700 ring-gray-200 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10",
      };
    return {
      text: "NOT SET",
      cls: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-200 dark:ring-orange-500/30",
    };
  }, [canAutoRequest, apiConfigured]);

  const secondaryLine = trackingNo
    ? `Tracking: ${trackingNo}`
    : memoNo
      ? `Memo: ${memoNo}`
      : "Tracking/Memo: —";

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{label}</p>

            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                statusPill.cls
              )}
            >
              {statusPill.text}
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">{secondaryLine}</p>

          {canAutoRequest ? (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Auto available:{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {connectedAutoProviders.map((x) => x.providerName).join(", ")}
              </span>
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white",
            canAutoRequest ? "bg-success-600 hover:bg-success-700" : "bg-brand-500 hover:bg-brand-600"
          )}
        >
          Save & Send
        </button>
      </div>

      <CourierRequestModal
        open={open}
        onClose={() => setOpen(false)}
        order={order}
        onAutoDispatch={(payload) => onAutoDispatch(Number(order.id), payload)}
        onManualDispatch={(payload) => onManualDispatch(Number(order.id), payload)}
      />
    </>
  );
}
