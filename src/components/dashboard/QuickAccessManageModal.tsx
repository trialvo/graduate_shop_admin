import { Pin, PinOff } from "lucide-react";
import { QuickAccessItem } from "../../pages/Dashboard/dashboardData";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  items: QuickAccessItem[];
  onTogglePin: (id: number) => void;
}

const MAX_PIN = 6;

const QuickAccessManageModal = ({
  open,
  onClose,
  items,
  onTogglePin,
}: Props) => {
  const pinnedCount = items.filter((i) => i.pinned).length;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      className="
        w-full
        max-w-[700px]
        max-h-[700px]
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="border-b px-6 py-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Manage Quick Access
        </h3>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-[calc(700px-72px)] overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {items.map((item) => {
            const disablePin = !item.pinned && pinnedCount >= MAX_PIN;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 text-white ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {item.name}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant={item.pinned ? "outline" : "primary"}
                  disabled={disablePin}
                  onClick={() => onTogglePin(item.id)}
                  className={
                    item.pinned
                      ? "text-red-600 ring-red-300 hover:bg-red-50 dark:text-red-400"
                      : ""
                  }
                >
                  {item.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                </Button>
              </div>
            );
          })}

          {pinnedCount >= MAX_PIN && (
            <p className="text-xs text-red-500">
              Maximum {MAX_PIN} shortcuts can be pinned.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QuickAccessManageModal;
