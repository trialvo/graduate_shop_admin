// src/api/admin-users.api.ts
import { api } from "./client";

export type AdminUserStatus = "active" | "inactive";
export type AdminUserGender = "unspecified" | "male" | "female" | "other";

export type AdminUserPhone = {
  id: number;
  phone_number: string;
  is_verified: boolean | 0 | 1;
};

export type AdminUserEntity = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  img_path: string | null;
  status: AdminUserStatus | string;
  gender: AdminUserGender | string;
  dob: string | null;

  is_email_verified: boolean;
  is_fully_verified: boolean;
  has_password: boolean;

  total_spent: number;

  default_phone: string | null;
  phones: AdminUserPhone[];

  default_address: any | null;
  addresses: any[];

  created_at: string;
  deleted_at: string | null;
};

export type AdminUsersListResponse = {
  success: boolean;
  meta: { limit: number; offset: number; total: number };
  users: AdminUserEntity[];
};

export type AdminUserResponse = {
  success: boolean;
  user: AdminUserEntity;
};

export type GetAdminUsersParams = {
  limit?: number;
  offset?: number;
};

export async function getAdminUsers(params: GetAdminUsersParams) {
  const res = await api.get<AdminUsersListResponse>("/admin/users", { params });
  return res.data;
}

export async function getAdminUser(id: number) {
  const res = await api.get<AdminUserResponse>(`/admin/user/${id}`);
  return res.data;
}

export type CreateAdminUserPayload = {
  user_profile?: File | null;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  gender: AdminUserGender;
  phone: string;
  dob: string; // YYYY-MM-DD
  is_active: AdminUserStatus; // "active" | "inactive"
};

export type EditAdminUserPayload = {
  user_profile?: File | null;
  email: string;
  password?: string; // optional on edit
  first_name: string;
  last_name: string;
  gender: AdminUserGender;
  phone: string;
  dob: string; // YYYY-MM-DD
  is_active: AdminUserStatus;
};

function buildUserFormData(payload: Record<string, any>) {
  const fd = new FormData();

  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return;

    if (k === "user_profile") {
      if (v instanceof File) fd.append(k, v);
      return;
    }

    fd.append(k, String(v));
  });

  return fd;
}

export async function createAdminUser(payload: CreateAdminUserPayload) {
  const fd = buildUserFormData(payload as any);
  const res = await api.post("/admin/createUser", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function editAdminUser(id: number, payload: EditAdminUserPayload) {
  const fd = buildUserFormData(payload as any);
  const res = await api.put(`/admin/editUser/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteAdminUser(id: number) {
  const res = await api.delete(`/admin/user/${id}`);
  return res.data;
}
