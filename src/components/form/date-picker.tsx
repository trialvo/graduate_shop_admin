import React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value?: string; // expected format: YYYY-MM-DD (native date input)
  onChange?: (value: string) => void;

  placeholder?: string; // used only as label-like hint (native date input doesn't show placeholder reliably)
  id?: string;
  name?: string;

  disabled?: boolean;
  error?: boolean;
  hint?: string;

  className?: string;

  /** show calendar icon on left */
  withIcon?: boolean;

  /** min/max date in YYYY-MM-DD */
  min?: string;
  max?: string;
};

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  id,
  name,
  disabled = false,
  error = false,
  hint,
  className,
  withIcon = true,
  min,
  max,
}: Props) {
  return (
    <div className="relative">
      {withIcon ? (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Calendar size={16} />
        </div>
      ) : null}

      <input
        type="date"
        id={id}
        name={name}
        value={value ?? ""}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          // ✅ fixed height
          "h-10 w-full rounded-[4px] border bg-white px-3 text-sm text-gray-900",
          // ✅ left icon spacing
          withIcon ? "pl-9" : "pl-3",
          // ✅ no ring / no shadow; border-only focus
          "outline-none focus-visible:outline-none focus-visible:border-brand-500",
          "transition-colors duration-150",
          // states
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500 opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            : error
              ? "border-error-500 dark:border-error-500"
              : "border-gray-200 dark:border-gray-700",
          "dark:bg-gray-900 dark:text-white/90",
          className,
        )}
        aria-invalid={error ? "true" : "false"}
        aria-label={placeholder}
      />

      {hint ? (
        <p
          className={cn(
            "mt-1.5 text-xs",
            error ? "text-error-500" : "text-gray-500 dark:text-gray-400",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
