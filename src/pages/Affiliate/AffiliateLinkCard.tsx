import React from "react";
import { referralBaseUrl } from "./affiliate.utils";
import AppCopyIcon from "../../components/CopyIcon/CopyIcon";

interface AffiliateLinkCardProps {
  campaignCode: string;
  langData: any;
}

const AffiliateLinkCard: React.FC<AffiliateLinkCardProps> = ({
  campaignCode,
  langData,
}) => {
  const campaignCodeDisplay = referralBaseUrl + campaignCode;

  return (
    <div className="affiliate-link-Card-ctn">
      <div className="affiliate-link-Card">
        <div className="affiliate-link-ctn">
          <p className="affiliate-link-title">{langData?.["campaign_link"]}:</p>
          <p className="affiliate-link-text">{campaignCodeDisplay}</p>
        </div>

        <AppCopyIcon copyText={campaignCodeDisplay} />
      </div>

      <div className="affiliate-link-Card-two web-view"></div>
    </div>
  );
};

export default AffiliateLinkCard;
