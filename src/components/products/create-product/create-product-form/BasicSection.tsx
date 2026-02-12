import Input from "@/components/form/input/InputField";
import Section from "./Section";
import Select from "@/components/form/Select";
import { Package } from "lucide-react";

type Option = { value: string; label: string; status?: boolean };

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {children}
    </p>
  );
}

function BasicSection({
  productName,
  setProductName,
  productSlug,
  mainCategoryId,
  setMainCategoryId,
  subCategoryId,
  setSubCategoryId,
  childCategoryId,
  setChildCategoryId,
  brandId,
  setBrandId,

  mainOptions,
  subOptions,
  childOptions,
  brandOptions,

  subLoading,
  childLoading,
}: {
  productName: string;
  setProductName: (v: string) => void;
  productSlug: string;

  mainCategoryId: number;
  setMainCategoryId: (n: number) => void;
  subCategoryId: number;
  setSubCategoryId: (n: number) => void;
  childCategoryId: number;
  setChildCategoryId: (n: number) => void;
  brandId: number;
  setBrandId: (n: number) => void;

  mainOptions: Option[];
  subOptions: Option[];
  childOptions: Option[];
  brandOptions: Option[];

  subLoading: boolean;
  childLoading: boolean;
}) {
  return (
    <Section
      title="Basic Information"
      description="Product name, slug, categories and brand."
      icon={<Package className="h-5 w-5" />}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <FieldLabel>PRODUCT NAME *</FieldLabel>
          <Input
            value={productName}
            onChange={(e) => setProductName(String(e.target.value))}
            placeholder="Enter product name"
          />
        </div>

        <div>
          <FieldLabel>SLUG</FieldLabel>
          <Input value={productSlug} disabled placeholder="auto-generated-slug" />
        </div>

        <div>
          <FieldLabel>MAIN CATEGORY *</FieldLabel>
          <Select
            options={mainOptions}
            placeholder="Select main category"
            value={String(mainCategoryId)}
            onChange={(v) => setMainCategoryId(Number(v))}
          />
        </div>

        <div>
          <FieldLabel>SUB CATEGORY *</FieldLabel>
          <Select
            key={`sub-${mainCategoryId}-${subCategoryId}`}
            options={subOptions}
            placeholder={
              subLoading
                ? "Loading sub categories..."
                : "Select sub category"
            }
            value={String(subCategoryId)}
            onChange={(v) => setSubCategoryId(Number(v))}
          />
        </div>

        <div>
          <FieldLabel>CHILD CATEGORY</FieldLabel>
          <Select
            key={`child-${subCategoryId}-${childCategoryId}`}
            options={childOptions}
            placeholder={
              !subCategoryId
                ? "Select sub category first"
                : childLoading
                  ? "Loading child categories..."
                  : "Select child category (optional)"
            }
            value={String(childCategoryId)}
            onChange={(v) => setChildCategoryId(Number(v))}
          />
        </div>

        <div>
          <FieldLabel>BRAND *</FieldLabel>
          <Select
            options={brandOptions}
            placeholder="Select brand"
            value={String(brandId)}
            onChange={(v) => setBrandId(Number(v))}
          />
        </div>
      </div>
    </Section>
  );
}

export default BasicSection;
