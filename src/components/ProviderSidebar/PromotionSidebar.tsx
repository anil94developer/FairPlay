import React, { useEffect, useState } from "react";
import Sports from "../../assets/images/promotions/sports.webp";
import FortuneWheel from "../../assets/images/promotions/fortune_wheel.webp";
import Ezugi from "../../assets/images/promotions/ezugi.webp";
import CasinoPromotion from "../../assets/images/promotions/casino_promotion.webp";
import Cricket from "../../assets/images/promotions/cricket.webp";
import Promotion from "../../assets/images/promotions/promotion.webp";
import "./PromotionSidebar.scss";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { AuthResponse } from "../../models/api/AuthResponse";
import SVLS_API from "../../svls-api";
import { BRAND_DOMAIN } from "../../constants/Branding";
import { DcGameNew } from "../../models/dc/DcGame";
import { RootState } from "../../models/RootState";
import { connect } from "react-redux";
import { isMobile } from "react-device-detect";

type PromotionProps = {
  loggedIn: boolean;
  loggedInUserStatus: any;
};

const lottieBanners = [
  // { loop: true, path: "/casino",autoplay: true, animationData: AndarBahar },
  // { loop: true, path: "/exchange_sports/cricket",autoplay: true, animationData: CricketLottie },
  // { loop: true, path: "/exchange_sports/cricket",autoplay: true, animationData: CricketLottie },
  // { loop: true, path: "/casino",autoplay: true, animationData: AndarBahar },
  // { loop: true, autoplay: true, animationData: Europe },
];

const PromotionSidebar: React.FC<PromotionProps> = (props) => {
  const { loggedIn, loggedInUserStatus } = props;
  const [apiMobBanners, setApiMobBanners] = useState([]);
  const [games, setGames] = useState<DcGameNew[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const location = useLocation().pathname;

  const history = useHistory();

  const fetchBannerData = async () => {
    let webdata = [];
    let mobiledata = [];
    let category = "";
    if (location.includes("indian_casino")) {
      category = "indiancasinobanner";
    } else if (location.includes("/casino")) {
      category = "Casinobanner";
    } else if (location.includes("cricket")) {
      category = "cricketbanner";
    } else if (location.includes("football")) {
      category = "footballbanner";
    } else if (location.includes("tennis")) {
      category = "tennisbanner";
    } else if (location.includes("horseracing")) {
      category = "horseracingbanner";
    } else if (location.includes("greyhound")) {
      category = "greyhoundbanner";
    } else if (location.includes("basketball")) {
      category = "Basketballbanner";
    } else if (location.includes("baseball")) {
      category = "Baseballbanner";
    }
    try {
      // Dummy data instead of API call
      const dummyResponse: AuthResponse = {
        data: {
          banners: [
            {
              deviceType: "mobile",
              publicUrl:
                "https://cdn.uvwin2024.co/banners/dummy-mobile-banner.webp",
              redirectionUrl: "/casino",
              title: "Promotion Banner",
            },
          ],
        },
      } as AuthResponse;
      let data = dummyResponse?.data?.banners;
      if (data?.length > 0) {
        data.map((item) => {
          if (item.deviceType === "desktop") {
            webdata.push(item);
          } else if (item.deviceType === "mobile") {
            mobiledata.push(item);
          }
        });
        //setApiWebBanners(webdata);
        setApiMobBanners(mobiledata);
      }
      if (mobiledata.length == 0) {
        setApiMobBanners([]);
      }
    } catch (err) {
      console.log(err);
      if (mobiledata.length == 0) {
        setApiMobBanners([]);
      }
      //setShowError(true);
      if (err.response && err.response.status === 400) {
        //setErrorText(err.response.data.message);
      } else {
        //setErrorText('Something went wrong');
      }
    }
  };

  useEffect(() => {
    if (!location?.includes("/inplay")) {
      fetchBannerData();
    }
  }, []);

  const casino_sidebar = [
    { link: "/casino?provider=Ezugi", img: Ezugi },
    { link: "/casino?provider=Royal%20Gaming", img: Promotion },
    { link: "/exchange_sports/basketball", img: Sports },
    { link: "/casino?provider=Evolution%20Gaming", img: CasinoPromotion },
    { link: "/casino?provider=Evolution%20Gaming", img: FortuneWheel },
    { link: "/exchange_sports/cricket", img: Cricket },
  ];

  const navigateToLink = (data) => {
    if (
      data?.redirectionUrl == "/exchange_sports/inplay" ||
      data?.redirectionUrl == "/casino" ||
      data?.redirectionUrl == "/exchange_sports/cricket" ||
      data?.redirectionUrl == "/exchange_sports/tennis" ||
      data?.redirectionUrl == "/exchange_sports/football"
    ) {
      history.push(data?.redirectionUrl);
    } else if (data?.redirectionUrl == "nourl") {
    } else {
      let url = data?.redirectionUrl;
      window.open(url, "_blank");
    }
  };

  const setDialogShow = (show: boolean) => {
    setShowDialog(show);
  };

  const getGameUrl = async (
    gameId: string,
    gameName: string,
    gameCode: string,
    provider: string,
    subProvider: string
  ) => {
    if (loggedIn) {
      // status check
      if (loggedInUserStatus === 0 || loggedInUserStatus === 3) {
        history.push(`/home`);
      }
      if (provider === "Indian Casino") {
        history.push(`/casino/indian/${gameCode}`);
      } else {
        history.push(
          `/dc/gamev1.1/${gameName?.toLowerCase().replace(/\s+/g, "-")}-${btoa(
            gameId?.toString()
          )}-${btoa(gameCode)}-${btoa(provider)}-${btoa(subProvider)}`
        );
      }
    } else {
      setDialogShow(true);
    }
  };

  return (
    <div className="promotions-sidebar-container">
      <div className="promotions-sidebar-ctn web-view">
        {isMobile && lottieBanners.length > 0 ? (
          <div className="promotions-banners">
            {lottieBanners.map((banner) => (
              <div className="banner">
                {/* <video
                  controls={false} 
                  autoPlay 
                  muted 
                  loop 
                  preload='metadata'
                  playsInline
                  disablePictureInPicture
                  src={banner?.publicUrl}
                  key={banner?.title + 'image'}
                  onClick={() => {
                    navigateToLink(banner)
                  }}
                /> */}
                <div
                  className="banner-image"
                  onClick={() => history.push(banner.path)}
                >
                  {/* <Lottie options={banner} /> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="promotions-banners"></div>
        )}
      </div>

      {/* {
        !location?.includes("casino") ?
          <TrendingGames />
          : null
      } */}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  let status = 0;
  if (state.auth.loggedIn) {
    try {
      const jwtToken = sessionStorage.getItem("jwt_token");
      if (jwtToken) {
        const tokenParts = jwtToken.split(".");
        if (tokenParts.length >= 2) {
          const decodedPayload = window.atob(tokenParts[1]);
          const parsedPayload = JSON.parse(decodedPayload);
          status = parsedPayload.status || 0;
        }
      }
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      status = 0;
    }
  }
  return {
    loggedIn: state.auth.loggedIn,
    loggedInUserStatus: status,
  };
};

export default connect(mapStateToProps, null)(PromotionSidebar);
