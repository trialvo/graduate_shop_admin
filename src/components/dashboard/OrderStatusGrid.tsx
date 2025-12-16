import OrderStatusCard from "./OrderStatusCard";
import { dashboardStatusData } from "../../pages/Dashboard/dashboardStatusData";

const OrderStatusGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {dashboardStatusData.map((item) => (
        <OrderStatusCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default OrderStatusGrid;
