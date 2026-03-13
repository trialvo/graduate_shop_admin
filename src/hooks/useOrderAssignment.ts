import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignOrder, unassignOrder, getAssignmentLogs } from "@/api/order-assignment.api";

const assignmentKeys = {
  logs: (params: Record<string, any>) => ["assignment-logs", params] as const,
};

export function useAssignmentLogs(params?: { order_id?: number; agent_id?: number; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: assignmentKeys.logs(params ?? {}),
    queryFn: () => getAssignmentLogs(params),
  });
}

export function useAssignOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignment-logs"] }),
  });
}

export function useUnassignOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unassignOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignment-logs"] }),
  });
}
