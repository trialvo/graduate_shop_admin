import React, { useEffect, useMemo, useState } from "react";
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

import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Modal from "@/components/ui/modal/Modal";

import type { CustomerBehavior, CustomerRow } from "./types";

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
  // IPv4 basic validation
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
  // allow +8801xxxxxxxxx OR 01xxxxxxxxx
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
            className={filled ? "text-warning-500" : "text-gray-300 dark:text-gray-700"}
            fill={filled ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
}

export default function EditCustomerModal({
  open,
  customer,
  onClose,
  onSave,
}: {
  open: boolean;
  customer: CustomerRow | null;
  onClose: () => void;
  onSave: (next: CustomerRow) => void;
}) {
  const [draft, setDraft] = useState<CustomerRow | null>(customer);

  useEffect(() => {
    setDraft(customer);
  }, [customer]);

  const errors = useMemo(() => {
    if (!draft) return { name: "", phone: "", ip: "", orders: "" };

    const nameErr = !draft.name.trim() ? "Customer name is required." : "";
    const phoneErr = !draft.phone.trim()
      ? "Phone is required."
      : !isValidPhone(draft.phone)
      ? "Use 01xxxxxxxxx or +8801xxxxxxxxx format."
      : "";

    const ipErr = !draft.ipAddress.trim()
      ? "IP address is required."
      : !isValidIp(draft.ipAddress)
      ? "Invalid IP address. Example: 103.94.135.12"
      : "";

    const ordersErr =
      draft.acceptedOrders > draft.totalOrders
        ? "Accepted orders cannot be greater than total orders."
        : "";

    return { name: nameErr, phone: phoneErr, ip: ipErr, orders: ordersErr };
  }, [draft]);

  const canSave = useMemo(() => {
    if (!draft) return false;
    return !errors.name && !errors.phone && !errors.ip && !errors.orders;
  }, [draft, errors]);

  if (!draft) {
    return (
      <Modal open={open} title="Edit Customer" onClose={onClose} size="lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No customer selected.
        </p>
      </Modal>
    );
  }

  const blockedTone = draft.ipBlocked;

  return (
    <Modal
      open={open}
      title="Edit Customer"
      description="Update customer profile, behavior and IP access controls."
      onClose={onClose}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(draft)} disabled={!canSave}>
            Update Customer
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section: Profile */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Profile
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Basic identity & contact information.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="solid" color={behaviorBadgeColor(draft.behavior)} size="sm">
                  {behaviorLabel(draft.behavior)}
                </Badge>
                <Badge variant="solid" color={draft.ipBlocked ? "error" : "success"} size="sm">
                  {draft.ipBlocked ? "IP Blocked" : "IP Unblocked"}
                </Badge>
              </div>
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
                      value={draft.name}
                      onChange={(e) =>
                        setDraft({ ...draft, name: String(e.target.value) })
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
                      value={draft.phone}
                      onChange={(e) =>
                        setDraft({ ...draft, phone: String(e.target.value) })
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

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    IP Address <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Globe size={16} />
                    </div>
                    <Input
                      className="pl-9"
                      value={draft.ipAddress}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          ipAddress: String(e.target.value),
                        })
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
                    key={`rating-${draft.id}-${draft.rating}`}
                    options={RATING_OPTIONS}
                    placeholder="Select rating"
                    defaultValue={String(draft.rating)}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        rating: safeNumber(String(v), draft.rating),
                      })
                    }
                  />
                  <div className="pt-1">{renderStars(draft.rating)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Classification */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
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
                    key={`type-${draft.id}-${draft.customerType}`}
                    options={CUSTOMER_TYPE_OPTIONS}
                    placeholder="Select type"
                    defaultValue={draft.customerType}
                    onChange={(v) =>
                      setDraft({
                        ...draft,
                        customerType: v as CustomerRow["customerType"],
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Behavior
                  </p>
                  <Select
                    key={`behavior-${draft.id}-${draft.behavior}`}
                    options={BEHAVIOR_OPTIONS}
                    placeholder="Select behavior"
                    defaultValue={draft.behavior}
                    onChange={(v) =>
                      setDraft({ ...draft, behavior: v as CustomerBehavior })
                    }
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      variant="solid"
                      color={behaviorBadgeColor(draft.behavior)}
                      size="sm"
                    >
                      {behaviorLabel(draft.behavior)}
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Use Fraud/Risky to monitor suspicious activity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Orders & Location */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
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
                    value={String(draft.totalOrderAmountBdt)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        totalOrderAmountBdt: safeNumber(
                          String(e.target.value),
                          draft.totalOrderAmountBdt
                        ),
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Order Date
                  </p>
                  <Input
                    value={draft.lastOrderDate}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        lastOrderDate: String(e.target.value),
                      })
                    }
                    placeholder="DD/MM/YYYY"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    For demo: DD/MM/YYYY. (API integration can use ISO date)
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Orders
                  </p>
                  <Input
                    value={String(draft.totalOrders)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        totalOrders: safeNumber(
                          String(e.target.value),
                          draft.totalOrders
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
                    value={String(draft.acceptedOrders)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        acceptedOrders: safeNumber(
                          String(e.target.value),
                          draft.acceptedOrders
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
                      value={draft.city ?? ""}
                      onChange={(e) =>
                        setDraft({ ...draft, city: String(e.target.value) })
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
                    value={draft.subCity ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, subCity: String(e.target.value) })
                    }
                    placeholder="Mirpur"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Preview + Security */}
        <div className="lg:col-span-4 space-y-6">
          {/* Preview Card */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-base font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {draft.avatarLetter || (draft.name.trim().slice(0, 1).toUpperCase() || "C")}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                    {draft.name || "—"}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Phone size={14} />
                    <span className="truncate">{draft.phone || "—"}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Globe size={14} />
                    <span className="truncate">{draft.ipAddress || "—"}</span>
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="solid" color={behaviorBadgeColor(draft.behavior)} size="sm">
                      {behaviorLabel(draft.behavior)}
                    </Badge>
                    <Badge
                      variant="solid"
                      color={draft.ipBlocked ? "error" : "success"}
                      size="sm"
                    >
                      {draft.ipBlocked ? "IP Blocked" : "IP Unblocked"}
                    </Badge>
                  </div>

                  <div className="mt-3">{renderStars(draft.rating)}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {draft.totalOrders}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Accepted</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {draft.acceptedOrders}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security / IP Controls */}
          <div
            className={[
              "rounded-2xl border overflow-hidden",
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
                    Blocked customers cannot proceed (based on your backend rules).
                  </p>
                </div>

                <div className="pt-1">
                  <Switch
                    label=""
                    defaultChecked={draft.ipBlocked}
                    onChange={(checked) =>
                      setDraft({ ...draft, ipBlocked: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border",
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
                    {blockedTone ? "This IP is currently blocked" : "This IP is allowed"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Recommendation: Block only when you’re confident about suspicious activity.
                  </p>

                  <div className="mt-4 flex flex-col gap-2">
                    {blockedTone ? (
                      <div className="flex items-center gap-2 text-xs text-error-700 dark:text-error-300">
                        <Ban size={14} />
                        Orders from this customer may be denied.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-success-700 dark:text-success-300">
                        <CheckCircle2 size={14} />
                        Customer can place orders normally.
                      </div>
                    )}

                    {(errors.phone || errors.ip) ? (
                      <div className="flex items-center gap-2 text-xs text-warning-700 dark:text-warning-300">
                        <AlertTriangle size={14} />
                        Please fix invalid fields before saving.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Small helper card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Tips
            </p>
            <ul className="mt-2 space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li>• Fraud/Risky behavior helps your team prioritize verification.</li>
              <li>• Keep accepted orders ≤ total orders to maintain correct stats.</li>
              <li>• IP block is best used with backend enforcement.</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
}
