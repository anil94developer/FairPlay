import React from "react";
import InputTemplate from "../../common/InputTemplate/InputTemplate";
import CloseIcon from "@material-ui/icons/Close";
import CustomModalBtns from "../../common/CustomButton/CustomModalBtn";
import { FieldTypes } from "./affiliate.utils";

type AffiliateFormStateType = {
  affiliateName: string;
  affiliateId: string;
  referralLink: string;
};

interface AffiliateFormProps {
  affiliateFormState: AffiliateFormStateType;
  handleChange: (text: string, fieldType: FieldTypes) => void;
  handleCreateCampaign: () => void;
  resetAffiliateForm: () => void;
  handleFormClose?: () => void;
  langData: any;
}

const AffiliateForm: React.FC<AffiliateFormProps> = ({
  affiliateFormState: { affiliateName, affiliateId, referralLink },
  handleChange,
  handleFormClose,
  resetAffiliateForm,
  handleCreateCampaign,
  langData,
}) => {
  return (
    <div className="dialog-content">
      <div className="dialog-title-ctn">
        <div className="dialog-title">{langData?.["create_affiliate"]}</div>
        <div
          onClick={() => {
            handleFormClose();
            resetAffiliateForm();
          }}
          className="close-icon-ctn"
        >
          <CloseIcon className="close-icon" />
        </div>
      </div>
      <div className="dialog-form">
        <InputTemplate
          label={langData?.["campaign_name"]}
          value={affiliateName}
          placeholder={langData?.["enter"]}
          onChange={(text) => handleChange(text, FieldTypes.AFFILIATE_NAME)}
          customInputClassName="affiliate-input"
          customInputCtnClassName="affiliate-input-ctn"
        />

        <InputTemplate
          label={langData?.["campaign_id"]}
          value={affiliateId}
          placeholder={langData?.["enter"]}
          onChange={(text) => handleChange(text, FieldTypes.AFFILIATE_ID)}
          customInputClassName="affiliate-input"
          customInputCtnClassName="affiliate-input-ctn"
        />

        <InputTemplate
          label={langData?.["referral_link"]}
          value={referralLink}
          placeholder={langData?.["enter"]}
          // onChange={(text) => handleChange(text, FieldTypes.REFERRAL_LINK)}
          customInputClassName="affiliate-input"
          customInputCtnClassName="affiliate-input-ctn"
        />
      </div>

      <CustomModalBtns
        leftBtnTitle={langData?.["reset"]}
        rightBtnTitle={langData?.["create"]}
        leftBtnOnPress={resetAffiliateForm}
        rightBtnDisabled={!(affiliateName && affiliateId)}
        rightBtnOnPress={handleCreateCampaign}
      />
    </div>
  );
};

export default AffiliateForm;
