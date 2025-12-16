import { MetricsRange } from "../../pages/Dashboard/dashboardMetricsData";

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

const MetricsFilter = ({ value, onChange }: Props) => {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            value === opt.value
              ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default MetricsFilter;
