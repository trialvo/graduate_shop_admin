import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { DropdownItem } from "./DropdownItem";

export type ImageSelectOption = {
  id: string;
  label: string;
  image?: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: ImageSelectOption[];
  placeholder: string;
  className?: string;
  disabled?: boolean;
};

/**
 * A reusable dropdown/select component that supports option images.
 * - Uses the project's existing Dropdown/DropdownItem utilities.
 * - Styled to match existing inputs.
 */
export default function ImageSelectDropdown({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value]
  );

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const buttonLabel = selected?.label ?? placeholder;

  return (
    <div
      className={`relative ${className}`}
      aria-disabled={disabled ? true : undefined}
    >
      <button
        type="button"
        disabled={disabled}
        className={`dropdown-toggle flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        }`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="flex min-w-0 items-center gap-3">
          {selected?.image ? (
            <img
              src={selected.image}
              alt=""
              className="h-6 w-6 rounded-md object-cover"
            />
          ) : null}
          <span
            className={`truncate ${
              selected ? "text-gray-700 dark:text-gray-200" : "text-gray-400"
            }`}
          >
            {buttonLabel}
          </span>
        </span>

        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="w-full p-2"
      >
        <div className="max-h-64 overflow-auto custom-scrollbar">
          {options.map((o) => {
            const active = o.id === value;
            return (
              <DropdownItem
                key={o.id}
                onItemClick={() => {
                  onChange(o.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                  active
                    ? "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
                baseClassName=""
              >
                {o.image ? (
                  <img
                    src={o.image}
                    alt=""
                    className="h-7 w-7 rounded-md object-cover"
                  />
                ) : (
                  <span className="h-7 w-7 rounded-md bg-gray-100 dark:bg-white/5" />
                )}
                <span className="min-w-0 truncate">{o.label}</span>
              </DropdownItem>
            );
          })}
        </div>
      </Dropdown>
    </div>
  );
}
