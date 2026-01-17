// src/components/business-settings/service-settings/EmailConfigModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import { cn } from "@/lib/utils";

import { updateEmailConfig } from "@/api/service-config.api";
import type { EmailCard } from "./types";

type Props = {
  open: boolean;
  initial: EmailCard | null;
  onClose: () => void;
  onSaved: () => void;
};

function safeString(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

export default function EmailConfigModal({ open, initial, onClose, onSaved }: Props) {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [armWipe, setArmWipe] = useState(false);

  useEffect(() => {
    if (!open) return;

    setHost(safeString(initial?.host));
    setPort(safeString(initial?.port));
    setUser(safeString(initial?.user));
    setPass(safeString(initial?.pass));
    setArmWipe(false);
  }, [open, initial]);

  const mutation = useMutation({
    mutationFn: (payload: { MAIL_HOST?: string; MAIL_PORT?: string; MAIL_USER?: string; MAIL_PASS?: string; setNull?: boolean }) =>
      updateEmailConfig(payload),
    onSuccess: (res: any) => {
      if (res?.success === true || res?.status === true) {
        toast.success("Email config updated");
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
    return Boolean(host.trim() && port.trim() && user.trim() && pass.trim());
  }, [armWipe, host, port, user, pass]);

  const submit = () => {
    if (armWipe) {
      mutation.mutate({ setNull: true });
      return;
    }

    mutation.mutate({
      MAIL_HOST: host.trim(),
      MAIL_PORT: port.trim(),
      MAIL_USER: user.trim(),
      MAIL_PASS: pass.trim(),
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
              Email (SMTP) Settings
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Update SMTP credentials used for system emails.
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
                MAIL_HOST <span className="text-error-500">*</span>
              </p>
              <Input
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="mail.trialvo.com"
                disabled={mutation.isPending || armWipe}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                MAIL_PORT <span className="text-error-500">*</span>
              </p>
              <Input
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="465"
                disabled={mutation.isPending || armWipe}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                MAIL_USER <span className="text-error-500">*</span>
              </p>
              <Input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="test@trialvo.com"
                disabled={mutation.isPending || armWipe}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                MAIL_PASS <span className="text-error-500">*</span>
              </p>
              <Input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                disabled={mutation.isPending || armWipe}
              />
            </div>
          </div>

          {!armWipe && !canSave ? (
            <div className="mt-4 rounded-[4px] border border-warning-200 bg-warning-50 px-4 py-3 text-xs font-semibold text-warning-700 dark:border-warning-900/40 dark:bg-warning-500/10 dark:text-warning-300">
              All fields are required unless setNull=true.
            </div>
          ) : null}

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
                  If enabled, it will wipe email config. When setNull=true, other fields are not required.
                </p>

                <div className="mt-3 flex items-center justify-between rounded-[4px] border border-error-200 bg-white px-4 py-3 dark:border-error-900/40 dark:bg-gray-900">
                  <p className="text-sm font-semibold text-error-700 dark:text-error-200">
                    {armWipe ? "Armed: setNull=true" : "Not armed"}
                  </p>
                  <Switch label="" defaultChecked={armWipe} onChange={(c) => setArmWipe(c)} />
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
