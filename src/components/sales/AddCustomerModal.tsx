import React from "react";
import toast from "react-hot-toast";
import { UserPlus, Upload } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";

import {
  createAdminUser,
  type AdminUserGender,
  type CreateAdminUserPayload,
} from "@/api/admin-users.api";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (data: { id: number; email: string }) => void;
};

function todayMinusYears(years: number) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}

export default function AddCustomerModal({ open, onClose, onCreated }: Props) {
  const [userProfile, setUserProfile] = React.useState<File | null>(null);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("12345678");

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  const [gender, setGender] = React.useState<AdminUserGender>("unspecified");
  const [phone, setPhone] = React.useState("");
  const [dob, setDob] = React.useState(todayMinusYears(20));

  const [isActive, setIsActive] = React.useState<"active" | "inactive">("active");

  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    // keep fields as-is (admin may open/close repeatedly)
  }, [open]);

  const canSave = React.useMemo(() => {
    return Boolean(email.trim() && password.trim() && firstName.trim() && phone.trim());
  }, [email, password, firstName, phone]);

  async function handleCreate() {
    if (!canSave || saving) return;

    setSaving(true);
    try {
      const payload: CreateAdminUserPayload = {
        user_profile: userProfile,
        email: email.trim(),
        password: password.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        gender,
        phone: phone.trim(),
        dob,
        is_active: isActive,
      };

      const res = await createAdminUser(payload);

      // success response example:
      // { success:true, message:"User created successfully", data:{ id:77, email:"..." } }
      const id = Number(res?.data?.id);
      const createdEmail = String(res?.data?.email ?? payload.email);

      if (!Number.isFinite(id)) {
        toast.error(res?.message ?? "User created but missing id");
        setSaving(false);
        return;
      }

      toast.success(res?.message ?? "User created successfully");
      onCreated({ id, email: createdEmail });
      onClose();
    } catch (e: any) {
      // show backend error message (e.g. "Phone number already verified by another user")
      const msg = e?.message ? String(e.message) : "Failed to create user";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const titleId = "add-customer-modal-title";

  return (
    <Modal isOpen={open} onClose={onClose} titleId={titleId} className="w-full max-w-[860px] overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <h3 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-white/90">
          Add New Customer
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create customer and auto-select for billing.
        </p>
      </div>

      {/* Body (scroll) */}
      <div className="max-h-[calc(100dvh-260px)] overflow-y-auto custom-scrollbar px-6 py-6">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/5">
          <div className="grid grid-cols-12 gap-4">
            {/* Profile */}
            <div className="col-span-12">
              <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Profile Image (optional)
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-3",
                  "hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-white/[0.03]"
                )}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                    {userProfile ? userProfile.name : "Upload customer photo"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    JPG/PNG supported
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
                  <Upload size={16} />
                  Browse
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setUserProfile(f);
                  }}
                />
              </label>
            </div>

            {/* Email */}
            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@gmail.com"
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Password */}
            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. 12345678"
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Required for account login.
              </p>
            </div>

            {/* First name */}
            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                First Name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Arafat"
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Last name */}
            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Shanto"
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Phone */}
            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01629615314"
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Gender */}
            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as AdminUserGender)}
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                <option value="unspecified">Unspecified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* DOB */}
            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Status */}
            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Status
              </label>
              <select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value as "active" | "inactive")}
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Required: Email + Password + First Name + Phone
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>

            <Button
              startIcon={<UserPlus size={16} />}
              disabled={!canSave || saving}
              onClick={handleCreate}
            >
              {saving ? "Saving..." : "Save Customer"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
