import { StatusItem } from "../../pages/Dashboard/dashboardStatusData";
import { useTranslation } from "react-i18next";

interface Props {
  item: StatusItem;
}

const OrderStatusCard = ({ item }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm ${item.iconBg}`}
        >
          {item.icon}
        </div>

        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t(item.titleKey)}
        </h4>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {item.stats.map((stat) => (
          <div key={stat.labelKey} className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t(stat.labelKey)}
            </p>
            <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-white">
              {String(stat.value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusCard;
