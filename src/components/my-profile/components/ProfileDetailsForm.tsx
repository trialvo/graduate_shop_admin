import { useMemo, useState } from "react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import type { ProfileUser } from "../types";

type Props = {
  user: ProfileUser;
  onChange: (next: ProfileUser) => void;
  onOpenChangePassword: () => void;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  state: string;
  zipcode: string;
  address: string;
};

function asState(user: ProfileUser): FormState {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    country: user.country,
    city: user.city,
    state: user.state,
    zipcode: user.zipcode,
    address: user.address,
  };
}

function canSave(s: FormState): boolean {
  return Boolean(
    s.firstName.trim() &&
      s.lastName.trim() &&
      s.email.trim() &&
      s.phone.trim() &&
      s.country.trim() &&
      s.city.trim() &&
      s.state.trim() &&
      s.zipcode.trim() &&
      s.address.trim()
  );
}

export default function ProfileDetailsForm({
  user,
  onChange,
  onOpenChangePassword,
}: Props) {
  const [state, setState] = useState<FormState>(() => asState(user));
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(() => {
    const base = asState(user);
    return Object.keys(base).some((k) => {
      const key = k as keyof FormState;
      return base[key] !== state[key];
    });
  }, [state, user]);

  const onReset = () => setState(asState(user));

  const onSubmit = async () => {
    if (!canSave(state)) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 450));
    onChange({
      ...user,
      ...state,
    });
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        My Profile Details
      </h3>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
          </p>
          <Input
            value={state.firstName}
            onChange={(e) =>
              setState((p) => ({ ...p, firstName: e.target.value }))
            }
            placeholder="First name"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </p>
          <Input
            value={state.lastName}
            onChange={(e) => setState((p) => ({ ...p, lastName: e.target.value }))}
            placeholder="Last name"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </p>
          <Input
            value={state.email}
            onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))}
            placeholder="Email"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </p>
          <Input
            value={state.phone}
            onChange={(e) => setState((p) => ({ ...p, phone: e.target.value }))}
            placeholder="Phone"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Country
          </p>
          <Input
            value={state.country}
            onChange={(e) =>
              setState((p) => ({ ...p, country: e.target.value }))
            }
            placeholder="Country"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            City
          </p>
          <Input
            value={state.city}
            onChange={(e) => setState((p) => ({ ...p, city: e.target.value }))}
            placeholder="City"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            State
          </p>
          <Input
            value={state.state}
            onChange={(e) => setState((p) => ({ ...p, state: e.target.value }))}
            placeholder="State"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Zipcode
          </p>
          <Input
            value={state.zipcode}
            onChange={(e) =>
              setState((p) => ({ ...p, zipcode: e.target.value }))
            }
            placeholder="Zipcode"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Address
          </p>
          <Input
            value={state.address}
            onChange={(e) =>
              setState((p) => ({ ...p, address: e.target.value }))
            }
            placeholder="Address"
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
            ••••••••
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-brand-500 hover:text-brand-600"
            onClick={onOpenChangePassword}
          >
            Change Password
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onReset} disabled={!dirty || saving}>
          Reset
        </Button>
        <Button onClick={onSubmit} disabled={!dirty || !canSave(state) || saving}>
          {saving ? "Updating..." : "Update Information"}
        </Button>
      </div>
    </div>
  );
}
