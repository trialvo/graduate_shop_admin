import { useMemo } from "react";
import Section from "./Section";
import Input from "@/components/form/input/InputField";
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



function SeoSection({
  seo,
  setSeo,
}: {
  seo: {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    canonical_url: string;
    og_title: string;
    og_description: string;
    robots: string;
  };
  setSeo: React.Dispatch<
    React.SetStateAction<{
      meta_title: string;
      meta_description: string;
      meta_keywords: string;
      canonical_url: string;
      og_title: string;
      og_description: string;
      robots: string;
    }>
  >;
}) {
  const robotsOptions: Option[] = useMemo(
    () => [
      { value: "index, follow", label: "index, follow" },
      { value: "index, nofollow", label: "index, nofollow" },
      { value: "noindex, follow", label: "noindex, follow" },
      { value: "noindex, nofollow", label: "noindex, nofollow" },
    ],
    [],
  );

  return (
    <Section title="SEO" description="All SEO fields from API payload.">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel>Meta Title</FieldLabel>
          <Input value={seo.meta_title} onChange={(e) => setSeo((p) => ({ ...p, meta_title: String(e.target.value) }))} />
        </div>

        <div className="space-y-2">
          <FieldLabel>Canonical URL</FieldLabel>
          <Input value={seo.canonical_url} onChange={(e) => setSeo((p) => ({ ...p, canonical_url: String(e.target.value) }))} />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <FieldLabel>Meta Description</FieldLabel>
          <Input
            value={seo.meta_description}
            onChange={(e) => setSeo((p) => ({ ...p, meta_description: String(e.target.value) }))}
            placeholder="product meta description"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Tip: keep it under ~160 characters.</p>
        </div>

        <div className="space-y-2 lg:col-span-2">
          <FieldLabel>Meta Keywords</FieldLabel>
          <Input
            value={seo.meta_keywords}
            onChange={(e) => setSeo((p) => ({ ...p, meta_keywords: String(e.target.value) }))}
            placeholder="shirt,vo"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>OG Title</FieldLabel>
          <Input value={seo.og_title} onChange={(e) => setSeo((p) => ({ ...p, og_title: String(e.target.value) }))} />
        </div>

        <div className="space-y-2">
          <FieldLabel>Robots</FieldLabel>
          <Select options={robotsOptions} placeholder="Select robots" value={seo.robots} onChange={(v) => setSeo((p) => ({ ...p, robots: String(v) }))} />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <FieldLabel>OG Description</FieldLabel>
          <Input value={seo.og_description} onChange={(e) => setSeo((p) => ({ ...p, og_description: String(e.target.value) }))} />
        </div>
      </div>
    </Section>
  );
}
export default SeoSection;