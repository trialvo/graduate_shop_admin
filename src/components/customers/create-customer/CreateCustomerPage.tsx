import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CheckCircle2,
  Globe,
  MapPin,
  Phone,
  ShieldAlert,
  Star,
  User2,
} from "lucide-react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";

import type { CreateCustomerForm, CustomerBehavior, CustomerType } from "./types";

type Option = { value: string; label: string };

const CUSTOMER_TYPE_OPTIONS: Option[] = [
  { value: "LOYAL", label: "LOYAL" },
  { value: "VIP", label: "VIP" },
  { value: "NEW", label: "NEW" },
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "FAKE", label: "FAKE" },
  { value: "RISKY", label: "RISKY" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "BLOCKED", label: "BLOCKED" },
];

const BEHAVIOR_OPTIONS: Option[] = [
  { value: "REGULAR", label: "Regular" },
  { value: "RISKY", label: "Risky" },
  { value: "FRAUD", label: "Fraud" },
];

const RATING_OPTIONS: Option[] = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

function safeNumber(input: string, fallback: number): number {
  const n = Number(input);
  return Number.isFinite(n) ? n : fallback;
}

function isValidIp(ip: string): boolean {
  const v = ip.trim();
  const parts = v.split(".");
  if (parts.length !== 4) return false;
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return false;
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) return false;
  }
  return true;
}

function isValidPhone(phone: string): boolean {
  const v = phone.trim();
  return /^(\+8801\d{9}|01\d{9})$/.test(v);
}

function behaviorBadgeColor(
  behavior: CustomerBehavior
): "success" | "warning" | "error" {
  switch (behavior) {
    case "REGULAR":
      return "success";
    case "RISKY":
      return "warning";
    case "FRAUD":
      return "error";
    default:
      return "success";
  }
}

function behaviorLabel(b: CustomerBehavior): string {
  if (b === "REGULAR") return "Regular";
  if (b === "FRAUD") return "Fraud";
  return "Risky";
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const filled = star <= rating;
        return (
          <Star
            key={star}
            size={16}
            className={
              filled ? "text-warning-500" : "text-gray-300 dark:text-gray-700"
            }
            fill={filled ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
}

const INITIAL_FORM: CreateCustomerForm = {
  name: "",
  phone: "",
  ipAddress: "",

  customerType: "NEW",
  behavior: "REGULAR",

  rating: 0,
  city: "",
  subCity: "",

  totalOrderAmountBdt: 0,
  totalOrders: 0,
  acceptedOrders: 0,

  lastOrderDate: "",
  ipBlocked: false,

  note: "",
};

export default function CreateCustomerPage() {
  const [form, setForm] = useState<CreateCustomerForm>(INITIAL_FORM);
  const [submitState, setSubmitState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  const avatarLetter = useMemo(() => {
    const c = form.name.trim().slice(0, 1).toUpperCase();
    return c || "C";
  }, [form.name]);

  const errors = useMemo(() => {
    const nameErr = !form.name.trim() ? "Customer name is required." : "";
    const phoneErr = !form.phone.trim()
      ? "Phone is required."
      : !isValidPhone(form.phone)
      ? "Use 01xxxxxxxxx or +8801xxxxxxxxx format."
      : "";
    const ipErr = !form.ipAddress.trim()
      ? "IP address is required."
      : !isValidIp(form.ipAddress)
      ? "Invalid IP address. Example: 103.94.135.12"
      : "";

    const ordersErr =
      form.acceptedOrders > form.totalOrders
        ? "Accepted orders cannot be greater than total orders."
        : "";

    return { name: nameErr, phone: phoneErr, ip: ipErr, orders: ordersErr };
  }, [form]);

  const canSubmit = useMemo(() => {
    return !errors.name && !errors.phone && !errors.ip && !errors.orders;
  }, [errors]);

  const reset = () => {
    setForm(INITIAL_FORM);
    setSubmitState("idle");
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitState("saving");

    // Demo: simulate save
    try {
      await new Promise((r) => setTimeout(r, 400));
      // eslint-disable-next-line no-console
      console.log("Create Customer payload:", form);
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  const blockedTone = form.ipBlocked;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Create Customer" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Create Customer
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add a new customer with behavior classification and IP access control.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile */}
          <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Profile
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Basic identity & contact information.
              </p>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer Name <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User2 size={16} />
                    </div>
                    <Input
                      className="pl-9"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: String(e.target.value) })
                      }
                      placeholder="Customer name"
                    />
                  </div>
                  {errors.name ? (
                    <p className="text-xs text-error-500">{errors.name}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone size={16} />
                    </div>
                    <Input
                      className="pl-9"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: String(e.target.value) })
                      }
                      placeholder="01xxxxxxxxx / +8801xxxxxxxxx"
                    />
                  </div>
                  {errors.phone ? (
                    <p className="text-xs text-error-500">{errors.phone}</p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      BD format supported: 01xxxxxxxxx or +8801xxxxxxxxx
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    IP Address <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Globe size={16} />
                    </div>
                    <Input
                      className="pl-9"
                      value={form.ipAddress}
                      onChange={(e) =>
                        setForm({ ...form, ipAddress: String(e.target.value) })
                      }
                      placeholder="103.94.135.12"
                    />
                  </div>
                  {errors.ip ? (
                    <p className="text-xs text-error-500">{errors.ip}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rating
                  </p>
                  <Select
                    key={`rating-${form.rating}`}
                    options={RATING_OPTIONS}
                    placeholder="Select rating"
                    defaultValue={String(form.rating)}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        rating: safeNumber(String(v), form.rating),
                      })
                    }
                  />
                  <div className="pt-1">{renderStars(form.rating)}</div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Order Date
                  </p>
                  <Input
                    value={form.lastOrderDate}
                    onChange={(e) =>
                      setForm({ ...form, lastOrderDate: String(e.target.value) })
                    }
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Classification
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customer type & behavioral flags for operational decisions.
              </p>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer Type
                  </p>
                  <Select
                    key={`type-${form.customerType}`}
                    options={CUSTOMER_TYPE_OPTIONS}
                    placeholder="Select type"
                    defaultValue={form.customerType}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        customerType: v as CustomerType,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Behavior
                  </p>
                  <Select
                    key={`behavior-${form.behavior}`}
                    options={BEHAVIOR_OPTIONS}
                    placeholder="Select behavior"
                    defaultValue={form.behavior}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        behavior: v as CustomerBehavior,
                      })
                    }
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      variant="solid"
                      color={behaviorBadgeColor(form.behavior)}
                      size="sm"
                    >
                      {behaviorLabel(form.behavior)}
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Fraud/Risky helps your team prioritize verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders & Location */}
          <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Orders & Location
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Operational stats and optional location fields.
              </p>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Order Amount (BDT)
                  </p>
                  <Input
                    value={String(form.totalOrderAmountBdt)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        totalOrderAmountBdt: safeNumber(
                          String(e.target.value),
                          form.totalOrderAmountBdt
                        ),
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Orders
                  </p>
                  <Input
                    value={String(form.totalOrders)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        totalOrders: safeNumber(
                          String(e.target.value),
                          form.totalOrders
                        ),
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Accepted Orders
                  </p>
                  <Input
                    value={String(form.acceptedOrders)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        acceptedOrders: safeNumber(
                          String(e.target.value),
                          form.acceptedOrders
                        ),
                      })
                    }
                    placeholder="0"
                  />
                  {errors.orders ? (
                    <p className="text-xs text-error-500">{errors.orders}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </p>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin size={16} />
                    </div>
                    <Input
                      className="pl-9"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: String(e.target.value) })
                      }
                      placeholder="Dhaka"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sub City
                  </p>
                  <Input
                    value={form.subCity}
                    onChange={(e) =>
                      setForm({ ...form, subCity: String(e.target.value) })
                    }
                    placeholder="Mirpur"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Internal Note
                  </p>
                  <Input
                    value={form.note}
                    onChange={(e) =>
                      setForm({ ...form, note: String(e.target.value) })
                    }
                    placeholder="Write internal note (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
            <Button onClick={submit} disabled={!canSubmit || submitState === "saving"}>
              {submitState === "saving" ? "Saving..." : "Create Customer"}
            </Button>
          </div>

          {submitState === "success" ? (
            <div className="rounded-[4px] border border-success-200 bg-success-50 p-4 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-500/10 dark:text-success-300">
              Customer created successfully (demo).
            </div>
          ) : null}

          {submitState === "error" ? (
            <div className="rounded-[4px] border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-500/10 dark:text-error-300">
              Failed to create customer. Try again.
            </div>
          ) : null}
        </div>

        {/* RIGHT: Preview + Security */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Preview */}
          <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Live Preview
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                What will be shown in the list.
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[4px] bg-gray-100 text-base font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {avatarLetter}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                    {form.name || "—"}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Phone size={14} />
                    <span className="truncate">{form.phone || "—"}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Globe size={14} />
                    <span className="truncate">{form.ipAddress || "—"}</span>
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="solid" color={behaviorBadgeColor(form.behavior)} size="sm">
                      {behaviorLabel(form.behavior)}
                    </Badge>
                    <Badge variant="solid" color={form.ipBlocked ? "error" : "success"} size="sm">
                      {form.ipBlocked ? "IP Blocked" : "IP Unblocked"}
                    </Badge>
                  </div>

                  <div className="mt-3">{renderStars(form.rating)}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-[4px] border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {form.totalOrders}
                  </p>
                </div>
                <div className="rounded-[4px] border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Accepted</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {form.acceptedOrders}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security / IP Controls */}
          <div
            className={[
              "overflow-hidden rounded-[4px] border",
              blockedTone
                ? "border-error-200 bg-error-50 dark:border-error-900/40 dark:bg-error-500/10"
                : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
            ].join(" ")}
          >
            <div
              className={[
                "border-b px-5 py-4",
                blockedTone
                  ? "border-error-200 dark:border-error-900/40"
                  : "border-gray-200 dark:border-gray-800",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className={[
                      "text-sm font-semibold",
                      blockedTone
                        ? "text-error-700 dark:text-error-300"
                        : "text-gray-900 dark:text-white",
                    ].join(" ")}
                  >
                    IP Access Control
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Block this customer based on suspicious behavior.
                  </p>
                </div>

                <div className="pt-1">
                  <Switch
                    label=""
                    defaultChecked={form.ipBlocked}
                    onChange={(checked) =>
                      setForm({ ...form, ipBlocked: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-[4px] border",
                    blockedTone
                      ? "border-error-200 bg-white text-error-600 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-300"
                      : "border-success-200 bg-white text-success-600 dark:border-success-900/40 dark:bg-gray-900 dark:text-success-300",
                  ].join(" ")}
                >
                  {blockedTone ? <ShieldAlert size={18} /> : <BadgeCheck size={18} />}
                </div>

                <div className="min-w-0">
                  <p
                    className={[
                      "text-sm font-semibold",
                      blockedTone
                        ? "text-error-700 dark:text-error-300"
                        : "text-gray-900 dark:text-white",
                    ].join(" ")}
                  >
                    {blockedTone ? "This IP will be blocked" : "This IP will be allowed"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Recommendation: use IP block only when confident.
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    {blockedTone ? (
                      <div className="flex items-center gap-2 text-xs text-error-700 dark:text-error-300">
                        <Ban size={14} />
                        Customer access may be denied.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-success-700 dark:text-success-300">
                        <CheckCircle2 size={14} />
                        Customer can place orders normally.
                      </div>
                    )}

                    {!canSubmit ? (
                      <div className="flex items-center gap-2 text-xs text-warning-700 dark:text-warning-300">
                        <AlertTriangle size={14} />
                        Please fix invalid fields before creating.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Tips
            </p>
            <ul className="mt-2 space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li>• Fraud/Risky behavior helps your team prioritize verification.</li>
              <li>• Keep accepted orders ≤ total orders to maintain correct stats.</li>
              <li>• IP block should be enforced by backend for full security.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
