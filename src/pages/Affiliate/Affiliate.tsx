import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import Drawer from "@material-ui/core/Drawer";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import React from "react";
import { ReactComponent as affiliateIcon } from "../../assets/images/icons/affiliate-icon.svg?react";
import noAffiliateIcon from "../../assets/images/icons/no-affiliate-icon.svg";
import NoDataComponent from "../../common/NoDataComponent/NoDataComponent";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import Spinner from "../../components/Spinner/Spinner";
import { useAffiliateHook } from "./Affiliate.hooks";
import "./Affiliate.scss";
import { affiliatePageTabs } from "./affiliate.utils";
import AffiliateForm from "./AffiliateForm";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";

const Affiliate = () => {
  const {
    affiliateFormState,
    handleFormTextChange,
    handleTabChange,
    isMobile,
    selectedTab,
    campaignDetails,
    setShowAddNewAffiliateForm,
    showAddNewAffiliateForm,
    toggleAffiliateForm,
    getSelectedComponent,
    handleCreateCampaign,
    resetCreateCampaignInputFields,
    campaignPageLoader,
    langData,
  } = useAffiliateHook();

  return (
    <div className="affiliate-page">
      <ReportBackBtn back={langData?.["back"]} />
      <div onClick={toggleAffiliateForm}>
        <ReportsHeader
          titleIcon={affiliateIcon}
          reportName={langData?.["affiliate_program"]}
          reportFilters={[]}
        />
      </div>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="affiliate tabs"
        variant="scrollable"
      >
        {affiliatePageTabs.map((tab, idx) => (
          <Tab
            className="com-tab"
            label={langData?.[tab.langKey]}
            value={tab.type}
          />
        ))}
      </Tabs>

      {campaignPageLoader ? (
        <Spinner />
      ) : (
        <>
          {campaignDetails.isCampaignCreated ? (
            getSelectedComponent()
          ) : (
            <NoDataComponent
              title={langData?.["affiliate_not_active_txt"]}
              bodyContent={langData?.["create_new_affiliate_txt"]}
              noDataImg={noAffiliateIcon}
              buttonProps={{
                onClick: toggleAffiliateForm,
                text: langData?.["add_new"],
              }}
            />
          )}
        </>
      )}

      <Drawer
        anchor={"bottom"}
        open={isMobile && showAddNewAffiliateForm}
        onClose={toggleAffiliateForm}
        className="light-bg-title game-rules-drawer mob-view"
        title="Rules"
      >
        <AffiliateForm
          resetAffiliateForm={resetCreateCampaignInputFields}
          affiliateFormState={affiliateFormState}
          handleChange={handleFormTextChange}
          handleFormClose={toggleAffiliateForm}
          handleCreateCampaign={handleCreateCampaign}
          langData={langData}
        />
      </Drawer>

      <Dialog
        open={!isMobile && showAddNewAffiliateForm}
        onClose={() => setShowAddNewAffiliateForm(false)}
      >
        <DialogContent>
          <AffiliateForm
            resetAffiliateForm={resetCreateCampaignInputFields}
            affiliateFormState={affiliateFormState}
            handleChange={handleFormTextChange}
            handleFormClose={toggleAffiliateForm}
            handleCreateCampaign={handleCreateCampaign}
            langData={langData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Affiliate;
