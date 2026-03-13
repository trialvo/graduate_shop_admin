import { api } from "./client";

export type NotificationBatch = {
  id: number;
  type: string;
  subject: string | null;
  sent_count: number;
  failed_count: number;
  created_at: string;
};

export type EmailLog = {
  id: number;
  to: string;
  subject: string;
  status: string;
  created_at: string;
};

export type SmsLog = {
  id: number;
  to: string;
  message: string;
  status: string;
  provider: string;
  created_at: string;
};

export type PushLog = {
  id: number;
  title: string;
  body: string;
  status: string;
  created_at: string;
};

export async function getNotificationBatches(params?: {
  limit?: number;
  offset?: number;
}): Promise<NotificationBatch[]> {
  const res = await api.get("/admin/notifications/batches", { params });
  return res.data.data; // { success, data: [] }
}

export async function getEmailLogs(params?: {
  limit?: number;
  offset?: number;
  from?: string;
  to?: string;
}): Promise<EmailLog[]> {
  const res = await api.get("/admin/notifications/email-logs", { params });
  return res.data.data; // { success, data: [] }
}

export async function getSmsLogs(params?: {
  limit?: number;
  offset?: number;
}): Promise<SmsLog[]> {
  const res = await api.get("/admin/notifications/sms-logs", { params });
  return res.data.data; // { success, data: [] }
}

export async function getPushLogs(params?: {
  limit?: number;
  offset?: number;
}): Promise<PushLog[]> {
  const res = await api.get("/admin/notifications/push-logs", { params });
  return res.data.data; // { success, data: [] }
}
