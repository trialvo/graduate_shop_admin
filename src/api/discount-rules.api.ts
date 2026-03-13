import { api } from "./client";

// ─── Bulk Rules ───────────────────────────────────────────────────────────────

export type BulkRule = {
  id: number;
  name: string;
  product_sku_id: number;
  min_quantity: number;
  /** 0 = flat amount, 1 = percentage */
  discount_type: 0 | 1;
  discount_value: number;
  status: boolean;
};

export type BulkRulePayload = Omit<BulkRule, "id">;

export async function getBulkRules(): Promise<BulkRule[]> {
  const res = await api.get("/admin/discount/bulk-rules");
  return res.data.data; // { success, data: [] }
}

export async function createBulkRule(body: BulkRulePayload): Promise<{ success: true; id: number }> {
  const res = await api.post("/admin/discount/bulk-rule", body);
  return res.data;
}

export async function editBulkRule(id: number, body: Partial<BulkRulePayload>): Promise<{ success: true }> {
  const res = await api.put(`/admin/discount/bulk-rule/${id}`, body);
  return res.data;
}

export async function deleteBulkRule(id: number): Promise<{ success: true }> {
  const res = await api.delete(`/admin/discount/bulk-rule/${id}`);
  return res.data;
}

// ─── Combo Rules ──────────────────────────────────────────────────────────────

export type ComboRuleItem = { product_sku_id: number; product_name?: string };

export type ComboRule = {
  id: number;
  name: string;
  discount_type: 0 | 1;
  discount_value: number;
  status: boolean;
  items: ComboRuleItem[];
};

export type ComboRulePayload = Omit<ComboRule, "id" | "items"> & {
  items: { product_sku_id: number }[];
};

export async function getComboRules(): Promise<ComboRule[]> {
  const res = await api.get("/admin/discount/combo-rules");
  return res.data.data; // { success, data: [] }
}

export async function createComboRule(body: ComboRulePayload): Promise<{ success: true; id: number }> {
  const res = await api.post("/admin/discount/combo-rule", body);
  return res.data;
}

export async function editComboRule(id: number, body: Partial<ComboRulePayload>): Promise<{ success: true }> {
  const res = await api.put(`/admin/discount/combo-rule/${id}`, body);
  return res.data;
}

export async function deleteComboRule(id: number): Promise<{ success: true }> {
  const res = await api.delete(`/admin/discount/combo-rule/${id}`);
  return res.data;
}
