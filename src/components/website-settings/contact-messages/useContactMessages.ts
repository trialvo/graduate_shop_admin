// src/hooks/contact-messages/useContactMessages.ts

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  deleteContactMessage,
  getContactMessage,
  getContactMessageCounts,
  getContactMessages,
  replyContactMessage,
  toggleContactMessageStatus,
  type ContactMessageCounts,
  type GetContactMessagesParams,
  type GetContactMessagesResponse,
  type ContactMessageSingle,
  type ReplyContactMessagePayload,
} from "@/api/contact-messages.api";
import { contactMessageKeys } from "./contactMessageKeys";

type ContactMessageCountsResponse = { success: boolean; data: ContactMessageCounts };
type ContactMessageSingleResponse = { success: boolean; data: ContactMessageSingle };

export function useContactMessageCounts(opts?: {
  enabled?: boolean;
  refetchIntervalMs?: number;
}): UseQueryResult<ContactMessageCountsResponse> {
  return useQuery<ContactMessageCountsResponse>({
    queryKey: contactMessageKeys.counts(),
    queryFn: getContactMessageCounts,
    enabled: opts?.enabled ?? true,
    refetchInterval: opts?.refetchIntervalMs,
  });
}

export function useContactMessages(
  params: GetContactMessagesParams,
  opts?: { enabled?: boolean; refetchIntervalMs?: number }
): UseQueryResult<GetContactMessagesResponse> {
  return useQuery<GetContactMessagesResponse>({
    queryKey: contactMessageKeys.list(params),
    queryFn: () => getContactMessages(params),
    enabled: opts?.enabled ?? true,
    refetchInterval: opts?.refetchIntervalMs,
    placeholderData: keepPreviousData,
  });
}

export function useContactMessage(
  id: number | null,
  opts?: { enabled?: boolean }
): UseQueryResult<ContactMessageSingleResponse> {
  return useQuery<ContactMessageSingleResponse>({
    queryKey: id ? contactMessageKeys.single(id) : ["contact-messages", "single", "null"],
    queryFn: () => {
      if (!id) throw new Error("Missing message id");
      return getContactMessage(id);
    },
    enabled: (opts?.enabled ?? true) && !!id,
  });
}

export function useToggleContactMessageStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toggleContactMessageStatus(id),
    onSuccess: async (res) => {
      toast.success(res.message || "Updated.");
      await Promise.all([
        qc.invalidateQueries({ queryKey: contactMessageKeys.counts() }),
        qc.invalidateQueries({ queryKey: contactMessageKeys.all() }),
      ]);
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to update status");
    },
  });
}

export function useDeleteContactMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteContactMessage(id),
    onSuccess: async (res) => {
      toast.success(res.message || "Deleted.");
      await Promise.all([
        qc.invalidateQueries({ queryKey: contactMessageKeys.counts() }),
        qc.invalidateQueries({ queryKey: contactMessageKeys.all() }),
      ]);
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to delete message");
    },
  });
}

export function useReplyContactMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReplyContactMessagePayload) => replyContactMessage(payload),
    onSuccess: async (res) => {
      toast.success(res.message || "Replied.");
      await Promise.all([
        qc.invalidateQueries({ queryKey: contactMessageKeys.counts() }),
        qc.invalidateQueries({ queryKey: contactMessageKeys.all() }),
      ]);
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to send reply");
    },
  });
}
