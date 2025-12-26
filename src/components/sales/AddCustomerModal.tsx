import { useEffect, useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
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

  useEffect(() => {
    if (!open) return;
    // keep values if you want; or reset on open:
    // setName(""); setPhone(""); setAddressLine("");
  }, [open]);

  const canSave = useMemo(() => {
    return Boolean(name.trim() && phone.trim());
  }, [name, phone]);

  const titleId = "add-customer-modal-title";

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      titleId={titleId}
      className="w-full max-w-[760px] overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <h3
          id={titleId}
          className="text-lg font-semibold text-gray-900 dark:text-white/90"
        >
          Add New Customer
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a customer profile to use for billing and delivery.
        </p>
      </div>

      {/* Body */}
      <div className="px-6 py-6">
        <div className="rounded-[4px] border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/5">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Customer Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sajjad Hossain"
                className="h-11 w-full rounded-[4px] border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-12">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01700-000000"
                className="h-11 w-full rounded-[4px] border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Phone is required for delivery/contact.
              </p>
            </div>

            <div className="col-span-12">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Address (optional)
              </label>
              <input
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="e.g. Dhaka, Mirpur 10"
                className="h-11 w-full rounded-[4px] border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Required: Name + Phone
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              startIcon={<UserPlus size={16} />}
              disabled={!canSave}
              onClick={() => {
                if (!canSave) return;

                onCreate({
                  id: `C-${Date.now()}`,
                  name: name.trim(),
                  phone: phone.trim(),
                  addresses: addressLine.trim()
                    ? [
                        {
                          label: "Home",
                          addressLine: addressLine.trim(),
                          phone: phone.trim(),
                        },
                      ]
                    : [],
                });

                onClose();
                setName("");
                setPhone("");
                setAddressLine("");
              }}
            >
              Save Customer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddCustomerModal;
