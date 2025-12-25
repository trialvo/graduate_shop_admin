import React, { useEffect, useMemo, useState } from "react";
import { Camera, Mail, Phone, ShieldCheck, User2 } from "lucide-react";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { AdminRole, AdminStatus, CreateAdminForm } from "../types";

type Option = { value: string; label: string };

const ROLE_OPTIONS: Option[] = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
  { value: "Sales Executive", label: "Sales Executive" },
  { value: "Employee Currier", label: "Employee Currier" },
  { value: "Order Manager", label: "Order Manager" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Catalog Manager", label: "Catalog Manager" },
  { value: "Read Only Admin", label: "Read Only Admin" },
];

const STATUS_OPTIONS: Option[] = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "A";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidBDPhone(v: string): boolean {
  const p = v.trim();
  return /^(\+8801\d{9}|01\d{9})$/.test(p);
}

const INITIAL_FORM: CreateAdminForm = {
  name: "",
  email: "",
  role: "Admin",
  joinDate: "",
  phone: "",
  status: "ACTIVE",
  note: "",
  password: "",
  confirmPassword: "",
  avatarFile: null,
  avatarPreviewUrl: "",
};

export default function CreateAdminPage() {
  const [form, setForm] = useState<CreateAdminForm>(INITIAL_FORM);
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "success" | "error">("idle");

  useEffect(() => {
    return () => {
      if (form.avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(form.avatarPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errors = useMemo(() => {
    const nameErr = !form.name.trim() ? "Name is required." : "";
    const emailErr = !form.email.trim()
      ? "Email is required."
      : !isValidEmail(form.email)
      ? "Invalid email address."
      : "";
    const phoneErr = !form.phone.trim()
      ? "Phone is required."
      : !isValidBDPhone(form.phone)
      ? "Use 01xxxxxxxxx or +8801xxxxxxxxx format."
      : "";
    const passErr = form.password.length < 6 ? "Password must be at least 6 characters." : "";
    const confirmErr =
      form.password !== form.confirmPassword ? "Passwords do not match." : "";

    return { nameErr, emailErr, phoneErr, passErr, confirmErr };
  }, [form]);

  const canSubmit = useMemo(() => {
    return !errors.nameErr && !errors.emailErr && !errors.phoneErr && !errors.passErr && !errors.confirmErr;
  }, [errors]);

  const avatarLetter = useMemo(() => initials(form.name || "Admin"), [form.name]);

  const reset = () => {
    if (form.avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(form.avatarPreviewUrl);
    }
    setForm(INITIAL_FORM);
    setSubmitState("idle");
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitState("saving");

    try {
      await new Promise((r) => setTimeout(r, 400));
      // eslint-disable-next-line no-console
      console.log("Create Admin payload:", form);
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  const statusColor = form.status === "ACTIVE" ? "success" : "error";

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Create Admin" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Admin</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create new admin account by role with secure password.
          </p>
        </div>

    
          <Button variant="outline">Back to Admins</Button>
    
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin image & basic contact info.
              </p>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* image */}
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Image
                  </p>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40">
                      {form.avatarPreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={form.avatarPreviewUrl}
                          alt="Admin avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {avatarLetter}
                        </div>
                      )}

                      <div className="absolute bottom-1 right-1 rounded-lg border border-gray-200 bg-white p-1 text-gray-700 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        <Camera size={14} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.03]">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            if (!f) return;

                            if (form.avatarPreviewUrl.startsWith("blob:")) {
                              URL.revokeObjectURL(form.avatarPreviewUrl);
                            }
                            const url = URL.createObjectURL(f);
                            setForm({ ...form, avatarFile: f, avatarPreviewUrl: url });
                          }}
                        />
                      </label>

                      <Button
                        variant="outline"
                        onClick={() => {
                          if (form.avatarPreviewUrl.startsWith("blob:")) {
                            URL.revokeObjectURL(form.avatarPreviewUrl);
                          }
                          setForm({ ...form, avatarFile: null, avatarPreviewUrl: "" });
                        }}
                      >
                        Remove
                      </Button>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPG/PNG recommended. Square image looks best.
                      </p>
                    </div>
                  </div>
                </div>

                {/* name */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name <span className="text-error-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User2 size={16} />
                    </div>
                    <Input
                      className="pl-9"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: String(e.target.value) })}
                      placeholder="Admin name"
                    />
                  </div>
                  {errors.nameErr ? <p className="text-xs text-error-500">{errors.nameErr}</p> : null}
                </div>

                {/* email */}
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
                      onChange={(e) => setForm({ ...form, email: String(e.target.value) })}
                      placeholder="admin@email.com"
                    />
                  </div>
                  {errors.emailErr ? <p className="text-xs text-error-500">{errors.emailErr}</p> : null}
                </div>

                {/* phone */}
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
                      onChange={(e) => setForm({ ...form, phone: String(e.target.value) })}
                      placeholder="01xxxxxxxxx / +8801xxxxxxxxx"
                    />
                  </div>
                  {errors.phoneErr ? <p className="text-xs text-error-500">{errors.phoneErr}</p> : null}
                </div>

                {/* join date */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Joining Date
                  </p>
                  <Input
                    value={form.joinDate}
                    onChange={(e) => setForm({ ...form, joinDate: String(e.target.value) })}
                    placeholder="DD/MM/YYYY"
                  />
                </div>

                {/* note */}
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Note</p>
                  <Input
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: String(e.target.value) })}
                    placeholder="Write note (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role & Status */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Access</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose admin role and account status.
              </p>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</p>
                  <Select
                    key={`role-${form.role}`}
                    options={ROLE_OPTIONS}
                    placeholder="Select role"
                    defaultValue={form.role}
                    onChange={(v) => setForm({ ...form, role: v as AdminRole })}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                  <Select
                    key={`status-${form.status}`}
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                    defaultValue={form.status}
                    onChange={(v) => setForm({ ...form, status: v as AdminStatus })}
                  />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40 md:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Status Preview
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ACTIVE admins can login. INACTIVE admins cannot.
                      </p>
                      <div className="mt-3">
                        <Badge variant="solid" color={statusColor} size="sm">
                          {form.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Password</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Set initial password for this admin.
              </p>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password <span className="text-error-500">*</span>
                  </p>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: String(e.target.value) })}
                    placeholder="Minimum 6 characters"
                  />
                  {errors.passErr ? <p className="text-xs text-error-500">{errors.passErr}</p> : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password <span className="text-error-500">*</span>
                  </p>
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: String(e.target.value) })
                    }
                    placeholder="Re-enter password"
                  />
                  {errors.confirmErr ? <p className="text-xs text-error-500">{errors.confirmErr}</p> : null}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
            <Button onClick={submit} disabled={!canSubmit || submitState === "saving"}>
              {submitState === "saving" ? "Saving..." : "Create Admin"}
            </Button>
          </div>

          {submitState === "success" ? (
            <div className="rounded-2xl border border-success-200 bg-success-50 p-4 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-500/10 dark:text-success-300">
              Admin created successfully (demo).
            </div>
          ) : null}

          {submitState === "error" ? (
            <div className="rounded-2xl border border-error-200 bg-error-50 p-4 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-500/10 dark:text-error-300">
              Failed to create admin. Try again.
            </div>
          ) : null}
        </div>

        {/* RIGHT preview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Live Preview</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                How this admin will appear in the list.
              </p>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                  {form.avatarPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.avatarPreviewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {avatarLetter}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                    {form.name || "—"}
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
                    <Badge variant="solid" color={statusColor} size="sm">
                      {form.status}
                    </Badge>
                    <Badge variant="solid" color="primary" size="sm">
                      {form.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Note</p>
                <p className="line-clamp-3">{form.note || "—"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Tips</p>
            <ul className="mt-2 space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li>• Assign roles carefully to avoid permission risks.</li>
              <li>• Use strong passwords (6+ chars recommended).</li>
              <li>• Keep INACTIVE for suspended admins.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
