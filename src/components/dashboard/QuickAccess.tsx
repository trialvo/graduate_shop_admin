import { useState } from "react";
import { Settings } from "lucide-react";
import QuickAccessCard from "./QuickAccessCard";
import QuickAccessManageModal from "./QuickAccessManageModal";
import { quickAccessList as initialData } from "@/pages/Dashboard/dashboardData";

const QuickAccess = () => {
  const [items, setItems] = useState(initialData);
  const [open, setOpen] = useState(false);

  const pinnedItems = items.filter((i) => i.pinned).slice(0, 6);

  const togglePin = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pinned: !item.pinned } : item
      )
    );
  };

  return (
    <section className="mb-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
          Quick Access
        </h2>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {pinnedItems.map((item) => (
          <QuickAccessCard
            key={item.id}
            name={item.name}
            icon={item.icon}
            color={item.color}
            path={item.path}
          />
        ))}
      </div>

      {/* Manage Modal */}
      <QuickAccessManageModal
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        onTogglePin={togglePin}
      />
    </section>
  );
};

export default QuickAccess;
