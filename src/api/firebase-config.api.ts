import { api } from "./client";

export type FirebaseCredential = {
  id: number;
  project_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type GetFirebaseCredentialResponse = {
  success: true;
  data: FirebaseCredential | null;
};

export type ToggleFirebaseCredentialResponse = {
  success: boolean;
  data: { id: number; is_active: boolean };
  message: string;
};

export async function getFirebaseCredential(): Promise<FirebaseCredential | null> {
  const res = await api.get<GetFirebaseCredentialResponse>("/config/firebase-credential");
  return res.data.data ?? null;
}

export async function saveFirebaseCredential(payload: {
  label?: string;
  credential_json: Record<string, unknown>;
}): Promise<{ success: true; message: string }> {
  const res = await api.post("/config/firebase-credential", payload);
  return res.data;
}

export async function toggleFirebaseCredential(): Promise<ToggleFirebaseCredentialResponse> {
  const res = await api.patch("/config/firebase-credential/toggle");
  return res.data;
}
