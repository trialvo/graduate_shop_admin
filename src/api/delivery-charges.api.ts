// src/api/delivery-charges.api.ts

import { api } from "./client";

export type DeliveryChargeEntity = {
  id: number;
  title: string;
  type: string;
  customer_charge: number;
  our_charge: number;

  // ✅ now boolean in API
  status: boolean;

  img_path: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type DeliveryChargesListResponse = {
  success: boolean;
  data: DeliveryChargeEntity[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
};

export type GetDeliveryChargesParams = {
  type?: string;
  status?: boolean;
  limit?: number;
  offset?: number;
};

export type CreateDeliveryChargeInput = {
  delivery_img?: File | null;
  title: string;
  type: string;
  customer_charge: number;
  our_charge: number;
  status: boolean;
};

export type UpdateDeliveryChargeInput = Partial<CreateDeliveryChargeInput>;

function buildFormData(input: Partial<CreateDeliveryChargeInput>) {
  const fd = new FormData();

  if (input.delivery_img) fd.append("delivery_img", input.delivery_img);

  if (typeof input.title === "string") fd.append("title", input.title);
  if (typeof input.type === "string") fd.append("type", input.type);

  if (typeof input.customer_charge === "number") fd.append("customer_charge", String(input.customer_charge));
  if (typeof input.our_charge === "number") fd.append("our_charge", String(input.our_charge));

  // ✅ boolean -> "true"/"false" in form-data (most backends parse this fine)
  if (typeof input.status === "boolean") fd.append("status", input.status ? "true" : "false");

  return fd;
}

export async function getDeliveryCharges(params: GetDeliveryChargesParams) {
  const res = await api.get<DeliveryChargesListResponse>("/delivery/charges", {
    params: {
      ...(params.type ? { type: params.type } : {}),
      ...(typeof params.status === "boolean" ? { status: params.status } : {}),
      ...(typeof params.limit === "number" ? { limit: params.limit } : {}),
      ...(typeof params.offset === "number" ? { offset: params.offset } : {}),
    },
  });

  const payload = res.data;

  return {
    success: Boolean(payload?.success),
    data: Array.isArray(payload?.data) ? payload.data : [],
    pagination: payload?.pagination ?? {
      total: Array.isArray(payload?.data) ? payload.data.length : 0,
      limit: params.limit ?? 0,
      offset: params.offset ?? 0,
    },
  };
}

export async function getDeliveryCharge(id: number) {
  const res = await api.get<any>(`/delivery/charge/${id}`);
  const data = res.data;

  // backend might return raw entity or {success,data}
  if (data && typeof data === "object" && "success" in data) {
    return (data?.data ?? null) as DeliveryChargeEntity | null;
  }
  return data as DeliveryChargeEntity;
}

export async function createDeliveryCharge(input: CreateDeliveryChargeInput) {
  const fd = buildFormData(input);

  const res = await api.post<any>("/delivery/charge", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function updateDeliveryCharge(id: number, input: UpdateDeliveryChargeInput) {
  const fd = buildFormData(input);

  const res = await api.put<any>(`/delivery/charge/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function deleteDeliveryCharge(id: number) {
  const res = await api.delete<{ success?: boolean; message?: string }>(`/delivery/charge/${id}`);
  return res.data;
}
