"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, UploadCloud, X, Crop as CropIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { cn } from "@/lib/utils";

import {
  createBanner,
  getBannerById,
  updateBanner,
  type BannerApi,
} from "@/api/banners.api";
import { toPublicUrl } from "@/utils/toPublicUrl";
import type { BannerRow, Option } from "./types";
import { ZONES, TYPES } from "./banner.constants";
import ImageCropperModal from "./BannerImageCropper";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: BannerRow | null;
  onClose: () => void;
};

type ImgMeta = { width: number; height: number; ratio: number };

const RECOMMENDED = { ratio: 3 / 1, width: 1200, height: 400 };

function ratioLabel(r: number) {
  return `${r.toFixed(2)}:1`;
}

function isImageFile(f: File) {
  return f.type.startsWith("image/");
}

function getApiErrorMessage(err: unknown): string {
  const anyErr = err as any;
  const data = anyErr?.response?.data;
  if (typeof data?.error === "string" && data.error.trim()) return data.error.trim();
  if (typeof data?.message === "string" && data.message.trim()) return data.message.trim();
  if (typeof anyErr?.message === "string" && anyErr.message.trim()) return anyErr.message.trim();
  return "Something went wrong!";
}

const typeOptions: Option[] = TYPES.map((t) => ({ value: t, label: t }));

function hasOwn(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export default function BannerModal({ open, mode, initial, onClose }: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const editingId = initial?.id;

  const bannerQuery = useQuery({
    queryKey: ["banner", editingId],
    queryFn: async () => {
      if (!editingId) return null;
      const res = await getBannerById(editingId);
      return res.banner;
    },
    enabled: open && mode === "edit" && Boolean(editingId),
    staleTime: 0,
  });

  const apiBanner: BannerApi | null = (bannerQuery.data as any) ?? null;

  // form state
  const [title, setTitle] = useState("");
  const [zone, setZone] = useState<string>(ZONES[0] ?? "Home Top");
  const [type, setType] = useState<string>("Default");

  // ✅ new
  const [path, setPath] = useState<string>("");

  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState(true);

  // image
  const [imageUrl, setImageUrl] = useState<string | null>(null); // preview url (objectURL or public)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const [imgMeta, setImgMeta] = useState<ImgMeta | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // ✅ crop modal state
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [cropSourceName, setCropSourceName] = useState<string | undefined>(undefined);

  const zoneOptions: Option[] = useMemo(
    () => ZONES.map((z) => ({ value: z, label: z })),
    []
  );

  useEffect(() => {
    if (!open) return;

    if (mode === "create") {
      setTitle("");
      setZone(ZONES[0] ?? "Home Top");
      setType("Default");

      setPath("");

      setFeatured(false);
      setStatus(true);

      setImageUrl(null);
      setImageFile(null);
      setImageFileName(null);
      setImgMeta(null);

      setCropOpen(false);
      setCropSourceUrl(null);
      setCropSourceName(undefined);

      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const b = apiBanner
      ? {
          title: apiBanner.title,
          zone: apiBanner.zone,
          type: apiBanner.type,
          path: apiBanner.path,
          featured: apiBanner.featured,
          status: apiBanner.status,
          img_path: apiBanner.img_path,
        }
      : initial
        ? {
            title: initial.title,
            zone: initial.zone,
            type: initial.type,
            path: initial.path,
            featured: initial.featured,
            status: initial.status,
            img_path: initial.imgPath ? initial.imgPath.replace(toPublicUrl(""), "") : null,
          }
        : null;

    if (!b) return;

    setTitle(b.title ?? "");
    setZone(b.zone ?? (ZONES[0] ?? "Home Top"));
    setType(b.type ?? "Default");
    setPath(b.path ?? "");

    setFeatured(Boolean(b.featured));
    setStatus(Boolean(b.status));

    const serverImg = apiBanner?.img_path ?? null;
    setImageUrl(serverImg ? toPublicUrl(serverImg) : initial?.imgPath ?? null);

    setImageFile(null);
    setImageFileName(null);
    setImgMeta(null);

    setCropOpen(false);
    setCropSourceUrl(null);
    setCropSourceName(undefined);

    if (fileRef.current) fileRef.current.value = "";
  }, [open, mode, apiBanner, initial]);

  const loadMeta = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      setImgMeta({ width: w, height: h, ratio: h > 0 ? w / h : 0 });
    };
    img.src = src;
  };

  // ✅ when user picks a file -> open crop modal immediately
  const openCropForFile = (f: File) => {
    if (!isImageFile(f)) {
      toast.error("Please select an image file");
      return;
    }
    const src = URL.createObjectURL(f);
    setCropSourceUrl(src);
    setCropSourceName(f.name);
    setCropOpen(true);
  };

  const onFileSelected = (f: File | null) => {
    if (!f) return;
    openCropForFile(f);
  };

  const pickImage = () => fileRef.current?.click();

  const resetImage = () => {
    // Reset to original server image (edit) or empty (create)
    if (mode === "edit") {
      const serverImg = apiBanner?.img_path ? toPublicUrl(apiBanner.img_path) : null;
      setImageUrl(serverImg ?? initial?.imgPath ?? null);
    } else {
      setImageUrl(null);
    }

    setImageFile(null);
    setImageFileName(null);
    setImgMeta(null);

    setCropOpen(false);
    setCropSourceUrl(null);
    setCropSourceName(undefined);

    if (fileRef.current) fileRef.current.value = "";
  };

  // Optional: allow re-crop current local file
  const reCropCurrent = () => {
    if (!imageFile) {
      toast.error("No local image to crop. Upload a new image first.");
      return;
    }
    openCropForFile(imageFile);
  };

  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (mode === "create" && !imageFile) return false; // create requires cropped image
    return true;
  }, [title, mode, imageFile]);

  const ratioDiff = useMemo(() => {
    if (!imgMeta?.ratio) return null;
    return Math.abs(imgMeta.ratio - RECOMMENDED.ratio);
  }, [imgMeta]);

  const ratioOk = useMemo(() => {
    if (ratioDiff == null) return null;
    return ratioDiff <= 0.12;
  }, [ratioDiff]);

  const createMut = useMutation({
    mutationFn: async () => {
      if (!imageFile) throw new Error("Image required");

      return createBanner({
        banner_img: imageFile,
        title: title.trim(),
        zone,
        type,
        path: path.trim() ? path.trim() : null,
        status,
        featured,
      });
    },
    onSuccess: (res: any) => {
      if (res?.success === true) {
        toast.success("Banner created");
        qc.invalidateQueries({ queryKey: ["banners"] });
        onClose();
        return;
      }
      toast.error(res?.message || res?.error || "Failed to create banner");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      if (!editingId) throw new Error("Missing banner id");

      const base = apiBanner
        ? {
            title: apiBanner.title ?? "",
            zone: apiBanner.zone ?? "",
            type: apiBanner.type ?? "",
            path: apiBanner.path ?? "",
            status: Boolean(apiBanner.status),
            featured: Boolean(apiBanner.featured),
          }
        : initial
          ? {
              title: initial.title ?? "",
              zone: initial.zone ?? "",
              type: initial.type ?? "",
              path: initial.path ?? "",
              status: Boolean(initial.status),
              featured: Boolean(initial.featured),
            }
          : null;

      const patch: any = {};

      if (!base || title.trim() !== (base.title ?? "")) patch.title = title.trim();
      if (!base || zone !== (base.zone ?? "")) patch.zone = zone;
      if (!base || type !== (base.type ?? "")) patch.type = type;

      const nextPath = path.trim() ? path.trim() : "";
      const basePath = (base?.path ?? "") || "";
      if (!base || nextPath !== basePath) patch.path = nextPath ? nextPath : null;

      if (!base || Boolean(status) !== Boolean(base.status)) patch.status = Boolean(status);
      if (!base || Boolean(featured) !== Boolean(base.featured)) patch.featured = Boolean(featured);

      if (imageFile) patch.banner_img = imageFile;

      if (Object.keys(patch).length === 0) return { success: true, message: "No changes" };

      return updateBanner(editingId, patch);
    },
    onSuccess: (res: any) => {
      if (res?.success === true) {
        toast.success("Banner updated");
        qc.invalidateQueries({ queryKey: ["banners"] });
        qc.invalidateQueries({ queryKey: ["banner", editingId] });
        onClose();
        return;
      }
      toast.error(res?.message || res?.error || "Update failed");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const submit = () => {
    if (!canSave) return;
    if (mode === "create") createMut.mutate();
    else updateMut.mutate();
  };

  const pending = createMut.isPending || updateMut.isPending;

  // ✅ when crop applied
  const onCropApply = ({ file, previewUrl }: { file: File; previewUrl: string }) => {
    setImageFile(file);
    setImageUrl(previewUrl);
    setImageFileName(file.name);
    loadMeta(previewUrl);

    // cleanup crop source url
    if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);

    setCropOpen(false);
    setCropSourceUrl(null);
    setCropSourceName(undefined);

    if (fileRef.current) fileRef.current.value = "";
  };

  const onCropClose = () => {
    // if user closes crop modal, don't change current selected image
    if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    setCropOpen(false);
    setCropSourceUrl(null);
    setCropSourceName(undefined);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center">
        <button
          type="button"
          className="absolute inset-0 bg-black/60"
          onClick={() => !pending && onClose()}
          aria-label="Close overlay"
        />

        <div className="relative w-[96vw] max-w-6xl overflow-hidden rounded-[4px] border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === "create" ? "Add New Banner" : "Edit Banner"}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Upload করলে auto crop আসবে (Fixed ratio 3:1)
              </p>
            </div>

            <button
              type="button"
              onClick={() => !pending && onClose()}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-[4px] border",
                "border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50",
                "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              )}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[800px] overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left */}
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Banner Information
                  </h4>

                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title <span className="text-error-500">*</span>
                      </p>
                      <Input
                        placeholder="New banner"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Zone <span className="text-error-500">*</span>
                      </p>
                      <Select
                        options={zoneOptions}
                        placeholder="Select zone"
                        defaultValue={zone}
                        onChange={(v) => setZone(String(v))}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type <span className="text-error-500">*</span>
                      </p>
                      <Select
                        options={typeOptions}
                        placeholder="Select type"
                        defaultValue={type}
                        onChange={(v) => setType(String(v))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Path (optional)
                      </p>
                      <Input
                        placeholder="/campaign/winter-sale or https://..."
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Empty রাখলে backend এ <b>null</b> হবে।
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-[4px] border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Featured
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Highlight this banner
                          </p>
                        </div>
                        <Switch label="" defaultChecked={featured} onChange={(c) => setFeatured(c)} />
                      </div>
                    </div>

                    <div className="rounded-[4px] border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Status
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {status ? "Active" : "Inactive"}
                          </p>
                        </div>
                        <Switch label="" defaultChecked={status} onChange={(c) => setStatus(c)} />
                      </div>
                    </div>
                  </div>

                  {mode === "edit" && bannerQuery.isFetching ? (
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Loading banner...
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Right Upload */}
              <div className="space-y-6">
                <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Banner Image
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Upload করলে auto crop popup আসবে (3:1)
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={pickImage} disabled={pending}>
                        Upload
                      </Button>
                      <Button variant="outline" onClick={resetImage} disabled={pending}>
                        Reset
                      </Button>
                      <Button
                        variant="outline"
                        onClick={reCropCurrent}
                        disabled={pending || !imageFile}
                        startIcon={<CropIcon size={16} />}
                      >
                        Crop
                      </Button>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "mt-4 overflow-hidden rounded-[4px] border transition",
                      dragOver ? "border-brand-500" : "border-gray-200 dark:border-gray-800"
                    )}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0] ?? null;
                      if (file) onFileSelected(file);
                    }}
                  >
                    <div className="relative w-full bg-gray-50 dark:bg-gray-800">
                      <div className="pt-[33.333%]" />
                      <div className="absolute inset-0">
                        {imageUrl ? (
                          <>
                            <img src={imageUrl} alt="Banner preview" className="h-full w-full object-cover" />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                          </>
                        ) : (
                          <button
                            type="button"
                            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400"
                            onClick={pickImage}
                            disabled={pending}
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-gray-300 bg-white shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">
                              <UploadCloud size={20} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold">
                                {mode === "create" ? "Upload Banner (required)" : "Upload New Image (optional)"}
                              </p>
                              <p className="mt-1 text-xs">Drag & drop or click to select</p>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="inline-flex h-7 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                          <ImageIcon size={14} />
                          {imageFileName ?? (imageUrl ? "Current image" : "No file selected")}
                        </span>

                        {imgMeta ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex h-7 items-center rounded-lg border border-gray-200 bg-white px-2 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                              {imgMeta.width}×{imgMeta.height}
                            </span>

                            <span
                              className={cn(
                                "inline-flex h-7 items-center rounded-lg border px-2 font-semibold",
                                ratioOk === true
                                  ? "border-success-200 bg-success-50 text-success-700 dark:border-success-900/30 dark:bg-success-500/10 dark:text-success-300"
                                  : "border-error-200 bg-error-50 text-error-700 dark:border-error-900/30 dark:bg-error-500/10 dark:text-error-300"
                              )}
                            >
                              Ratio {ratioLabel(imgMeta.ratio)}
                              {ratioOk === true ? " ✓" : " !"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Crop ratio 3:1 enforced</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
                  />
                </div>

                <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Best practice</h4>
                  <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <li>• Crop করে 3:1 perfect fit নাও</li>
                    <li>• Text edges থেকে দূরে রাখো</li>
                    <li>• High quality image use করো</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => !pending && onClose()} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canSave || pending}>
              {pending ? "Saving..." : mode === "create" ? "Submit" : "Update"}
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ Crop modal */}
      <ImageCropperModal
        open={cropOpen}
        imageUrl={cropSourceUrl ?? ""}
        fileName={cropSourceName}
        aspect={3 / 1}
        onClose={onCropClose}
        onApply={onCropApply}
      />
    </>
  );
}
