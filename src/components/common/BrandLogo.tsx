import React from "react";

import { useTheme } from "../../context/ThemeContext";
import { useAppBranding } from "../../context/AppBrandingContext";
import { cn } from "../../lib/utils";

type BrandLogoProps = {
  /** `full` uses theme-aware light/dark logo. `icon` uses logoIconUrl. */
  variant?: "full" | "icon";
  /** Wrapper className (applied to the `<img/>`). */
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
};

const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  className,
  alt,
  width,
  height,
}) => {
  const { theme } = useTheme();
  const { branding } = useAppBranding();

  const src =
    variant === "icon"
      ? branding.logoIconUrl
      : theme === "dark"
        ? branding.logoDarkUrl
        : branding.logoLightUrl;

  return (
    <img
      src={src}
      alt={alt ?? branding.appName}
      width={width}
      height={height}
      className={cn("block", className)}
    />
  );
};

export default BrandLogo;
