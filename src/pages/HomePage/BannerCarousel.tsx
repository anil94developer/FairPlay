import React, { useEffect, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { isMobile } from "react-device-detect";
import { useHistory } from "react-router";
import DepositBanner from "../../assets/images/home_page/banners/joining_bonus.webp";
import JoiningBonusMob from "../../assets/images/banners/joining_bonus_mob.webp";
import AffiliateBanner from "../../assets/images/home_page/banners/affiliate.webp";
import AffiliateMobilePng2xBanner from "../../assets/images/banners/affiliate_mob.webp";
import DepositIcon from "../../assets/images/icons/depositIcon.svg";
import WithdrawIcon from "../../assets/images/icons/withdrawIcon.svg";
import { Button } from "@material-ui/core";
import { connect, useSelector } from "react-redux";
import { RootState } from "../../models/RootState";
import { AuthResponse } from "../../models/api/AuthResponse";
import SVLS_API from "../../svls-api";
import { BRAND_DOMAIN } from "../../constants/Branding";
import { BannerManagementCategoryEnum } from "../../models/cms.types";

type StateProps = {
  loggedIn: boolean;
  langData: any;
};

const desktopDefaultBanner = [
  {
    publicUrl: DepositBanner,
    redirectionUrl: "/transaction/deposit",
  },
  {
    publicUrl: AffiliateBanner,
    redirectionUrl: "/affiliate_program",
  },
];

const mobileDefaultBanner = [
  {
    publicUrl: JoiningBonusMob,
    redirectionUrl: "/transaction/deposit",
  },
  {
    publicUrl: AffiliateMobilePng2xBanner,
    redirectionUrl: "/affiliate_program",
  },
];

const banners = [
  {
    id: 12069558977,
    houseId: 16,
    bannerId: "fairplay.live_homebanner_mobile_1",
    sportsBookUrl: "fairplay.live",
    title: "Home page banners",
    category: "homebanner",
    deviceType: "mobile",
    level: 1,
    publicUrl:
      "https://cdn.uvwin2024.co/banners/banner__4812e17c-d01c-473e-b9c9-5993fbec1fa3.webp",
    redirectionUrl: "/transaction/deposit",
    imageContent: null,
    displayContent: null,
    active: true,
  },
  {
    id: 12069558978,
    houseId: 16,
    bannerId: "fairplay.live_homebanner_desktop_1",
    sportsBookUrl: "fairplay.live",
    title: "Home page banners",
    category: "homebanner",
    deviceType: "desktop",
    level: 1,
    publicUrl:
      "https://cdn.uvwin2024.co/banners/banner__b8061b64-d767-47cb-a7e1-985197f72c63.webp",
    redirectionUrl: "/transaction/deposit",
    imageContent: null,
    displayContent: null,
    active: true,
  },
  {
    id: 12069982960,
    houseId: 16,
    bannerId: "fairplay.live_homebanner_mobile_2",
    sportsBookUrl: "fairplay.live",
    title: "Affiliate Home Banner",
    category: "homebanner",
    deviceType: "mobile",
    level: 2,
    publicUrl:
      "https://cdn.uvwin2024.co/banners/banner__580be4a3-c30a-47f7-938b-6c6b2b8c21ea.webp",
    redirectionUrl: "/affiliate_program",
    imageContent: null,
    displayContent: null,
    active: true,
  },
  {
    id: 12069982961,
    houseId: 16,
    bannerId: "fairplay.live_homebanner_desktop_2",
    sportsBookUrl: "fairplay.live",
    title: "Affiliate Home Banner",
    category: "homebanner",
    deviceType: "desktop",
    level: 2,
    publicUrl:
      "https://cdn.uvwin2024.co/banners/banner__0ac0f9cc-7ea3-4d1c-9edc-b97ef48d2207.png",
    redirectionUrl: "/affiliate_program",
    imageContent: null,
    displayContent: null,
    active: true,
  },
];

const App: React.FC<StateProps> = (props) => {
  const { loggedIn, langData } = props;
  const history = useHistory();
  const [apiWebBanners, setApiWebBanners] = useState(
    banners.filter((b) => b.deviceType === "desktop")
  );
  const [apiMobBanners, setApiMobBanners] = useState(
    banners.filter((b) => b.deviceType === "mobile")
  );

  return (
    <div className="banner-container mt-12">
      <div className="banner-cards">
        {loggedIn && (
          <>
            <Button
              onClick={() => history.push("/transaction/deposit")}
              className="deposit-btn"
              key={"deposit-btn"}
            >
              <img src={DepositIcon} alt="deposit" />
              {langData?.["deposit"]}
            </Button>
            <Button
              onClick={() => history.push("/transaction/withdraw")}
              className="withdraw-btn"
              key={"withdraw-btn"}
            >
              <img src={WithdrawIcon} alt="withdraw" />
              {langData?.["withdraw"]}
            </Button>
          </>
        )}

        {!isMobile
          ? (apiWebBanners?.length > 0
              ? apiWebBanners
              : desktopDefaultBanner
            )?.map((banner, index) => (
              <div key={index} className={"inplay-bg banner-card-div"}>
                <div
                  className="banner-image"
                  onClick={() => {
                    if (loggedIn) {
                      history.push(banner.redirectionUrl);
                    } else {
                      history.push("/login");
                    }
                  }}
                >
                  <img
                    src={
                      banner?.publicUrl ||
                      (index === 0 ? DepositBanner : AffiliateBanner)
                    }
                    alt={banner.title}
                  />
                </div>
              </div>
            ))
          : (apiMobBanners?.length > 0
              ? apiMobBanners
              : mobileDefaultBanner
            )?.map((banner, index) => (
              <div className={"inplay-bg banner-card-div"}>
                <div
                  className="banner-image"
                  onClick={() => {
                    if (loggedIn) {
                      history.push(banner?.redirectionUrl);
                    } else {
                      history.push("/login");
                    }
                  }}
                >
                  <img
                    src={
                      banner?.publicUrl ||
                      (index === 0
                        ? JoiningBonusMob
                        : AffiliateMobilePng2xBanner)
                    }
                    alt={banner.title}
                  />
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    loggedIn: state.auth.loggedIn,
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(App);
