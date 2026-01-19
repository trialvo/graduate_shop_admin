// src/components/business-settings/service-settings/SmsConfigModal.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import { cn } from "@/lib/utils";

import {
  setActiveSmsProvider,
  updateSmsProviderConfig,
} from "@/api/service-config.api";

import type { SmsProvider, SmsProviderCard } from "./types";
import { smsProviderTitle } from "./types";

type Props = {
  open: boolean;
  initial: SmsProviderCard | null;
  defaultProvider: SmsProvider | null;
  onClose: () => void;
  onSaved: () => void;
};

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

  const [status, setStatus] = useState(true);
  const [setDefault, setSetDefault] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [senderId, setSenderId] = useState("");

  const [armWipe, setArmWipe] = useState(false);

  const hydratingRef = useRef(false);

  const isDefaultNow = useMemo(
    () => defaultProvider === provider,
    [defaultProvider, provider],
  );

  useEffect(() => {
    if (!open) return;

    hydratingRef.current = true;

    const p = (initial?.provider ??
      defaultProvider ??
      "alphasms") as SmsProvider;
    setProvider(p);

    setStatus(Boolean(initial?.is_active ?? true));
    setSetDefault(Boolean(defaultProvider === p));

    setApiKey(safeString(initial?.apiKey));
    setBaseUrl(safeString(initial?.url));
    setSenderId(safeString(initial?.senderId));

    setArmWipe(false);

    const t = setTimeout(() => {
      hydratingRef.current = false;
    }, 0);

    return () => clearTimeout(t);
  }, [open, initial, defaultProvider]);

  const updateMutation = useMutation({
    mutationFn: (payload: {
      provider: SmsProvider;
      body: {
        status?: boolean;
        api_key?: string;
        base_url?: string;
        sender_id?: string;
        setNull?: boolean;
      };
    }) => updateSmsProviderConfig(payload.provider, payload.body),
    onSuccess: (res: any) => {
      if (res?.success === true || res?.status === true) return;
      throw new Error(res?.error ?? res?.message ?? "Failed to update");
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (payload: { provider: SmsProvider }) =>
      setActiveSmsProvider(payload),
    onSuccess: (res: any) => {
      if (res?.success === true || res?.status === true) return;
      // backend might not return success flag; don’t hard fail
    },
  });

  const isSaving = updateMutation.isPending || defaultMutation.isPending;

  const canSave = useMemo(() => {
    if (armWipe) return true;

    // all optional by backend, but we keep minimal validation:
    // if user fills anything -> allow, but encourage API key
    const anyFilled = Boolean(
      apiKey.trim() || baseUrl.trim() || senderId.trim(),
    );
    if (!anyFilled) return true;

    // if they started, API key is recommended (not required by spec)
    return true;
  }, [armWipe, apiKey, baseUrl, senderId]);

  const submit = async () => {
    try {
      if (armWipe) {
        await updateMutation.mutateAsync({
          provider,
          body: { setNull: true },
        });

        if (setDefault) {
          await defaultMutation.mutateAsync({ provider });
        }

        toast.success("SMS config wiped");
        onSaved();
        return;
      }

      const body: Record<string, any> = {
        status,
        api_key: apiKey.trim() ? apiKey.trim() : undefined,
        base_url: baseUrl.trim() ? baseUrl.trim() : undefined,
        sender_id: senderId.trim() ? senderId.trim() : undefined,
        setNull: false,
      };

      Object.keys(body).forEach((k) => {
        if (body[k] === undefined) delete body[k];
      });

      await updateMutation.mutateAsync({ provider, body });

      // set default (active provider)
      if (setDefault && !isDefaultNow) {
        await defaultMutation.mutateAsync({ provider });
      }

      toast.success("SMS config updated");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update");
    }
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
              {smsProviderTitle(provider)} Settings
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Update credentials, status and set active provider.
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
            {/* Provider (read-only) */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Provider
              </p>
              <div className="h-11 flex items-center justify-between rounded-[4px] border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {smsProviderTitle(provider)}
                </p>
                {isDefaultNow ? (
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

            {/* Status */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </p>
              <div className="h-11 flex items-center justify-between rounded-[4px] border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {status ? "Active" : "Inactive"}
                </p>
                <Switch
                  label=""
                  defaultChecked={status}
                  onChange={(c) => setStatus(c)}
                />
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                API Key{" "}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  (optional)
                </span>
              </p>
              <Input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter api key"
                disabled={isSaving || armWipe}
              />
            </div>

            {/* Base URL */}
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Base URL{" "}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  (optional)
                </span>
              </p>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.sms.net.bd"
                disabled={isSaving || armWipe}
              />
            </div>

            {/* Sender ID */}
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sender ID{" "}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  (optional)
                </span>
              </p>
              <Input
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                placeholder="8809617618674"
                disabled={isSaving || armWipe}
              />
            </div>

            {/* Set Default */}
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Set Active Provider
              </p>
              <div className="h-11 flex items-center justify-between rounded-[4px] border border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {setDefault ? "Yes (make active)" : "No"}
                </p>
                <Switch
                  label=""
                  defaultChecked={setDefault}
                  onChange={(c) => setSetDefault(c)}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This updates{" "}
                <span className="font-mono">SMS_ACTIVE_PROVIDER</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={isSaving || !canSave}
            className={cn(armWipe && "bg-error-600 hover:bg-error-700")}
          >
            {isSaving ? "Saving..." : armWipe ? "Wipe & Save" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
