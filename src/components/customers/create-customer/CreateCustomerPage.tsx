// src/components/customers/create-customer/CreateCustomerPage.tsx
"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BadgeCheck,
  Calendar,
  Mail,
  Phone,
  User2,
  Image as ImageIcon,
  ShieldAlert,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
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

const STATUS_OPTIONS: Option[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function isValidPhone(phone: string): boolean {
  const v = phone.trim();
  return /^(\+8801\d{9}|01\d{9})$/.test(v);
}

function isValidEmail(email: string): boolean {
  const v = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidDob(dob: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dob.trim());
}

const INITIAL_FORM: CreateCustomerForm = {
  user_profile: null,
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  gender: "unspecified",
  phone: "",
  dob: "",
  is_active: "active",
};

export default function CreateCustomerPage() {
  const [form, setForm] = useState<CreateCustomerForm>(INITIAL_FORM);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const avatarLetter = useMemo(() => {
    const s = `${form.first_name} ${form.last_name}`.trim();
    const c = s.slice(0, 1).toUpperCase();
    return c || "C";
  }, [form.first_name, form.last_name]);

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

    const dobErr = !form.dob.trim()
      ? "DOB is required."
      : !isValidDob(form.dob)
      ? "Use YYYY-MM-DD format. Example: 1995-11-05"
      : "";

    return {
      email: emailErr,
      pass: passErr,
      first: firstErr,
      last: lastErr,
      phone: phoneErr,
      dob: dobErr,
    };
  }, [form]);

  const canSubmit = useMemo(() => {
    return (
      !errors.email &&
      !errors.pass &&
      !errors.first &&
      !errors.last &&
      !errors.phone &&
      !errors.dob
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
        dob: form.dob.trim(),
        is_active: form.is_active,
      });
    },
    onSuccess: () => {
      toast.success("Customer created successfully");
      setForm(INITIAL_FORM);
      setPreviewUrl(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to create customer";
      toast.error(msg);
    },
  });

  const reset = () => {
    setForm(INITIAL_FORM);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Create Customer" />

      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Create Customer
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new customer from Admin panel (multipart form-data).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: FORM */}
        <div className="lg:col-span-8 space-y-6">
          <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Profile
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Basic identity & contact information.
              </p>
            </div>

            <div className="p-5 space-y-5">
              {/* Image upload */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile Image (user_profile)
                  </p>

                  <div className="mt-2 rounded-[4px] border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <ImageIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold">
                          {form.user_profile?.name ?? "No file selected"}
                        </span>
                      </div>

                      <label className="inline-flex cursor-pointer items-center justify-center rounded-[4px] border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;

                            setForm((p) => ({ ...p, user_profile: file }));

                            if (file) {
                              const url = URL.createObjectURL(file);
                              setPreviewUrl(url);
                            } else {
                              setPreviewUrl(null);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Uploaded as{" "}
                      <code className="font-mono">user_profile</code> in form-data.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Preview
                  </p>
                  <div className="mt-2 flex h-[120px] items-center justify-center overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        {avatarLetter}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail size={16} />
                    </div>
                    <Input
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

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password <span className="text-error-500">*</span>
                  </p>
                  <Input
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
                  {errors.pass ? (
                    <p className="text-xs text-error-500">{errors.pass}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User2 size={16} />
                    </div>
                    <Input
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

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name <span className="text-error-500">*</span>
                  </p>
                  <Input
                    value={form.last_name}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        last_name: String(e.target.value),
                      }))
                    }
                    placeholder="Last name"
                  />
                  {errors.last ? (
                    <p className="text-xs text-error-500">{errors.last}</p>
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

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date of Birth <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar size={16} />
                    </div>
                    <Input
                      className="pl-9"
                      value={form.dob}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          dob: String(e.target.value),
                        }))
                      }
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  {errors.dob ? (
                    <p className="text-xs text-error-500">{errors.dob}</p>
                  ) : null}
                </div>

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

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status (is_active)
                  </p>
                  <Select
                    key={`status-${form.is_active}`}
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                    defaultValue={form.is_active}
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

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="outline"
              onClick={reset}
              disabled={createMutation.isPending}
            >
              Reset
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit || createMutation.isPending}
            >
              {createMutation.isPending ? "Saving..." : "Create Customer"}
            </Button>
          </div>
        </div>

        {/* RIGHT: Preview Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
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
                    {`${form.first_name} ${form.last_name}`.trim() || "—"}
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
                    : "border-warning-200 bg-warning-50 dark:border-warning-900/40 dark:bg-warning-500/10",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    {canSubmit ? <BadgeCheck size={18} /> : <ShieldAlert size={18} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {canSubmit ? "Ready to create" : "Fix required fields"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Required: email, password, first name, last name, phone, dob.
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
              <li>• DOB must be YYYY-MM-DD format.</li>
              <li>• Image is uploaded as user_profile file.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
