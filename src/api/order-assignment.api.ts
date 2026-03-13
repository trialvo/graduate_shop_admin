import { api } from "./client";

export type AssignmentLog = {
  id: number;
  order_id: number;
  agent_id: number;
  agent_name: string;
  assigned_by: string;
  assigned_at: string;
};

export async function assignOrder(body: {
  order_id: number;
  agent_id: number;
}): Promise<{ success: true; assigned_at: string }> {
  const res = await api.post("/admin/order/assign", body);
  return res.data;
}

export async function unassignOrder(order_id: number): Promise<{ success: true }> {
  const res = await api.delete(`/admin/order/unassign/${order_id}`);
  return res.data;
}

export async function getAssignmentLogs(params?: {
  order_id?: number;
  agent_id?: number;
  limit?: number;
  offset?: number;
}): Promise<AssignmentLog[]> {
  const res = await api.get("/admin/order/assignment-logs", { params });
  return res.data.data; // { success, data: [] }
}
