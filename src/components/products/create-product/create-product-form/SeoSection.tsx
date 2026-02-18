import { useMemo } from "react";
import Section from "./Section";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      title={t("products.createProduct.seoTitle")}
      description={t("products.createProduct.seoDesc")}
      icon={<Globe className="h-5 w-5" />}
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <FieldLabel>{t("products.createProduct.metaTitle")}</FieldLabel>
          <Input
            value={seo.meta_title}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                meta_title: String(e.target.value),
              }))
            }
            placeholder={t("products.createProduct.metaTitlePlaceholder")}
          />
        </div>

        <div>
          <FieldLabel>{t("products.createProduct.canonicalUrl")}</FieldLabel>
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
          <FieldLabel>{t("products.createProduct.metaDescription")}</FieldLabel>
          <Input
            value={seo.meta_description}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                meta_description: String(e.target.value),
              }))
            }
            placeholder={t("products.createProduct.metaDescPlaceholder")}
          />
          <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
            {t("products.createProduct.metaDescHint")}
          </p>
        </div>

        <div className="lg:col-span-2">
          <FieldLabel>{t("products.createProduct.metaKeywords")}</FieldLabel>
          <Input
            value={seo.meta_keywords}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                meta_keywords: String(e.target.value),
              }))
            }
            placeholder={t("products.createProduct.metaKeywordsPlaceholder")}
          />
        </div>

        <div>
          <FieldLabel>{t("products.createProduct.ogTitle")}</FieldLabel>
          <Input
            value={seo.og_title}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                og_title: String(e.target.value),
              }))
            }
            placeholder={t("products.createProduct.ogTitlePlaceholder")}
          />
        </div>

        <div>
          <FieldLabel>{t("products.createProduct.robots")}</FieldLabel>
          <Select
            options={robotsOptions}
            placeholder={t("products.createProduct.robotsPlaceholder")}
            value={seo.robots}
            onChange={(v) =>
              setSeo((p) => ({ ...p, robots: String(v) }))
            }
          />
        </div>

        <div className="lg:col-span-2">
          <FieldLabel>{t("products.createProduct.ogDescription")}</FieldLabel>
          <Input
            value={seo.og_description}
            onChange={(e) =>
              setSeo((p) => ({
                ...p,
                og_description: String(e.target.value),
              }))
            }
            placeholder={t("products.createProduct.ogDescPlaceholder")}
          />
        </div>
      </div>
    </Section>
  );
}
export default SeoSection;