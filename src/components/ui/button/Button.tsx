import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps {
  children?: ReactNode;

  /** Heights are capped at 40px (h-10) */
  size?: "sm" | "md" | "icon";

  variant?: "primary" | "outline" | "ghost" | "danger";

  startIcon?: ReactNode;
  endIcon?: ReactNode;

  onClick?: () => void;
  disabled?: boolean;

  type?: "button" | "submit" | "reset";

  className?: string;

  /** For icon-only buttons (a11y) */
  ariaLabel?: string;

  /** Optional native tooltip */
  title?: string;

  /** ✅ optional loading */
  isLoading?: boolean;
  loadingText?: string;
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className,
  disabled = false,
  type = "button",
  ariaLabel,
  title,
  isLoading = false,
  loadingText,
}) => {
  const isIconOnly = !children && (size === "icon" || (!!(startIcon || endIcon) && !loadingText));

  const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-9 px-3 text-sm", // <= 36px
    md: "h-10 px-4 text-sm", // <= 40px
    icon: "h-10 w-10 p-0", // <= 40px
  };

  const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300 dark:disabled:bg-brand-400/40",
    outline:
      "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-white/[0.03]",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/[0.06]",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-400/40",
  };

  const computedDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[4px] transition-colors duration-150",
        "whitespace-nowrap select-none",
        "outline-none focus-visible:outline-none",
        computedDisabled && "cursor-not-allowed opacity-60",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      onClick={computedDisabled ? undefined : onClick}
      disabled={computedDisabled}
    >
      {/* Loading */}
      {isLoading ? (
        <>
          <Spinner />
          {loadingText ? <span className="truncate">{loadingText}</span> : null}
        </>
      ) : (
        <>
          {startIcon ? <span className="inline-flex items-center">{startIcon}</span> : null}
          {/* children optional */}
          {children}
          {endIcon ? <span className="inline-flex items-center">{endIcon}</span> : null}
        </>
      )}

      {/* a11y hint: if icon-only and no ariaLabel, still render (but please pass ariaLabel) */}
      {isIconOnly && !ariaLabel ? (
        <span className="sr-only">Button</span>
      ) : null}
    </button>
  );
};

export default Button;
