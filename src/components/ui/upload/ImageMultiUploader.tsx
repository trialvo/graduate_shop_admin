import { useMemo, useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";

export type UploadedImage = {
  id: string;
  file: File;
  url: string; // objectURL
};

type Props = {
  label: string;
  images: UploadedImage[];
  onChange: (next: UploadedImage[]) => void;
  max?: number;
  helperText?: string;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ImageMultiUploader({
  label,
  images,
  onChange,
  max = 10,
  helperText,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const remaining = Math.max(0, max - images.length);
  const canAdd = images.length < max;
  const previews = useMemo(() => images, [images]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining);

    const next: UploadedImage[] = list.map((file) => ({
      id: makeId(),
      file,
      url: URL.createObjectURL(file),
    }));

    onChange([...images, ...next]);
  };

  const remove = (id: string) => {
    const target = images.find((x) => x.id === id);
    if (target) URL.revokeObjectURL(target.url);
    onChange(images.filter((x) => x.id !== id));
  };

  const clearAll = () => {
    images.forEach((x) => URL.revokeObjectURL(x.url));
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {images.length}/{max}
          </span>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={images.length === 0}>
            Clear
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <ImagePlus size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Upload product images
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Supports JPG/PNG/WebP. Remaining: {remaining}
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              if (inputRef.current) inputRef.current.value = "";
            }}
          />

          <Button onClick={() => inputRef.current?.click()} disabled={!canAdd} startIcon={<ImagePlus size={16} />}>
            Select images
          </Button>
        </div>

        {previews.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {previews.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800"
              >
                <img src={img.url} alt={img.file.name} className="h-28 w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 shadow-theme-xs opacity-0 transition group-hover:opacity-100 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400"
                  onClick={() => remove(img.id)}
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {helperText ? <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p> : null}
    </div>
  );
}
