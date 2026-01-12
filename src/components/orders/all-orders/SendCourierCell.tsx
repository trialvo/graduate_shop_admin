// src/components/orders/all-orders/SendCourierCell.tsx

import React, { useMemo, useState } from "react";
import type { CourierProviderId, OrderRow } from "./types";
import CourierRequestModal from "@/components/ui/modal/CourierRequestModal";
import { cn } from "@/lib/utils";

type Props = {
  order: OrderRow;

  courierOverride?: { providerId?: CourierProviderId; memoNo?: string };

  onUpdateCourier: (
    orderId: string,
    providerId: CourierProviderId,
    memoNo: string
  ) => void;

  onRequestCourier: (
    orderId: string,
    providerId: Exclude<CourierProviderId, "select">
  ) => Promise<void> | void;
};

type CourierProviderIdSafe = CourierProviderId | "manual" | "unknown";

function providerLabel(id?: CourierProviderIdSafe) {
  switch (id) {
    case "sa_paribahan":
      return "S A Paribahan";
    case "pathao":
      return "Pathao";
    case "redx":
      return "RedX";
    case "delivery_tiger":
      return "Delivery Tiger";
    case "sundarban":
      return "Sundarban Courier";
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

export default function SendCourierCell({
  order,
  courierOverride,
  onUpdateCourier,
  onRequestCourier,
}: Props) {
  const [open, setOpen] = useState(false);

  const apiConfigured = Boolean(order.courier?.apiConfigured);
  const apiConnectedForThisOrder = Boolean(order.courier?.apiConnected);

  const connectedAutoProviders =
    order.courier?.availableAutoCouriers?.filter((x) => x.connected) ?? [];

  const canAutoRequest = apiConfigured && connectedAutoProviders.length > 0;

  const providerId: CourierProviderIdSafe =
    (courierOverride?.providerId as CourierProviderIdSafe) ??
    ((order.courier?.providerId as CourierProviderIdSafe) || "select");

  const memoNo = courierOverride?.memoNo ?? order.courier?.memoNo ?? "";
  const trackingNo = order.courier?.trackingNo ?? "";

  const label = useMemo(() => {
    // If this order's selected provider is API-connected, show that provider name prominently
    if (apiConnectedForThisOrder) {
      const byName = (order.courier?.providerName || "").trim();
      if (byName) return byName;
      return providerLabel(order.courier?.providerId as CourierProviderIdSafe);
    }

    // Otherwise show the currently selected (or overridden) provider label
    return providerLabel(providerId);
  }, [apiConnectedForThisOrder, providerId, order.courier?.providerId, order.courier?.providerName]);

  const statusPill = useMemo(() => {
    if (apiConnectedForThisOrder) return { text: "API", cls: "bg-success-50 text-success-700 ring-success-200 dark:bg-success-500/10 dark:text-success-200 dark:ring-success-500/30" };
    if (apiConfigured) return { text: "Manual", cls: "bg-gray-50 text-gray-700 ring-gray-200 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10" };
    return { text: "Not Set", cls: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-200 dark:ring-orange-500/30" };
  }, [apiConnectedForThisOrder, apiConfigured]);

  const actionLabel = useMemo(() => {
    if (canAutoRequest) return "REQUEST";
    if (trackingNo || memoNo || providerId !== "select") return "EDIT";
    return "SEND";
  }, [canAutoRequest, trackingNo, memoNo, providerId]);

  const secondaryLine = apiConnectedForThisOrder
    ? trackingNo
      ? `Tracking: ${trackingNo}`
      : "Tracking: —"
    : memoNo
      ? `Memo: ${memoNo}`
      : "Memo: —";

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Compact preview */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              {label}
            </p>

            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                statusPill.cls
              )}
              title={
                apiConnectedForThisOrder
                  ? "Courier API connected"
                  : apiConfigured
                    ? "Courier API configured (manual send)"
                    : "Courier not configured"
              }
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

        {/* Action button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white",
            canAutoRequest ? "bg-success-600 hover:bg-success-700" : "bg-brand-500 hover:bg-brand-600"
          )}
        >
          {actionLabel}
        </button>
      </div>

      <CourierRequestModal
        open={open}
        onClose={() => setOpen(false)}
        order={order}
        courierProviderId={(providerId === "manual" ? "select" : providerId) as CourierProviderId}
        memoNo={memoNo}
        onSaveManual={(p, memo) => onUpdateCourier(order.id, p, memo)}
        onRequestCourier={(provider) => onRequestCourier(order.id, provider)}
      />
    </>
  );
}
