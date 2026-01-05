export type UserRole = "Admin" | "Super Admin" | "Manager";

export type ProfileUser = {
  id: string;
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
  status: "active" | "inactive";
  avatarUrl?: string;
  lastVisitAt?: string; // UI only
};

export type NotificationCount = {
  notifications: number;
  messages: number;
};

export type ProfileContact = {
  email: string;
  address: string;
  phonePrimary: string;
  phoneSecondary?: string;
  profileFileLabel?: string;
};
