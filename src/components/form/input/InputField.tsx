import type React from "react";
import type { FC } from "react";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;

  // ✅ allow both number & string (fixes TS error)
  min?: string | number;
  max?: string | number;

  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  onKeyDown,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
}) => {
  let inputClasses =
    `h-11 w-full rounded-xl border px-4 py-2.5 text-sm ` +
    `shadow-theme-xs placeholder:text-gray-400 ` +
    `transition-colors duration-200 ` +
    `focus:outline-none focus:ring-4 ` +
    `dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ` +
    `${className}`;

  if (disabled) {
    inputClasses +=
      ` bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed opacity-60 ` +
      `dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses +=
      ` bg-white border-error-500 focus:border-error-300 focus:ring-error-500/20 ` +
      `dark:bg-gray-900 dark:text-error-200 dark:border-error-500 dark:focus:border-error-800`;
  } else if (success) {
    inputClasses +=
      ` bg-white border-success-500 focus:border-success-300 focus:ring-success-500/20 ` +
      `dark:bg-gray-900 dark:text-success-200 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses +=
      ` bg-white border-gray-200 text-gray-900 focus:border-brand-300 focus:ring-brand-500/20 ` +
      `dark:bg-gray-900 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
                ? "text-success-500"
                : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
