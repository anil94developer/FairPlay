import React from "react";
import { connect, useSelector } from "react-redux";
import {
  NavLink,
  useHistory,
  useLocation,
  useRouteMatch,
} from "react-router-dom";
import { ReactComponent as MyBetsImg } from "../../../assets/images/icons/my-bets.svg?react";
import { ReactComponent as ProfileImg } from "../../../assets/images/icons/user.svg?react";
import { ReactComponent as CasinoImg } from "../../../assets/images/sidebar/casino.svg?react";
import { ReactComponent as HomeImg } from "../../../assets/images/sportsbook/icons/home.svg?react";
import { ReactComponent as SportsImg } from "../../../assets/images/sportsbook/icons/sports.svg?react";
import { ReactComponent as InplayImg } from "../../../assets/images/sportsbook/inplay_icon.svg?react";
import { ALLOW_CASINO } from "../../../constants/CasinoPermission";
import { CONFIG_PERMISSIONS } from "../../../constants/ConfigPermission";
import { RootState } from "../../../models/RootState";
import "./MobileHeader.scss";
import UVGamesGif from "../../../assets/images/casino/uv_games.gif";
// import MiniGameBtn from '../../../assets/images/casino/mini_games_btn.png';
// import MiniGameGif from '../../../assets/images/casino/mini_games_gif.gif';

import OneClickBetting from "../../OneClickBetting";
import { isMobile } from "react-device-detect";

type StoreProps = {
  allowedConfig: number;
  langData: any;
  oneClickBettingEnabled: boolean;
};

const MobileHeader: React.FC<StoreProps> = (props) => {
  const { allowedConfig, langData, oneClickBettingEnabled } = props;
  const path = useHistory();
  const pathName = path.location.pathname;
  const loggedIn = useSelector((state: RootState) => state.auth.loggedIn);

  const marketsPagePathMatch = useRouteMatch(
    "/:eventType/:competition/:eventId/:eventInfo"
  );

  const mlobbyBtnClick = async () => {
    if (loggedIn) {
      document
        .getElementsByClassName("mlobby-main-dc")[0]
        ?.classList.remove("d-none");
      document
        .getElementsByClassName("mini-casino-btn")[0]
        ?.classList.add("d-none");

      const routerEl = document.getElementsByClassName(
        "router-ctn"
      )[0] as HTMLElement;
      if (routerEl) {
        routerEl.style.maxHeight = "calc(100% - 250px)";
        routerEl.style.overflowY = "scroll";
      }
    } else {
      path.push("/login");
    }
  };

  // useEffect(() => {
  //   if (marketsPagePathMatch) {
  //     setShowYuvi(true);
  //   } else {
  //     setShowYuvi(false);
  //     let miniLobbyEl = document.getElementsByClassName('mlobby-main-dc')[0];
  //     if (miniLobbyEl) {
  //       miniLobbyEl.classList.add('d-none');
  //     }
  //   }
  // }, [location.pathname]);

  return (
    <>
      <a
        className="exch-mob-nav-link mlobby-main mini-casino-btn"
        onClick={() => mlobbyBtnClick()}
      >
        <div className="exch-nav-item-ctn relative">
          <img className="absolute" src={UVGamesGif} />
          {/* <img src={MiniGameGif} className="mini-games-gif absolute" /> */}
        </div>
      </a>

      {oneClickBettingEnabled &&
      isMobile &&
      pathName?.split("/")?.length >= 5 ? (
        <OneClickBetting />
      ) : null}

      <div className="exch-mob-header-ctn">
        {(allowedConfig & CONFIG_PERMISSIONS.sports) !== 0 ? (
          <>
            <NavLink
              activeClassName={
                !pathName.endsWith("/inplay") && !pathName.endsWith("/binary")
                  ? "active"
                  : null
              }
              to={`${loggedIn ? "/premium_sports" : "/login"}`}
              className="exch-mob-nav-link mob-link-btn"
            >
              <div className="exch-nav-item-ctn">
                <div className="exch-nav-item-icon sport-icon">
                  <SportsImg className="mh-img" width={26} height={26} />
                </div>
                <div className="exch-nav-item-label ">
                  {langData?.["sports_book"]}
                </div>
              </div>
            </NavLink>

            <NavLink
              activeClassName="active"
              to="/exchange_sports/inplay"
              className="exch-mob-nav-link mob-link-btn"
            >
              <div className="exch-nav-item-ctn">
                <div className="exch-nav-item-icon inplay-icon">
                  <InplayImg className="mh-img" width={28} height={28} />
                </div>
                <div className="exch-nav-item-label">
                  {langData?.["in_play"]}
                </div>
              </div>
            </NavLink>
          </>
        ) : ALLOW_CASINO ? (
          <NavLink
            activeClassName={"active"}
            to="/casino"
            className={"exch-mob-nav-link mob-link-btn"}
          >
            <div className="exch-nav-item-ctn">
              <div className="exch-nav-item-icon ">
                <CasinoImg className="mh-img" width={28} height={28} />
              </div>
              <div className="exch-nav-item-label casino-label">
                {langData?.["casino"]}
              </div>
            </div>
          </NavLink>
        ) : (
          <div className={"exch-mob-nav-link  mob-link-btn disabled"}>
            <div className="exch-nav-item-ctn">
              <div className="exch-nav-item-icon ">
                <CasinoImg className="mh-img" width={28} height={28} />
              </div>
              <div className="exch-nav-item-label casino-label">
                {langData?.["casino"]}
              </div>
            </div>
          </div>
        )}

        <NavLink
          activeClassName="active"
          to="/home"
          className="exch-mob-nav-link mob-link-btn"
        >
          <div className="exch-nav-item-ctn">
            <div className="exch-nav-item-icon home-icon">
              <HomeImg className="mh-img" width={28} height={28} />
            </div>
            <div className="exch-nav-item-label">{langData?.["home"]}</div>
          </div>
        </NavLink>

        {(allowedConfig & CONFIG_PERMISSIONS.casino) !== 0 &&
        ![8, 16, 24].includes(allowedConfig) ? (
          ALLOW_CASINO ? (
            <NavLink
              activeClassName="active"
              to="/casino"
              className={
                pathName.includes("/dc/gamev1.1/")
                  ? "active exch-mob-nav-link mob-link-btn"
                  : "exch-mob-nav-link mob-link-btn"
              }
            >
              <div className="exch-nav-item-ctn">
                <div className="exch-nav-item-icon ">
                  <CasinoImg className="mh-img" width={28} height={28} />
                </div>
                <div className="exch-nav-item-label casino-label">
                  {langData?.["casino"]}
                </div>
              </div>
            </NavLink>
          ) : (
            <div className={"exch-mob-nav-link  mob-link-btn disabled"}>
              <div className="exch-nav-item-ctn">
                <div className="exch-nav-item-icon ">
                  <CasinoImg className="mh-img" width={28} height={28} />
                </div>
                <div className="exch-nav-item-label casino-label">
                  {langData?.["casino"]}
                </div>
              </div>
            </div>
          )
        ) : (allowedConfig & CONFIG_PERMISSIONS.sports) !== 0 ? (
          <NavLink
            activeClassName="active"
            to="/my_bets"
            className="exch-mob-nav-link  mob-link-btn"
          >
            <div className="exch-nav-item-ctn">
              <div className="exch-nav-item-icon profile-icon">
                <MyBetsImg className="mh-img" width={28} height={28} />
              </div>
              <div className="exch-nav-item-label">{langData?.["my_bets"]}</div>
            </div>
          </NavLink>
        ) : null}

        <NavLink
          activeClassName="active"
          to="/dashboard"
          className="exch-mob-nav-link  mob-link-btn"
        >
          <div className="exch-nav-item-ctn">
            <div className="exch-nav-item-icon profile-icon">
              <ProfileImg className="mh-img" width={28} height={28} />
            </div>
            <div className="exch-nav-item-label">
              {langData?.["preferences"]}
            </div>
          </div>
        </NavLink>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    allowedConfig: state.common.allowedConfig,
    langData: state.common.langData,
    oneClickBettingEnabled: state.exchBetslip.oneClickBettingEnabled,
  };
};

export default connect(mapStateToProps)(MobileHeader);
