import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { clearAuthStorage, tokenStorage } from "@/lib/storage";

// ✅ SPA friendly logout event (no hard reload needed)
export const AUTH_LOGOUT_EVENT = "auth:logout";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      clearAuthStorage();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
      }
    }
    return Promise.reject(err);
  }
);
