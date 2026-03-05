import React from "react";
import { cn } from "@/lib/utils";

type Props = {
 title?: string;
 description?: string;
 icon?: React.ReactNode;
 badge?: React.ReactNode;
 headerActions?: React.ReactNode;
 children: React.ReactNode;
 /** Remove the inner padding from children area */
 noPadding?: boolean;
 className?: string;
};

/**
 * Card section with optional icon + title header.
 *
 * ```tsx
 * <SectionCard title="Basic Info" icon={<Package size={16} />}>
 *   <div>...</div>
 * </SectionCard>
 * ```
 */
export default function SectionCard({
 title,
 description,
 icon,
 badge,
 headerActions,
 children,
 noPadding,
 className,
}: Props) {
 const hasHeader = title || icon || badge || headerActions;

 return (
  <div
   className={cn(
    "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900",
    className,
   )}
  >
   {hasHeader && (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
     <div className="flex items-center gap-2.5">
      {icon && (
       <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
        {icon}
       </span>
      )}
      <div>
       {title && (
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
       )}
       {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
       )}
      </div>
     </div>
     <div className="flex items-center gap-2">
      {badge && badge}
      {headerActions && headerActions}
     </div>
    </div>
   )}
   <div className={cn(!noPadding && "p-5")}>{children}</div>
  </div>
 );
}
