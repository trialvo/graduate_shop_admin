import * as React from "react";
import { cn } from "@/lib/utils";
import { MetricsRange } from "./MetricCard";
interface Props {
  value: MetricsRange;
  onChange: (value: MetricsRange) => void;
}

const options: { label: string; value: MetricsRange }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const MetricsFilter: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
            value === opt.value
              ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 dark:bg-gray-700 dark:text-white dark:ring-white/10"
              : "text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default MetricsFilter;
