import React, { useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import type { ProfileUser } from "../types";
import ChangePasswordInline from "./ChangePasswordInline";

type Props = {
  user: ProfileUser;
  onChange: (next: ProfileUser) => void;
  onChangePassword: (payload: { current: string; next: string }) => void;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-200">{label}</p>
      {children}
    </div>
  );
}

export default function ProfileDetailsCard({ user, onChange, onChangePassword }: Props) {
  const [draft, setDraft] = useState<ProfileUser>(user);
  const [showPass, setShowPass] = useState(false);

  // keep synced if parent changes
  React.useEffect(() => setDraft(user), [user]);

  const canSave = useMemo(() => {
    return (
      draft.firstName.trim() &&
      draft.lastName.trim() &&
      draft.email.trim() &&
      draft.phone.trim()
    );
  }, [draft]);

  const update = <K extends keyof ProfileUser>(key: K, value: ProfileUser[K]) => {
    setDraft((p) => ({ ...p, [key]: value }));
  };

  const submit = () => {
    if (!canSave) return;
    onChange(draft);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-extrabold text-white">My Profile Details</h2>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Field label="First Name">
          <div className="rounded-xl border border-white/10 bg-white/5">
            <Input
              className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
              value={draft.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="First name"
            />
          </div>
        </Field>

        <Field label="Country">
          <div className="rounded-xl border border-white/10 bg-white/5">
            <Input
              className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
              value={draft.country}
              onChange={(e) => update("country", e.target.value)}
              placeholder="Country"
            />
          </div>
        </Field>

        <Field label="Last Name">
          <div className="rounded-xl border border-white/10 bg-white/5">
            <Input
              className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
              value={draft.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="Last name"
            />
          </div>
        </Field>

        <Field label="City">
          <div className="rounded-xl border border-white/10 bg-white/5">
            <Input
              className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
              value={draft.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="City"
            />
          </div>
        </Field>

        <Field label="Email">
          <div className="rounded-xl border border-white/10 bg-white/5">
            <Input
              className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
              value={draft.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="Email"
            />
          </div>
        </Field>

        <Field label="State">
          <div className="rounded-xl border border-white/10 bg-white/5">
            <Input
              className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
              value={draft.state}
              onChange={(e) => update("state", e.target.value)}
              placeholder="State"
            />
          </div>
        </Field>

        <Field label="Phone Number">
          <div className="rounded-xl border border-white/10 bg-white/5">
            <Input
              className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
              value={draft.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Phone"
            />
          </div>
        </Field>

        <Field label="Zipcode">
          <div className="rounded-xl border border-white/10 bg-white/5">
            <Input
              className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
              value={draft.zipcode}
              onChange={(e) => update("zipcode", e.target.value)}
              placeholder="Zipcode"
            />
          </div>
        </Field>

        {/* Password - display only + change */}
        <div className="lg:col-span-2">
          <Field label="Password">
            <div className="rounded-xl border border-white/10 bg-white/5">
              <Input
                type={showPass ? "text" : "password"}
                className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
                value={"********"}
                onChange={() => {}}
              />
            </div>

            <button
              type="button"
              className="mt-2 text-sm font-semibold text-brand-300 hover:text-brand-200"
              onClick={() => setShowPass((p) => !p)}
            >
              {showPass ? "Hide" : "Change Password"}
            </button>

            {showPass ? (
              <div className="mt-4">
                <ChangePasswordInline onSubmit={onChangePassword} />
              </div>
            ) : null}
          </Field>
        </div>

        <div className="lg:col-span-2">
          <Field label="Address">
            <div className="rounded-xl border border-white/10 bg-white/5">
              <TextArea
                value={draft.address}
                onChange={(v) => update("address", v)}
                placeholder="Address"
                className="!border-0 !bg-transparent !text-gray-100 placeholder:text-gray-400"
              />
            </div>
          </Field>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={submit} disabled={!canSave} className="!bg-emerald-600 hover:!bg-emerald-700">
          Update Information
        </Button>
      </div>
    </div>
  );
}
