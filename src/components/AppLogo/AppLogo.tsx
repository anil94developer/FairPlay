import React from "react";
import { useLogo } from "../../contexts/LogoContext";
import fallbackLogo from "../../assets/images/theme/title.png";

type AppLogoProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Optional class name (e.g. "logo", "sh-website-title-img") */
  className?: string;
  /** Alt text for the image */
  alt?: string;
};

/**
 * Renders the app logo from content/getLogo API, with fallback to static asset.
 */
const AppLogo: React.FC<AppLogoProps> = ({
  className,
  alt = "website",
  ...imgProps
}) => {
  const { logoSrc } = useLogo();
  const src = logoSrc || fallbackLogo;
  return <img src={src} alt={alt} className={className} {...imgProps} />;
};

export default AppLogo;
