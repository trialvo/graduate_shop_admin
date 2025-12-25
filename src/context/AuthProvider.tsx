"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  adminStorage,
  clearAuthStorage,
  tokenStorage,
  type StoragePersistOptions,
  type StoredAdmin,
} from "@/lib/storage";
import { getJwtExpMs, isTokenExpired } from "@/lib/jwt";
import { AUTH_LOGOUT_EVENT } from "@/api/client";

type AuthContextValue = {
  hydrated: boolean;
  token: string | null;
  admin: StoredAdmin | null;
  isAuthed: boolean;

  setSession: (token: string, admin: StoredAdmin, options?: SessionOptions) => void;
  logout: (reason?: string) => void;

  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
};

type SessionOptions = StoragePersistOptions & {
  notify?: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<StoredAdmin | null>(null);

  // ✅ hydrate from localStorage (no flashing)
  useEffect(() => {
    const t = tokenStorage.get();
    const a = adminStorage.get();

    if (!t || !a) {
      if (t || a) {
        clearAuthStorage();
      }
      setToken(null);
      setAdmin(null);
      setHydrated(true);
      return;
    }

    if (isTokenExpired(t)) {
      clearAuthStorage();
      setToken(null);
      setAdmin(null);
      setHydrated(true);
      return;
    }

    setToken(t);
    setAdmin(a);
    setHydrated(true);
  }, []);

  const logout = useCallback(
    (reason?: string) => {
      clearAuthStorage();
      setToken(null);
      setAdmin(null);
      toast.success(reason ?? "Logged out");
      navigate("/", { replace: true });
    },
    [navigate]
  );

  // ✅ listen for axios 401 interceptor
  useEffect(() => {
    const handler = () => {
      // avoid double toast spam
      clearAuthStorage();
      setToken(null);
      setAdmin(null);

      // if already on home, no need extra nav
      if (location.pathname !== "/") {
        toast.error("Session expired. Please login again.");
        navigate("/", { replace: true });
      } else {
        toast.error("Session expired. Please login again.");
      }
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handler);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler);
  }, [navigate, location.pathname]);

  // ✅ auto logout on token expiry time (even without API call)
  useEffect(() => {
    if (!token) return;

    const expMs = getJwtExpMs(token);
    if (!expMs) return;

    const msLeft = expMs - Date.now();
    if (msLeft <= 0) {
      logout("Session expired");
      return;
    }

    // 2 seconds earlier logout
    const timer = window.setTimeout(() => {
      logout("Session expired");
    }, Math.max(0, msLeft - 2000));

    return () => window.clearTimeout(timer);
  }, [token, logout]);

  const setSession = useCallback(
    (t: string, a: StoredAdmin, options?: SessionOptions) => {
      tokenStorage.set(t, options);
      adminStorage.set(a, options);
      setToken(t);
      setAdmin(a);
      if (options?.notify) {
        toast.success("Signed in successfully");
      }
    },
    []
  );

  const hasRole = useCallback((role: string) => Boolean(admin?.roles?.includes(role)), [admin]);
  const hasAnyRole = useCallback((roles: string[]) => roles.some((r) => admin?.roles?.includes(r)), [admin]);
  const hasPermission = useCallback(
    (permission: string) => Boolean(admin?.permissions?.includes(permission)),
    [admin]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      hydrated,
      token,
      admin,
      isAuthed: Boolean(token && admin),

      setSession,
      logout,

      hasRole,
      hasAnyRole,
      hasPermission,
    }),
    [hydrated, token, admin, setSession, logout, hasRole, hasAnyRole, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
