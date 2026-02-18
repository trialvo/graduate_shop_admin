import { HelmetProvider, Helmet } from "react-helmet-async";
import { useAppBranding } from "../../context/AppBrandingContext";
import { useTheme } from "../../context/ThemeContext";

const AppHead = () => {
  const { branding } = useAppBranding();
  const { theme } = useTheme();
  const faviconHref =
    theme === "dark" && branding.faviconDarkUrl
      ? branding.faviconDarkUrl
      : branding.faviconUrl;

  return (
    <Helmet>
      <link rel="icon" href={faviconHref} />
      {branding.appleTouchIconUrl ? (
        <link rel="apple-touch-icon" href={branding.appleTouchIconUrl} />
      ) : null}
      {branding.defaultOgImageUrl ? (
        <meta property="og:image" content={branding.defaultOgImageUrl} />
      ) : null}
    </Helmet>
  );
};

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <AppHead />
    {children}
  </HelmetProvider>
);

export default PageMeta;
