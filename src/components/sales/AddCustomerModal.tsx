import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import type { Customer } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (c: Customer) => void;
}

const AddCustomerModal = ({ open, onClose, onCreate }: Props) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");

  const canSave = name.trim() && phone.trim();

  return (
    <Modal isOpen={open} onClose={onClose} className="w-full max-w-[700px] max-h-[700px] overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Add New Customer
        </h3>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Customer Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="col-span-12">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address (optional)
            </label>
            <input
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!canSave) return;
              onCreate({
                id: `C-${Date.now()}`,
                name: name.trim(),
                phone: phone.trim(),
                addresses: addressLine.trim()
                  ? [{ label: "Home", addressLine: addressLine.trim(), phone: phone.trim() }]
                  : [],
              });
              onClose();
              setName("");
              setPhone("");
              setAddressLine("");
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCustomerModal;
