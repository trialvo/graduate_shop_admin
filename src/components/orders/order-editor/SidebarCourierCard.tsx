import type React from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";

type ProviderItem = { provider: string; is_auto_available: number };

interface SidebarCourierCardProps {
  method: string;
  consignmentId: string;
  trackingUrl?: string;
  lastUpdatedAtLabel?: string;

  // ✅ NEW: from API (courierOption)
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
    <div className="rounded-[4px] border border-gray-200 bg-white/70 p-5 shadow-theme-xs backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
          Currier:
        </div>

        {providers?.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
              Providers: {providers.length}
            </span>
            {anyAutoAvailable ? (
              <span className="rounded-full bg-success-500/10 px-2 py-1 text-[11px] font-semibold text-success-700 dark:text-success-300">
                Auto available
              </span>
            ) : (
              <span className="rounded-full bg-gray-900/5 px-2 py-1 text-[11px] font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                Manual only
              </span>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
            Select Method
          </div>
          <Select
            options={options}
            defaultValue={method}
            onChange={(v) => onChange({ method: v })}
            className="bg-white dark:bg-gray-900"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={onSend} size="sm" variant="primary">
            Send
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Consignment ID
            </div>
            <Input
              value={consignmentId}
              onChange={(e) => onChange({ consignmentId: e.target.value })}
              className="bg-white dark:bg-gray-900"
              placeholder="Consignment ID"
            />
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
              Tracking Link
            </div>
            <div className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {trackingUrl ? (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
                >
                  {trackingUrl}
                </a>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">
                  Not available
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center rounded-lg bg-success-500 px-4 py-2 text-xs font-semibold text-white shadow-theme-xs hover:bg-success-600"
          >
            Complete
          </button>
          <button
            type="button"
            onClick={onDownloadInvoice}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-theme-xs hover:bg-purple-700"
          >
            Currier invoice <span aria-hidden>⬇</span>
          </button>
        </div>

        {lastUpdatedAtLabel ? (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {lastUpdatedAtLabel}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SidebarCourierCard;
