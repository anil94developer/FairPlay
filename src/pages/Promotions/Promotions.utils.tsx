import React from "react";
import DOMPurify from "dompurify";

export type BannerObjData = {
  id: number;
  houseId: number;
  bannerId: string;
  sportsBookUrl: string;
  title: string;
  category: string;
  deviceType: string;
  level: number;
  publicUrl: string;
  redirectionUrl: string;
  imageContent: string;
  displayContent: string;
  active: boolean;
};

export type BannerResData = {
  banners: BannerObjData[];
};

export interface PromotionCardProps {
  bannerData: BannerObjData;
  onKnowMorePress: (banner: BannerObjData) => void;
  langData: any;
}

export type RenderHtmlProps = {
  htmlString: string;
};

export const RenderHtml: React.FC<RenderHtmlProps> = ({ htmlString }) => {
  const html = DOMPurify.sanitize(htmlString);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
