import type { ProfileUser } from "./types";

export const INITIAL_PROFILE_USER: ProfileUser = {
  id: 1,
  avatarUrl: "",
  firstName: "Maria",
  lastName: "Smith",
  email: "maria@email.com",
  phone: "+1-123-123-123",

  country: "Bangladesh",
  city: "Gazipur",
  state: "Gazipur City",
  zipcode: "1346",

  address: "Gazipur, dhaka, bangladesh",

  role: "Admin",
  lastVisitText: "last visit 02/03/2023",
  online: true,

  notifications: 2,
  messages: 7,

  contactEmail: "maria@email.com",
  contactAddress: "312 3rd St, Albany, New York 12206, USA",
  contactPhone1: "+1 123-123-123",
  contactPhone2: "+1 123-123-123",

  profileFileName: "Profile information file",
};
