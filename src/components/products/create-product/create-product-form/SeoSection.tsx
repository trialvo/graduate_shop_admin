import { useMemo } from "react";
import Section from "./Section";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { Globe } from "lucide-react";

type Option = { value: string; label: string };

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {children}
    </p>
  );
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
    <Section
      title="SEO & Open Graph"
      description="Search engine optimization and social sharing metadata."
      icon={<Globe className="h-5 w-5" />}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <FieldLabel>META TITLE</FieldLabel>
          <Input
            value={seo.meta_title}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                meta_title: String(e.target.value),
              }))
            }
            placeholder="Page title for search engines"
          />
        </div>

        <div>
          <FieldLabel>CANONICAL URL</FieldLabel>
          <Input
            value={seo.canonical_url}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                canonical_url: String(e.target.value),
              }))
            }
            placeholder="https://example.com/product"
          />
        </div>

        <div className="lg:col-span-2">
          <FieldLabel>META DESCRIPTION</FieldLabel>
          <Input
            value={seo.meta_description}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                meta_description: String(e.target.value),
              }))
            }
            placeholder="Brief description for search results"
          />
          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
            Recommended: under 160 characters
          </p>
        </div>

        <div className="lg:col-span-2">
          <FieldLabel>META KEYWORDS</FieldLabel>
          <Input
            value={seo.meta_keywords}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                meta_keywords: String(e.target.value),
              }))
            }
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>

        <div>
          <FieldLabel>OG TITLE</FieldLabel>
          <Input
            value={seo.og_title}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                og_title: String(e.target.value),
              }))
            }
            placeholder="Social share title"
          />
        </div>

        <div>
          <FieldLabel>ROBOTS</FieldLabel>
          <Select
            options={robotsOptions}
            placeholder="Select robots directive"
            value={seo.robots}
            onChange={(v) =>
              setSeo((p) => ({ ...p, robots: String(v) }))
            }
          />
        </div>

        <div className="lg:col-span-2">
          <FieldLabel>OG DESCRIPTION</FieldLabel>
          <Input
            value={seo.og_description}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                og_description: String(e.target.value),
              }))
            }
            placeholder="Social share description"
          />
        </div>
      </div>
    </Section>
  );
}
export default SeoSection;