import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;

  /** controlled */
  value?: string;

  /** uncontrolled (kept for compatibility) */
  defaultValue?: string;

  disabled?: boolean;
  className?: string;

  /** optional */
  searchable?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  value,
  defaultValue = "",
  disabled = false,
  className,
  searchable = true,
  isLoading = false,
  loadingText = "Loading...",
}) => {
  const isControlled = typeof value === "string";
  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const selectedValue = isControlled ? (value as string) : internalValue;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isControlled) setInternalValue(defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectedOption = useMemo(() => {
    return options.find((o) => o.value === selectedValue) ?? null;
  }, [options, selectedValue]);

  const filtered = useMemo(() => {
    if (!searchable) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const commit = (v: string) => {
    if (!isControlled) setInternalValue(v);
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((s) => !s);
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => listRef.current?.focus());
      return;
    }
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => {
          if (disabled || isLoading) return;
          setOpen((s) => !s);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          // ✅ radius max 4px
          "h-10 w-full rounded-[4px] border bg-white px-3 pr-10 text-sm text-left",
          "transition-colors duration-150",
          // ✅ focus border only (no ring / no shadow)
          "outline-none focus-visible:outline-none",
          "focus-visible:border-brand-500",
          "dark:bg-gray-900",
          disabled || isLoading
            ? "border-gray-200 text-gray-500 opacity-70 cursor-not-allowed dark:border-gray-700 dark:text-gray-400"
            : selectedOption
              ? "border-gray-200 text-gray-900 dark:border-gray-700 dark:text-white/90"
              : "border-gray-200 text-gray-400 dark:border-gray-700 dark:text-gray-400",
        )}
      >
        <span className="block truncate">
          {isLoading ? loadingText : selectedOption ? selectedOption.label : placeholder}
        </span>

        <span
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-150",
            open && "rotate-180",
          )}
        >
          <ChevronDown size={16} />
        </span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-[4px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
          {searchable ? (
            <div className="border-b border-gray-100 p-2 dark:border-gray-800">
              <div className="relative">
                <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={14} />
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className={cn(
                    "h-9 w-full rounded-[4px] border border-gray-200 bg-white pl-8 pr-2 text-sm",
                    "outline-none focus-visible:outline-none focus-visible:border-brand-500",
                    "dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30",
                  )}
                  autoFocus
                />
              </div>
            </div>
          ) : null}

          <div
            ref={listRef}
            tabIndex={-1}
            className="max-h-56 overflow-auto p-1 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setQuery("");
              }
            }}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">No results</div>
            ) : (
              filtered.map((opt) => {
                const active = opt.value === selectedValue;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => commit(opt.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-[4px] px-3 py-2 text-sm text-left",
                      "transition-colors duration-150",
                      active
                        ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                        : "hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/60",
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {active ? (
                      <span className="text-brand-600 dark:text-brand-400">
                        <Check size={16} />
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Select;
