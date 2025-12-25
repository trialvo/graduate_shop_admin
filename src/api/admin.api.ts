import { api } from "@/api/client";

export type AdminListResponse = {
  data: Array<{
    id: number;
    email: string;
    is_active: boolean;
    roles: string[];
    created_at: string;
    last_login_at: string | null;
    profile_img_path: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    address: string | null;
  }>;
  limit: number;
  offset: number;
  total: number;
};

export type CreateAdminBody = {
  email: string;
  password: string;
  role_id: number;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type CreateAdminResponse = {
  id: number;
  email: string;
  roles: string[];
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
};

export type UpdateAdminBody = {
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  address?: string | null;
  role_id?: number;
  is_active?: boolean;
  password?: string;
};

export type UpdateAdminResponse = {
  success: boolean;
  id: number;
  relogin_required?: boolean;
  changes?: Record<string, unknown>;
};

export const getAdmins = async (params: {
  role?: string;
  email?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}) => {
  const { data } = await api.get<AdminListResponse>("/admin/getAdmins", { params });
  return data;
};

export const createAdmin = async (body: CreateAdminBody) => {
  const { data } = await api.post<CreateAdminResponse>("/admin/createAdmin", body);
  return data;
};

export const updateAdmin = async (id: number, body: UpdateAdminBody) => {
  const { data } = await api.put<UpdateAdminResponse>(`/admin/update/${id}`, body);
  return data;
};
