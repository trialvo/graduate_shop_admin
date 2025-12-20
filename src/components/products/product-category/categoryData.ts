import type { CategoryRow, SubCategoryRow, ChildCategoryRow } from "./types";

export const INITIAL_CATEGORIES: CategoryRow[] = [
  { id: 129, name: "Spices", status: true, featured: false, priority: "Normal" },
  { id: 102, name: "Cooking", status: true, featured: false, priority: "Medium" },
  { id: 101, name: "Household", status: true, featured: false, priority: "Medium" },
  { id: 12, name: "Fresh Produce", status: true, featured: true, priority: "High" },
];

export const INITIAL_SUB_CATEGORIES: SubCategoryRow[] = [
  {
    id: 143,
    name: "Cooking Sauces",
    mainCategoryId: 102,
    status: true,
    featured: false,
    priority: "Normal",
  },
  {
    id: 142,
    name: "Ghee",
    mainCategoryId: 102,
    status: true,
    featured: false,
    priority: "Normal",
  },
  {
    id: 139,
    name: "Paper Product",
    mainCategoryId: 101,
    status: true,
    featured: false,
    priority: "Normal",
  },
];

export const INITIAL_CHILD_CATEGORIES: ChildCategoryRow[] = [
  {
    id: 501,
    name: "Tomato Sauce",
    mainCategoryId: 102,
    subCategoryId: 143,
    status: true,
    featured: false,
    priority: "Normal",
  },
  {
    id: 502,
    name: "Butter Ghee 500g",
    mainCategoryId: 102,
    subCategoryId: 142,
    status: true,
    featured: true,
    priority: "High",
  },
];
