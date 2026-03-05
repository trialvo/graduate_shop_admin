import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Trash2 } from "lucide-react";
import Button from "@/components/ui/button/Button";

type Props = {
 open: boolean;
 onClose: () => void;
 onConfirm: () => void;
 loading?: boolean;

 title?: string;
 message?: React.ReactNode;
 confirmLabel?: string;
 cancelLabel?: string;
 variant?: "danger" | "warning";
};

/**
 * Generic confirm/delete modal.
 *
 * ```tsx
 * <ConfirmModal
 *   open={open}
 *   onClose={onClose}
 *   onConfirm={handleDelete}
 *   loading={isPending}
 *   title="Delete Category"
 *   message="This action cannot be undone."
 * />
 * ```
 */
export default function ConfirmModal({
 open,
 onClose,
 onConfirm,
 loading,
 title = "Are you sure?",
 message,
 confirmLabel = "Delete",
 cancelLabel = "Cancel",
 variant = "danger",
}: Props) {
 if (!open) return null;

 return (
  <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
   {/* Backdrop */}
   <div
    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
    onClick={onClose}
    aria-hidden
   />

   {/* Dialog */}
   <div
    className={cn(
     "relative w-full max-w-md rounded-2xl border bg-white p-6 shadow-xl dark:bg-gray-900",
     variant === "danger"
      ? "border-red-100 dark:border-red-900/30"
      : "border-amber-100 dark:border-amber-900/30",
    )}
    role="dialog"
    aria-modal="true"
   >
    <div className="flex flex-col items-center gap-4 text-center">
     <span
      className={cn(
       "flex h-14 w-14 items-center justify-center rounded-2xl",
       variant === "danger"
        ? "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
        : "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400",
      )}
     >
      {variant === "danger" ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
     </span>

     <div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
      {message && (
       <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
     </div>

     <div className="flex w-full gap-3">
      <Button
       variant="outline"
       className="flex-1"
       onClick={onClose}
       disabled={loading}
      >
       {cancelLabel}
      </Button>
      <Button
       className={cn(
        "flex-1",
        variant === "danger"
         ? "bg-red-500 text-white hover:bg-red-600"
         : "bg-amber-500 text-white hover:bg-amber-600",
       )}
       onClick={onConfirm}
       disabled={loading}
      >
       {loading ? (
        <span className="flex items-center gap-2">
         <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
         {confirmLabel}
        </span>
       ) : (
        confirmLabel
       )}
      </Button>
     </div>
    </div>
   </div>
  </div>
 );
}
