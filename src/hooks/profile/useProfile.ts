import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  adminForgotPassword,
  adminResetPassword,
  getAdminProfile,
  updateAdminProfile,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
  type UpdateAdminProfilePayload,
} from "@/api/admin-profile.api";
import { profileKeys } from "./profile.keys";

export function useAdminProfile() {
  return useQuery({
    queryKey: profileKeys.admin(),
    queryFn: getAdminProfile,
    staleTime: 30_000,
  });
}

export function useUpdateAdminProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAdminProfilePayload) => updateAdminProfile(payload),
    onSuccess: (data) => {
      qc.setQueryData(profileKeys.admin(), data);
      toast.success("Profile updated.");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    },
  });
}

export function useAdminForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => adminForgotPassword(payload),
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data?.message || "Failed to send OTP.");
        return;
      }
      toast.success(data?.message || "OTP sent to your email.");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to send OTP.");
    },
  });
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => adminResetPassword(payload),
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data?.message || "Failed to reset password.");
        return;
      }
      toast.success(data?.message || "Password updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reset password.");
    },
  });
}
