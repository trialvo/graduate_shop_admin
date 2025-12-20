import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";
import AddCustomerModal from "./AddCustomerModal";
import type { CartItem, Customer } from "./types";

interface Props {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  cart: CartItem[];
  onUpdateQty: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
  deliveryMethods: { id: string; name: string }[];
}

const BillingPanel = ({
  customers,
  setCustomers,
  cart,
  onUpdateQty,
  onRemove,
  deliveryMethods,
}: Props) => {
  const [customerId, setCustomerId] = useState<string>("");
  const [isGuest, setIsGuest] = useState(false);

  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId) ?? null,
    [customers, customerId]
  );

  const [addressIndex, setAddressIndex] = useState(0);
  const address = selectedCustomer?.addresses?.[addressIndex] ?? null;

  const [payBy, setPayBy] = useState<"cod" | "bkash">("cod");
  const [trx, setTrx] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState(deliveryMethods[0]?.id ?? "home");

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),
    [cart]
  );

  const discount = 0;
  const deliveryFee = 0;
  const tax = 0;
  const total = subtotal - discount + deliveryFee + tax;

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Billing Section
        </h3>
      </div>

      {/* Customer Select + Add */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-7">
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setAddressIndex(0);
              setIsGuest(false);
            }}
            className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            disabled={isGuest}
          >
            <option value="">{isGuest ? "Guest selected" : "Select customer"}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <button
            onClick={() => setAddCustomerOpen(true)}
            className="h-12 w-full rounded-lg bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Add New Customer
          </button>
        </div>

        <div className="col-span-12">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isGuest}
              onChange={(e) => {
                setIsGuest(e.target.checked);
                if (e.target.checked) setCustomerId("");
              }}
            />
            Guest
          </label>
        </div>
      </div>

      {/* Delivery info */}
      <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
              Delivery Information
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({deliveryMethods.find(d => d.id === deliveryMethod)?.name ?? "Home Delivery"})
            </span>
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            title="Edit delivery"
            onClick={() => {
              // hook later: open delivery edit modal
            }}
          >
            <Pencil size={16} />
          </button>
        </div>

        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
              Delivery Method
            </label>
            <select
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            >
              {deliveryMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {!isGuest && selectedCustomer?.addresses?.length ? (
            <>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                Address
              </label>
              <select
                value={addressIndex}
                onChange={(e) => setAddressIndex(Number(e.target.value))}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
              >
                {selectedCustomer.addresses.map((a, idx) => (
                  <option key={`${a.label}-${idx}`} value={idx}>
                    {a.label} — {a.addressLine}
                  </option>
                ))}
              </select>

              {address ? (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {address.phone ?? selectedCustomer.phone}
                  </div>
                  <div>{address.addressLine}</div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isGuest ? "Guest delivery info (add later)" : "No address found for this customer"}
            </div>
          )}
        </div>
      </div>

      {/* Cart list */}
      <div className="mt-4 flex-1 overflow-auto custom-scrollbar">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-700 dark:bg-white/[0.04] dark:text-gray-200">
            <div className="col-span-6">Food</div>
            <div className="col-span-2 text-center">QTY</div>
            <div className="col-span-3 text-center">Unit Price</div>
            <div className="col-span-1 text-right">Del</div>
          </div>

          {cart.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Cart is empty
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {cart.map((i) => (
                <div key={i.key} className="grid grid-cols-12 items-center px-4 py-3">
                  <div className="col-span-6 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {i.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {i.sku}
                      {i.variant ? ` • ${i.variant}` : ""}{i.size ? ` • ${i.size}` : ""}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <input
                      type="number"
                      min={1}
                      value={i.qty}
                      onChange={(e) => onUpdateQty(i.key, Math.max(1, Number(e.target.value)))}
                      className="h-9 w-14 rounded-lg border border-gray-200 px-2 text-center text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-3 text-center text-sm text-gray-600 dark:text-gray-300">
                    ${i.unitPrice.toFixed(2)}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => onRemove(i.key)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Subtotal :</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Discount :</span>
            <span>- ${discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Delivery fee :</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Tax :</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="my-2 h-px bg-gray-200 dark:bg-gray-800" />
          <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
            <span>Total :</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Pay by */}
        <div className="mt-5">
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">Paid By</p>

          <div className="flex gap-2">
            <button
              onClick={() => setPayBy("cod")}
              className={`rounded-lg px-4 py-2 text-sm ring-1 transition ${
                payBy === "cod"
                  ? "bg-gray-800 text-white ring-gray-800 dark:bg-white dark:text-gray-900 dark:ring-white"
                  : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
              }`}
            >
              Cash On Delivery
            </button>

            <button
              onClick={() => setPayBy("bkash")}
              className={`rounded-lg px-4 py-2 text-sm ring-1 transition ${
                payBy === "bkash"
                  ? "bg-gray-800 text-white ring-gray-800 dark:bg-white dark:text-gray-900 dark:ring-white"
                  : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-800 dark:hover:bg-white/[0.03]"
              }`}
            >
              bKash
            </button>
          </div>

          {payBy === "bkash" ? (
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-300">
                bKash TRX ID
              </label>
              <input
                value={trx}
                onChange={(e) => setTrx(e.target.value)}
                placeholder="Enter transaction id"
                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-12 gap-3">
        <div className="col-span-12 md:col-span-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // clear cart handled by parent typically
              window.dispatchEvent(new CustomEvent("new-sale-clear-cart"));
            }}
          >
            Clear Cart
          </Button>
        </div>

        <div className="col-span-12 md:col-span-6">
          <button
            className="h-11 w-full rounded-lg bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600"
            onClick={() => {
              // hook later: submit order
              // validate: if bkash require trx
            }}
          >
            Place Order
          </button>
        </div>
      </div>

      <AddCustomerModal
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onCreate={(c) => {
          setCustomers((prev) => [c, ...prev]);
          setCustomerId(c.id);
          setIsGuest(false);
        }}
      />
    </div>
  );
};

export default BillingPanel;
