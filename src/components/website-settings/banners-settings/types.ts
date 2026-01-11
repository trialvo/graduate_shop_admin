export type BannerRow = {
  id: number;
  title: string;
  zone: string;
  type: string;

  imgPath: string | null;

  status: boolean;
  featured: boolean;

  createdAt: string;
  updatedAt: string;
};

export type BannerModalMode = "create" | "edit";

export type Option = { value: string; label: string };

export function safeText(v: unknown): string {
  return typeof v === "string" ? v : "";
}
