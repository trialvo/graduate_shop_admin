import { useQuery } from "@tanstack/react-query";
import {
  getNotificationBatches,
  getEmailLogs,
  getSmsLogs,
  getPushLogs,
} from "@/api/notification-history.api";

export function useNotificationBatches(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["notification-batches", params],
    queryFn: () => getNotificationBatches(params),
  });
}

export function useEmailLogs(params?: { limit?: number; offset?: number; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["email-logs", params],
    queryFn: () => getEmailLogs(params),
  });
}

export function useSmsLogs(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["sms-logs", params],
    queryFn: () => getSmsLogs(params),
  });
}

export function usePushLogs(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["push-logs", params],
    queryFn: () => getPushLogs(params),
  });
}
