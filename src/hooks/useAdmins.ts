import { useQuery } from "@tanstack/react-query";
import { getAdmins } from "@/api/admin.api";

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
