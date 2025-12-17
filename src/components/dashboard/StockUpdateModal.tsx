import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    stock: number;
  };
  onUpdate: (stock: number) => void;
}

const StockUpdateModal = ({ open, onClose, product, onUpdate }: Props) => {
  const [value, setValue] = useState(product.stock);

  const handleSave = () => {
    if (value < 0) return;
    onUpdate(value);
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      className="max-w-[420px] w-full p-6"
    >
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        Update Stock
      </h3>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {product.title}
      </p>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Stock Quantity
        </label>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  );
};

export default StockUpdateModal;
