export type StoredAdmin = {
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

export type StoragePersistOptions = {
  persist?: boolean;
};

const TOKEN_KEY = "admin_access_token";
const ADMIN_KEY = "admin_user";

const getFromSession = (key: string) => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(key);
};

const getFromLocal = (key: string) => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
};

const setStorageValue = (key: string, value: string, persist?: boolean) => {
  if (typeof window === "undefined") return;
  const shouldPersist = persist ?? true;
  if (shouldPersist) {
    window.localStorage.setItem(key, value);
    window.sessionStorage.removeItem(key);
  } else {
    window.sessionStorage.setItem(key, value);
    window.localStorage.removeItem(key);
  }
};

const clearStorageValue = (key: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
};

export const tokenStorage = {
  get(): string | null {
    return getFromSession(TOKEN_KEY) ?? getFromLocal(TOKEN_KEY);
  },
  set(token: string, options?: StoragePersistOptions) {
    setStorageValue(TOKEN_KEY, token, options?.persist);
  },
  clear() {
    clearStorageValue(TOKEN_KEY);
  },
};

export const adminStorage = {
  get(): StoredAdmin | null {
    const raw = getFromSession(ADMIN_KEY) ?? getFromLocal(ADMIN_KEY);
    return raw ? (JSON.parse(raw) as StoredAdmin) : null;
  },
  set(admin: StoredAdmin, options?: StoragePersistOptions) {
    setStorageValue(ADMIN_KEY, JSON.stringify(admin), options?.persist);
  },
  clear() {
    clearStorageValue(ADMIN_KEY);
  },
};

export const clearAuthStorage = () => {
  tokenStorage.clear();
  adminStorage.clear();
};
