import { api } from "./client";

export type PolicySummary = {
  key: string;
  title: string;
  updated_at: string;
};

export type PolicyFull = {
  key: string;
  title: string;
  content: string;
};

export async function getPolicies(): Promise<PolicySummary[]> {
  const res = await api.get("/admin/policies");
  return res.data;
}

export async function getPolicyByKey(key: string): Promise<PolicyFull> {
  const res = await api.get(`/admin/policy/${key}`);
  return res.data;
}

export async function savePolicy(body: {
  key: string;
  title: string;
  content: string;
}): Promise<{ success: true }> {
  const res = await api.post("/admin/policy", body);
  return res.data;
}

export async function deletePolicy(key: string): Promise<{ success: true }> {
  const res = await api.delete(`/admin/policy/${key}`);
  return res.data;
}
