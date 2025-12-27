// src/components/customers/customers-list/EditCustomerModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calendar, Image as ImageIcon, Mail, Phone, User2 } from "lucide-react";

import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import Modal from "@/components/ui/modal/Modal";

import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/utils/toPublicUrl";

import {
  editAdminUser,
  getAdminUser,
  type AdminUserGender,
  type AdminUserStatus,
} from "@/api/admin-users.api";

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

type Draft = {
  user_profile?: File | null;

  email: string;
  password: string;

  first_name: string;
  last_name: string;

  gender: AdminUserGender;
  phone: string;
  dob: string;

  is_active: AdminUserStatus;
};

export default function EditCustomerModal({
  open,
  userId,
  onClose,
  onUpdated,
}: {
  open: boolean;
  userId: number | null;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const enabled = open && !!userId;

  const userQuery = useQuery({
    queryKey: ["adminUser", userId],
    queryFn: () => getAdminUser(Number(userId)),
    enabled,
    retry: 1,
  });

  const [draft, setDraft] = useState<Draft | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = userQuery.data?.user;
    if (!u) return;

    const phone = u.phones?.[0]?.phone_number ?? "";

    const dob = u.dob ? new Date(u.dob).toISOString().slice(0, 10) : "";

    setDraft({
      user_profile: null,
      email: u.email ?? "",
      password: "", // optional on edit
      first_name: u.first_name ?? "",
      last_name: u.last_name ?? "",
      gender: (u.gender ?? "unspecified") as AdminUserGender,
      phone,
      dob,
      is_active: (String(u.status ?? "active").toLowerCase() === "inactive" ? "inactive" : "active") as AdminUserStatus,
    });

    setPreviewUrl(null);
  }, [userQuery.data]);

  const errors = useMemo(() => {
    if (!draft) return { email: "", first: "", last: "", phone: "", dob: "" };

    const emailErr = !draft.email.trim()
      ? "Email is required."
      : !isValidEmail(draft.email)
      ? "Invalid email format."
      : "";

    const firstErr = !draft.first_name.trim() ? "First name is required." : "";
    const lastErr = !draft.last_name.trim() ? "Last name is required." : "";

    const phoneErr = !draft.phone.trim()
      ? "Phone is required."
      : !isValidPhone(draft.phone)
      ? "Use 01xxxxxxxxx or +8801xxxxxxxxx format."
      : "";

    const dobErr = !draft.dob.trim()
      ? "DOB is required."
      : !isValidDob(draft.dob)
      ? "Use YYYY-MM-DD format."
      : "";

    return { email: emailErr, first: firstErr, last: lastErr, phone: phoneErr, dob: dobErr };
  }, [draft]);

  const canSave = useMemo(() => {
    if (!draft) return false;
    return !errors.email && !errors.first && !errors.last && !errors.phone && !errors.dob;
  }, [draft, errors]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !draft) throw new Error("Missing user");
      return editAdminUser(userId, {
        user_profile: draft.user_profile ?? null,
        email: draft.email.trim(),
        password: draft.password.trim() ? draft.password : undefined,
        first_name: draft.first_name.trim(),
        last_name: draft.last_name.trim(),
        gender: draft.gender,
        phone: draft.phone.trim(),
        dob: draft.dob.trim(),
        is_active: draft.is_active,
      });
    },
    onSuccess: () => {
      toast.success("Customer updated");
      onUpdated?.();
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to update customer";
      toast.error(msg);
    },
  });

  const currentUserImg = userQuery.data?.user?.img_path ? toPublicUrl(userQuery.data.user.img_path) : null;
  const avatarLetter = useMemo(() => {
    const name = `${draft?.first_name ?? ""} ${draft?.last_name ?? ""}`.trim();
    return name.slice(0, 1).toUpperCase() || "C";
  }, [draft?.first_name, draft?.last_name]);

  if (!draft) {
    return (
      <Modal open={open} title="Edit Customer" onClose={onClose} size="xl">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {userQuery.isLoading ? "Loading..." : "No customer selected."}
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      title="Edit Customer"
      description="Update customer info via /admin/editUser/:id (multipart/form-data)"
      onClose={() => {
        if (updateMutation.isPending) return;
        onClose();
      }}
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => updateMutation.mutate()} disabled={!canSave || updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Update Customer"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-6">
          <div className="overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update email, name, phone, dob and image.
              </p>
            </div>

            <div className="p-5 space-y-5">
              {/* Image */}
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
                          {draft.user_profile?.name ?? "No new file selected"}
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
                            setDraft((p) => ({ ...(p as Draft), user_profile: file }));
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
                      If no file selected, backend keeps old image.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current / Preview</p>
                  <div className="mt-2 flex h-[120px] items-center justify-center overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
                    ) : currentUserImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={currentUserImg} alt="current" className="h-full w-full object-cover" />
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
                      value={draft.email}
                      onChange={(e) => setDraft((p) => ({ ...(p as Draft), email: String(e.target.value) }))}
                    />
                  </div>
                  {errors.email ? <p className="text-xs text-error-500">{errors.email}</p> : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password (optional)
                  </p>
                  <Input
                    type="password"
                    value={draft.password}
                    onChange={(e) => setDraft((p) => ({ ...(p as Draft), password: String(e.target.value) }))}
                    placeholder="Leave empty to keep existing password"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    If empty, password is not changed.
                  </p>
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
                      value={draft.first_name}
                      onChange={(e) => setDraft((p) => ({ ...(p as Draft), first_name: String(e.target.value) }))}
                    />
                  </div>
                  {errors.first ? <p className="text-xs text-error-500">{errors.first}</p> : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name <span className="text-error-500">*</span>
                  </p>
                  <Input
                    value={draft.last_name}
                    onChange={(e) => setDraft((p) => ({ ...(p as Draft), last_name: String(e.target.value) }))}
                  />
                  {errors.last ? <p className="text-xs text-error-500">{errors.last}</p> : null}
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
                      onChange={(e) => setDraft((p) => ({ ...(p as Draft), phone: String(e.target.value) }))}
                    />
                  </div>
                  {errors.phone ? <p className="text-xs text-error-500">{errors.phone}</p> : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    DOB <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar size={16} />
                    </div>
                    <Input
                      className="pl-9"
                      value={draft.dob}
                      onChange={(e) => setDraft((p) => ({ ...(p as Draft), dob: String(e.target.value) }))}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  {errors.dob ? <p className="text-xs text-error-500">{errors.dob}</p> : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</p>
                  <Select
                    key={`gender-${draft.gender}`}
                    options={GENDER_OPTIONS}
                    defaultValue={draft.gender}
                    placeholder="Select gender"
                    onChange={(v) => setDraft((p) => ({ ...(p as Draft), gender: v as AdminUserGender }))}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status (is_active)</p>
                  <Select
                    key={`active-${draft.is_active}`}
                    options={STATUS_OPTIONS}
                    defaultValue={draft.is_active}
                    placeholder="Select status"
                    onChange={(v) => setDraft((p) => ({ ...(p as Draft), is_active: v as AdminUserStatus }))}
                  />
                </div>
              </div>

              <div
                className={cn(
                  "rounded-[4px] border p-4 text-sm",
                  canSave
                    ? "border-success-200 bg-success-50 text-success-700 dark:border-success-900/40 dark:bg-success-500/10 dark:text-success-300"
                    : "border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-900/40 dark:bg-warning-500/10 dark:text-warning-200",
                )}
              >
                {canSave ? "Ready to update." : "Please fix invalid fields before updating."}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT small preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Live Preview</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Name + email + phone</p>

            <div className="mt-4 flex items-start gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-[4px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
                ) : currentUserImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUserImg} alt="current" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-base font-semibold text-gray-700 dark:text-gray-200">
                    {avatarLetter}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                  {`${draft.first_name} ${draft.last_name}`.trim() || "—"}
                </p>
                <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                  {draft.email || "—"}
                </p>
                <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                  {draft.phone || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
