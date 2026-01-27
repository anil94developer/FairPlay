import { useState } from "react";
import DashboardTab from "./DashboardTab";
import ReportTab from "./ReportTab";
import ShareAffiliateLinkDialog from "./ShareAffiliateLinkDialog";
import UserListTab from "./UserListTab";
import UserProfitLossTab from "./UserProfitLossTab";

import "./AffiliateRefer.scss";

const affiliateTabs = [
  { label: "Dashboard", key: "dashboard" },
  { label: "User List", key: "user-list" },
  { label: "Share Affiliate", key: "share", isDialog: true },
  { label: "User Profit/Loss", key: "profit-loss" },
  { label: "Report", key: "report" },
];

const Affiliate = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [shareAffiliateDialog, setShareAffiliateDialog] = useState(false);
  return (
    <div className="affiliate-container">
      <div class="affiliate-tabs">
        <div class="affiliate-tab-list">
          {affiliateTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`affiliate-tab ${
                activeTab === tab.key ? "active-tab" : ""
              }`}
              onClick={() => {
                if (tab.isDialog) {
                  setShareAffiliateDialog(true);
                  return;
                }
                setActiveTab(tab.key);
              }}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      {activeTab === "dashboard" && <DashboardTab />}
      {activeTab === "user-list" && <UserListTab />}
      {activeTab === "profit-loss" && <UserProfitLossTab />}
      {activeTab === "report" && <ReportTab />}

      <ShareAffiliateLinkDialog
        open={shareAffiliateDialog}
        onClose={() => setShareAffiliateDialog(false)}
      />
    </div>
  );
};

export default Affiliate;
