import React, { lazy, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import BannerCarousel from "./BannerCarousel";
import Providers from "./ProvidersInfo";
import "./HomePage.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { connect } from "react-redux";
import { RootState } from "../../models/RootState";
import { DcGameNew } from "../../models/dc/DcGame";
import SitesInfo from "./SiteInfo";
import GamesCarousel from "./GamesCarousel";
import { AxiosResponse } from "axios";
import SVLS_API from "../../svls-api";
import { setTrendingGames } from "../../store/common/commonActions";
import { CasinoGameDTO } from "../../models/IndianCasinoState";

import { isMobile } from "react-device-detect";
import { useHistory } from "react-router";
import CheckBonusTab from "./CheckBonusTab";
import BottomTab from "./BottomTab";
import { DomainConfig } from "../../models/DomainConfig";
import {
  fetchFavEvents,
  setCompetition,
  setExchEvent,
} from "../../store/exchangeSports/exchangeSportsActions";
import { EventDTO } from "../../models/common/EventDTO";
import { FavoriteEventDTO } from "../../models/common/FavoriteEventDTO";
import { favoriteEvents } from "../../description/favoriteEvents";
import { newLaunch } from "../../description/newLaunch";
const TopMatches = lazy(() => import("./TopMatches"));

type StoreProps = {
  allowedConfig: number;
  trendingGames: DcGameNew[];
  setTrendingGames: Function;
  loggedIn: boolean;
  loggedInUserStatus: any;
  setCasinoGame: (cGame: CasinoGameDTO) => void;
  langData: any;
  domainConfig: DomainConfig;
  setCompetition: Function;
  setExchEvent: Function;
};

const HomePage: React.FC<StoreProps> = (props) => {
  const {
    allowedConfig,
    trendingGames,
    setTrendingGames,
    loggedIn,
    loggedInUserStatus,
    setCasinoGame,
    langData,
    domainConfig,
    setCompetition,
    setExchEvent,
  } = props;
  const [macGames, setMacGames] = useState<DcGameNew[]>();
  const [evolutionGames, setEvolutionGames] = useState<DcGameNew[]>();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [favouriteEvents, setFavouriteEvents] = useState<FavoriteEventDTO[]>(
    []
  );
  const [slotGames, setSlotGames] = useState<DcGameNew[]>([]);
  const history = useHistory();
  const setDialogShow = (show: boolean) => {
    setShowDialog(show);
  };

  const getGames = async () => {
    let macGames = newLaunch.filter((game) => game.tag == "recommended_games");
    let trendingGames = newLaunch.filter((game) => game.tag == "new_launch");
    let evolutionGames = newLaunch.filter(
      (game) => game.tag == "live_casino_games"
    );
    let slotGames = newLaunch.filter((game) => game.tag == "slot");

    setMacGames(macGames);
    setTrendingGames(trendingGames);
    setEvolutionGames(evolutionGames);
    setSlotGames(slotGames);
  };

  const fetchFavoruiteEvents = () => {
    setFavouriteEvents(favoriteEvents);
  };

  useEffect(() => {
    getGames();
    fetchFavoruiteEvents();
  }, []);

  return (
    <div className="home-page-ctn">
      <div className="home-container">
        <BannerCarousel />

        <CheckBonusTab
          loggedIn={loggedIn}
          langData={langData}
          bonusEnabled={domainConfig.b2cEnabled && domainConfig.bonus}
        />

        {favouriteEvents?.length > 0 && (
          <TopMatches
            favouriteEvents={favouriteEvents}
            displayHeader={langData?.["top_matches"] || "Top Matches"}
            langData={langData}
            loggedIn={loggedIn}
            setCompetition={setCompetition}
            setExchEvent={setExchEvent}
          />
        )}

        <GamesCarousel
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          trendingGames={trendingGames}
          displayHeader={langData?.["new_launch"] ?? "New Launch"}
          heading="Popular Games"
        />

        <SitesInfo
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          langData={langData}
        />
        <GamesCarousel
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          trendingGames={macGames}
          displayHeader={langData?.["recommended_games"]}
          heading="Recommended Games"
        />

        <GamesCarousel
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          trendingGames={evolutionGames}
          displayHeader={langData?.["live_casino_games"]}
          heading="Live Casino Games"
        />

        <GamesCarousel
          loggedIn={loggedIn}
          setDialogShow={setDialogShow}
          setCasinoGame={setCasinoGame}
          loggedInUserStatus={loggedInUserStatus}
          trendingGames={slotGames}
          displayHeader={langData?.["slots"] ?? "Slots"}
          heading="Slots"
        />
        <Providers langData={langData} />

        <BottomTab
          langData={langData}
          supportContacts={domainConfig.suppportContacts}
        />

        <div className="banner-container pb-0"></div>
      </div>

      <Dialog
        open={showDialog}
        onClose={() => setDialogShow(false)}
        aria-labelledby="form-dialog-title"
        maxWidth="xs"
        className="login-alert"
      >
        <DialogTitle id="form-dialog-title">{langData?.["notice"]}</DialogTitle>
        <DialogContent>
          <div className="dc-dialog-body">
            {langData?.["games_access_login_txt"]}
          </div>
        </DialogContent>
        <DialogActions className="dc-dialog-actions">
          <Button
            onClick={() => setDialogShow(false)}
            className="cancel-btn dialog-action-btn"
          >
            {langData?.["cancel"]}
          </Button>
          <Button
            onClick={() => {
              history.push("/login");
              setDialogShow(false);
            }}
            className="login-btn dialog-action-btn"
          >
            {langData?.["login"]}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  let status = 0;
  if (state.auth.loggedIn) {
    const jwtToken = sessionStorage.getItem("jwt_token");
    if (jwtToken) {
      status = JSON.parse(window.atob(jwtToken.split(".")[1])).status;
    }
  }
  return {
    loggedIn: state.auth.loggedIn,
    allowedConfig: state.common.allowedConfig,
    trendingGames: state.common.trendingGames,
    loggedInUserStatus: status,
    langData: state.common.langData,
    domainConfig: state.common.domainConfig,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setTrendingGames: (value) => dispatch(setTrendingGames(value)),
    setCompetition: (competition: any) => dispatch(setCompetition(competition)),
    setExchEvent: (event: any) => dispatch(setExchEvent(event)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
