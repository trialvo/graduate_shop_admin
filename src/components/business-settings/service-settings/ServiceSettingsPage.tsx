// src/components/business-settings/service-settings/ServiceSettingsPage.tsx
"use client";

import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Mail, MessageSquareText, Settings } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Switch from "@/components/form/switch/Switch";
import { cn } from "@/lib/utils";

import {
  getEmailSystemConfig,
  getSmsSystemConfig,
  getSmsBalance,
  setActiveSmsProvider,
} from "@/api/service-config.api";

import type { EmailCard, SmsProviderCard, SmsProvider } from "./types";
import { smsProviderTitle } from "./types";

import SmsConfigModal from "./SmsConfigModal";
import EmailConfigModal from "./EmailConfigModal";

function safeString(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function formatBalance(data: any) {
  if (!data?.success) return "—";
  const bal = typeof data.balance === "number" ? data.balance : Number(data.balance);
  if (!Number.isFinite(bal)) return "—";
  const unit = safeString(data.unit) || "BDT";
  return `${bal} ${unit}`;
}

function buildSmsCard(provider: SmsProvider, node: any): SmsProviderCard {
  const cfg = node?.config ?? {};
  const is_active = Boolean(node?.is_active);

  const upper = provider === "alphasms" ? "ALPHA_SMS" : "BULK_SMS";

  const apiKey = safeString(cfg?.[`${upper}_API_KEY`]);
  const senderId = safeString(cfg?.[`${upper}_SENDER_ID`]);
  const url = safeString(cfg?.[`${upper}_URL`]);

  return {
    provider,
    is_active,
    config: cfg,
    gateway_name: smsProviderTitle(provider),
    apiKey,
    senderId,
    url,
  };
}

export default function ServiceSettingsPage() {
  const qc = useQueryClient();

  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsEditing, setSmsEditing] = useState<SmsProviderCard | null>(null);

  const [emailModalOpen, setEmailModalOpen] = useState(false);

  const smsQuery = useQuery({
    queryKey: ["systemConfig", "sms"],
    queryFn: () => getSmsSystemConfig(),
    retry: 1,
  });

  const emailQuery = useQuery({
    queryKey: ["systemConfig", "email"],
    queryFn: () => getEmailSystemConfig(),
    retry: 1,
  });

  const alphaBalanceQuery = useQuery({
    queryKey: ["smsBalance", "alphasms"],
    queryFn: () => getSmsBalance("alphasms"),
    retry: 1,
  });

  const bulkBalanceQuery = useQuery({
    queryKey: ["smsBalance", "bulksms"],
    queryFn: () => getSmsBalance("bulksms"),
    retry: 1,
  });

  const smsCards = useMemo(() => {
    const sms = smsQuery.data?.sms ?? {};
    const providers: SmsProvider[] = ["alphasms", "bulksms"];
    return providers.map((p) => buildSmsCard(p, sms?.[p] ?? {}));
  }, [smsQuery.data]);

  const smsDefaultProvider = useMemo(() => {
    const sms = smsQuery.data?.sms ?? {};
    const p = safeString(sms?.default?.config?.SMS_ACTIVE_PROVIDER) as SmsProvider | "";
    return p || null;
  }, [smsQuery.data]);

  const emailCard: EmailCard | null = useMemo(() => {
    const email = emailQuery.data?.email ?? {};
    const node = email?.custom_smtp ?? null;
    if (!node) return null;

    const cfg = node?.config ?? {};
    return {
      is_active: Boolean(node?.is_active),
      config: cfg,
      host: safeString(cfg?.MAIL_HOST),
      port: safeString(cfg?.MAIL_PORT),
      user: safeString(cfg?.MAIL_USER),
      pass: safeString(cfg?.MAIL_PASS),
    };
  }, [emailQuery.data]);

  const invalidateAll = () =>
    Promise.allSettled([
      qc.invalidateQueries({ queryKey: ["systemConfig", "sms"] }),
      qc.invalidateQueries({ queryKey: ["systemConfig", "email"] }),
      qc.invalidateQueries({ queryKey: ["smsBalance", "alphasms"] }),
      qc.invalidateQueries({ queryKey: ["smsBalance", "bulksms"] }),
    ]).then(() => undefined);

  const activeProviderMutation = useMutation({
    mutationFn: (provider: SmsProvider) => setActiveSmsProvider(provider),
    onSuccess: (res: any) => {
      if (res?.success === true || res?.status === true) {
        toast.success("Active SMS provider updated");
        invalidateAll().catch(() => undefined);
        return;
      }
      toast.error(res?.error ?? res?.message ?? "Failed to update active provider");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Failed to update active provider";
      toast.error(msg);
    },
  });

  const openSmsEdit = (card: SmsProviderCard) => {
    setSmsEditing(card);
    setSmsModalOpen(true);
  };

  const balanceFor = (provider: SmsProvider) => {
    return provider === "alphasms"
      ? formatBalance(alphaBalanceQuery.data)
      : formatBalance(bulkBalanceQuery.data);
  };

  const isRefreshing =
    smsQuery.isFetching ||
    emailQuery.isFetching ||
    alphaBalanceQuery.isFetching ||
    bulkBalanceQuery.isFetching ||
    activeProviderMutation.isPending;

  return (
    <div className="space-y-6">
      {/* SMS Section */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
              <MessageSquareText size={18} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">SMS Service</h3>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Manage SMS provider configuration, balance and active provider.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  Active Provider:{" "}
                  <span className="ml-1 font-bold">
                    {smsDefaultProvider ? smsProviderTitle(smsDefaultProvider) : "—"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              invalidateAll().catch(() => undefined);
              toast.success("Refreshed");
            }}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {smsQuery.isLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[180px] animate-pulse rounded-[4px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
                />
              ))
            : smsCards.map((c) => {
                const isDefault = smsDefaultProvider === c.provider;

                return (
                  <div
                    key={c.provider}
                    className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                          {c.gateway_name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                          Provider: <span className="font-semibold">{c.provider}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
                            c.is_active
                              ? "bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                          )}
                        >
                          {c.is_active ? "Enabled" : "Disabled"}
                        </span>

                        {isDefault ? (
                          <span className="inline-flex items-center rounded-lg bg-success-100 px-2.5 py-1 text-xs font-semibold text-success-700 dark:bg-success-500/10 dark:text-success-300">
                            Active
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Balance:{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {balanceFor(c.provider)}
                        </span>
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sender ID:{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {c.senderId || "—"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Base URL:{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {c.url || "—"}
                        </span>
                      </p>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600",
                        )}
                        onClick={() => openSmsEdit(c)}
                      >
                        <Settings size={16} />
                        View Settings
                      </button>

                      {/* ✅ Set Active Provider toggle */}
                      <div className="flex items-center justify-between gap-3 rounded-[4px] border border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900 sm:w-[240px]">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Set Active Provider
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {isDefault ? "Currently active" : "Make active"}
                          </p>
                        </div>

                        <Switch
                          key={`sms-active-${c.provider}-${String(isDefault)}`}
                          label=""
                          defaultChecked={isDefault}
                          disabled={activeProviderMutation.isPending || smsQuery.isLoading}
                          onChange={(checked) => {
                            if (!checked) {
                              toast("To deactivate, select another provider.");
                              return;
                            }
                            activeProviderMutation.mutate(c.provider);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Email Section */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
              <Mail size={18} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Email Service</h3>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Configure SMTP credentials used for system emails.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
                    emailCard?.is_active
                      ? "bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                  )}
                >
                  {emailCard?.is_active ? "Active" : "Inactive"}
                </span>

                <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  Provider: Custom SMTP
                </span>
              </div>
            </div>
          </div>

          <Button onClick={() => setEmailModalOpen(true)} disabled={emailQuery.isLoading || !emailCard}>
            View Settings
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {emailQuery.isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-[84px] animate-pulse rounded-[4px] border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
              />
            ))
          ) : emailCard ? (
            <>
              <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">MAIL_HOST</p>
                <p className="mt-1 break-all text-sm font-semibold text-gray-900 dark:text-white">
                  {emailCard.host || "—"}
                </p>
              </div>

              <div className="rounded-[4px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">MAIL_USER</p>
                <p className="mt-1 break-all text-sm font-semibold text-gray-900 dark:text-white">
                  {emailCard.user || "—"}
                </p>
              </div>
            </>
          ) : (
            <div className="col-span-full rounded-[4px] border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              Email configuration not found.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SmsConfigModal
        open={smsModalOpen}
        initial={smsEditing}
        defaultProvider={smsDefaultProvider}
        onClose={() => {
          setSmsModalOpen(false);
          setSmsEditing(null);
        }}
        onSaved={() => {
          invalidateAll().catch(() => undefined);
          setSmsModalOpen(false);
          setSmsEditing(null);
        }}
      />

      <EmailConfigModal
        open={emailModalOpen}
        initial={emailCard}
        onClose={() => setEmailModalOpen(false)}
        onSaved={() => {
          invalidateAll().catch(() => undefined);
          setEmailModalOpen(false);
        }}
      />
    </div>
  );
}
