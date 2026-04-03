import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignOrder,
  unassignOrder,
  getAssignmentLogs,
} from "@/api/order-assignment.api";

const assignmentKeys = {
  logs: (params: Record<string, unknown>) =>
    ["assignment-logs", params] as const,
};

export function useAssignmentLogs(params?: {
  order_id?: number;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: assignmentKeys.logs(params ?? {}),
    queryFn: () => getAssignmentLogs(params),
    enabled: params?.order_id !== undefined ? !!params.order_id : true,
    staleTime: 10_000,
  });
}

export function useAssignOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignment-logs"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["distribution-eligible-admins"] });
    },
  });
}

export function useUnassignOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: number) => unassignOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignment-logs"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["distribution-eligible-admins"] });
    },
  });
}
