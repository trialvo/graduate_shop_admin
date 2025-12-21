import { useEffect, useMemo, useRef } from "react";
import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Table2,
  Underline,
  Video,
} from "lucide-react";

import Button from "@/components/ui/button/Button";

type Props = {
  label: string;
  value: string;
  onChange: (nextHtml: string) => void;
  placeholder?: string;
  heightClassName?: string; // e.g. "min-h-[180px]"
  helperText?: string;
};

function exec(cmd: string, value?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = document as any;
  if (typeof d.execCommand === "function") d.execCommand(cmd, false, value);
}

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  heightClassName = "min-h-[180px]",
  helperText,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const toolbarItems = useMemo(
    () => [
      { key: "bold", icon: <Bold size={16} />, onClick: () => exec("bold"), title: "Bold" },
      { key: "italic", icon: <Italic size={16} />, onClick: () => exec("italic"), title: "Italic" },
      { key: "underline", icon: <Underline size={16} />, onClick: () => exec("underline"), title: "Underline" },
      { key: "ul", icon: <List size={16} />, onClick: () => exec("insertUnorderedList"), title: "Bullets" },
      { key: "ol", icon: <ListOrdered size={16} />, onClick: () => exec("insertOrderedList"), title: "Numbered" },
      {
        key: "link",
        icon: <Link2 size={16} />,
        onClick: () => {
          const url = normalizeUrl(window.prompt("Enter link URL") ?? "");
          if (url) exec("createLink", url);
        },
        title: "Insert link",
      },
      {
        key: "image",
        icon: <ImageIcon size={16} />,
        onClick: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const url = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result ?? ""));
              reader.onerror = () => reject(new Error("Failed to read image"));
              reader.readAsDataURL(file);
            });
            if (url) {
              exec(
                "insertHTML",
                `<img src="${url}" alt="" style="max-width:100%; border-radius:12px;" />`
              );
            }
          };
          input.click();
        },
        title: "Insert image",
      },
      {
        key: "table",
        icon: <Table2 size={16} />,
        onClick: () => {
          const rows = Number(window.prompt("Table rows?", "2") ?? "2");
          const cols = Number(window.prompt("Table columns?", "2") ?? "2");
          const r = Number.isFinite(rows) && rows > 0 ? Math.min(10, rows) : 2;
          const c = Number.isFinite(cols) && cols > 0 ? Math.min(10, cols) : 2;

          const thead = `<tr>${Array.from({ length: c })
            .map(
              () =>
                `<th style="border:1px solid #e5e7eb; padding:8px; text-align:left;">Header</th>`
            )
            .join("")}</tr>`;

          const tbody = Array.from({ length: r })
            .map(
              () =>
                `<tr>${Array.from({ length: c })
                  .map(() => `<td style="border:1px solid #e5e7eb; padding:8px;">Cell</td>`)
                  .join("")}</tr>`
            )
            .join("");

          exec(
            "insertHTML",
            `<div style="overflow-x:auto;"><table style="border-collapse:collapse; width:100%; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">${thead}${tbody}</table></div>`
          );
        },
        title: "Insert table",
      },
      {
        key: "video",
        icon: <Video size={16} />,
        onClick: () => {
          const url = window.prompt("Video URL (YouTube / MP4)") ?? "";
          const clean = url.trim();
          if (!clean) return;

          const yt = clean.match(
            /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i
          );

          if (yt?.[1]) {
            const id = yt[1];
            exec(
              "insertHTML",
              `<div style="position:relative; width:100%; padding-top:56.25%; border-radius:12px; overflow:hidden;"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute; inset:0; width:100%; height:100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
            );
            return;
          }

          const safeUrl = normalizeUrl(clean);
          if (!safeUrl) return;
          exec(
            "insertHTML",
            `<video controls style="width:100%; border-radius:12px; overflow:hidden;"><source src="${safeUrl}" /></video>`
          );
        },
        title: "Insert video",
      },
    ],
    []
  );

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800">
          {toolbarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              title={item.title}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
              onClick={() => {
                ref.current?.focus();
                item.onClick();
                onChange(ref.current?.innerHTML ?? "");
              }}
            >
              {item.icon}
            </button>
          ))}

          <div className="ml-auto" />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!ref.current) return;
              ref.current.innerHTML = "";
              onChange("");
            }}
          >
            Clear
          </Button>
        </div>

        <div
          ref={ref}
          className={[
            "p-4 text-sm text-gray-800 dark:text-white/90 outline-none",
            heightClassName,
          ].join(" ")}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder ?? ""}
          onInput={(e) => onChange((e.currentTarget as HTMLDivElement).innerHTML)}
          onBlur={(e) => onChange((e.currentTarget as HTMLDivElement).innerHTML)}
          style={{ wordBreak: "break-word" }}
        />
      </div>

      {helperText ? <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p> : null}

      <style>
        {`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9CA3AF;
          }
        `}
      </style>
    </div>
  );
}
