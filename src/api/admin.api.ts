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
