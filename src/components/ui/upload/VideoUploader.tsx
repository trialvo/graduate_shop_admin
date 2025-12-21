import { useRef } from "react";
import { Trash2, UploadCloud, Video } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";

export type UploadedVideo =
  | { kind: "none" }
  | { kind: "file"; file: File; url: string }
  | { kind: "url"; url: string };

type Props = {
  label: string;
  value: UploadedVideo;
  onChange: (next: UploadedVideo) => void;
  helperText?: string;
};

function normalizeUrl(input: string): string {
  const t = input.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export default function VideoUploader({ label, value, onChange, helperText }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const clear = () => {
    if (value.kind === "file") URL.revokeObjectURL(value.url);
    onChange({ kind: "none" });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <Button variant="outline" size="sm" onClick={clear} disabled={value.kind === "none"}>
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <UploadCloud size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Upload video file</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">MP4/WebM recommended</p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (value.kind === "file") URL.revokeObjectURL(value.url);
                onChange({ kind: "file", file, url: URL.createObjectURL(file) });
                if (inputRef.current) inputRef.current.value = "";
              }}
            />

            <Button onClick={() => inputRef.current?.click()} startIcon={<Video size={16} />}>
              Select video
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Or use a video URL</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Example: YouTube / CDN / MP4 URL
          </p>

          <div className="mt-4 flex gap-2">
            <Input
              placeholder="https://..."
              value={value.kind === "url" ? value.url : ""}
              onChange={(e) => onChange({ kind: "url", url: e.target.value })}
            />
            <Button
              variant="outline"
              onClick={() => {
                if (value.kind !== "url") return;
                const n = normalizeUrl(value.url);
                onChange({ kind: "url", url: n });
              }}
              disabled={value.kind !== "url" || !value.url.trim()}
            >
              Fix
            </Button>
          </div>
        </div>
      </div>

      {value.kind !== "none" ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Preview</p>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
              onClick={clear}
              aria-label="Remove video"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            {value.kind === "file" ? (
              <video controls className="w-full" src={value.url} />
            ) : (
              <iframe
                title="video"
                src={value.url}
                className="h-64 w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      ) : null}

      {helperText ? <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p> : null}
    </div>
  );
}
