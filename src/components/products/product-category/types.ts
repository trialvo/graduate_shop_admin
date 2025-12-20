export type Priority = "Low" | "Normal" | "Medium" | "High";

export interface CategoryRow {
  id: number;
  name: string;
  status: boolean;
  featured: boolean;
  priority: Priority;
  imageUrl?: string;
}

export interface SubCategoryRow {
  id: number;
  name: string;
  mainCategoryId: number;
  status: boolean;
  featured: boolean;
  priority: Priority;
  imageUrl?: string;
}

export interface ChildCategoryRow {
  id: number;
  name: string;
  mainCategoryId: number;
  subCategoryId: number;
  status: boolean;
  featured: boolean;
  priority: Priority;
  imageUrl?: string;
}

export type Option = { value: string; label: string };
