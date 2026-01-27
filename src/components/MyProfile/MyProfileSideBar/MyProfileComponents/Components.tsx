import React from "react";
import { RootState } from "../../../../models/RootState";
import { connect, useSelector } from "react-redux";

import icon1 from "../../../../assets/images/MyProfileIcons/change_password_icon.svg";
import twoFactorIcon from "../../../../assets/images/MyProfileIcons/two_factor_icon.svg";
import twoFactorIconSelected from "../../../../assets/images/MyProfileIcons/two_factor_icon_selected.svg";
import icon1Selected from "../../../../assets/images/MyProfileIcons/change_password_icon_selected.svg";

import icon2 from "../../../../assets/images/MyProfileIcons/withdrawal_icon.svg";
import icon2Selected from "../../../../assets/images/MyProfileIcons/withdrawal_icon_selected.svg";

import icon3 from "../../../../assets/images/MyProfileIcons/deposit_icon.svg";
import icon3Selected from "../../../../assets/images/MyProfileIcons/deposit_icon_selected.svg";

import icon4 from "../../../../assets/images/MyProfileIcons/personal_info_icon.svg";
import icon4Selected from "../../../../assets/images/MyProfileIcons/personal_info_icon_selected.svg";

import icon5 from "../../../../assets/images/MyProfileIcons/referral_icon.svg";
import icon5Selected from "../../../../assets/images/MyProfileIcons/referral_icon_selected.svg";

import icon6 from "../../../../assets/images/sidebar/bonus_statement.svg";

import "./Components.scss";
import { notDemoUser } from "../../../../util/stringUtil";

type Detail = {
  label: string;
  langKey: string;
  amount: number;
  cond: boolean;
};

type DetailsProps = {
  balance: number;
  exposure: number;
  bonus: number;
  langData: any;
};

export const Details = (props: DetailsProps) => {
  const { balance, exposure, bonus, langData } = props;
  const domainConfig = useSelector(
    (state: RootState) => state.common.domainConfig
  );

  const details: Detail[] = [
    {
      label: "Exposure Credited",
      langKey: "exposure_credited",
      amount: exposure,
      cond: true,
    },
    {
      label: "Available Balance",
      langKey: "available_balance",
      amount: balance,
      cond: true,
    },
    {
      label: "Bonus Rewarded",
      langKey: "bonus_rewarded",
      amount: bonus,
      cond: domainConfig.b2cEnabled && domainConfig.bonus,
    },
  ];

  return (
    <div className="mp-details">
      {details.map(
        (detail) =>
          detail.cond && (
            <div key={detail.langKey} className="mp-detail">
              <div className="mp-detail-amount">{detail.amount}</div>
              <div className="mp-detail-label">
                {langData?.[detail.langKey]}
              </div>
            </div>
          )
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    balance: state.auth.balanceSummary.balance,
    exposure: state.auth.balanceSummary.exposure,
    bonus: state.auth.balanceSummary.bonus,
  };
};
export default connect(mapStateToProps)(Details);

type MPTabsProps = {
  onChange: Function;
  tabValue: number;
  langData: any;
};

export enum MPTabsEnum {
  PERSONAL_INFO = "personal info",
  CHANGE_PASSWORD = "change password",
  TWO_FACTOR_AUTH = "two factor auth",
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  REFFERAL = "referral",
  Bonus = "Check Bonuses",
}

export const myProfileTabs = [
  { img: icon4, label: MPTabsEnum.PERSONAL_INFO, tabValue: 0 },
  { img: icon1, label: MPTabsEnum.CHANGE_PASSWORD, tabValue: 1 },
  { img: twoFactorIcon, label: MPTabsEnum.TWO_FACTOR_AUTH, tabValue: 2 },
  { img: icon3, label: MPTabsEnum.DEPOSIT, tabValue: 3 },
  { img: icon2, label: MPTabsEnum.WITHDRAW, tabValue: 4 },
  { img: icon5, label: MPTabsEnum.REFFERAL, tabValue: 5 },
  { img: icon6, label: MPTabsEnum.Bonus, tabValue: 6 },
];

export const getMyProfileTabs = (selectedTab: number, domainConfig: any) => [
  {
    img: selectedTab === 0 ? icon4Selected : icon4,
    label: MPTabsEnum.PERSONAL_INFO,
    langKey: "personal_info",
    tabValue: 0,
    cond: true,
  },
  {
    img: selectedTab === 1 ? icon1Selected : icon1,
    label: MPTabsEnum.CHANGE_PASSWORD,
    langKey: "change_password_txt",
    tabValue: 1,
    cond: true,
  },
  {
    img: selectedTab === 2 ? twoFactorIconSelected : twoFactorIcon,
    label: MPTabsEnum.TWO_FACTOR_AUTH,
    langKey: "two_factor_auth",
    tabValue: 2,
    cond: true,
  },
  {
    img: selectedTab === 3 ? icon3Selected : icon3,
    label: MPTabsEnum.DEPOSIT,
    langKey: "deposit",
    tabValue: 3,
    cond: true,
  },
  {
    img: selectedTab === 4 ? icon2Selected : icon2,
    label: MPTabsEnum.WITHDRAW,
    langKey: "withdraw",
    tabValue: 4,
    cond: true,
  },
  // {
  //   img: selectedTab === 5 ? icon5Selected : icon5,
  //   label: MPTabsEnum.REFFERAL,
  //   tabValue: 5,
  // },
  {
    img: selectedTab === 6 ? icon6 : icon6,
    label: MPTabsEnum.Bonus,
    langKey: "checkbonuses",
    tabValue: 6,
    cond: true,
  },
];

export const MPTabs = (props: MPTabsProps) => {
  const { onChange, tabValue, langData } = props;
  const common = useSelector((state: RootState) => state.common);

  const handleClick = (label) => {
    onChange(label);
  };

  return (
    <div className="mp-tabs">
      {getMyProfileTabs(tabValue, common.domainConfig).map((tab) => {
        return (
          tab.cond && (
            <div
              className={`mp-tab ${
                tabValue === tab.tabValue ? "mp-selected" : ""
              }`}
              onClick={() => handleClick(tab.label)}
            >
              <img className="mp-tab-img" src={tab.img} />

              <div className="mp-tab-label">{langData?.[tab.langKey]}</div>
            </div>
          )
        );
      })}
    </div>
  );
};
