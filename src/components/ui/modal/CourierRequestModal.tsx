import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";

import type { OrderRow } from "@/components/orders/all-orders/types";
import {
  dispatchOrderCourier,
  manualDispatchOrder,
  ordersKeys,
  type DispatchCourierProvider,
} from "@/api/orders.api";

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderRow;
};

function tabBtn(active: boolean) {
  if (active) return "bg-brand-500 text-white";
  return "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.06]";
}

function formatMoney(symbol: string | undefined, n: unknown) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : Number(n ?? 0) || 0;
  return `${symbol ?? ""}${v.toLocaleString()}`;
}

function toDispatchProviderId(v: string): DispatchCourierProvider | null {
  const id = String(v || "").toLowerCase().trim();
  if (id === "paperfly") return "paperfly";
  if (id === "redx") return "redx";
  if (id === "pathao") return "pathao";
  if (id === "steadfast") return "steadfast";
  return null;
}

function readApiError(err: any, fallback: string) {
  return (
    err?.response?.data?.error ??
    err?.response?.data?.message ??
    err?.response?.data?.flag ??
    err?.message ??
    fallback
  );
}

export default function CourierRequestModal({ open, onClose, order }: Props) {
  const titleId = "courier-request-modal-title";
  const queryClient = useQueryClient();

  const autoConnectedList = useMemo(() => {
    const list = order.courier?.availableAutoCouriers ?? [];
    // UI "connected" already maps is_auto_available===1 in your list mapping
    return list.filter((x) => x.connected);
  }, [order.courier?.availableAutoCouriers]);

  const hasAnyAuto = Boolean(order.courier?.apiConfigured) && autoConnectedList.length > 0;

  const defaultAuto = useMemo(() => {
    const first = autoConnectedList.find((x) => x.isDefault)?.providerId ?? autoConnectedList[0]?.providerId;
    return first ? String(first) : "";
  }, [autoConnectedList]);

  const [tab, setTab] = useState<"auto" | "manual">(hasAnyAuto ? "auto" : "manual");

  // Auto
  const [autoProvider, setAutoProvider] = useState<string>(defaultAuto);
  const [autoWeightKg, setAutoWeightKg] = useState<string>("1");

  // Manual
  const [manualProvider, setManualProvider] = useState<string>(defaultAuto || "steadfast");
  const [manualTracking, setManualTracking] = useState<string>("");
  const [manualReferenceId, setManualReferenceId] = useState<string>("");
  const [manualMemo, setManualMemo] = useState<string>("");
  const [manualWeightKg, setManualWeightKg] = useState<string>("1");

  // reset when modal opens
  useEffect(() => {
    if (!open) return;

    const nextHasAuto = Boolean(order.courier?.apiConfigured) && autoConnectedList.length > 0;
    setTab(nextHasAuto ? "auto" : "manual");

    setAutoProvider(defaultAuto);
    setAutoWeightKg("1");

    setManualProvider(defaultAuto || "steadfast");
    setManualTracking("");
    setManualReferenceId("");
    setManualMemo("");
    setManualWeightKg("1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order.id]);

  const preview = useMemo(() => {
    return (
      order.courier?.preview ?? {
        receiverName: order.customerName,
        receiverPhone: order.customerPhone,
        address: order.shippingAddress ?? "—",
        area: order.shippingArea ?? order.shippingLocation,
        codAmount: order.paymentMethod === "COD" ? order.total : 0,
        weightKg: 1,
      }
    );
  }, [order]);

  const deliveryInfo = useMemo(() => {
    const shippingCost = Number(order.shippingCost ?? 0) || 0;
    const discount = Number(order.discount ?? 0) || 0;
    const paidAmount = Number(order.paidAmount ?? 0) || 0;

    return {
      shippingCost,
      discount,
      paidAmount,
      dueAmount: Math.max(0, Number(order.total ?? 0) - paidAmount),
    };
  }, [order]);

  const existingTracking = order.courier?.trackingNo ?? "—";
  const existingProvider = order.courier?.providerName ?? "—";
  const existingMemo = order.courier?.memoNo ?? "—";

  const dispatchMutation = useMutation({
    mutationFn: async (payload: { provider: DispatchCourierProvider; weight?: number }) => {
      return dispatchOrderCourier(Number(order.id), {
        courier_provider: payload.provider,
        weight: payload.weight,
      });
    },
    onSuccess: async (res) => {
      toast.success(res?.message || "Order dispatched successfully");
      await queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: ordersKeys.details() });
      onClose();
    },
    onError: (err: any) => {
      toast.error(readApiError(err, "Failed to dispatch order"));
    },
  });

  const manualDispatchMutation = useMutation({
    mutationFn: async (payload: {
      provider: DispatchCourierProvider;
      tracking_number?: string;
      reference_id?: string;
      memo?: string;
      weight?: number;
    }) => {
      return manualDispatchOrder(Number(order.id), {
        courier_provider: payload.provider,
        tracking_number: payload.tracking_number || undefined,
        reference_id: payload.reference_id || undefined,
        memo: payload.memo || undefined,
        weight: payload.weight,
      });
    },
    onSuccess: async (res) => {
      toast.success(res?.message || "Order manually dispatched successfully");
      await queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: ordersKeys.details() });
      onClose();
    },
    onError: (err: any) => {
      toast.error(readApiError(err, "Failed to manual dispatch"));
    },
  });

  const autoProviderId = toDispatchProviderId(autoProvider);
  const manualProviderId = toDispatchProviderId(manualProvider);

  const autoWeight = Math.max(0, Number(autoWeightKg || "0") || 0) || undefined;
  const manualWeight = Math.max(0, Number(manualWeightKg || "0") || 0) || undefined;

  const canAutoRequest = hasAnyAuto && !!autoProviderId && !dispatchMutation.isPending;
  const canManualSend = !!manualProviderId && !manualDispatchMutation.isPending;

  return (
    <Modal isOpen={open} onClose={onClose} titleId={titleId} className="w-full max-w-[980px] overflow-hidden">
      <div className="bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 id={titleId} className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                Send Courier • {order.id}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Auto uses API dispatch. Manual uses manual dispatch API. Providers list depends on your API availability.
              </p>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setTab("auto")}
                disabled={!hasAnyAuto}
                className={cn(
                  "h-10 flex-1 rounded-lg px-4 text-sm font-semibold transition sm:flex-none",
                  tabBtn(tab === "auto"),
                  !hasAnyAuto && "cursor-not-allowed opacity-50"
                )}
              >
                Auto (API)
              </button>

              <button
                type="button"
                onClick={() => setTab("manual")}
                className={cn(
                  "h-10 flex-1 rounded-lg px-4 text-sm font-semibold transition sm:flex-none",
                  tabBtn(tab === "manual")
                )}
              >
                Manual
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-12 gap-4 px-6 py-6">
          {/* LEFT */}
          <div className="col-span-12 space-y-4 md:col-span-6">
            {/* Receiver + Address */}
            <div className="rounded-[6px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Receiver</h4>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {preview.receiverName ?? "—"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{preview.receiverPhone ?? "—"}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">COD Amount</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatMoney(order.currencySymbol, preview.codAmount ?? 0)}
                  </p>

                  <p className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Weight</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {(typeof preview.weightKg === "number" ? preview.weightKg : 1).toFixed(1)} kg
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[6px] border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Delivery Address</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{preview.address ?? "—"}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Area: <span className="font-semibold text-gray-900 dark:text-white">{preview.area ?? "—"}</span>
                </p>
              </div>
            </div>

            {/* Delivery + Money */}
            <div className="rounded-[6px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Delivery Information</h4>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-[6px] border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Shipping Cost</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {formatMoney(order.currencySymbol, deliveryInfo.shippingCost)}
                  </p>
                </div>

                <div className="rounded-[6px] border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Discount</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {formatMoney(order.currencySymbol, deliveryInfo.discount)}
                  </p>
                </div>

                <div className="rounded-[6px] border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Paid</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {formatMoney(order.currencySymbol, deliveryInfo.paidAmount)}
                  </p>
                </div>

                <div className="rounded-[6px] border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Due</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {formatMoney(order.currencySymbol, deliveryInfo.dueAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[6px] border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                <span className="font-semibold text-brand-500">Order Note: </span>
                {order.orderNote?.trim() ? order.orderNote : "—"}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-12 md:col-span-6">
            <div className="rounded-[6px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {tab === "auto" ? "Auto (API) Couriers" : "Manual Courier Dispatch"}
              </h4>

              {/* Existing */}
              <div className="mt-4 rounded-[6px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Current Provider</p>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">{existingProvider}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tracking</p>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">{existingTracking}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Memo</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{existingMemo}</p>
                </div>
              </div>

              {/* AUTO */}
              {tab === "auto" ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Available Auto Couriers
                    </label>

                    <select
                      value={autoProvider}
                      onChange={(e) => setAutoProvider(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                    >
                      {!autoConnectedList.length ? <option value="">No available courier</option> : null}
                      {autoConnectedList.map((c) => (
                        <option key={c.providerId} value={String(c.providerId)}>
                          {c.providerName}
                          {c.isDefault ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Showing only providers where <span className="font-semibold">is_auto_available = 1</span>.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Weight (kg) <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      value={autoWeightKg}
                      onChange={(e) => setAutoWeightKg(e.target.value)}
                      type="number"
                      min={0}
                      step="0.1"
                      placeholder="e.g. 1"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                    />
                  </div>

                  <div className="rounded-[6px] border border-brand-500/20 bg-brand-500/5 p-3 text-xs text-gray-700 dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-gray-200">
                    If API dispatch fails, it usually means: order is cancelled / not approved / already processing.
                  </div>
                </div>
              ) : (
                /* MANUAL */
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Courier Provider
                    </label>

                    <select
                      value={manualProvider}
                      onChange={(e) => setManualProvider(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                    >
                      {(["steadfast", "redx", "pathao", "paperfly"] as const).map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Manual dispatch API supports: steadfast, redx, pathao, paperfly.
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-6">
                      <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Tracking Number <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        value={manualTracking}
                        onChange={(e) => setManualTracking(e.target.value)}
                        placeholder="PF-2025-009812"
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Reference ID <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        value={manualReferenceId}
                        onChange={(e) => setManualReferenceId(e.target.value)}
                        placeholder="INV-77821"
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                      />
                    </div>

                    <div className="col-span-12">
                      <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Memo <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        value={manualMemo}
                        onChange={(e) => setManualMemo(e.target.value)}
                        placeholder="Manually booked from courier dashboard"
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                      />
                    </div>

                    <div className="col-span-12 md:col-span-6">
                      <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Weight (kg) <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        value={manualWeightKg}
                        onChange={(e) => setManualWeightKg(e.target.value)}
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="e.g. 1"
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                      />
                    </div>
                  </div>

                  <div className="rounded-[6px] border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                    Manual mode will call <span className="font-semibold">/admin/order/manualDispatchOrder/:id</span>.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{order.courier?.lastMessage ?? "Ready"}</p>

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={onClose} className="h-11" disabled={dispatchMutation.isPending || manualDispatchMutation.isPending}>
                Cancel
              </Button>

              {tab === "auto" ? (
                <Button
                  className="h-11"
                  disabled={!canAutoRequest}
                  onClick={() => {
                    if (!autoProviderId) return;
                    dispatchMutation.mutate({ provider: autoProviderId, weight: autoWeight });
                  }}
                >
                  {dispatchMutation.isPending ? "Requesting..." : "Request Courier"}
                </Button>
              ) : (
                <Button
                  className="h-11"
                  disabled={!canManualSend}
                  onClick={() => {
                    if (!manualProviderId) return;
                    manualDispatchMutation.mutate({
                      provider: manualProviderId,
                      tracking_number: manualTracking.trim() || undefined,
                      reference_id: manualReferenceId.trim() || undefined,
                      memo: manualMemo.trim() || undefined,
                      weight: manualWeight,
                    });
                  }}
                >
                  {manualDispatchMutation.isPending ? "Sending..." : "Send Manual"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
