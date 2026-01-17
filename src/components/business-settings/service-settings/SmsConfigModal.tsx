// src/components/business-settings/service-settings/SmsConfigModal.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select, { type Option } from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { cn } from "@/lib/utils";

import { updateSmsConfig } from "@/api/service-config.api";
import type { SmsProvider, SmsProviderCard } from "./types";
import { smsProviderTitle } from "./types";

type Props = {
  open: boolean;
  initial: SmsProviderCard | null;
  defaultProvider: SmsProvider | null;
  onClose: () => void;
  onSaved: () => void;
};

const PROVIDERS: SmsProvider[] = ["alphasms", "bulksms"];

const PROVIDER_OPTIONS: Option[] = PROVIDERS.map((p) => ({
  value: p,
  label: smsProviderTitle(p),
}));

function safeString(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

export default function SmsConfigModal({
  open,
  initial,
  defaultProvider,
  onClose,
  onSaved,
}: Props) {
  const [provider, setProvider] = useState<SmsProvider>("alphasms");
  const [apiKey, setApiKey] = useState("");
  const [senderId, setSenderId] = useState("");
  const [armWipe, setArmWipe] = useState(false);

  const hydratingRef = useRef(false);

  const isDefault = useMemo(() => defaultProvider === provider, [defaultProvider, provider]);

  useEffect(() => {
    if (!open) return;

    hydratingRef.current = true;

    const p = (initial?.provider ?? defaultProvider ?? "alphasms") as SmsProvider;
    setProvider(p);

    setApiKey(safeString(initial?.apiKey));
    setSenderId(safeString(initial?.senderId));
    setArmWipe(false);

    const t = setTimeout(() => {
      hydratingRef.current = false;
    }, 0);

    return () => clearTimeout(t);
  }, [open, initial, defaultProvider]);

  const mutation = useMutation({
    mutationFn: (payload: { provider: SmsProvider; API_KEY?: string; SENDER_ID?: string; setNull?: boolean }) =>
      updateSmsConfig(payload),
    onSuccess: (res: any) => {
      if (res?.success === true || res?.status === true) {
        toast.success("SMS config updated");
        onSaved();
        return;
      }
      toast.error(res?.error ?? res?.message ?? "Failed to update");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to update";
      toast.error(msg);
    },
  });

  const canSave = useMemo(() => {
    if (armWipe) return true;
    return Boolean(apiKey.trim());
  }, [armWipe, apiKey]);

  const submit = () => {
    if (armWipe) {
      mutation.mutate({ provider, setNull: true });
      return;
    }

    mutation.mutate({
      provider,
      API_KEY: apiKey.trim(),
      SENDER_ID: senderId.trim() ? senderId.trim() : undefined,
      setNull: false,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close overlay"
      />

      <div className="relative w-[95vw] max-w-2xl rounded-[4px] border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              SMS Provider Settings
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Update provider key and sender ID. Switching provider will make it active.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[560px] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Provider
              </p>
              <Select
                key={`sms-provider-${provider}`}
                options={PROVIDER_OPTIONS}
                placeholder="Select provider"
                defaultValue={provider}
                disabled={mutation.isPending}
                onChange={(v) => setProvider(v as SmsProvider)}
              />
              <div className="flex flex-wrap items-center gap-2">
                {isDefault ? (
                  <span className="inline-flex items-center rounded-lg bg-success-100 px-2.5 py-1 text-xs font-semibold text-success-700 dark:bg-success-500/10 dark:text-success-300">
                    Default
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    Not default
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                API Key <span className="text-error-500">*</span>
              </p>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key"
                disabled={mutation.isPending || armWipe}
              />
              {!armWipe && !apiKey.trim() ? (
                <p className="text-xs text-error-500">API Key is required.</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sender ID <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(optional)</span>
              </p>
              <Input
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                placeholder="e.g. 8809617618674"
                disabled={mutation.isPending || armWipe}
              />
            </div>
          </div>

          {/* Danger zone */}
          <div className="mt-6 rounded-[4px] border border-error-200 bg-error-50 p-4 dark:border-error-900/40 dark:bg-error-500/10">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-error-600 dark:text-error-300">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-error-700 dark:text-error-200">
                  Danger Zone (setNull)
                </p>
                <p className="mt-1 text-xs text-error-700/90 dark:text-error-300">
                  If enabled, it will wipe this provider config. When setNull=true, other fields are not required.
                </p>

                <div className="mt-3 flex items-center justify-between rounded-[4px] border border-error-200 bg-white px-4 py-3 dark:border-error-900/40 dark:bg-gray-900">
                  <p className="text-sm font-semibold text-error-700 dark:text-error-200">
                    {armWipe ? "Armed: setNull=true" : "Not armed"}
                  </p>
                  <Switch
                    label=""
                    defaultChecked={armWipe}
                    onChange={(c) => setArmWipe(c)}
                  />
                </div>

                {armWipe ? (
                  <p className="mt-2 text-xs font-semibold text-error-700 dark:text-error-300">
                    Saving now will send <span className="font-mono">setNull: true</span>.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={mutation.isPending || !canSave}
            className={cn(armWipe && "bg-error-600 hover:bg-error-700")}
          >
            {mutation.isPending ? "Saving..." : armWipe ? "Wipe & Save" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
