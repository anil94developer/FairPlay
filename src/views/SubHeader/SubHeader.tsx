import {
  Fab,
  Menu,
  Tooltip,
  Dialog,
  DialogTitle,
  useMediaQuery,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Tabs from "@material-ui/core/Tabs";
import { CancelOutlined, InfoOutlined, WhatsApp } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { connect } from "react-redux";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import WhatsupImg from "../../assets/images/footer/whatsup-flot.png";
import sidebarMobIcon from "../../assets/images/icons/mobSidebarIcon.svg";
import CustomButton from "../../common/CustomButton/CustomButton";
import SideHeader from "../../components/SideHeader/SideHeader";
import Logo from "../../assets/images/theme/title.png";
import { CONFIG_PERMISSIONS } from "../../constants/ConfigPermission";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { SPORTS_MAP } from "../../constants/ExchangeEventTypes";
import { DomainConfig } from "../../models/DomainConfig";
import { SelectedObj } from "../../models/ExchangeSportsState";
import { RootState } from "../../models/RootState";
import {
  fetchBalance,
  fetchBettingCurrency,
  getCurrencyTypeFromToken,
  logout,
  setEventType,
  setLangSelected,
  setWhatsappDetails,
  toggleDarkMode,
} from "../../store";
import { capitalizeWord, demoUser, showThemes } from "../../util/stringUtil";
import "./SubHeader.scss";
import ExposureTable from "../../components/Exposure/Exposure";
import USABET_API from "../../api-services/usabet-api";
import {
  getEnvVariable,
  WhitelabelEnvDTO,
} from "../../constants/whitelabelEnv";
import SkinIcon from "../../assets/images/common/skin-icon.svg";
import {ReactComponent as CustomerSupportIcon} from "../../assets/images/common/customer-support.svg?react";
import { ReactComponent as CasinoIcon } from "../../assets/images/sidebar/casino.svg?react";
import { ReactComponent as DimondIcon } from "../../assets/images/sidebar/dimond.svg?react";

type StoreProps = {
  allowedConfig: number;
  loggedIn: boolean;
  logout: Function;
  contentConfig: any;
  domainConfig: DomainConfig;
  bonusEnabled: boolean;
  skins: String[];
  balance: number;
  bonusRedeemed: number;
  nonCashableAmount: number;
  cashableAmount: number;
  exposure: number;
  bonus: number;
  toggleDarkMode: (val: string) => void;
  whatsappDetails: string;
  setWhatsappDetails: (details: string) => void;
  languages: string[];
  langSelected: string;
  setLangSelected: (lang: string) => void;
  langData: any;
  fetchBalance: () => void;
};

const SubHeader: React.FC<StoreProps> = (props) => {
  const {
    allowedConfig,
    loggedIn,
    contentConfig,
    domainConfig,
    bonusEnabled,
    skins,
    balance,
    bonusRedeemed,
    nonCashableAmount,
    cashableAmount,
    exposure,
    bonus,
    toggleDarkMode,
    whatsappDetails,
    setWhatsappDetails,
    languages,
    langSelected,
    setLangSelected,
    langData,
    fetchBalance,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [showWhatsapp, setShowWhatsapp] = useState<boolean>(true);
  const [showExpDetail, setShowExpDetail] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<{ username: string; fullName: string }>({
    username: "",
    fullName: "",
  });
  const history = useHistory();
  const location = useLocation();
  const isSmallScreen = useMediaQuery("(max-width:400px)");
  const [subHeaders, setSubHeaders] = useState<any>([
    {
      name: "Exchange",
      alias: "home",
      langKey: "home",
      key: false,
      exact: false,
      className: "nav-link",
      activeClassName: "active-link",
      buttonClassName: "nav-link-btn",
      icon: null,
      superScript: null,
      redirectionUrl: "/home",
      config: CONFIG_PERMISSIONS.sports,
      disable: false,
      priority: 0,
      onClick: false,
      loginRequired: true,
    },
    {
      name: "Exchange",
      alias: "Inplay",
      langKey: "inplay",
      key: false,
      exact: false,
      className: "nav-link",
      activeClassName: "active-link",
      buttonClassName: "nav-link-btn",
      icon: null,
      superScript: null,
      redirectionUrl: "/exchange_sports/inplay",
      config: CONFIG_PERMISSIONS.sports,
      disable: false,
      priority: 0,
      onClick: false,
      loginRequired: true,
    },
    {
      name: "Sportsbook",
      langKey: "sports_book",
      key: false,
      exact: false,
      className: "nav-link",
      activeClassName: "active-link",
      buttonClassName: "nav-link-btn",
      icon: null,
      superScript: null,
      redirectionUrl: "/premium_sports",
      config: CONFIG_PERMISSIONS.sports,
      disable: false,
      priority: 3,
      onClick: false,
      loginRequired: true,
    },
    {
      name: "Live Casino",
      langKey: "casino",
      key: false,
      exact: false,
      className: "nav-link",
      activeClassName: "active-link",
      buttonClassName: "nav-link-btn",
      icon: <CasinoIcon width={16} height={16} />,
      superScript: null,
      redirectionUrl: "/casino",
      config: CONFIG_PERMISSIONS.live_casino,
      disable: false,
      priority: 4,
      onClick: false,
      loginRequired: true,
    },
    {
      name: "Multi Markets",
      langKey: "multimarkets",
      key: false,
      exact: false,
      className: "nav-link",
      activeClassName: "active-link",
      buttonClassName: "nav-link-btn",
      icon: null,
      superScript: null,
      redirectionUrl: "/exchange_sports/multi-markets",
      config: CONFIG_PERMISSIONS.sports,
      disable: false,
      priority: 7,
      onClick: false,
      loginRequired: true,
    },
    {
      name: "Check Bonuses",
      langKey: "checkbonuses",
      key: false,
      exact: false,
      className: "nav-link",
      activeClassName: "check-bonus-active",
      buttonClassName: "check-bonus-btn check-bt-blink-animation",
      icon: <DimondIcon width={16} height={16} />,
      superScript: null,
      redirectionUrl: "/profile/bonus",
      disable: false,
      priority: 20,
      onClick: false,
      loginRequired: true,
    },
  ]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    var subHeadersArray = subHeaders;
    if (!bonusEnabled) {
      subHeadersArray = subHeadersArray.filter(
        (item) => item.name !== "Promotions"
      );
    } else {
      if (
        subHeadersArray.filter((item) => item.name === "Promotions").length ===
        0
      ) {
        subHeadersArray.push();
      }
    }
    contentConfig?.sub_headers.forEach((subHeader) => {
      var defaultSubHeader = subHeadersArray.filter(
        (item) => item.name.toLowerCase() === subHeader.name.toLowerCase()
      )[0];
      if (defaultSubHeader) {
        defaultSubHeader.disable = subHeader.disabled;
        defaultSubHeader.priority = subHeader.priority;
      }
    });
    subHeadersArray.sort((a, b) => a.priority - b.priority);
    setSubHeaders([...subHeadersArray.filter((elem) => !elem.disable)]);
  }, [contentConfig, bonusEnabled]);

  // Fetch balance when logged in and poll every 3 seconds
  useEffect(() => {
    if (!loggedIn || demoUser()) {
      return;
    }

    // Fetch balance immediately
    fetchBalance();

    // Set up polling every 3 seconds (3000ms)
    const balanceInterval = setInterval(() => {
      fetchBalance();
    }, 3000);

    // Cleanup interval on unmount or when logged out
    return () => {
      clearInterval(balanceInterval);
    };
  }, [loggedIn, fetchBalance]);

  // Fetch user details from API
  // useEffect(() => {
  //   const fetchUserDetails = async () => {
  //     if (!loggedIn || demoUser()) {
  //       setUserDetails({
  //         username: langData?.["demo_user"] || "Demo User",
  //         fullName: langData?.["demo_user"] || "Demo User",
  //       });
  //       return;
  //     }

  //     try {
  //       const username = sessionStorage.getItem("username");
  //       if (!username) {
  //         setUserDetails({
  //           username: "",
  //           fullName: "",
  //         });
  //         return;
  //       }

  //       // Try to fetch user profile from API
  //       try {
  //         const response = await USABET_API.post(`/user/profile`, {
  //           params: { username },
  //         });
          
  //         if (response?.data?.status === true && response?.data?.data) {
  //           const userData = response.data.data;
  //           const fullName = userData.fullName || userData.name || userData.firstName + " " + userData.lastName || username;
  //           setUserDetails({
  //             username: username,
  //             fullName: fullName,
  //           });
  //           console.log("[SubHeader] User details fetched from API:", userData);
  //         } else {
  //           // Fallback to username from sessionStorage
  //           setUserDetails({
  //             username: username,
  //             fullName: username,
  //           });
  //         }
  //       } catch (apiError) {
  //         console.warn("[SubHeader] Error fetching user profile from API, using fallback:", apiError);
  //         // Fallback to username from sessionStorage
  //         setUserDetails({
  //           username: username,
  //           fullName: username,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("[SubHeader] Error fetching user details:", error);
  //       const username = sessionStorage.getItem("username") || "";
  //       setUserDetails({
  //         username: username,
  //         fullName: username,
  //       });
  //     }
  //   };

  //   if (loggedIn) {
  //     fetchUserDetails();
  //   }
  // }, [loggedIn, langData]);

  const isAllowed = (config) => {
    return config ? (allowedConfig & config) !== 0 : true;
  };

  const isVisible = (subHeaderName: string) => {
    return subHeaderName.toLowerCase() !== "promotions" || domainConfig.bonus;
  };

  const isChangeSite = (subHeaderName: string) => {
    return subHeaderName.toLowerCase() !== "change site" || showThemes(skins);
  };

  const isBonusVisible = (subHeaderName: string) => {
    return subHeaderName.toLowerCase() !== "check bonuses" || loggedIn;
  };

  // Wrapper component to filter out invalid props from Material-UI Tabs
  const TabNavLink = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<typeof NavLink> & {
      fullWidth?: boolean;
      indicator?: any;
      selectionFollowsFocus?: boolean;
      textColor?: string;
    }
  >(({ fullWidth, indicator, selectionFollowsFocus, textColor, ...navLinkProps }, ref) => {
    return <NavLink {...navLinkProps} ref={ref} />;
  });
  TabNavLink.displayName = "TabNavLink";

  const defaultSubHeaders = subHeaders.map((value, index) => {
    if (
      isAllowed(value.config) &&
      isVisible(value.name) &&
      isChangeSite(value.name) &&
      isBonusVisible(value.name) &&
      value.loginRequired
    ) {
      return (
        <TabNavLink
          key={
            value?.key
              ? SPORTS_MAP.get(value.name).slug + index
              : value.name + index
          }
          exact={value?.exact ? value.exact : null}
          className={value.className}
          activeClassName={
            value?.activeClassName ? value.activeClassName : null
          }
          to={
            value.name !== "Sportsbook"
              ? value.redirectionUrl
              : loggedIn
              ? value.redirectionUrl
              : "/login"
          }
          onClick={
            value.onClick
              ? () => setEventType(SPORTS_MAP.get(value.name))
              : null
          }
        >
          <Button className={value.buttonClassName}>
            {value?.icon ? value.icon : null}
            {value?.icon ? "\u00a0" : null}
            {langData?.[value.langKey]}
            {value?.superScript ? value.superScript : null}
          </Button>
        </TabNavLink>
      );
    }
    return null;
  });

  const loginHandler = () => {
    history.push("/login");
  };

  const handleSideBarIconClick = () => {
    setOpenDrawer(true);
  };

  const signupHandler = () => {
    history.push("/register");
  };

  const handleLangChange = (langParam: string) => {
    sessionStorage.setItem("lang", langParam);
    setLangSelected(sessionStorage.getItem("lang"));
    window.location.reload();
  };

  const getUsername = () => {
    // Show "Demo User" immediately for demo users
    if (demoUser()) {
      return langData?.["demo_user"] || "Demo User";
    }
    // Return full name if available, otherwise username
    if (userDetails.fullName) {
      return userDetails.fullName;
    }
    return userDetails.username || sessionStorage.getItem("username") || "";
  };

  const redirectToHome = () => {
    history.push("/home");
  };

  const redirectToContact = () => {
    window.open(whatsappDetails, "_blank");
  };

  const handleSkinChange = (domain) => {
    let jwtToken = sessionStorage.getItem("jwt_token");
    sessionStorage.clear();
    window.open(`http://${domain}/login?authToken=${jwtToken}`, "_self");
  };

  return (
    <>
      <div className="app-sub-header">
        <Tabs
          value={1}
          variant="scrollable"
          scrollButtons="off"
          className="actions-list web-view"
        >
          {defaultSubHeaders}
        </Tabs>
        <div className="logo-wrapper">
          <div className="side-bar-icon-div mob-view">
            <img
              onClick={handleSideBarIconClick}
              src={sidebarMobIcon}
              alt="sidebar-icon"
              className="sb-menu-bar-icon"
            />
          </div>
          {isMobile ? (
            <button
              className="sh-website-title"
              onClick={() => redirectToHome()}
            >
              <img
                src={Logo}
                alt=""
                className="sh-website-title-img"
              />
            </button>
          ) : null}
        </div>

        <div className="whatsapp-login-signup">
          <button className="new-whatsapp web-view" onClick={redirectToContact}>
            <img src={WhatsupImg} height={28} width={28} alt="whatsapp" />
          </button>

          {loggedIn ? (
            <>
              {isMobile && (
                <NavLink
                  to={"/transaction/deposit"}
                  className="deposit-btn-wrapper"
                >
                  <div className="deposit-btn">
                    &nbsp;&nbsp;{isMobile ? "D" : langData?.["deposit"]}
                    &nbsp;&nbsp;
                  </div>
                </NavLink>
              )}

              <div className="bal-exp-btns input-tooltip">
                <Tooltip
                  enterTouchDelay={0}
                  className=" header-tooltip"
                  title={`${langData?.["cashable"]} : ${
                    balance
                      ? Math.floor(Number(cashableAmount / cFactor)).toFixed(2)
                      : 0.0
                  } ${langData?.["non_cashable"]} :${Math.floor(
                    Math.max(exposure, nonCashableAmount + bonusRedeemed)
                  )?.toFixed(2)}`}
                >
                  <InfoOutlined />
                </Tooltip>
              </div>
              <div className="bal-exp-btns">
                <div className="bal-exp-btn balance-sb">
                  {langData?.["header_balance_txt"]}:
                  {balance
                    ? Math.floor(Number(balance / cFactor)).toFixed(2)
                    : "0.00"}
                </div>
                <div
                  className="bal-exp-btn exp-underline cursor-pointer"
                  onClick={() => setShowExpDetail(true)}
                >
                  {langData?.["header_exp_txt"]}:
                  {exposure ? Number(exposure / cFactor).toFixed(2) : "0.00"}
                </div>
              </div>
              <div className="bal-exp-btns">
                <div className="bal-exp-btn username-sb">{getUsername()}</div>
                <div className="bal-exp-btn">
                  {langData?.["header_bonus_txt"]}:{" "}
                  {bonus ? Number(bonus / cFactor).toFixed(2) : "0.00"}
                </div>
              </div>
            </>
          ) : (
            <>
              <CustomButton
                className="sh-new-btn"
                text={langData?.["login"]}
                onClick={loginHandler}
                variant={1}
              />

              <CustomButton
                className="sh-new-btn"
                text={langData?.["signup"]}
                onClick={signupHandler}
                variant={2}
              />
            </>
          )}
        </div>
      </div>

      {domainConfig.whatsapp &&
        domainConfig.b2cEnabled &&
        isMobile &&
        showWhatsapp &&
        (location.pathname.includes("/home") ||
          location.pathname.includes("/inplay")) && (
          <div
            className="floating-whatsapp-btn new-whatsapp"
            onClick={redirectToContact}
          >
            <CustomerSupportIcon width={48} height={48} className="whatsapp-icon" />
            <CancelOutlined
              className="close-floating-btn"
              onClick={(e) => {
                setShowWhatsapp(false);
                e.stopPropagation();
              }}
            />
          </div>
        )}

      <Drawer
        anchor={"left"}
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <SideHeader closeHandler={() => setOpenDrawer(false)} />
      </Drawer>

      <Dialog
        open={showExpDetail}
        onClose={() => setShowExpDetail(false)}
        aria-labelledby="form-dialog-title"
        maxWidth="lg"
        fullWidth
        className="login-alert"
      >
        <DialogTitle id="form-dialog-title">
          {langData?.["exposure"]}
        </DialogTitle>
        <ExposureTable
          setShowExpDetail={setShowExpDetail}
          langData={langData}
        />
      </Dialog>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    allowedConfig: (state.common as any).allowedConfig,
    loggedIn: state.auth.loggedIn,
    domainConfig: (state.common as any).domainConfig,
    contentConfig: state.common.contentConfig,
    bonusEnabled: state.common.domainConfig.bonus,
    balance: state.auth.balanceSummary.balance,
    bonusRedeemed: state.auth.balanceSummary.bonusRedeemed,
    nonCashableAmount: state.auth.balanceSummary.nonCashableAmount,
    cashableAmount: state.auth.balanceSummary.cashableAmount,
    exposure: state.auth.balanceSummary.exposure,
    bonus: state.auth.balanceSummary.bonus,
    whatsappDetails:
      demoUser() || !state.auth.loggedIn
        ? state.common.demoUserWhatsappDetails
        : state.common.whatsappDetails,
    langSelected: state.common.langSelected,
    languages: state.common.languages,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    fetchBalance: () => dispatch(fetchBalance()),
    logout: () => dispatch(logout()),
    fetchBettingCurrency: () => dispatch(fetchBettingCurrency()),
    setEventType: (et: SelectedObj) => dispatch(setEventType(et)),
    toggleDarkMode: (val: string) => dispatch(toggleDarkMode(val)),
    setWhatsappDetails: (details: string) =>
      dispatch(setWhatsappDetails(details)),
    setLangSelected: (lang: string) => dispatch(setLangSelected(lang)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SubHeader);
