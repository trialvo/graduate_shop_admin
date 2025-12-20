import { useState } from "react";
import CategoryTab from "./CategoryTab";
import SubCategoryTab from "./SubCategoryTab";
import ChildCategoryTab from "./ChildCategoryTab";

const TABS = ["category", "sub", "child"] as const;
type TabType = (typeof TABS)[number];

export default function ProductCategoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("category");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Categories & Brands
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage and organize your product categories
        </p>
      </div>

      <div className="inline-flex w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {TABS.map((tab) => {
          const label =
            tab === "category"
              ? "Categories"
              : tab === "sub"
              ? "Sub Categories"
              : "Child Categories";

          const active = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "flex-1 px-5 py-3 text-sm font-semibold transition",
                active
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.03]",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "category" && <CategoryTab />}
      {activeTab === "sub" && <SubCategoryTab />}
      {activeTab === "child" && <ChildCategoryTab />}
    </div>
  );
}
