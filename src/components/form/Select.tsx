import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type Option = { value: string; label: string };

type MenuPlacement = "auto" | "top" | "bottom";

type SelectProps = {
  options: Option[];
  placeholder?: string;

  /** controlled */
  value?: string;
  /** uncontrolled */
  defaultValue?: string;

  onChange?: (value: string) => void;

  disabled?: boolean;
  isLoading?: boolean;

  className?: string; // trigger wrapper
  menuClassName?: string; // menu list

  /** ✅ dropdown positioning */
  menuPlacement?: MenuPlacement; // default: "auto"
  menuMaxHeight?: number; // default: 280

  /** render menu in a portal-like fixed layer */
  useFixedLayer?: boolean; // default true
};

type MenuPos = {
  top: number;
  left: number;
  width: number;
  placement: "top" | "bottom";
};

const GAP = 8;
const VIEWPORT_PADDING = 8;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Select({
  options,
  placeholder = "Select",
  value,
  defaultValue,
  onChange,
  disabled,
  isLoading,
  className,
  menuClassName,
  menuPlacement = "auto",
  menuMaxHeight = 280,
  useFixedLayer = true,
}: SelectProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isControlled = typeof value === "string";
  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? "");
  const selectedValue = isControlled ? (value as string) : internalValue;

  const selected = useMemo(
    () => options.find((o) => o.value === selectedValue) ?? null,
    [options, selectedValue],
  );

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);

  const close = () => setOpen(false);

  const commitValue = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    close();
  };

  // close on outside click / esc
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      close();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [open]);

  // compute menu position
  const computePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    const left = clamp(rect.left, VIEWPORT_PADDING, window.innerWidth - VIEWPORT_PADDING);
    const width = clamp(rect.width, 180, window.innerWidth - VIEWPORT_PADDING * 2);

    const availableBottom = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
    const availableTop = rect.top - VIEWPORT_PADDING;

    const menuEl = menuRef.current;
    const menuHeight = menuEl ? menuEl.getBoundingClientRect().height : Math.min(menuMaxHeight, 240);

    let placement: "top" | "bottom" = "bottom";

    if (menuPlacement === "top") placement = "top";
    if (menuPlacement === "bottom") placement = "bottom";

    if (menuPlacement === "auto") {
      // choose top when bottom is tight and top has more room
      const fitsBottom = availableBottom >= Math.min(menuHeight, menuMaxHeight);
      const fitsTop = availableTop >= Math.min(menuHeight, menuMaxHeight);

      if (!fitsBottom && fitsTop) placement = "top";
      else if (!fitsBottom && availableTop > availableBottom) placement = "top";
      else placement = "bottom";
    }

    let top = rect.bottom + GAP;
    if (placement === "top") {
      top = rect.top - GAP - Math.min(menuHeight, menuMaxHeight);
    }

    // clamp vertically inside viewport
    top = clamp(top, VIEWPORT_PADDING, window.innerHeight - VIEWPORT_PADDING - 40);

    setPos({ top, left, width, placement });
  };

  // compute on open and on resize/scroll
  useLayoutEffect(() => {
    if (!open) return;

    // first pass (menu may not be measured yet)
    computePosition();

    // second pass after render for accurate height
    const id = window.requestAnimationFrame(() => computePosition());

    const onScroll = () => computePosition();
    const onResize = () => computePosition();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, options.length, menuMaxHeight, menuPlacement]);

  const triggerText = isLoading ? "Loading..." : selected?.label ?? placeholder;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setOpen((s) => !s)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-[4px] border px-3 text-sm font-medium",
          "border-gray-200 bg-white text-gray-800 shadow-theme-xs hover:bg-gray-50",
          "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/[0.04]",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-brand-500/30",
          (disabled || isLoading) && "cursor-not-allowed opacity-60",
        )}
        aria-expanded={open}
      >
        <span className={cn("truncate", !selected && "text-gray-500 dark:text-gray-400")}>
          {triggerText}
        </span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          className={cn(
            "fixed inset-0",
            // ✅ keep menu above everything (modals/sidebars)
            "z-[9999]",
          )}
          aria-hidden="true"
        >
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              width: pos?.width ?? 0,
            }}
            className={cn(
              "rounded-[6px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900",
              useFixedLayer ? "" : "absolute",
            )}
            role="listbox"
          >
            <div
              className={cn("py-1", menuClassName)}
              style={{
                maxHeight: menuMaxHeight,
                overflowY: "auto",
              }}
            >
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No options
                </div>
              ) : (
                options.map((opt) => {
                  const active = opt.value === selectedValue;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => commitValue(opt.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm",
                        "transition",
                        active
                          ? "bg-brand-500/10 text-gray-900 dark:text-white"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/[0.04]",
                      )}
                      role="option"
                      aria-selected={active}
                    >
                      <span className="truncate">{opt.label}</span>
                      {active ? (
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                          Selected
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
