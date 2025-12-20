import { useMemo, useState } from "react";
import { Download, Plus, Search, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import type { AttributeDefinition, AttributeType, Priority, Option } from "../types";

const PRIORITY_OPTIONS: Option[] = [
  { value: "Low", label: "Low" },
  { value: "Normal", label: "Normal" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const TYPE_OPTIONS: Option[] = [
  { value: "size", label: "Size" },
  { value: "material", label: "Material" },
  { value: "text", label: "Text" },
  { value: "custom", label: "Custom" },
];

type Props = {
  attributes: AttributeDefinition[];
  onChange: (next: AttributeDefinition[]) => void;
};

export default function AttributeTab({ attributes, onChange }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AttributeType>("size");
  const [required, setRequired] = useState(true);
  const [priority, setPriority] = useState<Priority>("Normal");
  const [valueInput, setValueInput] = useState("");
  const [search, setSearch] = useState("");

  // per-row "add value" input state
  const [rowValueDraft, setRowValueDraft] = useState<Record<number, string>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return attributes;
    return attributes.filter((a) => a.name.toLowerCase().includes(q));
  }, [attributes, search]);

  const reset = () => {
    setName("");
    setType("size");
    setRequired(true);
    setPriority("Normal");
    setValueInput("");
  };

  const addDefinition = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const values = valueInput
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const nextId = Math.max(0, ...attributes.map((a) => a.id)) + 1;

    onChange([
      {
        id: nextId,
        name: trimmed,
        type,
        required,
        status: true,
        priority,
        values,
      },
      ...attributes,
    ]);

    reset();
  };

  const toggleStatus = (id: number, checked: boolean) => {
    onChange(attributes.map((a) => (a.id === id ? { ...a, status: checked } : a)));
  };

  const toggleRequired = (id: number, checked: boolean) => {
    onChange(attributes.map((a) => (a.id === id ? { ...a, required: checked } : a)));
  };

  const updatePriority = (id: number, p: Priority) => {
    onChange(attributes.map((a) => (a.id === id ? { ...a, priority: p } : a)));
  };

  const addValue = (id: number, v: string) => {
    const val = v.trim();
    if (!val) return;

    onChange(
      attributes.map((a) =>
        a.id === id ? { ...a, values: Array.from(new Set([...a.values, val])) } : a
      )
    );

    setRowValueDraft((prev) => ({ ...prev, [id]: "" }));
  };

  const removeValue = (id: number, v: string) => {
    onChange(
      attributes.map((a) =>
        a.id === id ? { ...a, values: a.values.filter((x) => x !== v) } : a
      )
    );
  };

  const removeDefinition = (id: number) => {
    onChange(attributes.filter((a) => a.id !== id));
    setRowValueDraft((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      {/* Create */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Create Attribute (Dynamic)
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Attribute Name <span className="text-error-500">*</span>
            </p>
            <Input
              placeholder="Size / Material / Weight"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
            </p>
            <Select
              options={TYPE_OPTIONS}
              placeholder="Select type"
              defaultValue={type}
              onChange={(v) => setType(v as AttributeType)}
            />
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

          <div className="space-y-2 lg:col-span-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Values (comma separated)
            </p>
            <Input
              placeholder="S, M, L, XL"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tip: values না দিলেও attribute create হবে (later values add করতে পারবে)।
            </p>
          </div>

          <div className="space-y-2 lg:col-span-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Required
            </p>
            <div className="h-11 flex items-center">
              <Switch
                label=""
                defaultChecked={required}
                onChange={(checked) => setRequired(checked)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
          <Button onClick={addDefinition} disabled={!name.trim()}>
            Add Attribute
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Attribute List
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
                placeholder="Search attribute"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              startIcon={<Download size={16} />}
              onClick={() => console.log("Export attributes")}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {[
                  "SL",
                  "Id",
                  "Name",
                  "Type",
                  "Required",
                  "Status",
                  "Values",
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
              {filtered.map((row, idx) => {
                const draft = rowValueDraft[row.id] ?? "";
                return (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 dark:border-gray-800 align-top"
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
                      {row.type}
                    </td>
                    <td className="px-4 py-4">
                      <Switch
                        label=""
                        defaultChecked={row.required}
                        onChange={(checked) => toggleRequired(row.id, checked)}
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
                      <div className="flex flex-wrap items-center gap-2">
                        {row.values.map((v) => (
                          <span
                            key={v}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          >
                            {v}
                            <button
                              type="button"
                              className="text-error-500 hover:text-error-600"
                              onClick={() => removeValue(row.id, v)}
                              aria-label="Remove value"
                            >
                              ×
                            </button>
                          </span>
                        ))}

                        <div className="flex items-center gap-2">
                          <div className="w-[160px]">
                            <Input
                              placeholder="Add value"
                              value={draft}
                              onChange={(e) =>
                                setRowValueDraft((prev) => ({
                                  ...prev,
                                  [row.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") addValue(row.id, draft);
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                            onClick={() => addValue(row.id, draft)}
                            aria-label="Add value"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
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
                      <button
                        type="button"
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-error-200 bg-white px-3 text-sm font-semibold text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                        onClick={() => removeDefinition(row.id)}
                      >
                        <Trash2 size={16} className="mr-2" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No attributes found.
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
