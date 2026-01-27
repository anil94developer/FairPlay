import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { useParams } from "react-router-dom";
import { RootState } from "../../../models/RootState";
import "./CasinoIframeNew.scss";
import { isMobile, isIOS } from "react-device-detect";
import LoadingPage from "../../../pages/LoadingPage/LoadingPage";
import SVLS_API from "../../../svls-api";

type StoreProps = {
  gameUrl: string;
  loggedIn: boolean;
};

type RouteParams = {
  gamePath: string;
};

const CasinoIframeNew: React.FC<StoreProps> = (props) => {
  const [gameSrc, setGameSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { loggedIn } = props;

  const { gamePath } = useParams<RouteParams>();
  const history = useHistory();

  const locationState: any = useLocation().state;

  useEffect(() => {
    document.getElementsByClassName("router-ctn")[0].scrollIntoView();
  }, []);

  const getGameUrl = async (
    gameId: string,
    gameCode: string,
    provider: string,
    subProvider: string,
    superProvider: string
  ) => {
    if (loggedIn) {
      setLoading(true);
      const claims = sessionStorage.getItem("jwt_token").split(".")[1];
      const userStatus = JSON.parse(window.atob(claims)).status;

      if (userStatus === 0 || userStatus === 3) {
        return history.push(`/home`);
      }

      // Replaced API call with dummy data
      const dummyGameUrl = "https://example.com/live-casino/game";

      if (isMobile && isIOS) {
        setLoading(false);
        // window.location.href = dummyGameUrl;
        setGameSrc(dummyGameUrl);
      } else {
        setGameSrc(dummyGameUrl);
        setLoading(false);
      }
    } else {
      history.push(`/`);
    }
  };

  useEffect(() => {
    const gameId = atob(gamePath.split("-")[gamePath.split("-").length - 5]);
    const gameCode = atob(gamePath.split("-")[gamePath.split("-").length - 4]);
    const provider = atob(gamePath.split("-")[gamePath.split("-").length - 3]);
    const subProvider = atob(
      gamePath.split("-")[gamePath.split("-").length - 2]
    );
    const superProvider = atob(
      gamePath.split("-")[gamePath.split("-").length - 1]
    );

    const gameName = locationState?.gameName;
    saveLastPlayedGameDetails({
      gameId,
      gameName,
      gameCode,
      provider,
      subProvider,
      superProvider,
    });
    getGameUrl(gameId, gameCode, provider, subProvider, superProvider);
  }, []);

  const saveLastPlayedGameDetails = (newGame) => {
    const existingGames =
      JSON.parse(localStorage.getItem("recent_games")) || [];
    if (
      existingGames.length > 0 &&
      existingGames[0].gameId === newGame.gameId
    ) {
      return;
    }
    existingGames.unshift(newGame);
    const updatedGames = existingGames.slice(0, 3);
    localStorage.setItem("recent_games", JSON.stringify(updatedGames));
  };

  return (
    <div className="dc-iframe-ctn">
      <div id="loader" className="center"></div>
      {loading ? (
        <LoadingPage />
      ) : (
        <iframe
          src={gameSrc}
          title="DC game"
          allowFullScreen
          sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
        ></iframe>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    gameUrl: state.common.dcGameUrl,
    loggedIn: state.auth.loggedIn,
  };
};

export default connect(mapStateToProps)(CasinoIframeNew);
