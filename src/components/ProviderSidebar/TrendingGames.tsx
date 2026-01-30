import React, { useEffect, useState } from "react";
import { DcGameNew } from "../../models/dc/DcGame";
import { RootState } from "../../models/RootState";
import { setTrendingGames } from "../../store/common/commonActions";
import { connect } from "react-redux";
import { getCurrencyTypeFromToken } from "../../store";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import { useHistory } from "react-router";
import ChevronRightOutlined from "@material-ui/icons/ChevronRightOutlined";
import { NavLink } from "react-router-dom";
import { Skeleton } from "@material-ui/lab";
import { casinoList } from "../../description/casinoList";

type TrendingProps = {
  trendingGames: DcGameNew[];
  loggedIn: boolean;
  loggedInUserStatus: any;
  setTrendingGames: Function;
  langData: any;
};

const TrendingGames: React.FC<TrendingProps> = (props) => {
  const {
    trendingGames,
    loggedIn,
    loggedInUserStatus,
    setTrendingGames,
    langData,
  } = props;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const history = useHistory();

  const setDialogShow = (show: boolean) => {
    setShowDialog(show);
  };

  const getGameUrl = async (
    gameId: string,
    gameName: string,
    gameCode: string,
    provider: string,
    subProvider: string,
    superProvider: string
  ) => {
    if (loggedIn) {
      // status check
      if (loggedInUserStatus === 0 || loggedInUserStatus === 3) {
        history.push(`/home`);
      }
      if (provider === "Indian Casino") {
        history.push(`/casino/indian/${gameCode}`);
      } else {
        history.push({
          pathname: `/dc/gamev1.1/${gameName
            ?.toLowerCase()
            .replace(/\s+/g, "-")}-${btoa(gameId?.toString())}-${btoa(
            gameCode
          )}-${btoa(provider)}-${btoa(subProvider)}-${btoa(superProvider)}`,
          state: { gameName },
        });
      }
    } else {
      setDialogShow(true);
    }
  };

  const getTrendingGames = () => {
    if (!casinoList || typeof casinoList !== "object") {
      console.warn("casinoList is not available");
      setTrendingGames([]);
      return;
    }

    const allGames: any[] = [];

    if (casinoList.ALL) {
      Object.keys(casinoList.ALL).forEach((category) => {
        const categoryGames = casinoList.ALL[category];
        if (Array.isArray(categoryGames)) {
          allGames.push(...categoryGames);
        }
      });
    }

    console.log("Total games found:", allGames.length);

    const filteredGames = allGames.filter((game) => game?.tag === "new_launch");

    console.log("Trending games (new_launch):", filteredGames.length);
    console.log("Sample game:", filteredGames[0]);

    setTrendingGames(filteredGames);
  };

  useEffect(() => {
    getTrendingGames();
  }, []); // Run once on mount

  const handleGameClick = async (
    gameId: string,
    gameName: string,
    gameCode: string,
    subProvider: string,
    provider?: string,
    superProvider?: string
  ) => {
    if (
      getCurrencyTypeFromToken() === 0 &&
      !(
        provider?.toLocaleLowerCase() === "ezugi" ||
        subProvider === "BetGames.TV" ||
        subProvider === "Pragmatic Play" ||
        subProvider === "Onetouch Live" ||
        subProvider === "OneTouch" ||
        provider === "RG"
      )
    ) {
      getGameUrl(
        gameId,
        gameName,
        gameCode,
        provider,
        subProvider,
        superProvider
      );
    } else {
      getGameUrl(
        gameId,
        gameName,
        gameCode,
        provider,
        subProvider,
        superProvider
      );
    }
  };

  return (
    <div className="trending-games-ctn">
      <div className="trending-game-heading">
        <div>{langData?.["trending_games"]}</div>
        <NavLink className="see-more" to={`/casino`}>
          {langData?.["see_more"]} <ChevronRightOutlined />{" "}
        </NavLink>
      </div>
      <div className="games-container">
        {trendingGames && trendingGames.length > 0
          ? trendingGames.map((game, index) => (
              <div className="trending-game-card" key={index}>
                <img
                  loading="lazy"
                  src={
                    game?.trendingThumbnail
                      ? game?.trendingThumbnail
                      : game?.urlThumb
                  }
                  alt={game?.gameName || "Game"}
                  onClick={() =>
                    handleGameClick(
                      game?.gameId,
                      game?.gameName,
                      game?.gameCode,
                      game?.subProviderName,
                      game?.providerName,
                      game?.superProviderName
                    )
                  }
                />
              </div>
            ))
          : Array.from({ length: 16 }).map((_, index) => (
              <div className="trending-game-card" key={index}>
                <Skeleton variant="rect" height={120} />
              </div>
            ))}
      </div>

      <Dialog
        open={showDialog}
        onClose={() => setDialogShow(false)}
        aria-labelledby="form-dialog-title"
        maxWidth="xs"
        className="login-alert"
      >
        <DialogTitle id="form-dialog-title">Notice</DialogTitle>
        <DialogContent>
          <div className="dc-dialog-body">
            Access required for gameplay. Please log in to proceed.
          </div>
        </DialogContent>
        <DialogActions className="dc-dialog-actions">
          <Button
            onClick={() => setDialogShow(false)}
            className="cancel-btn dialog-action-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              history.push("/login");
              setDialogShow(false);
            }}
            className="login-btn dialog-action-btn"
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>
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
    trendingGames: state.common.trendingGames,
    loggedInUserStatus: status,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setTrendingGames: (value) => dispatch(setTrendingGames(value)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrendingGames);
