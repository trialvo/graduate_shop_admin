export type UserRole = "Admin" | "Manager" | "Super Admin";

export type ProfileUser = {
  id: number;
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  country: string;
  city: string;
  state: string;
  zipcode: string;

  address: string;

  role: UserRole;
  lastVisitText: string; // e.g. "last visit 02/03/2023"
  online: boolean;

  notifications: number;
  messages: number;

  contactEmail: string;
  contactAddress: string;
  contactPhone1: string;
  contactPhone2?: string;

  profileFileName?: string;
};
