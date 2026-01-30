import { useTranslation } from "react-i18next";
import { setLanguage, getLanguage } from "../../i18n";

const LanguageToggle = () => {
  const { t } = useTranslation();
  const current = getLanguage();
  const isBangla = current === "bn";
  const handleSelect = (lng: "en" | "bn") => {
    setLanguage(lng);
  };

  return (
    <div
      role="switch"
      aria-checked={isBangla}
      aria-label={t("header.languageToggle")}
      title={t("header.languageToggle")}
      className="relative inline-flex min-w-[120px] items-center rounded-full border border-gray-200 bg-gray-100 p-1 shadow-theme-xs transition dark:border-gray-800 dark:bg-white/[0.05]"
    >
      <button
        type="button"
        onClick={() => handleSelect("en")}
        className={`relative z-10 flex h-8 flex-1 items-center justify-center rounded-full text-xs font-semibold transition ${
          !isBangla
            ? "text-brand-600 dark:text-brand-400"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        {t("common.englishShort")}
      </button>
      <button
        type="button"
        onClick={() => handleSelect("bn")}
        className={`relative z-10 flex h-8 flex-1 items-center justify-center rounded-full text-xs font-semibold transition ${
          isBangla
            ? "text-brand-600 dark:text-brand-400"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        {t("common.banglaShort")}
      </button>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute top-1 left-1 h-8 w-[calc(50%-4px)] rounded-full bg-white shadow-theme-sm transition-transform duration-200 dark:bg-gray-900 ${
          isBangla ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
        }`}
      />
    </div>
  );
};

export default LanguageToggle;
