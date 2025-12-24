import type { NotificationCount, ProfileContact, ProfileUser } from "./types";

export const MOCK_USER: ProfileUser = {
  id: "usr-1001",
  firstName: "Mehedi",
  lastName: "Hasan",
  email: "mehedi@email.com",
  phone: "+880 1700000000",
  country: "Bangladesh",
  city: "Gazipur",
  state: "Gazipur City",
  zipcode: "1346",
  address: "Gazipur, dhaka, bangladesh",
  role: "Admin",
  status: "active",
  lastVisitAt: "02/03/2023",
};

export const MOCK_COUNTS: NotificationCount = {
  notifications: 2,
  messages: 7,
};

export const MOCK_CONTACT: ProfileContact = {
  email: "maria@email.com",
  address: "312 3rd St, Albany, New York 12206, USA",
  phonePrimary: "+1-123-123-123",
  phoneSecondary: "+1-123-123-123",
  profileFileLabel: "Profile information file",
};
