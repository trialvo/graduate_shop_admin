import { StatusItem } from "../../pages/Dashboard/dashboardStatusData";
import { useTranslation } from "react-i18next";

interface Props {
  item: StatusItem;
}

const OrderStatusCard = ({ item }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${item.iconBg}`}
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
          <div key={stat.labelKey}>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {String(stat.value).padStart(2, "0")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t(stat.labelKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusCard;
