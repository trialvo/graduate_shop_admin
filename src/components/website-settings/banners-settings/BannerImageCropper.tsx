"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { UploadCloud, X, Scissors } from "lucide-react";

import Button from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import { getCroppedFile } from "./cropImage";

type CropAreaPixels = { x: number; y: number; width: number; height: number };

function isImageFile(f: File) {
  return f.type.startsWith("image/");
}

function revokeUrl(url: string | null) {
  if (!url) return;
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

export default function BannerImageCropper({
  label = "Banner Image",
  required = false,
  initialPreviewUrl,
  onChange,
  aspect = 3 / 1,
}: {
  label?: string;
  required?: boolean;
  initialPreviewUrl?: string | null;
  onChange: (payload: { file: File | null; previewUrl: string | null }) => void;
  aspect?: number;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl ?? null);

  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<CropAreaPixels | null>(null);

  const mimeType = useMemo(() => rawFile?.type || "image/jpeg", [rawFile]);

  useEffect(() => {
    // when parent changes initial (edit open/close), set preview but don't override if user picked new
    if (!rawFile) setPreviewUrl(initialPreviewUrl ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPreviewUrl]);

  useEffect(() => {
    return () => revokeUrl(previewUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = () => fileRef.current?.click();

  const setFile = (f: File | null) => {
    if (!f) return;
    if (!isImageFile(f)) return;

    // revoke old blob preview if any
    if (previewUrl?.startsWith("blob:")) revokeUrl(previewUrl);

    const url = URL.createObjectURL(f);
    setRawFile(f);
    setPreviewUrl(url);
    onChange({ file: f, previewUrl: url });
  };

  const reset = () => {
    if (previewUrl?.startsWith("blob:")) revokeUrl(previewUrl);
    setRawFile(null);
    setPreviewUrl(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedPixels(null);
    if (fileRef.current) fileRef.current.value = "";
    onChange({ file: null, previewUrl: null });
  };

  const onCropComplete = (_: any, areaPixels: CropAreaPixels) => {
    setCroppedPixels(areaPixels);
  };

  const applyCrop = async () => {
    if (!previewUrl || !croppedPixels) return;
    const base = rawFile?.name?.replace(/\.[^/.]+$/, "") || "banner";

    const croppedFile = await getCroppedFile(previewUrl, croppedPixels, `${base}_crop`, mimeType);

    // update preview to cropped blob
    if (previewUrl?.startsWith("blob:")) revokeUrl(previewUrl);
    const newUrl = URL.createObjectURL(croppedFile);

    setRawFile(croppedFile);
    setPreviewUrl(newUrl);
    onChange({ file: croppedFile, previewUrl: newUrl });
    setCropOpen(false);
  };

  return (
    <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {label} {required ? <span className="text-error-500">*</span> : null}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Recommended ratio: 3:1 (crop supported)
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={pick}>
            Upload
          </Button>
          <Button
            variant="outline"
            onClick={() => setCropOpen(true)}
            disabled={!previewUrl}
            startIcon={<Scissors size={16} />}
          >
            Crop
          </Button>
          <Button variant="outline" onClick={reset} disabled={!previewUrl}>
            Reset
          </Button>
        </div>
      </div>

      {/* Preview 3:1 */}
      <div className="mt-4 overflow-hidden rounded-[4px] border border-gray-200 dark:border-gray-800">
        <div className="relative w-full bg-gray-50 dark:bg-gray-800">
          <div className="pt-[33.333%]" />
          <div className="absolute inset-0">
            {previewUrl ? (
              <img src={previewUrl} alt="Banner preview" className="h-full w-full object-cover" />
            ) : (
              <button
                type="button"
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400"
                onClick={pick}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-gray-300 bg-white shadow-theme-xs dark:border-gray-700 dark:bg-gray-900">
                  <UploadCloud size={20} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Upload Banner</p>
                  <p className="mt-1 text-xs">Click to select</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      {/* Crop Modal */}
      {cropOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setCropOpen(false)}
            aria-label="Close crop overlay"
          />

          <div className="relative w-[95vw] max-w-4xl overflow-hidden rounded-[4px] border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Crop Image</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Keep important content inside the safe area
                </p>
              </div>

              <button
                type="button"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-[4px] border",
                  "border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50",
                  "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                )}
                onClick={() => setCropOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="relative h-[420px] w-full overflow-hidden rounded-[4px] border border-gray-200 bg-black dark:border-gray-800">
                {previewUrl ? (
                  <Cropper
                    image={previewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                ) : null}
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="mt-2 w-full"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setCropOpen(false)}>
                Cancel
              </Button>
              <Button onClick={applyCrop} disabled={!previewUrl || !croppedPixels}>
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
