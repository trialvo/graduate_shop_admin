import { api } from "./client";

export type DistributionSettings = {
  mode: "manual" | "auto";
  auto_assign: boolean;
  max_orders_per_agent: number;
};

export type DeliveryAgent = {
  id: number;
  name: string;
  phone: string;
  max_orders: number;
  active_order_count: number;
  status: boolean;
};

export type AgentPayload = {
  name: string;
  phone: string;
  max_orders: number;
};

export async function getDistributionSettings(): Promise<DistributionSettings> {
  const res = await api.get("/admin/order-distribution/settings");
  return res.data;
}

export async function updateDistributionSettings(
  body: Partial<DistributionSettings>
): Promise<{ success: true }> {
  const res = await api.patch("/admin/order-distribution/settings", body);
  return res.data;
}

export async function getAgents(): Promise<DeliveryAgent[]> {
  const res = await api.get("/admin/order-distribution/agents");
  return res.data;
}

export async function addAgent(body: AgentPayload): Promise<{ success: true; id: number }> {
  const res = await api.post("/admin/order-distribution/agent", body);
  return res.data;
}

export async function editAgent(id: number, body: Partial<AgentPayload>): Promise<{ success: true }> {
  const res = await api.put(`/admin/order-distribution/agent/${id}`, body);
  return res.data;
}

export async function removeAgent(id: number): Promise<{ success: true }> {
  const res = await api.delete(`/admin/order-distribution/agent/${id}`);
  return res.data;
}
