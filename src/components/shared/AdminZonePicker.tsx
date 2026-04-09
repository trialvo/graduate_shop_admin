// src/components/shared/AdminZonePicker.tsx
// Nested City → Area dropdown for admin forms (New Sale, Order Editor)
// Mirrors the shop panel's DeliveryAreaSelector UX.

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight, MapPin, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDeliveryAreas } from "@/api/delivery-areas.api";

export type ZoneSelection = {
  location_mapping_id: number;
  city_name: string;
  area_name: string;
};

type Props = {
  value: ZoneSelection | null;
  onChange: (sel: ZoneSelection | null) => void;
  placeholder?: string;
  disabled?: boolean;
};

type CityGroup = {
  city_name: string;
  areas: { id: number; area_name: string }[];
};

export default function AdminZonePicker({ value, onChange, placeholder = "Select delivery zone…", disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCity, setActiveCity] = useState<string | null>(value?.city_name ?? null);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch delivery areas
  const { data, isLoading } = useQuery({
    queryKey: ["admin-delivery-areas"],
    queryFn: getDeliveryAreas,
    staleTime: 10 * 60 * 1000,
  });

  // Group by city — backend returns nested [{city_name, areas:[{id,area_name}]}]
  const groups = useMemo<CityGroup[]>(() => {
    const raw = (data?.data ?? []) as Array<{
      city_name: string;
      areas: { id: number; area_name: string }[];
    }>;
    return raw.map((city) => ({
      city_name: city.city_name,
      areas: city.areas ?? [],
    }));
  }, [data]);

  // Filter by search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        areas: g.areas.filter((a) => a.area_name.toLowerCase().includes(q)),
      }))
      .filter((g) => g.city_name.toLowerCase().includes(q) || g.areas.length > 0);
  }, [groups, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync active city when value changes externally
  useEffect(() => {
    if (value?.city_name) setActiveCity(value.city_name);
  }, [value?.city_name]);

  // Flip dropdown upward if there is not enough viewport space below.
  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const estimatedDropdownHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setOpenUpward(spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow);
  }, [open, search]);

  const displayLabel = value
    ? `${value.city_name} — ${value.area_name}`
    : null;

  const handleSelect = (city_name: string, area: { id: number; area_name: string }) => {
    onChange({ location_mapping_id: area.id, city_name, area_name: area.area_name });
    setSearch("");
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setActiveCity(null);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen((p) => !p); }}
        className="flex h-11 w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm transition hover:border-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/60 dark:text-white dark:hover:border-gray-600 dark:focus:border-brand-500 dark:focus:ring-brand-500/10"
      >
        <MapPin size={13} className="shrink-0 text-gray-400" />
        <span className={`flex-1 truncate text-left ${displayLabel ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
          {isLoading ? "Loading zones…" : (displayLabel ?? placeholder)}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {value && (
            <span onClick={handleClear} className="flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700">
              <X size={11} />
            </span>
          )}
          <ChevronDown size={13} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={[
            "absolute left-0 z-50 w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950",
            openUpward ? "bottom-full mb-1" : "top-full mt-1",
          ].join(" ")}
        >
          {/* Search */}
          <div className="border-b border-gray-100 p-2 dark:border-gray-800">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 dark:bg-gray-900">
              <Search size={12} className="shrink-0 text-gray-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search city or area…"
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Area list */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <p className="py-6 text-center text-xs text-gray-400">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="py-6 text-center text-xs text-gray-400">No zones found</p>
            ) : (
              filtered.map((city) => {
                const isExpanded = search ? true : activeCity === city.city_name;
                return (
                  <div key={city.city_name}>
                    {/* City header */}
                    <button
                      type="button"
                      onClick={() => setActiveCity((p) => (p === city.city_name ? null : city.city_name))}
                      className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
                    >
                      {city.city_name}
                      <ChevronRight
                        size={12}
                        className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>

                    {/* Areas */}
                    {isExpanded &&
                      city.areas.map((area) => {
                        const isSelected = value?.location_mapping_id === area.id;
                        return (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => handleSelect(city.city_name, area)}
                            className={[
                              "flex w-full items-center gap-2 px-5 py-2 text-sm transition-colors hover:bg-brand-50 dark:hover:bg-brand-500/10",
                              isSelected
                                ? "bg-brand-50 font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                                : "text-gray-700 dark:text-gray-300",
                            ].join(" ")}
                          >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                            {area.area_name}
                          </button>
                        );
                      })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}


