import { useMemo, useState } from "react";
import { Download, Pencil, Search, Trash2 } from "lucide-react";

import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";

import ImagePickerSquare from "./ImagePickerSquare";
import type { CategoryRow, SubCategoryRow, Priority, Option } from "./types";
import { INITIAL_CATEGORIES, INITIAL_SUB_CATEGORIES } from "./categoryData";

const PRIORITY_OPTIONS: Option[] = [
  { value: "Low", label: "Low" },
  { value: "Normal", label: "Normal" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

export default function SubCategoryTab() {
  const [mainCategories] = useState<CategoryRow[]>(INITIAL_CATEGORIES);
  const [rows, setRows] = useState<SubCategoryRow[]>(INITIAL_SUB_CATEGORIES);

  const [name, setName] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState<number | null>(null);
  const [priority, setPriority] = useState<Priority>("Normal");
  const [image, setImage] = useState<File | null>(null);

  const [search, setSearch] = useState("");

  const mainCategoryOptions: Option[] = useMemo(() => {
    return mainCategories.map((c) => ({ value: String(c.id), label: c.name }));
  }, [mainCategories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const mc = mainCategories.find((c) => c.id === r.mainCategoryId)?.name ?? "";
      return (
        r.name.toLowerCase().includes(q) || mc.toLowerCase().includes(q)
      );
    });
  }, [rows, search, mainCategories]);

  const resetForm = () => {
    setName("");
    setMainCategoryId(null);
    setPriority("Normal");
    setImage(null);
  };

  const addRow = () => {
    const trimmed = name.trim();
    if (!trimmed || mainCategoryId === null) return;

    const nextId = Math.max(0, ...rows.map((r) => r.id)) + 1;

    setRows((prev) => [
      {
        id: nextId,
        name: trimmed,
        mainCategoryId,
        status: true,
        featured: false,
        priority,
      },
      ...prev,
    ]);

    resetForm();
  };

  const toggleStatus = (id: number, checked: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: checked } : r)));
  };

  const toggleFeatured = (id: number, checked: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, featured: checked } : r)));
  };

  const updatePriority = (id: number, p: Priority) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, priority: p } : r)));
  };

  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Create */}
      <div className="rounded-[4px] border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Add New Sub Category
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name (Default) <span className="text-error-500">*</span>
            </p>
            <Input
              placeholder="New sub category"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Main category <span className="text-error-500">*</span>
            </p>
            <Select
              options={mainCategoryOptions}
              placeholder="Select Main Category"
              onChange={(v) => setMainCategoryId(Number(v))}
              defaultValue={mainCategoryId !== null ? String(mainCategoryId) : ""}
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

          <div className="lg:col-span-3">
            <ImagePickerSquare
              label="Image"
              hint="(Ratio 1:1)"
              value={image}
              onChange={setImage}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={resetForm}>
            Reset
          </Button>
          <Button onClick={addRow} disabled={!name.trim() || mainCategoryId === null}>
            Add
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-[4px] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Sub Category List
            </h3>
            <span className="inline-flex h-6 items-center rounded-md bg-gray-100 px-2 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {filtered.length}
            </span>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
            <div className="relative w-full sm:w-[280px]">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Search size={16} className="text-gray-400" />
              </div>
              <Input
                className="pl-9"
                placeholder="Ex : search sub categories"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              startIcon={<Download size={16} />}
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log("Export sub categories");
              }}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {[
                  "SL",
                  "Id",
                  "Main Category",
                  "Sub Category",
                  "Status",
                  "Featured",
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
                const mainName =
                  mainCategories.find((c) => c.id === row.mainCategoryId)?.name ??
                  "—";

                return (
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
                      {mainName}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {row.name}
                    </td>

                    <td className="px-4 py-4">
                      <Switch
                        label=""
                        defaultChecked={row.status}
                        onChange={(checked) => toggleStatus(row.id, checked)}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <Switch
                        label=""
                        defaultChecked={row.featured}
                        onChange={(checked) => toggleFeatured(row.id, checked)}
                        color="gray"
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
                          onClick={() => {
                            // eslint-disable-next-line no-console
                            console.log("Edit sub category", row.id);
                          }}
                          aria-label="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-error-200 bg-white text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-900/40 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
                          onClick={() => removeRow(row.id)}
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No sub categories found.
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
