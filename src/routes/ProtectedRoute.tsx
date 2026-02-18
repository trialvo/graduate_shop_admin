import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import FullPageLoading from "@/components/auth/FullPageLoading";
import { useAuth } from "@/context/AuthProvider";
import toast from "react-hot-toast";

type Props = {
  roles?: string[];
  permissions?: string[];
  redirectTo?: string; // default "/"
};

export default function ProtectedRoute({ roles, permissions, redirectTo = "/" }: Props) {
  const { hydrated, isAuthed, hasAnyRole, hasPermission } = useAuth();
  const location = useLocation();

  if (!hydrated) return <FullPageLoading />;

  if (!isAuthed) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    toast.error("You don't have access to this page.");
    return <Navigate to="/dashboard" replace />;
  }

  if (permissions && permissions.length > 0) {
    const ok = permissions.every((p) => hasPermission(p));
    if (!ok) {
      toast.error("You don't have access to this page.");
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
