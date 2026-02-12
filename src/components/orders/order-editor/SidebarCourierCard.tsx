import type React from "react";
import { Truck, CheckCircle, FileText } from "lucide-react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { useTranslation } from "react-i18next";

type ProviderItem = { provider: string; is_auto_available: number };

interface SidebarCourierCardProps {
  method: string;
  consignmentId: string;
  trackingUrl?: string;
  lastUpdatedAtLabel?: string;

  // NEW: from API (courierOption)
  anyAutoAvailable?: boolean;
  providers?: ProviderItem[];

  onChange: (patch: { method?: string; consignmentId?: string }) => void;
  onSend: () => void;
  onComplete: () => void;
  onDownloadInvoice: () => void;
}

function toLabel(p: string) {
  return p
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const SidebarCourierCard: React.FC<SidebarCourierCardProps> = ({
  method,
  consignmentId,
  trackingUrl,
  lastUpdatedAtLabel,
  anyAutoAvailable,
  providers,
  onChange,
  onSend,
  onComplete,
  onDownloadInvoice,
}) => {
  const { t } = useTranslation();
  const options =
    providers && providers.length
      ? providers.map((p) => ({
        value: p.provider,
        label: `${toLabel(p.provider)}${p.is_auto_available ? " (Auto)" : ""}`,
      }))
      : [
        { value: "steadfast", label: "Steadfast" },
        { value: "pathao", label: "Pathao" },
        { value: "redx", label: "RedX" },
        { value: "paperfly", label: "Paperfly" },
      ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Truck size={18} />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              {t("orders.orderEditor.courier")}
            </div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">
              {t("orders.orderEditor.shipmentHandling")}
            </div>
          </div>
        </div>

        {providers?.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              {t("orders.orderEditor.providers")}: {providers.length}
            </span>
            {anyAutoAvailable ? (
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                {t("orders.orderEditor.autoAvailable")}
              </span>
            ) : (
              <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {t("orders.orderEditor.manualOnly")}
              </span>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
            {t("orders.orderEditor.selectMethod")}
          </div>
          <Select
            options={options}
            defaultValue={method}
            onChange={(v) => onChange({ method: v })}
            className="bg-white dark:bg-gray-800/50"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={onSend} size="sm" variant="primary">
            {t("orders.orderEditor.sendToCourier")}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
              {t("orders.orderEditor.consignmentId")}
            </div>
            <Input
              value={consignmentId}
              onChange={(e) => onChange({ consignmentId: e.target.value })}
              className="bg-white dark:bg-gray-800/50"
              placeholder={t("orders.orderEditor.consignmentId")}
            />
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
              {t("orders.orderEditor.trackingLink")}
            </div>
            <div className="flex h-11 w-full items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200">
              {trackingUrl ? (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
                >
                  {trackingUrl}
                </a>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">{t("orders.orderEditor.notAvailable")}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={onComplete}
            size="sm"
            variant="success"
            startIcon={<CheckCircle size={14} />}
          >
            {t("orders.orderEditor.complete")}
          </Button>
          <Button
            onClick={onDownloadInvoice}
            size="sm"
            variant="primary"
            startIcon={<FileText size={14} />}
          >
            {t("orders.orderEditor.courierInvoice")}
          </Button>
        </div>

        {lastUpdatedAtLabel ? (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {t("orders.orderEditor.updated")} {lastUpdatedAtLabel}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SidebarCourierCard;
