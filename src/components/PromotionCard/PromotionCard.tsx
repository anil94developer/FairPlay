import React, { useState } from "react";
import "./PromotionCard.scss";
import DOMPurify from "dompurify";
import CustomButton from "../../common/CustomButton/CustomButton";
import {
  PromotionCardProps,
  RenderHtmlProps,
} from "../../pages/Promotions/Promotions.utils";

const RenderHtml: React.FC<RenderHtmlProps> = ({ htmlString }) => {
  const html = DOMPurify.sanitize(htmlString);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const PromotionCard: React.FC<PromotionCardProps> = ({
  bannerData,
  onKnowMorePress,
  langData,
}) => {
  const { publicUrl: bannerUrl, imageContent: contentHtmlString } = bannerData;

  const onKnowMoreClick = () => onKnowMorePress(bannerData);

  return (
    <div className="promotion-card">
      <img src={bannerUrl} alt={"DepositBanner"} />
      <div className="banner-display-content">
        <RenderHtml htmlString={contentHtmlString} />
      </div>
      <div className="know-more-btn-div">
        <CustomButton
          text={langData?.["know_more"]}
          onClick={onKnowMoreClick}
        />
      </div>
    </div>
  );
};

export default PromotionCard;
