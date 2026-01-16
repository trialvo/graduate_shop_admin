import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import { createAdminUser, type CreateAdminUserPayload } from "@/api/admin-users.api";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (id: number) => void;
};

const GENDER_OPTIONS = [
  { id: "unspecified", label: "Unspecified" },
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
] as const;

export default function AddCustomerModal({ open, onClose, onCreated }: Props) {
  const [userProfile, setUserProfile] = useState<File | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("12345678");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [gender, setGender] = useState<CreateAdminUserPayload["gender"]>("unspecified");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [isActive, setIsActive] = useState<CreateAdminUserPayload["is_active"]>("active");

  useEffect(() => {
    if (!open) return;
    // reset each open to avoid stale
    setUserProfile(null);
    setEmail("");
    setPassword("12345678");
    setFirstName("");
    setLastName("");
    setGender("unspecified");
    setPhone("");
    setDob("");
    setIsActive("active");
  }, [open]);

  const canSave = useMemo(() => {
    // your backend: email + password + first/last + phone + dob usually required
    return Boolean(email.trim() && password.trim() && firstName.trim() && lastName.trim() && phone.trim() && dob.trim());
  }, [email, password, firstName, lastName, phone, dob]);

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminUser({
        user_profile: userProfile,
        email: email.trim(),
        password: password.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        gender,
        phone: phone.trim(),
        dob: dob.trim(),
        is_active: isActive,
      }),
    onSuccess: (data) => {
      if (data?.success === true && data?.data?.id) {
        toast.success(data?.message || "User created");
        onCreated(Number(data.data.id));
        onClose();
        return;
      }

      if (data?.flag && data?.error) {
        toast.error(String(data.error));
        return;
      }

      toast.error(data?.message || "Failed to create user");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create user");
    },
  });

  const titleId = "add-customer-modal-title";

  return (
    <Modal isOpen={open} onClose={onClose} titleId={titleId} className="w-full max-w-[860px] overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <h3 id={titleId} className="text-lg font-semibold text-gray-900 dark:text-white/90">
          Add New Customer
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a user to use in billing. (Admin manual user create)
        </p>
      </div>

      <div className="px-6 py-6">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUserProfile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-700 dark:text-gray-200"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional</p>
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@gmail.com"
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. 12345678"
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">First Name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Arafat"
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">Last Name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Shanto"
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-12 md:col-span-4">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01629615314"
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-12 md:col-span-4">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">DOB</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="col-span-12">
              <label className="mb-1 block text-sm font-semibold text-gray-800 dark:text-gray-200">Status</label>
              <select
                value={isActive}
                onChange={(e) => setIsActive(e.target.value as any)}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Required: Email, Password, First/Last name, Phone, DOB
        </p>
      </div>

      <div className="border-t border-gray-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center justify-between gap-3">
          <div className={cn("text-sm", canSave ? "text-gray-500 dark:text-gray-400" : "text-error-600 dark:text-error-300")}>
            {canSave ? "Ready to create" : "Fill required fields"}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!canSave || createMutation.isPending}
              onClick={() => {
                if (!canSave) return;
                createMutation.mutate();
              }}
            >
              {createMutation.isPending ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
