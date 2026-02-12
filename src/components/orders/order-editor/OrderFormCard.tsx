// src/components/orders/order-editor/OrderFormCard.tsx

import type React from "react";
import { ClipboardList, Save } from "lucide-react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";

import type { DeliveryType, OrderStatus, PaymentMethod, PaymentStatus } from "./types";

interface OrderFormValues {
  billingName: string;
  shippingAddress: string;
  orderStatus: OrderStatus;
  phone: string;
  altPhone: string;
  paymentStatus: PaymentStatus;
  deliveryType: DeliveryType;
  city: string;
  postalCode: string;
  email: string;
  paymentMethod: PaymentMethod;
  note: string;
}

interface OrderFormCardProps {
  values: OrderFormValues;
  onChange: <K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) => void;
  onSubmit: () => void;
}

const OrderFormCard: React.FC<OrderFormCardProps> = ({ values, onChange, onSubmit }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <ClipboardList size={18} />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Order Details
            </div>
            <div className="text-base font-semibold text-gray-900 dark:text-white">
              Customer & Status
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Update essential order fields and contact information.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
              Billing Name
            </div>
            <Input
              value={values.billingName}
              onChange={(e) => onChange("billingName", e.target.value)}
              placeholder="Billing name"
              className="bg-white dark:bg-gray-800/50"
            />
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
              Order Status
            </div>
            <Select
              options={[
                { value: "new", label: "New" },
                { value: "approved", label: "Approved" },
                { value: "processing", label: "Processing" },
                { value: "packaging", label: "Packaging" },
                { value: "shipped", label: "Shipped" },
                { value: "out_for_delivery", label: "Out for delivery" },
                { value: "delivered", label: "Delivered" },
                { value: "returned", label: "Returned" },
                { value: "cancelled", label: "Cancelled" },
                { value: "on_hold", label: "On hold" },
                { value: "trash", label: "Trash" },
              ]}
              defaultValue={values.orderStatus}
              onChange={(v) => onChange("orderStatus", v as OrderStatus)}
              className="bg-white dark:bg-gray-800/50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Payment Status
              </div>
              <Select
                options={[
                  { value: "paid", label: "Paid" },
                  { value: "partial_paid", label: "Partial paid" },
                  { value: "unpaid", label: "Unpaid" },
                ]}
                defaultValue={values.paymentStatus}
                onChange={(v) => onChange("paymentStatus", v as PaymentStatus)}
                className="bg-white dark:bg-gray-800/50"
              />
            </div>
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Delivery Type
              </div>
              <Select
                options={[
                  { value: "inside_dhaka", label: "Inside Dhaka" },
                  { value: "out_of_dhaka", label: "Out of Dhaka" },
                ]}
                defaultValue={values.deliveryType}
                onChange={(v) => onChange("deliveryType", v as DeliveryType)}
                className="bg-white dark:bg-gray-800/50"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
              Email
            </div>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="Email"
              className="bg-white dark:bg-gray-800/50"
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
              Shipping Address
            </div>
            <Input
              value={values.shippingAddress}
              onChange={(e) => onChange("shippingAddress", e.target.value)}
              placeholder="Shipping address"
              className="bg-white dark:bg-gray-800/50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Phone
              </div>
              <Input
                value={values.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder="Phone"
                className="bg-white dark:bg-gray-800/50"
              />
            </div>
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Alt Phone
              </div>
              <Input
                value={values.altPhone}
                onChange={(e) => onChange("altPhone", e.target.value)}
                placeholder="Alternative phone"
                className="bg-white dark:bg-gray-800/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                City
              </div>
              <Input
                value={values.city}
                onChange={(e) => onChange("city", e.target.value)}
                placeholder="City"
                className="bg-white dark:bg-gray-800/50"
              />
            </div>
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Postal Code
              </div>
              <Input
                value={values.postalCode}
                onChange={(e) => onChange("postalCode", e.target.value)}
                placeholder="Postal code"
                className="bg-white dark:bg-gray-800/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Payment Type
              </div>
              <Select
                options={[
                  { value: "gateway", label: "Gateway" },
                  { value: "cod", label: "COD" },
                  { value: "mixed", label: "Mixed" },
                ]}
                defaultValue={values.paymentMethod}
                onChange={(v) => onChange("paymentMethod", v as PaymentMethod)}
                className="bg-white dark:bg-gray-800/50"
              />
            </div>
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Note
              </div>
              <Input
                value={values.note}
                onChange={(e) => onChange("note", e.target.value)}
                placeholder="Add note"
                className="bg-white dark:bg-gray-800/50"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={onSubmit} size="md" variant="primary" startIcon={<Save size={16} />}>
              Update Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFormCard;
