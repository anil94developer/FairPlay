import {
  IonApp,
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import React, { useEffect, useState, lazy } from "react";
import { Switch } from "react-router";
import { Redirect, Route } from "react-router-dom";

import UserRoute from "../hoc/UserRoute";
import { RootState } from "../models/RootState";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";

import CloseIcon from "@material-ui/icons/Close";
import { connect, useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import "./marquee.scss";
import { BRAND_DOMAIN } from "../constants/Branding";
import { ALLOW_CASINO } from "../constants/CasinoPermission";
import { CONFIG_PERMISSIONS } from "../constants/ConfigPermission";
import { DomainConfig } from "../models/DomainConfig";
import {
  enableCommission,
  fetchBalance,
  getHouseIdFromToken,
  getParentIdFromToken,
  setAllowedConfig,
  setDomainConfig,
} from "../store";

import "./UserRouter.scss";
import { isMobile } from "react-device-detect";
import { useWindowSize } from "../hooks/useWindowSize";
import { StyledAlertBox } from "../components/Alert/AlertBox";
import Box from "@material-ui/core/Box";
import HomePage from "../pages/HomePage/Home";
import Promotions from "../pages/Promotions/Promotions";
import ApkDesktopBanner from "../assets/images/banners/apk_popup_desktop.webp";
import ApkMobileBanner from "../assets/images/banners/apk_popup_mobile.webp";

import { getAccessTokenWithRefreshToken } from "../store/auth/authActions";
import { pageViewEvent } from "../util/facebookPixelEvent";
import PromoPopup from "../assets/images/banners/login_popup.webp";
import Modal from "../components/Modal/Modal";
import CasinoV2 from "../pages/Casino/CasinoV2/CasinoV2";
import {
  isSiteUnderMaintenance,
  setMaintenanceTimer,
} from "../store/common/commonActions";
import {
  BannerObjData,
  BannerResData,
} from "../pages/Promotions/Promotions.utils";

import { isIOS } from "react-device-detect";

const MarketTermsCondi = lazy(
  () => import("../components/MarketTermsCondi/MarketTermsCondi")
);
const CasinoNew = lazy(() => import("../pages/Casino/CasinoNew/CasinoNew"));
const DashboardView = lazy(
  () => import("../pages/DashboardView/DashboardView")
);
const Affiliate = lazy(() => import("../pages/Affiliate/Affiliate"));
const AffiliateReferEarn = lazy(
  () => import("../pages/AffiliateReferEarn/Affiliate")
);
const SportsProviderIframe = lazy(
  () => import("../pages/SportsProvider/SportsProviderIframe")
);
const AccountStatement = lazy(
  () => import("../pages/AccountStatement/AccountStatement")
);
const AccountStatementEventLevelView = lazy(
  () => import("../pages/AccountStatement/AccountStatementEventLevel")
);
const CasinoIframeNew = lazy(
  () => import("../pages/Casino/CasinoIframeNew/CasinoIframeNew")
);
const Deposit = lazy(() => import("../pages/Payment/Deposit"));
const Withdrawal = lazy(() => import("../pages/Payment/Withdrawal"));
const UserPLStatement = lazy(
  () => import("../pages/UserPLStatement/UserPLStatement")
);
const MyBets = lazy(() => import("../components/MyBets/MyBetsView"));

const ButtonVariables = lazy(
  () => import("../components/ButtonVariables/ButtonVariables")
);
const ChangePassword = lazy(
  () => import("../components/ChangePassword/ChangePassword")
);
const MobileHeader = lazy(
  () => import("../components/Header/MobileHeader/MobileHeader")
);
const MyProfile = lazy(() => import("../components/MyProfile/MyProfile"));
const ResponsibleGaming = lazy(
  () => import("../components/ResponsibleGaming/ResponsibleGaming")
);
const IndianCasinoPage = lazy(
  () => import("../pages/Casino/IndianCasino/indianCasinoPage")
);
const ExchangeSportsBook = lazy(
  () => import("../pages/ExchSportsBook/ExchangeSportsBook")
);
const ResetPassword = lazy(
  () => import("../pages/ResetPassword/ResetPassword")
);
const ResponsibleGambling = lazy(
  () => import("../pages/ResponsibleGambling/ResponsibleGambling")
);
const RulesAndRegulations = lazy(
  () => import("../pages/RulesAndRegulations/RulesAndRegulations")
);
const Sitemap = lazy(() => import("../pages/Sitemap/Sitemap"));

const TransactionRequest = lazy(
  () => import("../pages/TransactionRequest/TransactionRequest")
);

const UserCommissionBySportView = lazy(
  () => import("../pages/UserCommission/UserCommissionBySportView")
);
const UserCommissionReport = lazy(
  () => import("../pages/UserCommission/UserCommissionReport")
);
const VirtualSports = lazy(
  () => import("../pages/VirtualSports/VirtualSports")
);
const SideHeader = lazy(() => import("../components/SideHeader/SideHeader"));
const BonusStatement = lazy(
  () => import("../pages/BonusStatement/BonusStatement")
);
const TurnOverStatement = lazy(
  () => import("../pages/TurnOverHistory/TurnOverStatement")
);
const DepositTurnoverReport = lazy(
  () => import("../pages/DepositTurnoverReport/DepositTurnoverReport")
);
const MyWallet = lazy(() => import("../pages/MyWallet/MyWallet"));
const GameRules = lazy(() => import("../pages/GameRules/GameRules"));
const Ledger = lazy(
  () => import("../../src/pages/AccountStatement/AccountStatementICLevel")
);
const SubHeader = lazy(() => import("../views/SubHeader/SubHeader"));

const MlobbyIframeNew = lazy(
  () => import("../pages/Casino/MlobbyIframeNew/MlobbyIframeNew")
);

const CricketBattleWidget = lazy(
  () => import("../pages/CricketBattle/CricketBattleWidget")
);

type StateProps = {
  role: string;
  allowedConfig: number;
  commissionEnabled: boolean;
  status: number;
  loggedIn: boolean;
  fetchBalance: () => void;
  setAllowedConfig: (allowedConfig: number) => void;
  setDomainConfig: (config: DomainConfig) => void;
  setEnableCommission: (commission: boolean) => void;
  balanceChanged: number;
  houseId: string;
  parentId: string;
  accountId: string;
  notificationUpdated: number;
  pushNotifWSConnection: boolean;
  langData: any;
};

const UserRouter: React.FC<StateProps> = (props) => {
  const windowSize = useWindowSize();

  const {
    role,
    allowedConfig,
    status,
    loggedIn,
    fetchBalance,
    setAllowedConfig,
    setEnableCommission,
    balanceChanged,
    houseId,
    parentId,
    accountId,
    notificationUpdated,
    pushNotifWSConnection,
    langData,
  } = props;

  let domainConfig = useSelector(
    (state: RootState) => state.common.domainConfig
  );

  const history = useHistory();
  const location = useLocation();
  const pathName = location.pathname;
  const [skins, setSkins] = useState<string[]>([]);
  const [showNotificationModal, setShowNotificationModal] =
    useState<boolean>(false);
  const [showRRModal, setShowRRModal] = useState<boolean>(false);
  const [showPromoPopup, setShowPromoPopup] = useState<boolean>(false);

  const [popupBanner, setPopupBanner] = useState<BannerObjData>();
  const [popupMobileBanner, setPopupMobileBanner] = useState<BannerObjData>();

  const [showPopup, setShowPopup] = useState(false);

  const [showApkPopup, setShowApkPopup] = useState(false);

  const bannersRes = [
    {
      id: 13462177934,
      houseId: 16,
      bannerId: "fairplay.live_popupbanner_mobile_1",
      sportsBookUrl: "fairplay.live",
      title: "Popup Banner",
      category: "popupbanner",
      deviceType: "mobile",
      level: 1,
      publicUrl:
        "https://cdn.uvwin2024.co/banners/banner__3dd72996-04d0-460a-b4d1-c50065671060.webp",
      redirectionUrl: "nourl",
      imageContent: null,
      displayContent: null,
      active: true,
    },
    {
      id: 13462177935,
      houseId: 16,
      bannerId: "fairplay.live_popupbanner_desktop_1",
      sportsBookUrl: "fairplay.live",
      title: "Popup Banner",
      category: "popupbanner",
      deviceType: "desktop",
      level: 1,
      publicUrl:
        "https://cdn.uvwin2024.co/banners/banner__1bd18461-1f08-4cf9-b4f7-24ba593ab110.webp",
      redirectionUrl: "nourl",
      imageContent: null,
      displayContent: null,
      active: true,
    },
  ];
  const getPopupBanners = async () => {
    // Use dummy data instead of API call

    if (bannersRes && bannersRes.length >= 2) {
      setPopupBanner(bannersRes.filter((b) => b.deviceType == "desktop")[0]);
      setPopupMobileBanner(
        bannersRes.filter((b) => b.deviceType == "mobile")[0]
      );
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("popup_shown")) {
      getPopupBanners();
    }
  }, []);

  const closePopup = () => {
    sessionStorage.setItem("popup_shown", "true");
    setShowPopup(false);
  };

  useEffect(() => {
    if (loggedIn && !sessionStorage.getItem("popup_shown")) {
      setShowPopup(true);
    }
  }, [loggedIn]);

  useEffect(() => {
    if (!sessionStorage.getItem("apk_popup_shown")) {
      setShowApkPopup(true);
    }
  }, []);

  const closeApkPopup = () => {
    sessionStorage.setItem("apk_popup_shown", "true");
    setShowApkPopup(false);
  };

  const [isApkAvailable, setIsApkAvailable] = useState<boolean>(false);

  useEffect(() => {
    setIsApkAvailable(!!domainConfig?.apkUrl);
  }, [domainConfig?.apkUrl]);

  const downloadApp = () => {
    const url = domainConfig.apkUrl;
    const link = document.createElement("a");
    link.href = "https://" + url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const redirectUser = () => {
    let redirectionURL = null;
    if ((allowedConfig & 31) === 0) {
      if (
        (allowedConfig & CONFIG_PERMISSIONS.sports) !== 0 &&
        pathName.includes("casino")
      ) {
        redirectionURL = "/home";
      } else if (
        (allowedConfig & CONFIG_PERMISSIONS.casino) !== 0 &&
        pathName.includes("exchange_sports")
      )
        redirectionURL = "/home";
    } else if (
      (allowedConfig & CONFIG_PERMISSIONS.casino) === 0 &&
      pathName.includes("casino")
    ) {
      redirectionURL = "/home";
    } else if (
      (allowedConfig & CONFIG_PERMISSIONS.sports) === 0 &&
      pathName.includes("exchange_sports")
    ) {
      redirectionURL = "/home";
    } else if (
      (allowedConfig & CONFIG_PERMISSIONS.indian_casino) === 0 &&
      pathName.includes("indian_casino")
    ) {
      redirectionURL = "/home";
    } else if (
      (allowedConfig & CONFIG_PERMISSIONS.live_casino) === 0 &&
      pathName.includes("/dc/")
    ) {
      redirectionURL = "/home";
    }

    if (redirectionURL) history.push(redirectionURL);
  };

  // DONT REMOVE THIS COMMENTED CODE

  const checkSiteUnderMaintenance = async () => {
    try {
      const res = await isSiteUnderMaintenance();
      if (res?.isSiteUnderMaintenance && pathName !== "/maintenance") {
        // Clear session storage only when maintenance flag is true
        sessionStorage.removeItem("aid");
        sessionStorage.removeItem("jwt_token");
        sessionStorage.removeItem("username");

        // Clear refreshToken cookie
        document.cookie =
          "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        dispatch(setMaintenanceTimer(res.downtimeTimestamp));
        history.replace("/maintenance");
      }
    } catch (error) {
      console.error("Error checking site maintenance:", error);
    }
  };

  useEffect(() => {
    redirectUser();
  }, [pathName, allowedConfig, loggedIn]);

  const closeStlDialog = () => {
    setShowNotificationModal(false);
  };

  const getAllowedConfig = async () => {
    setAllowedConfig(31);
    setEnableCommission(false);
  };

  const dispatch = useDispatch();
  useEffect(() => {
    getAllowedConfig();
    // getDomainConfig();
    if (!loggedIn) {
      dispatch(getAccessTokenWithRefreshToken());
    }
  }, [loggedIn]);

  useEffect(() => {
    if (
      !loggedIn &&
      pathName !== "/" &&
      !pathName.includes("/home") &&
      !pathName.includes("/fairplay_policy") &&
      !pathName.includes("/fairplay-terms-conditions")
    ) {
      history.replace("/login");
    }
  }, [loggedIn, pathName]);

  useEffect(() => {
    pageViewEvent();
    document?.getElementsByClassName("router-ctn")?.[0]?.scrollIntoView();
  }, [pathName]);

  useEffect(() => {
    if (loggedIn) {
      setShowPromoPopup(loggedIn);
    }
  }, [loggedIn]);

  return (
    <>
      <Box p={2}>
        <StyledAlertBox />
      </Box>
      {domainConfig?.payments &&
      !location?.hash &&
      !location?.search &&
      location?.pathname?.charAt(location?.pathname?.length - 1) === "/" ? (
        <Redirect to={location?.pathname?.slice(0, -1)} />
      ) : null}
      {status !== -1 && status === 4 ? (
        <Redirect to="/reset-password" />
      ) : status !== -1 && status === 2 ? (
        <Redirect to="/terms-and-conditions" />
      ) : role && role !== "User" ? (
        <Redirect to="/access-redirect" />
      ) : !ALLOW_CASINO &&
        (window.location.pathname.includes("/casino") ||
          window.location.pathname.includes("/dc/gamev1.1/")) ? (
        <Redirect to="/access-redirect" />
      ) : (
        <IonApp className="ion-app">
          {/* <Header></Header> */}
          {!window.location.pathname.includes("/premium_sports") &&
            !isMobile && (
              <div className="web-view">
                <SideHeader />
              </div>
            )}
          <div className="support">
            {(!isMobile || !pathName?.includes("/dc/gamev1.1/roulette")) && (
              <SubHeader skins={skins}></SubHeader>
            )}

            <IonContent>
              <IonRefresher
                slot="fixed"
                onIonRefresh={() => window.location.reload()}
              >
                <IonRefresherContent refreshingSpinner="circular"></IonRefresherContent>
              </IonRefresher>

              <div className="router-ctn">
                <Switch>
                  <Route path="/home" component={HomePage} exact={true} />
                  <Route path="/casino" component={CasinoV2} exact={true} />
                  <Route
                    path="/premium-casino"
                    component={CasinoV2}
                    exact={true}
                  />
                  <Route
                    path="/virtual_sports"
                    component={VirtualSports}
                    exact={true}
                  />

                  <Route
                    path="/indian_casino"
                    component={IndianCasinoPage}
                    exact={true}
                  />

                  <Route
                    path="/promotions"
                    component={Promotions}
                    exact={true}
                  />

                  <UserRoute
                    path="/cb"
                    component={CricketBattleWidget}
                    exact={true}
                  />

                  <Route
                    path="/premium_sports"
                    component={SportsProviderIframe}
                    exact={true}
                  />

                  <Route path="/dc" component={CasinoNew} exact={true} />
                  <Route
                    path="/resetPassword"
                    component={ResetPassword}
                    exact={true}
                  />
                  <Route
                    path="/change-password"
                    component={ChangePassword}
                    exact={true}
                  />
                  <Route
                    path="/dc/gamev1.1/:gamePath"
                    component={CasinoIframeNew}
                    exact={true}
                  />

                  <Route
                    path="/ic_account_statement"
                    component={Ledger}
                    exact={true}
                  />

                  <Route
                    path="/bonus_statement"
                    component={BonusStatement}
                    exact={true}
                  ></Route>

                  <UserRoute
                    path="/bonus/turnover_history"
                    component={TurnOverStatement}
                    exact={true}
                  ></UserRoute>

                  <UserRoute
                    path="/deposit-turnover"
                    component={DepositTurnoverReport}
                    exact={true}
                  ></UserRoute>

                  <Route
                    path="/exchange_sports"
                    render={() => <ExchangeSportsBook />}
                  ></Route>
                  <Route
                    path="/dashboard"
                    render={() => <DashboardView />}
                  ></Route>
                  <UserRoute
                    path="/account_statement"
                    component={AccountStatement}
                    exact={true}
                  ></UserRoute>
                  <UserRoute
                    path="/market_account_statement"
                    component={AccountStatementEventLevelView}
                    exact={true}
                  ></UserRoute>
                  <UserRoute
                    path="/my_bets"
                    component={MyBets}
                    exact={true}
                  ></UserRoute>
                  <UserRoute
                    path="/my_wallet"
                    component={MyWallet}
                    exact={true}
                  ></UserRoute>

                  <UserRoute
                    path="/affiliate_program"
                    component={Affiliate}
                    exact={true}
                  ></UserRoute>

                  <UserRoute
                    path="/affiliate_refer_earn"
                    component={AffiliateReferEarn}
                    exact={true}
                  ></UserRoute>

                  <UserRoute
                    path="/pl_statement"
                    component={UserPLStatement}
                    exact={true}
                  ></UserRoute>
                  <UserRoute
                    path="/commission_report"
                    component={UserCommissionReport}
                    exact={true}
                  ></UserRoute>

                  <UserRoute
                    path="/commission_report/:eventId"
                    component={UserCommissionBySportView}
                    exact={true}
                  ></UserRoute>

                  <UserRoute
                    path="/profile"
                    component={MyProfile}
                    exact={true}
                  ></UserRoute>

                  <UserRoute
                    path="/profile/:tab"
                    component={MyProfile}
                    exact={true}
                  ></UserRoute>
                  <Route
                    exact
                    path="/"
                    render={() => <Redirect to="/home" />}
                  />
                  <Route path="/rules" render={() => <RulesAndRegulations />} />
                  <Route path="/game-rules" render={() => <GameRules />} />
                  <Route
                    path="/responsible-gambling"
                    render={() => <ResponsibleGambling />}
                  />
                  <Route
                    path="/responsible-gaming"
                    render={() => (
                      <ResponsibleGaming
                        name="Responsible Gaming"
                        eventTypeID="Responsible Gaming"
                      />
                    )}
                  />
                  <Route
                    path="/about-us"
                    render={() => (
                      <ResponsibleGaming
                        name="About Us"
                        eventTypeID="About Us"
                      />
                    )}
                  />
                  <Route
                    path="/terms-conditions"
                    render={() => (
                      <ResponsibleGaming
                        name="Terms and conditions"
                        eventTypeID="Terms and conditions"
                      />
                    )}
                  />
                  <Route
                    path="/fairplay_policy"
                    render={() => (
                      <ResponsibleGaming
                        name="Policy"
                        eventTypeID="fairplay_policy"
                      />
                    )}
                  />
                  <Route
                    path="/fairplay-terms-conditions"
                    render={() => (
                      <ResponsibleGaming
                        name="Terms and conditions"
                        eventTypeID="fairplay_terms"
                      />
                    )}
                  />
                  <Route
                    path="/set-button-variables"
                    render={() => <ButtonVariables />}
                  />
                  <Route path="/sitemap" component={Sitemap} exact={true} />
                  <>
                    <UserRoute
                      path="/transaction/withdraw"
                      component={Withdrawal}
                      exact={true}
                    ></UserRoute>
                    <UserRoute
                      path="/transaction/deposit"
                      component={Deposit}
                      exact={true}
                    ></UserRoute>
                    <UserRoute
                      path="/my_transactions"
                      component={TransactionRequest}
                      exact={true}
                    ></UserRoute>
                  </>
                </Switch>
                {pathName !== "/premium_sports" && pathName !== "/profile" && (
                  <div
                    className="rules-regulations-footer"
                    onClick={() => setShowRRModal(true)}
                  >
                    <div>
                      {langData?.["rules_and_regulation_copyright_txt"]}
                    </div>
                  </div>
                )}
              </div>

              <Dialog
                open={showNotificationModal}
                onClose={closeStlDialog}
                aria-labelledby="Settlements Dialog"
                fullScreen={false}
                fullWidth={true}
                maxWidth="md"
                className="stl-dialog"
              >
                <DialogTitle className="stl-dialog-title">
                  <div className="modal-title notification-title">
                    {langData?.["notifications"]}
                  </div>
                  <IconButton
                    className="close-btn"
                    onClick={() => setShowNotificationModal(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>

                <DialogContent className="stl-dialog-content">
                  {/* <AdminNotification /> */}
                </DialogContent>
              </Dialog>
              <Dialog
                open={showRRModal}
                onClose={() => setShowRRModal(false)}
                aria-labelledby="Settlements Dialog"
                fullScreen={false}
                fullWidth={true}
                maxWidth="md"
                className="stl-dialog rules-dialog"
              >
                <DialogTitle className="stl-dialog-title">
                  <div className="title-close-icon">
                    <div className="modal-title notification-title">
                      {langData?.["rules_and_regulation_txt"]}
                    </div>
                    <IconButton
                      className="close-btn"
                      onClick={() => setShowRRModal(false)}
                    >
                      <CloseIcon className="close-icon" />
                    </IconButton>
                  </div>
                </DialogTitle>

                <DialogContent className="stl-dialog-content">
                  {<MarketTermsCondi />}
                </DialogContent>
              </Dialog>
            </IonContent>

            {windowSize.width < 720 && !pathName?.includes("/dc/gamev1.1/") && (
              <div className="mob-header">
                <MobileHeader />
              </div>
            )}

            {isMobile || isIOS ? (
              <div className="mob-view">
                <MlobbyIframeNew />
              </div>
            ) : null}

            {showPopup && popupBanner && popupMobileBanner && (
              <Modal
                open={showPopup}
                closeHandler={closePopup}
                title=""
                size="sm"
                disableFullScreen
                noTitle
                // hideCloseIcon
              >
                <img
                  src={
                    isMobile
                      ? popupMobileBanner?.publicUrl
                      : popupBanner?.publicUrl
                  }
                />
              </Modal>
            )}

            {!loggedIn && isApkAvailable && showApkPopup && (
              <Modal
                open={showApkPopup}
                closeHandler={closeApkPopup}
                title=""
                size="sm"
                disableFullScreen
                noTitle
              >
                <img
                  src={isMobile ? ApkMobileBanner : ApkDesktopBanner}
                  onClick={downloadApp}
                />
              </Modal>
            )}
          </div>
        </IonApp>
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  if (!state.auth.loggedIn) {
    return {
      role: null,
      status: -1,
      allowedConfig: state.common.allowedConfig,
      langData: state.common.langData,
    };
  }
  const jwt = state.auth?.jwtToken;
  let role: string | null = null;
  let status: number = -1;

  if (jwt && jwt.includes(".")) {
    try {
      const claim = jwt.split(".")[1];
      const decoded = JSON.parse(window.atob(claim));
      role = decoded.role ?? null;
      status = decoded.sts ?? decoded.status ?? -1;
    } catch {
      // If token is not a valid JWT or cannot be decoded, fall back to defaults.
      role = null;
      status = -1;
    }
  }

  return {
    loggedIn: state.auth.loggedIn,
    role,
    status,
    allowedConfig: state.common.allowedConfig,
    commissionEnabled: state.common.commissionEnabled,
    balanceChanged: state.common.balanceChanged,
    notificationUpdated: state.common.notificationUpdated,
    houseId: getHouseIdFromToken(),
    parentId: getParentIdFromToken(),
    accountId: sessionStorage.getItem("aid"),
    pushNotifWSConnection: state.exchangeSports.pushNotifWSConnection,
    langData: state.common.langData,
    domainConfig: state.common.domainConfig,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    fetchBalance: () => dispatch(fetchBalance()),
    setAllowedConfig: (allowedConfig: number) =>
      dispatch(setAllowedConfig(allowedConfig)),
    setDomainConfig: (config: DomainConfig) =>
      dispatch(setDomainConfig(config)),
    setEnableCommission: (commission: boolean) =>
      dispatch(enableCommission(commission)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserRouter);
