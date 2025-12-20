import type React from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";

import type {
  DeliveryType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "./types";

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
  onChange: <K extends keyof OrderFormValues>(
    key: K,
    value: OrderFormValues[K],
  ) => void;
  onSubmit: () => void;
}

const OrderFormCard: React.FC<OrderFormCardProps> = ({
  values,
  onChange,
  onSubmit,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-5 shadow-theme-xs backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Billing Name
            </div>
            <Input
              value={values.billingName}
              onChange={(e) => onChange("billingName", e.target.value)}
              placeholder="Billing name"
              className="bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Order Status
            </div>
            <Select
              options={[
                { value: "new", label: "New" },
                { value: "approved", label: "Approved" },
                { value: "processing", label: "Processing" },
                { value: "packaging", label: "Packaging" },
                { value: "shipped", label: "Shipped" },
                { value: "out_of_delivery", label: "Out of delivery" },
                { value: "delivered", label: "Delivered" },
                { value: "returned", label: "Returned" },
                { value: "cancelled", label: "Cancelled" },
                { value: "on_hold", label: "On hold" },
                { value: "trash", label: "Trash" },
              ]}
              defaultValue={values.orderStatus}
              onChange={(v) => onChange("orderStatus", v as OrderStatus)}
              className="bg-white dark:bg-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                Payment Status
              </div>
              <Select
                options={[
                  { value: "paid", label: "Paid" },
                  { value: "partial", label: "Partial" },
                  { value: "unpaid", label: "Unpaid" },
                ]}
                defaultValue={values.paymentStatus}
                onChange={(v) => onChange("paymentStatus", v as PaymentStatus)}
                className="bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                Delivery Type
              </div>
              <Select
                options={[
                  { value: "inside_dhaka", label: "Inside Dhaka" },
                  { value: "out_of_dhaka", label: "Out of Dhaka" },
                ]}
                defaultValue={values.deliveryType}
                onChange={(v) => onChange("deliveryType", v as DeliveryType)}
                className="bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Email
            </div>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="Email"
              className="bg-white dark:bg-gray-900"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Shipping Address
            </div>
            <Input
              value={values.shippingAddress}
              onChange={(e) => onChange("shippingAddress", e.target.value)}
              placeholder="Shipping address"
              className="bg-white dark:bg-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                Phone
              </div>
              <Input
                value={values.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder="Phone"
                className="bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                Alt phone
              </div>
              <Input
                value={values.altPhone}
                onChange={(e) => onChange("altPhone", e.target.value)}
                placeholder="Alternative phone"
                className="bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                City
              </div>
              <Input
                value={values.city}
                onChange={(e) => onChange("city", e.target.value)}
                placeholder="City"
                className="bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                Postal Code
              </div>
              <Input
                value={values.postalCode}
                onChange={(e) => onChange("postalCode", e.target.value)}
                placeholder="Postal code"
                className="bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                Payment method
              </div>
              <Select
                options={[
                  { value: "cod", label: "COD" },
                  { value: "bkash", label: "bKash" },
                  { value: "nagad", label: "Nagad" },
                  { value: "card", label: "Card" },
                ]}
                defaultValue={values.paymentMethod}
                onChange={(v) => onChange("paymentMethod", v as PaymentMethod)}
                className="bg-white dark:bg-gray-900"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                Note
              </div>
              <Input
                value={values.note}
                onChange={(e) => onChange("note", e.target.value)}
                placeholder="Add note"
                className="bg-white dark:bg-gray-900"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={onSubmit} size="md" variant="primary">
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFormCard;
