import { useMemo, useState } from "react";
import type { CourierProviderId, OrderRow } from "./types";
import CourierRequestModal from "@/components/ui/modal/CourierRequestModal";

type Props = {
  order: OrderRow;

  courierOverride?: { providerId?: CourierProviderId; memoNo?: string };

  onUpdateCourier: (orderId: string, providerId: CourierProviderId, memoNo: string) => void;

  onRequestCourier: (orderId: string, providerId: Exclude<CourierProviderId, "select">) => Promise<void> | void;
};

function providerLabel(id?: CourierProviderId) {
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

  const apiConnected = !!order.courier?.apiConfigured && !!order.courier?.apiConnected;
  const autoList = order.courier?.availableAutoCouriers?.filter((x) => x.connected) ?? [];

  const providerId =
    courierOverride?.providerId ?? order.courier?.providerId ?? "select";
  const memoNo = courierOverride?.memoNo ?? order.courier?.memoNo ?? "";
  const trackingNo = order.courier?.trackingNo ?? "";

  const label = useMemo(() => {
    if (apiConnected) return order.courier?.providerName ?? providerLabel(order.courier?.providerId);
    return providerLabel(providerId);
  }, [apiConnected, providerId, order]);

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Compact preview */}
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            {label}
          </p>

          {apiConnected ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {trackingNo ? `Tracking: ${trackingNo}` : "Tracking: —"}
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {memoNo ? `Memo: ${memoNo}` : "Memo: —"}
            </p>
          )}
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-success-600 px-4 py-2 text-xs font-semibold text-white hover:bg-success-700"
        >
          {apiConnected && autoList.length ? "REQUEST" : "SEND"}
        </button>
      </div>

      <CourierRequestModal
        open={open}
        onClose={() => setOpen(false)}
        order={order}
        courierProviderId={providerId}
        memoNo={memoNo}
        onSaveManual={(p, memo) => onUpdateCourier(order.id, p, memo)}
        onRequestCourier={(provider) => onRequestCourier(order.id, provider)}
      />
    </>
  );
}
