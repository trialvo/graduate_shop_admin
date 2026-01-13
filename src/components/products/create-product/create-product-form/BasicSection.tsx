import Input from "@/components/form/input/InputField";
import Section from "./Section";
import Select from "@/components/form/Select";

type Option = { value: string; label: string };
type SkuMode = "auto" | "manual";

type VariantRow = {
  key: string; // `${colorId}__${variantId}`
  colorId: number;
  variantId: number;

  buyingPrice: number;
  sellingPrice: number;
  discount: number;
  stock: number;
  sku: string;

  active: boolean;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{children}</p>;
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
    <Section title="Basic" description="Name, slug, categories and brand.">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Name *</FieldLabel>
          <Input value={productName} onChange={(e) => setProductName(String(e.target.value))} placeholder="Product name" />
        </div>

        <div className="space-y-2">
          <FieldLabel>Slug *</FieldLabel>
          <Input value={productSlug} disabled placeholder="product-slug" />
        </div>

        <div className="space-y-2">
          <FieldLabel>Category *</FieldLabel>
          <Select options={mainOptions} placeholder="Select category" value={String(mainCategoryId)} onChange={(v) => setMainCategoryId(Number(v))} />
        </div>

        <div className="space-y-2">
          <FieldLabel>Sub Category *</FieldLabel>
          <Select
            key={`sub-${mainCategoryId}-${subCategoryId}`}
            options={subOptions}
            placeholder={subLoading ? "Loading sub categories..." : "Select sub category"}
            value={String(subCategoryId)}
            onChange={(v) => setSubCategoryId(Number(v))}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Child Category *</FieldLabel>
          <Select
            key={`child-${subCategoryId}-${childCategoryId}`}
            options={childOptions}
            placeholder={!subCategoryId ? "Select sub category first" : childLoading ? "Loading child categories..." : "Select child category"}
            value={String(childCategoryId)}
            onChange={(v) => setChildCategoryId(Number(v))}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>Brand *</FieldLabel>
          <Select options={brandOptions} placeholder="Select brand" value={String(brandId)} onChange={(v) => setBrandId(Number(v))} />
        </div>
      </div>
    </Section>
  );
}

export default BasicSection;