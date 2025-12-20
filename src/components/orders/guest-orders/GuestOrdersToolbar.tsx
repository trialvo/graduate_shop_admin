"use client";

import React from "react";
import { Search } from "lucide-react";
import type { SortBy } from "./types";

import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

type Props = {
  sortOptions: Array<{ label: string; value: SortBy }>;
  sortBy: SortBy;
  onSortChange: (v: SortBy) => void;

  search: string;
  onSearchChange: (v: string) => void;

  onClear: () => void;
};

const GuestOrdersToolbar: React.FC<Props> = ({
  sortOptions,
  sortBy,
  onSortChange,
  search,
  onSearchChange,
  onClear,
}) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Sort */}
      <div className="w-full md:w-[220px]">
        <select
          value={sortBy}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onSortChange(e.target.value as SortBy)
          }
          className="h-11 w-full rounded-xl border border-border bg-background/30 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search + Clear */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative w-full sm:w-[280px]">
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="h-11 rounded-xl border border-border bg-background/30 pr-10"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          className="h-11 rounded-xl border-brand-500/40 text-brand-500 hover:text-brand-500 dark:bg-transparent"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default GuestOrdersToolbar;
export { GuestOrdersToolbar };
