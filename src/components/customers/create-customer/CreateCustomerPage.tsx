// src/components/customers/create-customer/CreateCustomerPage.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Mail,
  Phone,
  User2,
  Image as ImageIcon,
  ShieldAlert,
  UploadCloud,
  X,
  Lock,
  Calendar,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import StatusToggle from "@/components/ui/button/StatusToggle";
import CustomerImageCropperModal from "@/components/customers/create-customer/CustomerImageCropperModal";
import { cn } from "@/lib/utils";

import { createAdminUser, type AdminUserGender } from "@/api/admin-users.api";
import type { CreateCustomerForm } from "./types";

type Option = { value: string; label: string };

const GENDER_OPTIONS: Option[] = [
  { value: "unspecified", label: "Unspecified" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

function isValidPhone(phone: string): boolean {
  const v = phone.trim();
  return /^(\+8801\d{9}|01\d{9})$/.test(v);
}

function isValidEmail(email: string): boolean {
  const v = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

const INITIAL_FORM: CreateCustomerForm = {
  user_profile: null,
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  gender: "unspecified",
  phone: "",
  dob: "", // optional
  is_active: "active",
};

export default function CreateCustomerPage() {
  const [form, setForm] = useState<CreateCustomerForm>(INITIAL_FORM);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [cropSourceName, setCropSourceName] = useState<string | undefined>(undefined);

  const fullName = useMemo(() => {
    return `${form.first_name} ${form.last_name}`.trim();
  }, [form.first_name, form.last_name]);

  const avatarLetter = useMemo(() => {
    const c = fullName.slice(0, 1).toUpperCase();
    return c || "C";
  }, [fullName]);

  // cleanup preview object url
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    };
  }, [cropSourceUrl]);

  const errors = useMemo(() => {
    const emailErr = !form.email.trim()
      ? "Email is required."
      : !isValidEmail(form.email)
      ? "Invalid email format."
      : "";

    const passErr = !form.password.trim()
      ? "Password is required."
      : form.password.length < 8
      ? "Password must be at least 8 characters."
      : "";

    const firstErr = !form.first_name.trim() ? "First name is required." : "";
    const lastErr = !form.last_name.trim() ? "Last name is required." : "";

    const phoneErr = !form.phone.trim()
      ? "Phone is required."
      : !isValidPhone(form.phone)
      ? "Use 01xxxxxxxxx or +8801xxxxxxxxx format."
      : "";

    return {
      email: emailErr,
      pass: passErr,
      first: firstErr,
      last: lastErr,
      phone: phoneErr,
    };
  }, [form]);

  const canSubmit = useMemo(() => {
    return (
      !errors.email &&
      !errors.pass &&
      !errors.first &&
      !errors.last &&
      !errors.phone
    );
  }, [errors]);

  const createMutation = useMutation({
    mutationFn: async () => {
      return createAdminUser({
        user_profile: form.user_profile ?? null,
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        gender: form.gender as AdminUserGender,
        phone: form.phone.trim(),
        dob: form.dob.trim(), // optional
        is_active: form.is_active,
      });
    },
    onSuccess: (res: any) => {
      if (res?.flag && Number(res.flag) !== 200) {
        const errMsg =
          (typeof res?.error === "string" && res.error.trim()) ||
          (typeof res?.message === "string" && res.message.trim()) ||
          "Failed to create customer";
        toast.error(errMsg);
        return;
      }

      if (res?.success === false) {
        const errMsg =
          (typeof res?.error === "string" && res.error.trim()) ||
          (typeof res?.message === "string" && res.message.trim()) ||
          "Failed to create customer";
        toast.error(errMsg);
        return;
      }

      const msg =
        (typeof res?.message === "string" && res.message.trim()) ||
        (typeof res?.data?.message === "string" && res.data.message.trim()) ||
        "Customer created successfully";
      toast.success(msg);
      setForm(INITIAL_FORM);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      const msg =
        (typeof data?.error === "string" && data.error.trim()) ||
        (typeof data?.message === "string" && data.message.trim()) ||
        (typeof err?.message === "string" && err.message.trim()) ||
        "Failed to create customer";
      toast.error(msg);
    },
  });

  const reset = () => {
    setForm(INITIAL_FORM);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pickFile = () => fileInputRef.current?.click();

  const removeFile = () => {
    setForm((p) => ({ ...p, user_profile: null }));
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;

    if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);

    if (file) {
      const url = URL.createObjectURL(file);
      setCropSourceUrl(url);
      setCropSourceName(file.name);
      setCropOpen(true);
    } else {
      setCropSourceUrl(null);
      setCropSourceName(undefined);
      setCropOpen(false);
    }
  };

  const closeCropper = () => {
    if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    setCropSourceUrl(null);
    setCropSourceName(undefined);
    setCropOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const requiredLabel =
    "Required: email, password, first name, last name, phone.";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: FORM */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Profile
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Basic identity & contact information.
              </p>
            </div>

            <div className="space-y-6 p-5">
              {/* Profile Image + Upload + Status (RESPONSIVE GRID) */}
              <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                  {/* Preview */}
                  <div className="md:col-span-4 lg:col-span-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Profile Photo
                    </p>

                    <div className="mt-2 overflow-hidden rounded-[4px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                      <div className="aspect-square w-full">
                        {previewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewUrl}
                            alt="profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                              {avatarLetter}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Best ratio: 1:1 (square)
                    </p>
                  </div>

                  {/* Upload */}
                  <div className="md:col-span-8 lg:col-span-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Upload Image{" "}
                      <span className="text-xs text-gray-400">
                        (user_profile)
                      </span>
                    </p>

                    <div className="mt-2 rounded-[4px] border border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                            <ImageIcon size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {form.user_profile?.name ?? "No file selected"}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              <code className="font-mono">user_profile</code> in
                              form-data
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />

                          {form.user_profile ? (
                            <Button
                              variant="outline"
                              onClick={removeFile}
                              className="w-full sm:w-auto"
                              startIcon={<X size={16} />}
                            >
                              Remove
                            </Button>
                          ) : null}

                          <Button
                            variant="outline"
                            onClick={pickFile}
                            className="w-full sm:w-auto"
                            startIcon={<UploadCloud size={16} />}
                          >
                            Choose File
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-12 lg:col-span-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </p>

                    <div className="mt-2 flex items-center justify-between rounded-[4px] border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {form.is_active === "active" ? "Active" : "Inactive"}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          Toggle customer access
                        </p>
                      </div>

                      <StatusToggle
                        value={form.is_active}
                        onChange={(v) =>
                          setForm((p) => ({
                            ...p,
                            is_active: v as CreateCustomerForm["is_active"],
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Email */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <Input
                      startIcon={<Mail size={16} />}
                      className="pl-9"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          email: String(e.target.value),
                        }))
                      }
                      placeholder="example@gmail.com"
                    />
                  </div>
                  {errors.email ? (
                    <p className="text-xs text-error-500">{errors.email}</p>
                  ) : null}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <Input
                      startIcon={<Lock size={16} />}
                      className="pl-9"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          password: String(e.target.value),
                        }))
                      }
                      placeholder="minimum 8 characters"
                      type="password"
                    />
                  </div>
                  {errors.pass ? (
                    <p className="text-xs text-error-500">{errors.pass}</p>
                  ) : null}
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <Input
                      startIcon={<User2 size={16} />}
                      className="pl-9"
                      value={form.first_name}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          first_name: String(e.target.value),
                        }))
                      }
                      placeholder="First name"
                    />
                  </div>
                  {errors.first ? (
                    <p className="text-xs text-error-500">{errors.first}</p>
                  ) : null}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <Input
                      startIcon={<User2 size={16} />}
                      className="pl-9"
                      value={form.last_name}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          last_name: String(e.target.value),
                        }))
                      }
                      placeholder="Last name"
                    />
                  </div>
                  {errors.last ? (
                    <p className="text-xs text-error-500">{errors.last}</p>
                  ) : null}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <Input
                      startIcon={<Phone size={16} />}
                      className="pl-9"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          phone: String(e.target.value),
                        }))
                      }
                      placeholder="01xxxxxxxxx / +8801xxxxxxxxx"
                    />
                  </div>
                  {errors.phone ? (
                    <p className="text-xs text-error-500">{errors.phone}</p>
                  ) : null}
                </div>

                {/* DOB (Optional) with DatePicker */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date of Birth{" "}
                    <span className="text-xs text-gray-400">(optional)</span>
                  </p>

                  <div className="relative">
                    <DatePicker
                      value={form.dob}
                      onChange={(v) =>
                        setForm((p) => ({
                          ...p,
                          dob: String(v ?? ""),
                        }))
                      }
                      placeholder="Select date"
                      showClear={true}
                      showToday={true}
                      yearRange={{
                        from: new Date().getFullYear() - 80,
                        to: new Date().getFullYear(),
                      }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    If your DatePicker returns a date string, it will save as
                    YYYY-MM-DD.
                  </p>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gender
                  </p>
                  <Select
                    key={`gender-${form.gender}`}
                    options={GENDER_OPTIONS}
                    placeholder="Select gender"
                    defaultValue={form.gender}
                    onChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        gender: v as CreateCustomerForm["gender"],
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions (responsive) */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="outline"
              onClick={reset}
              disabled={createMutation.isPending}
              className="w-full sm:w-auto"
            >
              Reset
            </Button>

            <Button
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit || createMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createMutation.isPending ? "Saving..." : "Create Customer"}
            </Button>
          </div>
        </div>

        {/* RIGHT: Preview Card */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Live Preview
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This is how it will look in list.
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-[4px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-base font-semibold text-gray-700 dark:text-gray-200">
                      {avatarLetter}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                    {fullName || "—"}
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Mail size={14} />
                    <span className="truncate">{form.email || "—"}</span>
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Phone size={14} />
                    <span className="truncate">{form.phone || "—"}</span>
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="solid"
                      color={form.is_active === "active" ? "success" : "dark"}
                      size="sm"
                    >
                      {form.is_active}
                    </Badge>

                    <Badge variant="solid" color="info" size="sm">
                      {form.gender}
                    </Badge>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "mt-5 rounded-[4px] border p-4",
                  canSubmit
                    ? "border-success-200 bg-success-50 dark:border-success-900/40 dark:bg-success-500/10"
                    : "border-warning-200 bg-warning-50 dark:border-warning-900/40 dark:bg-warning-500/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    {canSubmit ? (
                      <BadgeCheck size={18} />
                    ) : (
                      <ShieldAlert size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {canSubmit ? "Ready to create" : "Fix required fields"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {requiredLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Tips
            </p>
            <ul className="mt-2 space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li>• Phone supports BD format: 01xxxxxxxxx or +8801xxxxxxxxx</li>
              <li>• DOB is optional (you can skip it).</li>
              <li>
                • Image is uploaded as user_profile file (square recommended).
              </li>
            </ul>
          </div>
        </div>
      </div>

      <CustomerImageCropperModal
        open={cropOpen}
        imageUrl={cropSourceUrl ?? ""}
        fileName={cropSourceName}
        aspect={1}
        onClose={closeCropper}
        onApply={({ file, previewUrl: croppedUrl }) => {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setForm((p) => ({ ...p, user_profile: file }));
          setPreviewUrl(croppedUrl);
          closeCropper();
        }}
      />
    </div>
  );
}
