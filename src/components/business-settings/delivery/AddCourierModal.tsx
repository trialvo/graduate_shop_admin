// src/components/delivery-settings/AddCourierModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Image as ImageIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Modal from "@/components/ui/modal/Modal";

import { cn } from "@/lib/utils";
import type { DeliveryChargeType } from "./types";
import { createDeliveryCharge } from "@/api/delivery-charges.api";

type Option = { value: string; label: string };

const TYPE_OPTIONS: Option[] = [
  { value: "outside of dhaka", label: "Outside Dhaka" },
  { value: "inside of dhaka", label: "Inside Dhaka" },
  { value: "inside chittagong", label: "Inside Chittagong" },
  { value: "outside chittagong", label: "Outside Chittagong" },
  { value: "free delivery", label: "Free Delivery" },
];

function safeNumber(v: string, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function AddCourierModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DeliveryChargeType>("outside of dhaka");

  const [customerCharge, setCustomerCharge] = useState("60");
  const [ourCharge, setOurCharge] = useState("40");

  // ✅ boolean
  const [status, setStatus] = useState(true);

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreviewUrl, setImgPreviewUrl] = useState("");

  useEffect(() => {
    return () => {
      if (imgPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(imgPreviewUrl);
    };
  }, [imgPreviewUrl]);

  const isFree = String(type).toLowerCase() === "free delivery";

  const errors = useMemo(() => {
    const t = title.trim();
    const customer = safeNumber(customerCharge, NaN);
    const own = safeNumber(ourCharge, NaN);

    return {
      title: !t ? "Title is required." : "",
      customer: isFree ? "" : !(customer >= 0) ? "Enter a valid customer charge." : "",
      own: !(own >= 0) ? "Enter a valid our charge." : "",
    };
  }, [title, customerCharge, ourCharge, isFree]);

  const canCreate = useMemo(() => !errors.title && !errors.customer && !errors.own, [errors]);

  const reset = () => {
    setTitle("");
    setType("outside of dhaka");
    setCustomerCharge("60");
    setOurCharge("40");
    setStatus(true);

    setImgFile(null);
    if (imgPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(imgPreviewUrl);
    setImgPreviewUrl("");
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createDeliveryCharge({
        delivery_img: imgFile ?? null,
        title: title.trim(),
        type: String(type),
        customer_charge: isFree ? 0 : Math.max(0, safeNumber(customerCharge, 0)),
        our_charge: Math.max(0, safeNumber(ourCharge, 0)),
        status,
      }),
    onSuccess: (res: any) => {
      if (res?.success === true) {
        toast.success("Courier charge created");
        onCreated();
        reset();
        onClose();
        return;
      }
      const msg = res?.error ?? res?.message ?? "Failed to create";
      toast.error(msg);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? "Failed to create";
      toast.error(msg);
    },
  });

  return (
    <Modal
      open={open}
      onClose={() => {
        if (createMutation.isPending) return;
        onClose();
      }}
      title="Add New Courier"
      description="Create delivery charge (multipart form-data) for a zone and manage availability."
      size="xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => {
              if (createMutation.isPending) return;
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={() => createMutation.mutate()} disabled={!canCreate || createMutation.isPending}>
            {createMutation.isPending ? "Adding..." : "Add Courier"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Courier Info</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Title, zone type and pricing.</p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title <span className="text-error-500">*</span>
                </p>
                <Input value={title} onChange={(e) => setTitle(String(e.target.value))} placeholder="dhakar baire" />
                {errors.title ? <p className="text-xs text-error-500">{errors.title}</p> : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
                <Select key={`type-${type}`} options={TYPE_OPTIONS} placeholder="Select type" defaultValue={String(type)} onChange={(v) => setType(String(v))} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Charge (BDT) {!isFree ? <span className="text-error-500">*</span> : null}
                </p>
                <Input
                  value={isFree ? "0" : customerCharge}
                  onChange={(e) => setCustomerCharge(String(e.target.value))}
                  placeholder="200"
                  disabled={isFree}
                />
                {errors.customer ? (
                  <p className="text-xs text-error-500">{errors.customer}</p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Checkout এ customer কে দেখাবে।</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Our Charge (BDT) <span className="text-error-500">*</span>
                </p>
                <Input value={ourCharge} onChange={(e) => setOurCharge(String(e.target.value))} placeholder="100" />
                {errors.own ? (
                  <p className="text-xs text-error-500">{errors.own}</p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Internal cost (profit calculation ready)।</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Availability</p>
                <div className="flex items-center justify-between rounded-[4px] border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{status ? "Enabled" : "Disabled"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Disable to stop showing this delivery option.</p>
                  </div>

                  <Switch key={`st-${status}`} label="" defaultChecked={status} onChange={(checked) => setStatus(checked)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Delivery Image</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Uploaded as <span className="font-mono">delivery_img</span> (optional).
            </p>

            <div className="mt-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[4px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40">
                  {imgPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgPreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-400" size={18} />
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-[4px] border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]">
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setImgFile(f);
                        if (!f) return;

                        if (imgPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(imgPreviewUrl);
                        setImgPreviewUrl(URL.createObjectURL(f));
                      }}
                    />
                  </label>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setImgFile(null);
                      if (imgPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(imgPreviewUrl);
                      setImgPreviewUrl("");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="mt-5 rounded-[4px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="text-xs text-gray-500 dark:text-gray-400">Preview</p>

                <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{title.trim() || "—"}</p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Type: <span className="font-semibold text-gray-700 dark:text-gray-200">{String(type)}</span>
                </p>

                <div className="mt-3 space-y-1">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Customer: {isFree ? 0 : Math.max(0, safeNumber(customerCharge, 0))} BDT
                  </p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Our Cost: {Math.max(0, safeNumber(ourCharge, 0))} BDT
                  </p>
                </div>

                <div
                  className={cn(
                    "mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                    status
                      ? "bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-300"
                      : "bg-error-100 text-error-700 dark:bg-error-500/10 dark:text-error-300",
                  )}
                >
                  {status ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
