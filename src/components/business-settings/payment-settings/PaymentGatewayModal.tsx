import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import { PAYMENT_PROVIDER_DEFS } from "./providerDefs";
import type { PaymentGatewayConfig, PaymentProvider, Option } from "./types";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: PaymentGatewayConfig | null;
  onClose: () => void;
  onSave: (payload: Omit<PaymentGatewayConfig, "id" | "createdAt" | "updatedAt">) => void;
};

const PROVIDER_OPTIONS: Option[] = PAYMENT_PROVIDER_DEFS.map((d) => ({
  value: d.provider,
  label: d.title,
}));

function nowStamp(): string {
  // UI placeholder only (server should generate real)
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  let hh = d.getHours();
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi} ${ampm}`;
}

export default function PaymentGatewayModal({ open, mode, initial, onClose, onSave }: Props) {
  const [provider, setProvider] = useState<PaymentProvider>("bkash");
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [sandbox, setSandbox] = useState(true);
  const [note, setNote] = useState("");
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  const providerDef = useMemo(
    () => PAYMENT_PROVIDER_DEFS.find((d) => d.provider === provider) ?? PAYMENT_PROVIDER_DEFS[0],
    [provider]
  );

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setProvider(initial.provider);
      setName(initial.name);
      setStatus(initial.status);
      setSandbox(initial.sandbox);
      setNote(initial.note ?? "");
      setCredentials({ ...initial.credentials });
      return;
    }

    // create
    setProvider("bkash");
    setName("bKash");
    setStatus(true);
    setSandbox(true);
    setNote("");
    setCredentials({});
  }, [open, mode, initial]);

  useEffect(() => {
    // Ensure name defaults to provider title if empty / create
    if (!open) return;
    if (mode === "create") {
      setName(providerDef.title);
    }
    // Ensure credentials object has keys
    setCredentials((prev) => {
      const next = { ...prev };
      for (const f of providerDef.fields) {
        if (next[f.key] === undefined) next[f.key] = "";
      }
      // Remove unknown keys for safety (optional)
      Object.keys(next).forEach((k) => {
        if (!providerDef.fields.some((f) => f.key === k)) delete next[k];
      });
      return next;
    });
  }, [open, providerDef, mode]);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    for (const f of providerDef.fields) {
      if (f.required && !String(credentials[f.key] ?? "").trim()) return false;
    }
    return true;
  }, [name, providerDef.fields, credentials]);

  const handleChangeCredential = (key: string, v: string) => {
    setCredentials((prev) => ({ ...prev, [key]: v }));
  };

  const submit = () => {
    const payload: Omit<PaymentGatewayConfig, "id" | "createdAt" | "updatedAt"> = {
      provider,
      name: name.trim(),
      category: providerDef.category,
      status,
      sandbox,
      note: note.trim() ? note.trim() : undefined,
      credentials: { ...credentials },
    };
    onSave(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close overlay"
      />

      <div className="relative w-[95vw] max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === "create" ? "Add Payment Gateway" : "Edit Payment Gateway"}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Configure credentials and enable/disable gateway (UI demo — connect API later)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scroll) */}
        <div className="max-h-[500px] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Provider <span className="text-error-500">*</span>
              </p>
              <Select
                options={PROVIDER_OPTIONS}
                placeholder="Select provider"
                defaultValue={provider}
                onChange={(v) => setProvider(v as PaymentProvider)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Gateway Name <span className="text-error-500">*</span>
              </p>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
              <div className="h-11 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {status ? "Active" : "Inactive"}
                </p>
                <Switch label="" defaultChecked={status} onChange={(c) => setStatus(c)} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Environment</p>
              <div className="h-11 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sandbox ? "Sandbox" : "Live"}
                </p>
                <Switch label="" defaultChecked={sandbox} onChange={(c) => setSandbox(c)} />
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {providerDef.title} Credentials
                </h4>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Required fields must be filled to save.
                </p>
              </div>
              <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {providerDef.category}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {providerDef.fields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {f.label} {f.required ? <span className="text-error-500">*</span> : null}
                  </p>
                  <Input
                    type={f.type === "password" ? "password" : "text"}
                    value={credentials[f.key] ?? ""}
                    onChange={(e) => handleChangeCredential(f.key, e.target.value)}
                    placeholder={f.placeholder ?? ""}
                  />
                  {f.helperText ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{f.helperText}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Note</p>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Updated: <span className="font-medium">{nowStamp()}</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSave}>
            {mode === "create" ? "Save Gateway" : "Update Gateway"}
          </Button>
        </div>
      </div>
    </div>
  );
}
