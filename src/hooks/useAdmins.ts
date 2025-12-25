import { useMutation, useQuery } from "@tanstack/react-query";
import { createAdmin, getAdmins, updateAdmin } from "@/api/admin.api";

export const adminKeys = {
  list: (params: Record<string, any>) => ["admins", "list", params] as const,
};

export const useAdmins = (params: {
  role?: string;
  email?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: adminKeys.list(params),
    queryFn: () => getAdmins(params),
  });
};

export const useCreateAdmin = () => {
  return useMutation({
    mutationFn: createAdmin,
  });
};

export const useUpdateAdmin = () => {
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateAdmin>[1] }) =>
      updateAdmin(id, body),
  });
};
