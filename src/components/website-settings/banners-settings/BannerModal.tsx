"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import { cn } from "@/lib/utils";

import type { BannerModalMode, BannerRow, Option } from "./types";
import { TYPES, ZONES } from "./banner.constants";
import { createBanner, updateBanner, type UpdateBannerPatch } from "@/api/banners.api";
import BannerImageCropper from "./BannerImageCropper";

function getApiErrorMessage(err: unknown): string {
  const anyErr = err as any;
  const data = anyErr?.response?.data;

  if (typeof data?.error === "string" && data.error.trim()) return data.error.trim();
  if (typeof data?.message === "string" && data.message.trim()) return data.message.trim();
  if (typeof anyErr?.message === "string" && anyErr.message.trim()) return anyErr.message.trim();

  return "Something went wrong!";
}

function sameString(a: string, b: string) {
  return (a ?? "").trim() === (b ?? "").trim();
}

export default function BannerModal({
  open,
  mode,
  initial,
  onClose,
}: {
  open: boolean;
  mode: BannerModalMode;
  initial?: BannerRow | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [zone, setZone] = useState<string>(ZONES[0] ?? "Home Top");
  const [type, setType] = useState<string>(TYPES[0] ?? "Default");

  const [status, setStatus] = useState(true);
  const [featured, setFeatured] = useState(false);

  // image state (cropped output file)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setTitle(initial.title ?? "");
      setZone(initial.zone ?? (ZONES[0] ?? "Home Top"));
      setType(initial.type ?? (TYPES[0] ?? "Default"));
      setStatus(Boolean(initial.status));
      setFeatured(Boolean(initial.featured));

      // For edit, preview should come from server img url (already mapped in parent)
      setImageFile(null);
      setImagePreview(initial.imgPath ?? null);
      return;
    }

    // create defaults
    setTitle("");
    setZone(ZONES[0] ?? "Home Top");
    setType(TYPES[0] ?? "Default");
    setStatus(true);
    setFeatured(false);
    setImageFile(null);
    setImagePreview(null);
  }, [open, mode, initial]);

  const zoneOptions: Option[] = useMemo(
    () => ZONES.map((z) => ({ value: z, label: z })),
    []
  );

  const typeOptions: Option[] = useMemo(
    () => TYPES.map((t) => ({ value: t, label: t })),
    []
  );

  const canSave = useMemo(() => {
    if (!title.trim()) return false;
    if (!zone.trim()) return false;
    if (!type.trim()) return false;

    // create requires image
    if (mode === "create" && !imageFile) return false;

    // edit: allow save with changes (or image change)
    if (mode === "edit" && initial) {
      const changed =
        !sameString(title, initial.title) ||
        !sameString(zone, initial.zone) ||
        !sameString(type, initial.type) ||
        Boolean(status) !== Boolean(initial.status) ||
        Boolean(featured) !== Boolean(initial.featured) ||
        Boolean(imageFile);

      return changed;
    }

    return true;
  }, [title, zone, type, status, featured, imageFile, mode, initial]);

  const createMut = useMutation({
    mutationFn: createBanner,
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
    mutationFn: ({ id, patch }: { id: number; patch: UpdateBannerPatch }) => updateBanner(id, patch),
    onSuccess: (res: any) => {
      if (res?.success === true) {
        toast.success("Banner updated");
        qc.invalidateQueries({ queryKey: ["banners"] });
        onClose();
        return;
      }
      toast.error(res?.message || res?.error || "Failed to update banner");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const submit = () => {
    if (!canSave) return;

    if (mode === "create") {
      if (!imageFile) {
        toast.error("Banner image is required");
        return;
      }

      createMut.mutate({
        banner_img: imageFile,
        title: title.trim(),
        zone: zone.trim(),
        type: type.trim(),
        status: Boolean(status),
        featured: Boolean(featured),
      });
      return;
    }

    if (mode === "edit" && initial) {
      const patch: UpdateBannerPatch = {};

      // ONLY changed fields go to body
      if (!sameString(title, initial.title)) patch.title = title.trim();
      if (!sameString(zone, initial.zone)) patch.zone = zone.trim();
      if (!sameString(type, initial.type)) patch.type = type.trim();
      if (Boolean(status) !== Boolean(initial.status)) patch.status = Boolean(status);
      if (Boolean(featured) !== Boolean(initial.featured)) patch.featured = Boolean(featured);
      if (imageFile) patch.banner_img = imageFile;

      updateMut.mutate({ id: initial.id, patch });
    }
  };

  if (!open) return null;

  const loading = createMut.isPending || updateMut.isPending;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
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
              Upload and crop banner image (recommended 3:1)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
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
        <div className="max-h-[82vh] overflow-y-auto px-6 py-5">
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
                      placeholder="e.g. pant"
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

                  <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        <Switch
                          key={`featured-${featured}`}
                          label=""
                          defaultChecked={featured}
                          onChange={(c) => setFeatured(Boolean(c))}
                        />
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
                        <Switch
                          key={`status-${status}`}
                          label=""
                          defaultChecked={status}
                          onChange={(c) => setStatus(Boolean(c))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {mode === "edit" ? (
                  <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
                    Update will send <span className="font-semibold">only changed</span> fields to
                    the API body.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-6">
              <BannerImageCropper
                required={mode === "create"}
                initialPreviewUrl={imagePreview}
                onChange={({ file, previewUrl }) => {
                  setImageFile(file);
                  setImagePreview(previewUrl);
                }}
              />

              <div className="rounded-[4px] border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Tips (Pro)
                </h4>
                <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Keep main text centered (safe padding)</li>
                  <li>• Use high contrast</li>
                  <li>• Prefer WebP/JPG for fast load</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSave || loading}>
            {loading ? (mode === "create" ? "Submitting..." : "Updating...") : mode === "create" ? "Submit" : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
}
