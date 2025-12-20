import React, { ReactNode } from "react";

export interface ButtonProps {
  children?: ReactNode; // ✅ optional now (supports icon-only buttons)

  size?: "sm" | "md" | "icon";
  variant?: "primary" | "outline" | "ghost" | "danger";

  startIcon?: ReactNode;
  endIcon?: ReactNode;

  onClick?: () => void;
  disabled?: boolean;

  type?: "button" | "submit" | "reset";

  className?: string;

  /**
   * ✅ For icon-only buttons (accessibility)
   * Example: ariaLabel="Search"
   */
  ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  ariaLabel,
}) => {
  const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
    icon: "h-9 w-9 p-0",
  };

  const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/[0.03]",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.06]",
    danger:
      "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  };

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg transition",
        sizeClasses[size],
        variantClasses[variant],
        disabled ? "cursor-not-allowed opacity-50" : "",
        className,
      ].join(" ")}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {/* ✅ children optional */}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
