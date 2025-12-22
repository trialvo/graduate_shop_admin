import React, { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import type { CourierChargeCard, DeliveryZoneType } from "./types";
import Modal from "@/components/ui/modal/Modal";

type Option = { value: string; label: string };

const TYPE_OPTIONS: Option[] = [
  { value: "OUTSIDE_DHAKA", label: "Outside Dhaka" },
  { value: "INSIDE_DHAKA", label: "Inside Dhaka" },
  { value: "INSIDE_CHITTAGONG", label: "Inside Chittagong" },
  { value: "OUTSIDE_CHITTAGONG", label: "Outside Chittagong" },
  { value: "FREE_DELIVERY", label: "Free Delivery" },
];

function safeNumber(v: string, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function nowText(): string {
  const d = new Date();
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AddCourierModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (card: CourierChargeCard) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DeliveryZoneType>("OUTSIDE_DHAKA");

  const [customerCharge, setCustomerCharge] = useState("60");
  const [ownCharge, setOwnCharge] = useState("40");

  const [active, setActive] = useState(true);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const errors = useMemo(() => {
    const t = title.trim();
    const customer = safeNumber(customerCharge, NaN);
    const own = safeNumber(ownCharge, NaN);

    return {
      title: !t ? "Title is required." : "",
      customer:
        type === "FREE_DELIVERY"
          ? ""
          : !(customer >= 0)
          ? "Enter a valid customer charge."
          : "",
      own: !(own >= 0) ? "Enter a valid our charge." : "",
    };
  }, [title, customerCharge, ownCharge, type]);

  const canCreate = useMemo(() => {
    return !errors.title && !errors.customer && !errors.own;
  }, [errors]);

  const reset = () => {
    setTitle("");
    setType("OUTSIDE_DHAKA");
    setCustomerCharge("60");
    setOwnCharge("40");
    setActive(true);

    setLogoFile(null);
    if (logoPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(logoPreviewUrl);
    setLogoPreviewUrl("");
  };

  const create = () => {
    if (!canCreate) return;

    const t = title.trim();
    const customer = type === "FREE_DELIVERY" ? 0 : safeNumber(customerCharge, 0);
    const own = safeNumber(ownCharge, 0);

    const card: CourierChargeCard = {
      id: Date.now(),
      title: t,
      type,
      customerChargeBdt: customer,
      ownChargeBdt: own,
      active,
      logoUrl: logoPreviewUrl || undefined,
      createdAt: nowText(),
      updatedAt: nowText(),
    };

    onCreate(card);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Currier"
      description="Create delivery charge card for a zone and manage availability."
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={create} disabled={!canCreate}>
            Add Currier
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Currier Info
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Title, zone type and pricing.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title <span className="text-error-500">*</span>
                </p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(String(e.target.value))}
                  placeholder="Outside Dhaka"
                />
                {errors.title ? (
                  <p className="text-xs text-error-500">{errors.title}</p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type
                </p>
                <Select
                  key={`type-${type}`}
                  options={TYPE_OPTIONS}
                  placeholder="Select type"
                  defaultValue={type}
                  onChange={(v) => setType(v as DeliveryZoneType)}
                />
              </div>

              {/* BOTH CHARGES */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Charge (BDT){" "}
                  {type !== "FREE_DELIVERY" ? (
                    <span className="text-error-500">*</span>
                  ) : null}
                </p>
                <Input
                  value={type === "FREE_DELIVERY" ? "0" : customerCharge}
                  onChange={(e) => setCustomerCharge(String(e.target.value))}
                  placeholder="60"
                  disabled={type === "FREE_DELIVERY"}
                />
                {errors.customer ? (
                  <p className="text-xs text-error-500">{errors.customer}</p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Checkout এ customer কে দেখাবে।
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Our Charge (BDT) <span className="text-error-500">*</span>
                </p>
                <Input
                  value={ownCharge}
                  onChange={(e) => setOwnCharge(String(e.target.value))}
                  placeholder="40"
                />
                {errors.own ? (
                  <p className="text-xs text-error-500">{errors.own}</p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Internal cost (profit calculation ready)।
                  </p>
                )}
              </div>

              {/* Availability */}
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Availability
                </p>
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {active ? "Enabled" : "Disabled"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Disable to stop showing this delivery option.
                    </p>
                  </div>
                  <Switch
                    label=""
                    defaultChecked={active}
                    onChange={(checked) => setActive(checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Currier Logo
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional logo for card preview.
            </p>

            <div className="mt-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40 flex items-center justify-center">
                  {logoPreviewUrl ? (
                    <img
                      src={logoPreviewUrl}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="text-gray-400" size={18} />
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]">
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setLogoFile(f);
                        if (!f) return;

                        if (logoPreviewUrl.startsWith("blob:")) {
                          URL.revokeObjectURL(logoPreviewUrl);
                        }
                        const url = URL.createObjectURL(f);
                        setLogoPreviewUrl(url);
                      }}
                    />
                  </label>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setLogoFile(null);
                      if (logoPreviewUrl.startsWith("blob:")) {
                        URL.revokeObjectURL(logoPreviewUrl);
                      }
                      setLogoPreviewUrl("");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="text-xs text-gray-500 dark:text-gray-400">Preview</p>

                <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                  {title.trim() || "—"}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Type:{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {type}
                  </span>
                </p>

                <div className="mt-3 space-y-1">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Customer:{" "}
                    {type === "FREE_DELIVERY" ? 0 : safeNumber(customerCharge, 0)}{" "}
                    BDT
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Our Cost: {safeNumber(ownCharge, 0)} BDT
                  </p>
                </div>
              </div>
            </div>
          </div>

          {logoFile ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              Selected file: <span className="font-semibold">{logoFile.name}</span>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
