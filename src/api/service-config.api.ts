// src/api/service-config.api.ts

import { api } from "./client";

export type SystemSmsConfigResponse = {
  sms?: Record<string, any>;
};

export type SystemEmailConfigResponse = {
  email?: Record<string, any>;
};

export type SmsBalanceResponse = {
  success: boolean;
  provider?: string;
  balance?: number;
  unit?: string; // e.g. "BDT"
};

export async function getSmsSystemConfig() {
  const res = await api.get(`/config/getSystemConfig/?service=sms`);
  return res.data as SystemSmsConfigResponse;
}

export async function getEmailSystemConfig() {
  const res = await api.get(`/config/getSystemConfig/?service=email`);
  return res.data as SystemEmailConfigResponse;
}

export async function updateEmailConfig(payload: {
  MAIL_HOST?: string;
  MAIL_PORT?: string;
  MAIL_USER?: string;
  MAIL_PASS?: string;
  setNull?: boolean;
}) {
  const res = await api.put(`/config/updateEmailConfig`, payload);
  return res.data;
}

export async function updateSmsConfig(payload: {
  provider: "alphasms" | "bulksms";
  API_KEY?: string;
  SENDER_ID?: string;
  setNull?: boolean;
}) {
  const res = await api.put(`/config/updateSmsConfig`, payload);
  return res.data;
}

export async function getSmsBalance() {
  const res = await api.get(`/config/getSmsBalance`);
  return res.data as SmsBalanceResponse;
}
