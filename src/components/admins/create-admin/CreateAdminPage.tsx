import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Mail,
  Phone,
  ShieldCheck,
  UploadCloud,
  User2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import Input from "@/components/form/input/InputField";
import Select, { type Option } from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import ActiveInactiveSwitch from "@/components/ui/toggles/ActiveInactiveSwitch";
import { cn } from "@/lib/utils";

import { AdminRole, CreateAdminForm } from "../types";
import { useCreateAdmin, useUpdateAdmin } from "@/hooks/useAdmins";
import { useAdminRoles } from "@/hooks/useAdminRoles";

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

const ROLE_LABELS: Record<string, AdminRole> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  ORDER_MANAGER: "Order Manager",
  CATALOG_MANAGER: "Catalog Manager",
  READ_ONLY_ADMIN: "Read Only Admin",
};

// "SUPER_ADMIN" -> "Super Admin"
function normalizeRoleLabel(name?: string | null): AdminRole {
  if (!name) return "Admin";
  if (ROLE_LABELS[name]) return ROLE_LABELS[name];
  const label = name
    .toLowerCase()
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
  return (label as AdminRole) ?? "Admin";
}

const INITIAL_FORM: CreateAdminForm = {
  name: "",
  email: "",
  role: "Admin", // will auto-set from API if exists
  joinDate: "",
  phone: "",
  status: "ACTIVE", // keep for compatibility, switch will control it
  note: "",
  password: "",
  confirmPassword: "",
  avatarFile: null,
  avatarPreviewUrl: "",
};

export default function CreateAdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateAdminForm>(INITIAL_FORM);
  const [submitState, setSubmitState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();

  // roles
  const rolesQuery = useAdminRoles();
  const roles = rolesQuery.data ?? [];

  const roleOptions: Option[] = useMemo(() => {
    return roles.map((r) => {
      const label = normalizeRoleLabel(r.name);
      return { value: label, label };
    });
  }, [roles]);

  // set default role from API
  useEffect(() => {
    if (!roles.length) return;

    // prefer "Admin" if available, else first
    const hasAdmin = roles.some((r) => normalizeRoleLabel(r.name) === "Admin");
    if (hasAdmin) {
      setForm((prev) => (prev.role ? prev : { ...prev, role: "Admin" }));
      return;
    }

    const first = normalizeRoleLabel(roles[0].name);
    setForm((prev) => (prev.role ? prev : { ...prev, role: first }));
  }, [roles]);

  // Avatar uploader
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    const passErr =
      form.password.length < 6 ? "Password must be at least 6 characters." : "";
    const confirmErr =
      form.password !== form.confirmPassword ? "Passwords do not match." : "";

    // role required (from API)
    const roleErr = !form.role ? "Role is required." : "";

    return { nameErr, emailErr, phoneErr, passErr, confirmErr, roleErr };
  }, [form]);

  const canSubmit = useMemo(() => {
    return (
      !errors.nameErr &&
      !errors.emailErr &&
      !errors.phoneErr &&
      !errors.passErr &&
      !errors.confirmErr &&
      !errors.roleErr
    );
  }, [errors]);

  const avatarLetter = useMemo(
    () => initials(form.name || "Admin"),
    [form.name]
  );

  const reset = () => {
    if (form.avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(form.avatarPreviewUrl);
    }
    setForm(INITIAL_FORM);
    setSubmitState("idle");
    setIsDragging(false);
  };

  const setAvatarFile = (f: File | null) => {
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG/PNG/WebP).");
      return;
    }
    const maxMb = 3;
    if (f.size > maxMb * 1024 * 1024) {
      toast.error(`Image too large. Max ${maxMb}MB allowed.`);
      return;
    }

    if (form.avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(form.avatarPreviewUrl);
    }
    const url = URL.createObjectURL(f);
    setForm({ ...form, avatarFile: f, avatarPreviewUrl: url });
  };

  const removeAvatar = () => {
    if (form.avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(form.avatarPreviewUrl);
    }
    setForm({ ...form, avatarFile: null, avatarPreviewUrl: "" });
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitState("saving");

    try {
      const selectedRole = roles.find(
        (r) => normalizeRoleLabel(r.name) === form.role
      );
      if (!selectedRole) {
        toast.error("Selected role not found. Please refresh roles.");
        setSubmitState("error");
        return;
      }

      const nameParts = form.name.trim().split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ") || null;

      const created = await createMutation.mutateAsync({
        email: form.email.trim(),
        password: form.password,
        role_id: selectedRole.id,
        first_name: firstName || null,
        last_name: lastName,
        phone: form.phone.trim() || null,
      });

      // ✅ property should be is_active: true/false
      const is_active = form.status === "ACTIVE";

      // keep your existing update flow (safe even if create does not accept is_active)
      if (!is_active) {
        await updateMutation.mutateAsync({
          id: created.id,
          body: { is_active: false },
        });
      }

      toast.success("Admin created successfully");
      await queryClient.invalidateQueries({
        queryKey: ["admins", "list"],
        exact: false,
      });
      navigate("/admins-list");
      setSubmitState("success");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to create admin";
      toast.error(msg);
      setSubmitState("error");
    }
  };

  const isActive = form.status === "ACTIVE";
  const statusColor = isActive ? "success" : "error";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Create Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create new admin account by role with secure password.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate("/admins-list")}>
          Back to Admins
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-5">
          {/* Profile */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Profile
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin image & basic contact info.
              </p>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Admin Image (advanced) */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Admin Image
                    </p>

                    {form.avatarPreviewUrl ? (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                      >
                        <X size={14} />
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div
                    className={cn(
                      "mt-2 grid grid-cols-1 gap-4 rounded-2xl border bg-gray-50 p-4 dark:bg-gray-800/40",
                      isDragging
                        ? "border-brand-500"
                        : "border-gray-200 dark:border-gray-800"
                    )}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                      const f = e.dataTransfer.files?.[0] ?? null;
                      if (f) setAvatarFile(f);
                    }}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
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

                          <div className="absolute bottom-1 right-1 rounded-[4px] border border-gray-200 bg-white p-1 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
                            <Camera size={14} />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {form.avatarPreviewUrl
                              ? "Image selected"
                              : "Upload an avatar"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Drag & drop or choose a file. Max 3MB.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="gap-2"
                        >
                          <UploadCloud size={16} />
                          {form.avatarPreviewUrl ? "Replace" : "Upload"}
                        </Button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            if (f) setAvatarFile(f);
                            e.currentTarget.value = "";
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recommended: 1:1 square image (PNG/JPG/WebP).
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {form.avatarFile
                          ? `Selected: ${form.avatarFile.name}`
                          : "No file selected"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* name */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name <span className="text-error-500">*</span>
                  </p>
                  <Input
                    startIcon={<User2 size={16} />}
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: String(e.target.value) })
                    }
                    placeholder="Admin name"
                    error={Boolean(errors.nameErr)}
                    hint={errors.nameErr || ""}
                  />
                </div>

                {/* email */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-error-500">*</span>
                  </p>
                  <Input
                    startIcon={<Mail size={16} />}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: String(e.target.value) })
                    }
                    placeholder="admin@email.com"
                    error={Boolean(errors.emailErr)}
                    hint={errors.emailErr || ""}
                  />
                </div>

                {/* phone */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone <span className="text-error-500">*</span>
                  </p>
                  <Input
                    startIcon={<Phone size={16} />}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: String(e.target.value) })
                    }
                    placeholder="01xxxxxxxxx / +8801xxxxxxxxx"
                    error={Boolean(errors.phoneErr)}
                    hint={errors.phoneErr || ""}
                  />
                </div>

                {/* join date */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Joining Date
                  </p>
                  <Input
                    value={form.joinDate}
                    onChange={(e) =>
                      setForm({ ...form, joinDate: String(e.target.value) })
                    }
                    placeholder="DD/MM/YYYY"
                  />
                </div>

                {/* note */}
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Note
                  </p>
                  <Input
                    value={form.note}
                    onChange={(e) =>
                      setForm({ ...form, note: String(e.target.value) })
                    }
                    placeholder="Write note (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

        {/* Access */}
<div className="rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
  <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
    <p className="text-sm font-semibold text-gray-900 dark:text-white">Access</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      Choose admin role and account status.
    </p>
  </div>

  <div className="p-4">
    {/* Top row: Role + Status */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
      {/* Role */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Role <span className="text-error-500">*</span>
        </p>

        <Select
          options={roleOptions}
          placeholder="Select role"
          value={form.role}
          onChange={(v) => setForm({ ...form, role: v as AdminRole })}
          isLoading={rolesQuery.isLoading}
          disabled={rolesQuery.isLoading || rolesQuery.isError}
          className="rounded-[4px]"
        />

        {errors.roleErr ? (
          <p className="text-xs text-error-500">{errors.roleErr}</p>
        ) : null}

        {rolesQuery.isError ? (
          <p className="text-xs text-error-500">Failed to load roles.</p>
        ) : null}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>

        <ActiveInactiveSwitch
          className="max-w-full"
          value={isActive}
          onChange={(next) => setForm({ ...form, status: next ? "ACTIVE" : "INACTIVE" })}
          disabled={submitState === "saving"}
        />

      </div>
    </div>

    {/* Divider */}
    <div className="my-4 h-px w-full bg-gray-200 dark:bg-gray-800" />

    {/* Password row */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password <span className="text-error-500">*</span>
        </p>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: String(e.target.value) })}
          placeholder="Minimum 6 characters"
          error={Boolean(errors.passErr)}
          hint={errors.passErr || ""}
          className="rounded-[4px]"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password <span className="text-error-500">*</span>
        </p>
        <Input
          type="password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({
              ...form,
              confirmPassword: String(e.target.value),
            })
          }
          placeholder="Re-enter password"
          error={Boolean(errors.confirmErr)}
          hint={errors.confirmErr || ""}
          className="rounded-[4px]"
        />
      </div>
    </div>

    {/* Status preview card */}
    <div className="mt-4 rounded-[4px] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <ShieldCheck size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Status Preview</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            ACTIVE admins can login. INACTIVE admins cannot.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="solid" color={statusColor} size="sm">
              {isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
            <Badge variant="solid" color="primary" size="sm">
              {form.role || "—"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
            <Button
              onClick={submit}
              disabled={!canSubmit || submitState === "saving"}
            >
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
        <div className="lg:col-span-4 space-y-5">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Live Preview
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                How this admin will appear in the list.
              </p>
            </div>

            <div className="p-4">
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
                      {isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                    <Badge variant="solid" color="primary" size="sm">
                      {form.role || "—"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Note
                </p>
                <p className="line-clamp-3">{form.note || "—"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Tips
            </p>
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
