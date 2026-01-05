import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  changePercent: number;
  weeklyText: string;
  trendUp?: boolean;
  icon: React.ReactNode;
}

const MetricCard = ({
  title,
  value,
  changePercent,
  weeklyText,
  trendUp = true,
  icon,
}: MetricCardProps) => {
  return (
    <div
      className="
        relative overflow-hidden rounded-[4px]
        bg-white
        p-5
        shadow-theme-md
        ring-1 ring-gray-200
        dark:bg-gray-900
        dark:ring-white/10
      "
    >
      {/* Top */}
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex items-center gap-2 text-sm font-medium ${
            trendUp
              ? "text-success-600 dark:text-success-500"
              : "text-danger-600 dark:text-danger-500"
          }`}
        >
          <span className="flex items-center gap-1">
            {icon}
            {trendUp ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {Math.abs(changePercent)}%
          </span>
        </div>

        {/* Sparkline placeholder */}
        <div className="h-6 w-16">
          <div
            className={`h-full w-full rounded ${
              trendUp
                ? "bg-success-500/20"
                : "bg-danger-500/20"
            }`}
          />
        </div>
      </div>

      {/* Title */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {title}
      </p>

      {/* Value */}
      <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>

      {/* Divider */}
      <div className="my-4 h-px w-full bg-gray-200 dark:bg-white/10" />

      {/* Bottom */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{weeklyText}</span>

        <span
          className={`flex items-center gap-1 ${
            trendUp
              ? "text-success-600 dark:text-success-500"
              : "text-danger-600 dark:text-danger-500"
          }`}
        >
          {trendUp ? (
            <ArrowUpRight size={12} />
          ) : (
            <ArrowDownRight size={12} />
          )}
          vs yesterday
        </span>
      </div>
    </div>
  );
};

export default MetricCard;
