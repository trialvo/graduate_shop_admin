import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { CourierProviderId, OrderRow } from "@/components/orders/all-orders/types";

const MANUAL_COURIERS: { id: CourierProviderId; label: string }[] = [
  { id: "select", label: "Select Courier" },
  { id: "sa_paribahan", label: "S A Paribahan" },
  { id: "pathao", label: "Pathao" },
  { id: "redx", label: "RedX" },
  { id: "delivery_tiger", label: "Delivery Tiger" },
  { id: "sundarban", label: "Sundarban Courier" },
  { id: "steadfast", label: "Steadfast" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderRow;

  courierProviderId?: CourierProviderId;
  memoNo?: string;

  onSaveManual: (providerId: CourierProviderId, memoNo: string) => void;
  onRequestCourier: (providerId: Exclude<CourierProviderId, "select">) => Promise<void> | void;
};

function tabBtn(active: boolean) {
  if (active) {
    return "bg-brand-500 text-white";
  }
  return "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.06]";
}

export default function CourierRequestModal({
  open,
  onClose,
  order,
  courierProviderId,
  memoNo,
  onSaveManual,
  onRequestCourier,
}: Props) {
  const titleId = "courier-request-modal-title";

  const apiConnected = !!order.courier?.apiConfigured && !!order.courier?.apiConnected;
  const autoList = order.courier?.availableAutoCouriers?.filter((x) => x.connected) ?? [];

  const defaultAuto =
    autoList.find((x) => x.isDefault)?.providerId ?? autoList[0]?.providerId;

  const [tab, setTab] = useState<"auto" | "manual">(
    apiConnected && autoList.length ? "auto" : "manual"
  );

  const [autoProvider, setAutoProvider] = useState<
    Exclude<CourierProviderId, "select"> | ""
  >(defaultAuto ?? "");

  const [manualProvider, setManualProvider] = useState<CourierProviderId>(
    courierProviderId ?? order.courier?.providerId ?? "select"
  );
  const [memo, setMemo] = useState<string>(memoNo ?? order.courier?.memoNo ?? "");

  const [loading, setLoading] = useState(false);

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

  const canManualSave = manualProvider !== "select" && memo.trim().length > 0;
  const canAutoRequest = apiConnected && autoList.length > 0 && !!autoProvider;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      titleId={titleId}
      className="w-full max-w-[860px] overflow-hidden"
    >
      <div className="bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3
                id={titleId}
                className="truncate text-lg font-semibold text-gray-900 dark:text-white"
              >
                Send Courier • {order.id}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Auto tab shows API connected couriers. Manual tab allows memo input.
              </p>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("auto")}
                disabled={!apiConnected || !autoList.length}
                className={`h-10 flex-1 sm:flex-none rounded-lg px-4 text-sm font-semibold transition ${
                  tabBtn(tab === "auto")
                } ${!apiConnected || !autoList.length ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Auto (API)
              </button>

              <button
                type="button"
                onClick={() => setTab("manual")}
                className={`h-10 flex-1 sm:flex-none rounded-lg px-4 text-sm font-semibold transition ${tabBtn(
                  tab === "manual"
                )}`}
              >
                Manual
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-12 gap-4 px-6 py-6">
          {/* Preview */}
          <div className="col-span-12 md:col-span-6">
            <div className="rounded-[4px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Preview Details
              </h4>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400">Receiver</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {preview.receiverName ?? "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400">Phone</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {preview.receiverPhone ?? "—"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400">Address</span>
                  <span className="text-right font-semibold text-gray-900 dark:text-white">
                    {preview.address ?? "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400">Area</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {preview.area ?? "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400">COD</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {order.currencySymbol}
                    {(preview.codAmount ?? 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400">Weight</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(preview.weightKg ?? 1).toFixed(1)} kg
                  </span>
                </div>

                <div className="mt-3 rounded-[4px] border border-gray-200 bg-white p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                  <span className="font-semibold text-brand-500">Note: </span>
                  {order.orderNote?.trim() ? order.orderNote : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="col-span-12 md:col-span-6">
            <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {tab === "auto" ? "Auto (API) Couriers" : "Manual Input"}
              </h4>

              {/* AUTO TAB */}
              {tab === "auto" ? (
                <div className="mt-4 space-y-4">
                  {/* show connected couriers list */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Connected Couriers
                    </label>

                    <select
                      value={autoProvider}
                      onChange={(e) => setAutoProvider(e.target.value as any)}
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                    >
                      {!autoList.length ? (
                        <option value="">No connected courier found</option>
                      ) : null}

                      {autoList.map((c) => (
                        <option key={c.providerId} value={c.providerId}>
                          {c.providerName}
                          {c.isDefault ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {apiConnected
                        ? "Select courier and request with one click."
                        : "API not connected. Use Manual tab."}
                    </p>
                  </div>

                  {/* show existing tracking/memo if any */}
                  <div className="rounded-[4px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Tracking
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {order.courier?.trackingNo ?? "—"}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Memo
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {order.courier?.memoNo ?? "—"}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      {order.courier?.autoDetected
                        ? "Auto-detected info available."
                        : "No auto-detected info yet."}
                    </div>
                  </div>
                </div>
              ) : (
                /* MANUAL TAB */
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Courier
                    </label>
                    <select
                      value={manualProvider}
                      onChange={(e) => setManualProvider(e.target.value as CourierProviderId)}
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                    >
                      {MANUAL_COURIERS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Memo Number
                    </label>
                    <input
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="Enter memo number"
                      className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                    />
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Manual mode: you can store memo number and courier name for record.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {order.courier?.lastMessage ?? "Ready"}
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={onClose} className="h-11">
                Cancel
              </Button>

              {tab === "auto" ? (
                <Button
                  className="h-11"
                  disabled={!canAutoRequest || loading}
                  onClick={async () => {
                    if (!autoProvider) return;
                    try {
                      setLoading(true);
                      await onRequestCourier(autoProvider as any);
                      onClose();
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Requesting..." : "Request Courier"}
                </Button>
              ) : (
                <Button
                  className="h-11"
                  disabled={!canManualSave}
                  onClick={() => {
                    onSaveManual(manualProvider, memo.trim());
                    onClose();
                  }}
                >
                  Save & Send
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
