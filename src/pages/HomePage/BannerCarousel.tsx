import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { useHistory } from "react-router";
import DepositBanner from "../../assets/images/home_page/banners/joining_bonus.webp";
import JoiningBonusMob from "../../assets/images/banners/joining_bonus_mob.webp";
import AffiliateBanner from "../../assets/images/home_page/banners/affiliate.webp";
import AffiliateMobilePng2xBanner from "../../assets/images/banners/affiliate_mob.webp";
import DepositIcon from "../../assets/images/icons/depositIcon.svg";
import WithdrawIcon from "../../assets/images/icons/withdrawIcon.svg";
import { Button } from "@material-ui/core";
import { connect } from "react-redux";
import { RootState } from "../../models/RootState";
import USABET_API from "../../api-services/usabet-api";

type StateProps = {
  loggedIn: boolean;
  langData: any;
};

type BannerItem = {
  id: string | number;
  bannerId?: string;
  publicUrl: string;
  redirectionUrl: string;
  title: string;
};

const desktopDefaultBanner: BannerItem[] = [
  {
    id: "default-desktop-1",
    publicUrl: DepositBanner,
    redirectionUrl: "/transaction/deposit",
    title: "Deposit",
  },
  {
    id: "default-desktop-2",
    publicUrl: AffiliateBanner,
    redirectionUrl: "/affiliate_program",
    title: "Affiliate",
  },
];

const mobileDefaultBanner: BannerItem[] = [
  {
    id: "default-mobile-1",
    publicUrl: JoiningBonusMob,
    redirectionUrl: "/transaction/deposit",
    title: "Deposit",
  },
  {
    id: "default-mobile-2",
    publicUrl: AffiliateMobilePng2xBanner,
    redirectionUrl: "/affiliate_program",
    title: "Affiliate",
  },
];

const App: React.FC<StateProps> = (props) => {
  const { loggedIn, langData } = props;
  const history = useHistory();
  const [apiWebBanners, setApiWebBanners] = useState<BannerItem[]>([]);
  const [apiMobBanners, setApiMobBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await USABET_API.get("/content/sliders");
        if (res?.data?.status === true && Array.isArray(res?.data?.data) && res.data.data.length > 0) {
          const items: BannerItem[] = res.data.data.map((row: any) => ({
            id: row._id,
            bannerId: row.slug,
            publicUrl: row.description || "",
            redirectionUrl: "#",
            title: row.title || "",
          }));
          setApiWebBanners(items);
          setApiMobBanners(items);
        }
      } catch {
        // keep existing banners on error
      }
    };
    fetchSliders();
  }, []);

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

        <div className="banner-two-col">
          {(!isMobile
            ? (apiWebBanners?.length > 0 ? apiWebBanners : desktopDefaultBanner)
            : (apiMobBanners?.length > 0 ? apiMobBanners : mobileDefaultBanner)
          )?.map((banner, index) => (
            <div
              key={banner.id ?? banner.bannerId ?? `${isMobile ? "mobile" : "desktop"}-${index}`}
              className="inplay-bg banner-card-div"
            >
              <div
                className="banner-image"
                onClick={() => {
                  if (loggedIn) {
                    if (banner.redirectionUrl && banner.redirectionUrl !== "#") {
                      history.push(banner.redirectionUrl);
                    }
                  } else {
                    history.push("/login");
                  }
                }}
              >
                <img
                  src={
                    banner?.publicUrl ||
                    (!isMobile
                      ? (index === 0 ? DepositBanner : AffiliateBanner)
                      : (index === 0 ? JoiningBonusMob : AffiliateMobilePng2xBanner))
                  }
                  alt={banner.title}
                />
              </div>
            </div>
          ))}
        </div>
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
