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
