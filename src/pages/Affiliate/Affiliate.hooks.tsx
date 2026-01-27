import React, { useEffect, useState } from "react";
import { useWindowSize } from "../../hooks/useWindowSize";
import {
  AffiliatePageTabTypes,
  FieldTypes,
  affiliatePageTabs,
  referralBaseUrl,
} from "./affiliate.utils";
import AffiliateInfoComp from "./AffiliateInfoComp";
import ReferredUsers from "./ReferredUsers";
import CommissionPage from "./CommissionPage";
import FundsReport from "./FundsPage";
import AffiliateOverview from "./AffiliateOverview";
import SVLS_API from "../../api-services/svls-api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../models/RootState";

import { setAlertMsg, setCampaignInfo } from "../../store/common/commonActions";
import AffiliateDailyReport from "./AffiliateDailyReport";

const initialAffiliateFormState = {
  affiliateName: "",
  affiliateId: "",
  referralLink: referralBaseUrl,
};

export const useAffiliateHook = () => {
  const dispatch = useDispatch();
  const [campaignPageLoader, setCampaignPageLoader] = useState(false);
  const [showAffiliateInfo, setShowAffiliateInfo] = useState(false);
  const [showAddNewAffiliateForm, setShowAddNewAffiliateForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>(
    affiliatePageTabs[0].type
  );

  const { campaignInfo: campaignDetails } = useSelector(
    (state: RootState) => state.common
  );

  const { langData } = useSelector((state: RootState) => state.common);

  const [affiliateFormState, setAffiliateFormState] = useState(
    initialAffiliateFormState
  );

  const isMobile = useWindowSize().width < 720;

  const resetCreateCampaignInputFields = () => {
    setAffiliateFormState({
      ...initialAffiliateFormState,
    });
  };

  const handleFormTextChange = (text: string, fieldType: FieldTypes) => {
    switch (fieldType) {
      case FieldTypes.AFFILIATE_NAME:
        setAffiliateFormState({ ...affiliateFormState, affiliateName: text });
        break;

      case FieldTypes.AFFILIATE_ID:
        setAffiliateFormState({
          ...affiliateFormState,
          affiliateId: text,
          referralLink: referralBaseUrl + text,
        });
        break;

      case FieldTypes.REFERRAL_LINK:
        setAffiliateFormState({ ...affiliateFormState, referralLink: text });
        break;

      default:
        setAffiliateFormState({ ...affiliateFormState });
    }
  };

  const toggleAffiliateForm = () => {
    setShowAddNewAffiliateForm((previousState) => !previousState);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const getCampaignDetails = async () => {
    setCampaignPageLoader(true);
    try {
      // Replaced API call with dummy data
      const dummyCampaignData = {
        userName: "dummyuser",
        lifeTimeFTDAmount: 50000,
        lifeTimeFirstDeposits: 25,
        lifeTimeSignUps: 100,
        totalCommission: 5000,
        availableCommission: 2500,
        isCampaignCreated: true,
        lastTxnTime: Date.now(),
        campaignDetailsHashMap: {
          CAMPAIGN001: {
            affiliateId: "AFF001",
            houseId: "HOUSE001",
            commissionPercentage: "10",
            affiliatePath: "/affiliate/campaign001",
            accountPath: "/account/campaign001",
            accountId: "ACC001",
            userName: "dummyuser",
            lifeTimeFTDAmount: "30000",
            lifeTimeFirstDeposits: "15",
            lifeTimeSignUps: "60",
            totalCommission: "3000",
            availableCommission: "1500",
            campaignCode: "CAMPAIGN001",
            campaignName: "Dummy Campaign 1",
          },
        },
      };

      dispatch(setCampaignInfo(dummyCampaignData));
    } catch (e) {
      dispatch(
        setAlertMsg({
          type: "error",
          message: langData?.["general_err_txt"],
        })
      );
    }

    setCampaignPageLoader(false);
  };

  const createCampaign = async (campaignId: string, campaignName: string) => {
    try {
      // Replaced API call with dummy logic - simulate successful campaign creation
      dispatch(
        setAlertMsg({
          type: "success",
          message: langData?.["campaign_create_success"],
        })
      );
      setShowAddNewAffiliateForm(false);
      setTimeout(() => getCampaignDetails(), 1000);
    } catch (e) {
      dispatch(
        setAlertMsg({
          type: "error",
          message: e.response?.data?.message || "Failed to create campaign",
        })
      );
    }
  };

  const handleCreateCampaign = () => {
    createCampaign(
      affiliateFormState.affiliateId,
      affiliateFormState.affiliateName
    );
  };

  useEffect(() => {
    getCampaignDetails();
  }, []);

  const getSelectedComponent = () => {
    switch (selectedTab) {
      case AffiliatePageTabTypes.CAMPAIGNS:
        return (
          <AffiliateInfoComp
            campaignDetails={campaignDetails}
            toggleAffiliateForm={toggleAffiliateForm}
            langData={langData}
          />
        );

      case AffiliatePageTabTypes.REFERRED_USERS:
        return <ReferredUsers langData={langData} />;

      case AffiliatePageTabTypes.COMMISSION:
        return <CommissionPage langData={langData} />;

      case AffiliatePageTabTypes.FUNDS:
        return (
          <FundsReport
            isMobile={isMobile}
            campaignDetails={campaignDetails}
            getCampaignDetails={getCampaignDetails}
            langData={langData}
          />
        );

      case AffiliatePageTabTypes.DAILY_REPORT:
        return <AffiliateDailyReport langData={langData} />;
      default:
        return <AffiliateOverview langData={langData} />;
    }
  };

  return {
    campaignPageLoader,
    showAffiliateInfo,
    setShowAffiliateInfo,
    showAddNewAffiliateForm,
    setShowAddNewAffiliateForm,
    selectedTab,
    setSelectedTab,
    affiliateFormState,
    setAffiliateFormState,
    isMobile,
    handleFormTextChange,
    toggleAffiliateForm,
    handleTabChange,
    getSelectedComponent,
    campaignDetails,
    handleCreateCampaign,
    resetCreateCampaignInputFields,
    langData,
  };
};
