"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import type { CourierProviderId, OrderRow } from "@/components/orders/all-orders/types";

type AutoProviderId = Exclude<CourierProviderId, "select" | "manual">;

type Props = {
  open: boolean;
  onClose: () => void;

  order: OrderRow;

  onAutoDispatch: (payload: { provider: AutoProviderId; weightKg?: number }) => Promise<void>;
  onManualDispatch: (payload: {
    provider: AutoProviderId;
    trackingNumber?: string;
    referenceId?: string;
    memo?: string;
    weightKg?: number;
  }) => Promise<void>;
};

export default function CourierRequestModal({
  open,
  onClose,
  order,
  onAutoDispatch,
  onManualDispatch,
}: Props) {
  const connectedAutoProviders = useMemo(() => {
    const list = order.courier?.availableAutoCouriers ?? [];
    return list.filter((x) => x.connected).map((x) => ({
      id: x.providerId as AutoProviderId,
      name: x.providerName,
    }));
  }, [order.courier?.availableAutoCouriers]);

  const hasAuto = connectedAutoProviders.length > 0;

  const [mode, setMode] = useState<"auto" | "manual">(hasAuto ? "auto" : "manual");

  const [provider, setProvider] = useState<AutoProviderId>(
    (connectedAutoProviders[0]?.id as AutoProviderId) || "steadfast"
  );

  const [weightKg, setWeightKg] = useState<string>("");

  // manual fields
  const [trackingNumber, setTrackingNumber] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [memo, setMemo] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const providerOptionsAuto = connectedAutoProviders;
  const providerOptionsManual = useMemo(
    () =>
      [
        { id: "paperfly", name: "Paperfly" },
        { id: "redx", name: "RedX" },
        { id: "pathao", name: "Pathao" },
        { id: "steadfast", name: "Steadfast" },
      ] as const,
    []
  );

  if (!open) return null;

  const submit = async () => {
    if (!provider) {
      toast.error("Select courier provider");
      return;
    }

    const w = weightKg.trim() ? Number(weightKg) : undefined;
    const safeWeight = w !== undefined && Number.isFinite(w) && w > 0 ? w : undefined;

    try {
      setSubmitting(true);

      if (mode === "auto") {
        await onAutoDispatch({ provider, weightKg: safeWeight });
      } else {
        await onManualDispatch({
          provider,
          weightKg: safeWeight,
          trackingNumber: trackingNumber.trim() || undefined,
          referenceId: referenceId.trim() || undefined,
          memo: memo.trim() || undefined,
        });
      }

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={submitting ? undefined : onClose}
        aria-label="Close"
      />

      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Dispatch Courier
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Order #{order.id}
            </p>
          </div>

          <button
            type="button"
            onClick={submitting ? undefined : onClose}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]"
          >
            Close
          </button>
        </div>

        {/* Mode */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("auto")}
            disabled={!hasAuto || submitting}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold ring-1 transition",
              mode === "auto"
                ? "bg-success-600 text-white ring-success-600"
                : "bg-white text-gray-700 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800",
              !hasAuto && "opacity-50 cursor-not-allowed"
            )}
          >
            Auto (API)
          </button>

          <button
            type="button"
            onClick={() => setMode("manual")}
            disabled={submitting}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold ring-1 transition",
              mode === "manual"
                ? "bg-brand-500 text-white ring-brand-500"
                : "bg-white text-gray-700 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800"
            )}
          >
            Manual
          </button>
        </div>

        {/* Provider */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Courier Provider
          </label>

          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AutoProviderId)}
            disabled={submitting}
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          >
            {(mode === "auto" ? providerOptionsAuto : providerOptionsManual).map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>

          {mode === "auto" && !hasAuto ? (
            <p className="mt-2 text-xs text-orange-600 dark:text-orange-300">
              No auto courier is connected. Use Manual.
            </p>
          ) : null}
        </div>

        {/* Weight */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            Weight (kg) <span className="text-gray-400">(optional)</span>
          </label>
          <input
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            disabled={submitting}
            placeholder="e.g. 1.5"
            className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
          />
        </div>

        {/* Manual extra fields */}
        {mode === "manual" ? (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Tracking Number <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                disabled={submitting}
                placeholder="PF-2025-009812"
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Reference ID <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                disabled={submitting}
                placeholder="INV-77821"
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Memo <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                disabled={submitting}
                placeholder="Manually booked from dashboard"
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
              />
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={submitting || (mode === "auto" && !hasAuto)}
            className={cn(
              "h-11 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50",
              mode === "auto" ? "bg-success-600 hover:bg-success-700" : "bg-brand-500 hover:bg-brand-600"
            )}
          >
            {submitting ? "Sending..." : mode === "auto" ? "Save & Send (Auto)" : "Save & Send (Manual)"}
          </button>
        </div>
      </div>
    </div>
  );
}
