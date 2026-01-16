import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  html: string;
  className?: string;
  emptyText?: string;
};

export default function RichTextPreview({ html, className, emptyText = "-" }: Props) {
  const safeHtml = (html ?? "").trim();

  if (!safeHtml) {
    return <div className={cn("text-sm text-gray-500 dark:text-gray-400", className)}>{emptyText}</div>;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200",
        className
      )}
    >
      <div
        className={cn(
          "richtext-preview",
          "space-y-3",
          "[&_p]:leading-relaxed",
          "[&_a]:text-brand-600 dark:[&_a]:text-brand-400",
          "[&_a]:underline",
          "[&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:list-decimal [&_ol]:pl-6",
          "[&_img]:max-w-full [&_img]:rounded-xl",
          "[&_video]:max-w-full [&_video]:rounded-xl",
          "[&_iframe]:w-full [&_iframe]:rounded-xl",
          "[&_table]:w-full [&_table]:border-collapse",
          "[&_th]:border [&_th]:border-gray-200 dark:[&_th]:border-gray-800",
          "[&_td]:border [&_td]:border-gray-200 dark:[&_td]:border-gray-800",
          "[&_th]:bg-gray-50 dark:[&_th]:bg-white/[0.04]",
          "[&_th]:px-3 [&_th]:py-2",
          "[&_td]:px-3 [&_td]:py-2"
        )}
        // NOTE: backend controlled HTML. If you ever allow user-submitted HTML, sanitize on server.
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  );
}
