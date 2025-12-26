// src/hooks/useAdmins.ts
import { useMutation, useQuery, type UseMutationOptions } from "@tanstack/react-query";
import {
  createAdmin,
  getAdmins,
  updateAdmin,
  type CreateAdminPayload,
  type CreateAdminResponse,
  type AdminListResponse,
  type UpdateAdminBody,
  type UpdateAdminResponse,
} from "@/api/admin.api";

export const adminKeys = {
  all: ["admins"] as const,
  list: (params: Record<string, any>) => ["admins", "list", params] as const,
};

export const useAdmins = (params: {
  role?: string;
  email?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}) => {
  return useQuery<AdminListResponse>({
    queryKey: adminKeys.list(params),
    queryFn: () => getAdmins(params),
  });
};

/**
 * ✅ create admin supports multipart (FormData) via createAdmin(payload)
 * payload can include: profile?: File | null
 */
export const useCreateAdmin = (
  options?: UseMutationOptions<CreateAdminResponse, unknown, CreateAdminPayload>,
) => {
  return useMutation<CreateAdminResponse, unknown, CreateAdminPayload>({
    mutationFn: (payload) => createAdmin(payload),
    ...options,
  });
};

export const useUpdateAdmin = (
  options?: UseMutationOptions<
    UpdateAdminResponse,
    unknown,
    { id: number; body: UpdateAdminBody }
  >,
) => {
  return useMutation<UpdateAdminResponse, unknown, { id: number; body: UpdateAdminBody }>({
    mutationFn: ({ id, body }) => updateAdmin(id, body),
    ...options,
  });
};
