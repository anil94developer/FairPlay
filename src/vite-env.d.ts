/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
// Declarations for importing styles and image assets used across the app
declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.webp";

declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const SvgComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default SvgComponent;
}

// Explicit declaration for *.svg?react to ensure ReactComponent is exported as named export
// This overrides the default-only export from vite-plugin-svgr/client.d.ts
// to support exportType: "named" configuration
declare module "*.svg?react" {
  import * as React from "react";
  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string; titleId?: string; desc?: string; descId?: string }
  >;
  export { ReactComponent };
  export default ReactComponent;
}
