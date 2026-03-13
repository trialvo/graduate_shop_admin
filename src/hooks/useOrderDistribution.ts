import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDistributionSettings, updateDistributionSettings,
  getAgents, addAgent, editAgent, removeAgent,
  type AgentPayload, type DistributionSettings,
} from "@/api/order-distribution.api";

const distKeys = {
  settings: ["distribution-settings"] as const,
  agents: ["distribution-agents"] as const,
};

export function useDistributionSettings() {
  return useQuery({ queryKey: distKeys.settings, queryFn: getDistributionSettings });
}
export function useUpdateDistributionSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<DistributionSettings>) => updateDistributionSettings(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: distKeys.settings }),
  });
}

export function useDeliveryAgents() {
  return useQuery({ queryKey: distKeys.agents, queryFn: getAgents });
}
export function useAddAgent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: addAgent, onSuccess: () => qc.invalidateQueries({ queryKey: distKeys.agents }) });
}
export function useEditAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<AgentPayload> }) => editAgent(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: distKeys.agents }),
  });
}
export function useRemoveAgent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: removeAgent, onSuccess: () => qc.invalidateQueries({ queryKey: distKeys.agents }) });
}
