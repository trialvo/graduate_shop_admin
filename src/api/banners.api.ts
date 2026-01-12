import { api } from "./client";

export type BannerTypeApi = string;
export type BannerZoneApi = string;

export type BannerApi = {
  id: number;
  title: string;
  zone: BannerZoneApi;
  type: BannerTypeApi;
  img_path: string | null;
  status: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type GetBannersParams = {
  search?: string;
  zone?: string;
  type?: string;

  // backend sample: status=5 (all), featured=2 (all)
  // BUT: you want these omitted unless user explicitly filters
  status?: 0 | 1 | 5;
  featured?: 0 | 1 | 2;

  limit?: number;
  offset?: number;

  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type GetBannersResponse = {
  success: boolean;
  total: number;
  limit: number;
  offset: number;
  banners: BannerApi[];
};

export type GetBannerResponse = {
  success: boolean;
  banner: BannerApi;
};

export type CreateBannerInput = {
  banner_img: File;
  title: string;
  zone: string;
  type: string;
  status: boolean;
  featured: boolean;
};

export type UpdateBannerPatch = Partial<{
  banner_img: File;
  title: string;
  zone: string;
  type: string;
  status: boolean;
  featured: boolean;
}>;

function hasOwn(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function buildFormDataForPatch(patch: UpdateBannerPatch) {
  const fd = new FormData();

  // IMPORTANT: include only keys that exist in patch (supports false)
  if (hasOwn(patch, "banner_img") && patch.banner_img) {
    fd.append("banner_img", patch.banner_img);
  }
  if (hasOwn(patch, "title") && patch.title !== undefined) {
    fd.append("title", String(patch.title ?? ""));
  }
  if (hasOwn(patch, "zone") && patch.zone !== undefined) {
    fd.append("zone", String(patch.zone ?? ""));
  }
  if (hasOwn(patch, "type") && patch.type !== undefined) {
    fd.append("type", String(patch.type ?? ""));
  }
  if (hasOwn(patch, "status") && patch.status !== undefined) {
    fd.append("status", String(Boolean(patch.status)));
  }
  if (hasOwn(patch, "featured") && patch.featured !== undefined) {
    fd.append("featured", String(Boolean(patch.featured)));
  }

  return fd;
}

// ✅ Only pass params if there is at least 1 key.
// Otherwise call just /banners with no query string.
export async function getBanners(params?: GetBannersParams) {
  const hasParams = params && Object.keys(params).length > 0;

  const { data } = await api.get<GetBannersResponse>("/banners", {
    params: hasParams ? params : undefined,
  });

  return data;
}

export async function getBannerById(id: number) {
  const { data } = await api.get<GetBannerResponse>(`/banner/${id}`);
  return data;
}

export async function createBanner(input: CreateBannerInput) {
  const fd = new FormData();
  fd.append("banner_img", input.banner_img);
  fd.append("title", input.title);
  fd.append("zone", input.zone);
  fd.append("type", input.type);
  fd.append("status", String(Boolean(input.status)));
  fd.append("featured", String(Boolean(input.featured)));

  const { data } = await api.post(`/banner`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateBanner(id: number, patch: UpdateBannerPatch) {
  const fd = buildFormDataForPatch(patch);

  const { data } = await api.put(`/banner/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteBanner(id: number) {
  const { data } = await api.delete(`/banner/${id}`);
  return data;
}
