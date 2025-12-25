export type AdminRole =
  | "Super Admin"
  | "Admin"
  | "Manager"
  | "Sales Executive"
  | "Employee Currier"
  | "Order Manager"
  | "Product Manager"
  | "Catalog Manager"
  | "Read Only Admin";

// Update these IDs to match your backend role IDs.
export const ROLE_ID_BY_LABEL: Record<AdminRole, number> = {
  "Super Admin": 1,
  Admin: 2,
  Manager: 3,
  "Sales Executive": 4,
  "Employee Currier": 5,
  "Order Manager": 6,
  "Product Manager": 7,
  "Catalog Manager": 8,
  "Read Only Admin": 9,
};

export type AdminStatus = "ACTIVE" | "INACTIVE";

export interface AdminRow {
  id: number;
  name: string;
  email: string;
  role: AdminRole;

  joinDate: string; // DD/MM/YYYY (demo)
  phone: string;

  status: AdminStatus;
  note: string;

  avatarUrl?: string; // optional
  passwordMasked: string; // display only (demo)
}

export interface CreateAdminForm {
  name: string;
  email: string;
  role: AdminRole;

  joinDate: string;
  phone: string;

  status: AdminStatus;
  note: string;

  password: string;
  confirmPassword: string;

  avatarFile: File | null;
  avatarPreviewUrl: string; // object URL
}
