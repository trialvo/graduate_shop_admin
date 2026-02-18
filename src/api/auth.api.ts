import { api } from "@/api/client";

export type LoginBody = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  admin: {
    id: number;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    address?: string | null;
    profile_img_path?: string | null;
    roles: string[];
    permissions: string[];
  };
};

export const adminLogin = async (body: LoginBody) => {
  const { data } = await api.post<LoginResponse>("/admin/login", body);
  return data;
};
