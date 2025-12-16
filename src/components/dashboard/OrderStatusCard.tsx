import { StatusItem } from "../../pages/Dashboard/dashboardStatusData";

interface Props {
  item: StatusItem;
}

const OrderStatusCard = ({ item }: Props) => {
  return (
    <div
      className="
        rounded-2xl
        bg-white
        p-5
        shadow-theme-xs
        ring-1 ring-gray-200
        dark:bg-gray-900
        dark:ring-white/10
      "
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${item.iconBg}`}
        >
          {item.icon}
        </div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
          {item.title}
        </h4>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {item.stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {stat.value.toString().padStart(2, "0")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusCard;
