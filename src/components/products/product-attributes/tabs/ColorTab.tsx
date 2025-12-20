import { useMemo, useState } from "react";
import { Download, Pencil, Search, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import type { ColorRow, Priority, Option } from "../types";

const PRIORITY_OPTIONS: Option[] = [
  { value: "Low", label: "Low" },
  { value: "Normal", label: "Normal" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

type Props = {
  colors: ColorRow[];
  onChange: (next: ColorRow[]) => void;
};

function isHexColor(v: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(v.trim());
}

export default function ColorTab({ colors, onChange }: Props) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#111827");
  const [priority, setPriority] = useState<Priority>("Normal");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return colors;
    return colors.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
    );
  }, [colors, search]);

  const reset = () => {
    setName("");
    setHex("#111827");
    setPriority("Normal");
  };

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed || !isHexColor(hex)) return;
    const nextId = Math.max(0, ...colors.map((c) => c.id)) + 1;
    onChange([
      { id: nextId, name: trimmed, hex: hex.trim(), status: true, priority },
      ...colors,
    ]);
    reset();
  };

  const toggleStatus = (id: number, checked: boolean) => {
    onChange(colors.map((c) => (c.id === id ? { ...c, status: checked } : c)));
  };

  const updatePriority = (id: number, p: Priority) => {
    onChange(colors.map((c) => (c.id === id ? { ...c, priority: p } : c)));
  };

  const remove = (id: number) => {
    onChange(colors.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Create */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Add New Color
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Color Name <span className="text-error-500">*</span>
            </p>
            <Input
              placeholder="Red"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              HEX <span className="text-error-500">*</span>
            </p>
            <div className="flex gap-3">
              <div
                className="h-11 w-11 rounded-lg border border-gray-200 dark:border-gray-800"
                style={{ backgroundColor: isHexColor(hex) ? hex : "#000000" }}
                aria-hidden
              />
              <Input
                placeholder="#EF4444"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
              />
            </div>
            {!isHexColor(hex) ? (
              <p className="text-xs text-error-500">
                Invalid hex. Example: #EF4444
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </p>
            <Select
              options={PRIORITY_OPTIONS}
              placeholder="Select priority"
              defaultValue={priority}
              onChange={(v) => setPriority(v as Priority)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
          <Button onClick={add} disabled={!name.trim() || !isHexColor(hex)}>
            Add
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Color List
            </h3>
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {filtered.length}
            </span>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
            <div className="relative w-full sm:w-[260px]">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Search size={16} className="text-gray-400" />
              </div>
              <Input
                className="pl-9"
                placeholder="Search color"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              startIcon={<Download size={16} />}
              onClick={() => console.log("Export colors")}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {[
                  "SL",
                  "Id",
                  "Color",
                  "HEX",
                  "Preview",
                  "Status",
                  "Priority",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-4 text-left text-xs font-semibold text-brand-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.id}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {row.hex}
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className="h-6 w-10 rounded-md border border-gray-200 dark:border-gray-800"
                      style={{ backgroundColor: row.hex }}
                      aria-hidden
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Switch
                      label=""
                      defaultChecked={row.status}
                      onChange={(checked) => toggleStatus(row.id, checked)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="max-w-[160px]">
                      <Select
                        options={PRIORITY_OPTIONS}
                        placeholder="Priority"
                        defaultValue={row.priority}
                        onChange={(v) => updatePriority(row.id, v as Priority)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                        onClick={() => console.log("Edit color", row.id)}
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                        onClick={() => remove(row.id)}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No colors found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
