import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value?: string; // ISO: YYYY-MM-DD
  onChange: (value: string) => void;

  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
  className?: string;

  min?: string; // ISO
  max?: string; // ISO
  showClear?: boolean;
  showToday?: boolean;

  /** Year range for quick selection */
  yearRange?: { from: number; to: number };
};

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function toISO(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function fromISO(v?: string): Date | null {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const da = Number(m[3]);
  const dt = new Date(y, mo, da);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== da) return null;
  return dt;
}
function formatDisplay(v?: string) {
  const d = fromISO(v);
  if (!d) return "";
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBeforeISO(aISO: string, bISO: string) {
  return aISO < bISO;
}
function isAfterISO(aISO: string, bISO: string) {
  return aISO > bISO;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  error = false,
  hint,
  className,
  min,
  max,
  showClear = true,
  showToday = true,
  yearRange,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => fromISO(value), [value]);

  const [view, setView] = useState<Date>(() => {
    const base = selectedDate ?? new Date();
    return startOfMonth(base);
  });

  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    setView(startOfMonth(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMonthOpen(false);
        setYearOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMonthOpen(false);
        setYearOpen(false);
      }
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const withinRange = (iso: string) => {
    if (min && isBeforeISO(iso, min)) return false;
    if (max && isAfterISO(iso, max)) return false;
    return true;
  };

  const selectISO = (iso: string) => {
    if (!withinRange(iso)) return;
    onChange(iso);
    setOpen(false);
    setMonthOpen(false);
    setYearOpen(false);
  };

  const grid = useMemo(() => {
    const first = startOfMonth(view);
    const startWeekday = first.getDay();
    const totalDays = daysInMonth(view);

    const cells: Array<{ date: Date | null; iso?: string }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: null });

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(view.getFullYear(), view.getMonth(), day);
      cells.push({ date: d, iso: toISO(d) });
    }

    while (cells.length % 7 !== 0) cells.push({ date: null });
    return cells;
  }, [view]);

  // year list
  const years = useMemo(() => {
    const nowY = new Date().getFullYear();
    const from = yearRange?.from ?? nowY - 50;
    const to = yearRange?.to ?? nowY + 10;
    const list: number[] = [];
    for (let y = to; y >= from; y--) list.push(y); // recent first
    return list;
  }, [yearRange]);

  // scroll to current year when opening year picker
  const yearListRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!yearOpen) return;
    const y = view.getFullYear();
    const idx = years.indexOf(y);
    if (idx < 0) return;
    const el = yearListRef.current;
    if (!el) return;
    // each item ~36px, put selection in view
    el.scrollTop = Math.max(0, idx * 36 - 72);
  }, [yearOpen, years, view]);

  const display = value ? formatDisplay(value) : "";
  const viewMonth = view.getMonth();
  const viewYear = view.getFullYear();

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((s) => !s)}
        className={cn(
          "relative h-10 w-full rounded-[4px] border bg-white px-3 pl-9 pr-9 text-left text-sm",
          "transition-colors duration-150",
          "outline-none focus-visible:outline-none focus-visible:border-brand-500",
          "dark:bg-gray-900",
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500 opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            : error
              ? "border-error-500 text-gray-900 dark:text-white/90"
              : "border-gray-200 text-gray-900 dark:border-gray-700 dark:text-white/90",
        )}
        aria-label={placeholder}
      >
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Calendar size={16} />
        </span>

        {display ? (
          <span className="block truncate">{display}</span>
        ) : (
          <span className="block truncate text-gray-400">{placeholder}</span>
        )}

        {showClear && value && !disabled ? (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-500",
                "hover:bg-gray-50",
                "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800/40",
              )}
              aria-label="Clear date"
            >
              <X size={14} />
            </button>
          </span>
        ) : null}
      </button>

      {hint ? (
        <p className={cn("mt-1.5 text-xs", error ? "text-error-500" : "text-gray-500 dark:text-gray-400")}>
          {hint}
        </p>
      ) : null}

      {/* Popup */}
      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Header with Month + Year selectors */}
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setView((v) => addMonths(v, -1))}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700",
                "hover:bg-gray-50",
                "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/40",
              )}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="relative flex-1">
              <div className="flex items-center justify-center gap-2">
                {/* Month button */}
                <button
                  type="button"
                  onClick={() => {
                    setMonthOpen((s) => !s);
                    setYearOpen(false);
                  }}
                  className={cn(
                    "inline-flex h-8 items-center gap-2 rounded-[4px] border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800",
                    "hover:bg-gray-50",
                    "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/40",
                  )}
                >
                  <span className="truncate">{MONTHS[viewMonth]}</span>
                  <ChevronDown size={14} className={cn("transition-transform", monthOpen && "rotate-180")} />
                </button>

                {/* Year button */}
                <button
                  type="button"
                  onClick={() => {
                    setYearOpen((s) => !s);
                    setMonthOpen(false);
                  }}
                  className={cn(
                    "inline-flex h-8 items-center gap-2 rounded-[4px] border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-800",
                    "hover:bg-gray-50",
                    "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/40",
                  )}
                >
                  <span className="truncate">{viewYear}</span>
                  <ChevronDown size={14} className={cn("transition-transform", yearOpen && "rotate-180")} />
                </button>
              </div>

              {/* Month dropdown (responsive grid) */}
              {monthOpen ? (
                <div className="absolute left-1/2 top-10 z-50 w-[min(360px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-[4px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="grid grid-cols-3 gap-1 p-2 sm:grid-cols-4">
                    {MONTHS.map((m, idx) => {
                      const active = idx === viewMonth;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setView(new Date(viewYear, idx, 1));
                            setMonthOpen(false);
                          }}
                          className={cn(
                            "h-9 rounded-[4px] px-2 text-xs font-semibold transition-colors",
                            active
                              ? "bg-brand-500 text-white"
                              : "bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/40",
                          )}
                        >
                          {m.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Year dropdown (scroll list) */}
              {yearOpen ? (
                <div className="absolute left-1/2 top-10 z-50 w-[min(280px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-[4px] border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
                  <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-300">
                    Select Year
                  </div>

                  <div ref={yearListRef} className="max-h-56 overflow-auto p-2">
                    <div className="grid grid-cols-3 gap-1 sm:grid-cols-4">
                      {years.map((y) => {
                        const active = y === viewYear;
                        return (
                          <button
                            key={y}
                            type="button"
                            onClick={() => {
                              setView(new Date(y, viewMonth, 1));
                              setYearOpen(false);
                            }}
                            className={cn(
                              "h-9 rounded-[4px] text-xs font-semibold transition-colors",
                              active
                                ? "bg-brand-500 text-white"
                                : "bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/40",
                            )}
                          >
                            {y}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setView((v) => addMonths(v, 1))}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-gray-200 bg-white text-gray-700",
                "hover:bg-gray-50",
                "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/40",
              )}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick actions */}
          {(showToday || showClear) ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-800">
              {showToday ? (
                <button
                  type="button"
                  onClick={() => selectISO(toISO(new Date()))}
                  className={cn(
                    "h-8 rounded-[4px] border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700",
                    "hover:bg-gray-50",
                    "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/40",
                  )}
                >
                  Today
                </button>
              ) : null}

              {showClear && value ? (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                    setMonthOpen(false);
                    setYearOpen(false);
                  }}
                  className={cn(
                    "h-8 rounded-[4px] border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700",
                    "hover:bg-gray-50",
                    "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/40",
                  )}
                >
                  Clear
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 px-3 pt-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-1 text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 px-3 pb-3">
            {grid.map((cell, idx) => {
              if (!cell.date || !cell.iso) return <div key={idx} className="h-9" />;

              const iso = cell.iso;
              const disabledDay = !withinRange(iso);

              const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
              const isToday = isSameDay(cell.date, new Date());

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => selectISO(iso)}
                  className={cn(
                    "h-9 rounded-[4px] text-sm transition-colors",
                    "outline-none focus-visible:outline-none",
                    disabledDay && "cursor-not-allowed opacity-40",
                    isSelected
                      ? "bg-brand-500 text-white"
                      : "bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800/40",
                    !isSelected && isToday && "border border-brand-500",
                  )}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
