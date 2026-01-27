import React from "react";
import "./Affiliate.scss";
import { CampaignInfoDataType } from "./affiliate.utils";
import AffiliateListCard from "./AffiliateListCard";
import AffiliateInfoCard from "./AffiliateInfoCard";
import CustomButton from "../../common/CustomButton/CustomButton";

interface AffiliateInfoCompProps {
  campaignDetails: CampaignInfoDataType;
  toggleAffiliateForm: () => void;
  langData: any;
}

const AffiliateInfoComp: React.FC<AffiliateInfoCompProps> = ({
  campaignDetails,
  toggleAffiliateForm,
  langData,
}) => {
  const {
    totalCommission,
    lifeTimeSignUps,
    lifeTimeFirstDeposits,
    lifeTimeFTDAmount,
    availableCommission,
    campaignDetailsHashMap,
  } = campaignDetails;

  const campaignList = Object.keys(campaignDetailsHashMap);

  return (
    <div className="affiliate-info-ctn">
      <div className="withdraw-btn-ctn">
        <CustomButton
          text={langData?.["create_new_campaign"]}
          onClick={toggleAffiliateForm}
        />
      </div>
      <div className="affiliate-cards-ctn">
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
      </div>
      <div>
        {campaignList.length > 0 &&
          campaignList.map((campaign) => (
            <AffiliateListCard
              title={campaign}
              number={+campaignDetailsHashMap[campaign].availableCommission}
              campaignDetails={campaignDetailsHashMap[campaign]}
              langData={langData}
            />
          ))}
      </div>
    </div>
  );
};

export default AffiliateInfoComp;
