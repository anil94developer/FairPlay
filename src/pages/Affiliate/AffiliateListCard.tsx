import React, { useState } from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import AffiliateInfoCard from "./AffiliateInfoCard";
import { CampaignInfoType } from "./affiliate.utils";
import AffiliateLinkCard from "./AffiliateLinkCard";

interface AffiliateListCardProps {
  title: string;
  number: number;
  campaignDetails: CampaignInfoType;
  langData: any;
}

const AffiliateListCard: React.FC<AffiliateListCardProps> = ({
  title,
  number,
  campaignDetails,
  langData,
}) => {
  const {
    availableCommission,
    campaignCode,
    commissionPercentage,
    lifeTimeFTDAmount,
    lifeTimeFirstDeposits,
    lifeTimeSignUps,
    totalCommission,
  } = campaignDetails;
  const [isCampaignDetailsOpen, setCampaignDetailsOpen] = useState(false);

  const toggleCampaignDetails = () => {
    setCampaignDetailsOpen(!isCampaignDetailsOpen);
  };

  return (
    <div>
      <div onClick={toggleCampaignDetails} className="list-card-ctn">
        <span className="title">{title}</span>

        <div className="number-ctn">
          <span className="number">{number}</span>
          {isCampaignDetailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </div>
      </div>
      {isCampaignDetailsOpen && (
        <>
          <div className="affiliate-cards-ctn affiliate-cards-list-ctn">
            <AffiliateInfoCard
              unitName={langData?.["available_commission"]}
              unitQuantity={availableCommission}
            />

            <AffiliateInfoCard
              unitName={langData?.["total_commission"]}
              unitQuantity={totalCommission}
            />

            <AffiliateInfoCard
              unitName={langData?.["lifetime_sign_ups"]}
              unitQuantity={lifeTimeSignUps}
            />

            <AffiliateInfoCard
              unitName={langData?.["lifetime_ftd"]}
              unitQuantity={lifeTimeFirstDeposits}
            />

            <AffiliateInfoCard
              unitName={langData?.["lifetime_ftd_amount"]}
              unitQuantity={lifeTimeFTDAmount}
            />

            <AffiliateInfoCard
              unitName={langData?.["commission_percentage"]}
              unitQuantity={commissionPercentage}
            />
          </div>

          <div>
            <AffiliateLinkCard
              campaignCode={campaignCode}
              langData={langData}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AffiliateListCard;
