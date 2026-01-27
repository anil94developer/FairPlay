import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import { RootState } from "../../../models/RootState";
import "./MlobbyIframeNew.scss";
import { isMobile, isIOS } from "react-device-detect";

import { enableMlobby } from "../../../store/auth/authActions";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import { KeyboardArrowDownRounded } from "@material-ui/icons";

type StoreProps = {
  gameUrl: string;
  loggedIn: boolean;
  isMolobby: boolean;
  langData: any;
};

const MlobbyIframeNew: React.FC<StoreProps> = (props) => {
  const { isMolobby, langData } = props;
  const [gameSrc, setGameSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { loggedIn } = props;

  const history = useHistory();
  const ref = useRef(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const getGameUrl = async (
    gameId: string,
    gameCode: string,
    provider: string,
    subProvider: string
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
      
      if (dummyGameUrl) {
        setGameSrc(dummyGameUrl);
        setLoading(false);
      }
    } else {
      history.push(`/`);
    }
  };

  useEffect(() => {
    const gameId = "902000";
    const gameCode = "YG-MLOBBY";
    const provider = "RG";
    const subProvider = "Yuvi Games Lobby";
    if (loggedIn) {
      setTimeout(() => {
        getGameUrl(gameId, gameCode, provider, subProvider);
      }, 3000);
    }
  }, [loggedIn]);

  const setDialogShow = (show: boolean) => {
    setShowDialog(show);
  };

  return (
    <>
      <div ref={ref} className="mlobby-main-dc d-none">
        <div
          className="mini-iframe-close-btn"
          onClick={() => {
            ref.current.classList.add("d-none");
            const routerEl = document.getElementsByClassName(
              "router-ctn"
            )[0] as HTMLElement;
            if (routerEl) {
              routerEl.style.maxHeight = "100vh";
              routerEl.style.overflowY = "auto";
            }
            document
              .getElementsByClassName("mini-casino-btn")[0]
              .classList.remove("d-none");
          }}
        >
          <KeyboardArrowDownRounded />
        </div>
        <div className="dc-iframe-ctn-mlobby">
          <iframe
            src={gameSrc}
            title={langData?.["dc_game"]}
            allowFullScreen
            sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
          ></iframe>
        </div>
      </div>

      <Dialog
        open={showDialog}
        onClose={() => setDialogShow(false)}
        aria-labelledby="form-dialog-title"
        maxWidth="xs"
      >
        <DialogTitle id="form-dialog-title">{langData?.["notice"]}</DialogTitle>
        <DialogContent>
          <div className="dc-dialog-body">
            {langData?.["you_have_to_be_logged_in_to_play"]}
          </div>
        </DialogContent>
        <DialogActions className="dc-dialog-actions">
          <Button
            onClick={() => setDialogShow(false)}
            color="primary"
            autoFocus
          >
            {langData?.["ok"]}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    gameUrl: state.common.dcGameUrl,
    loggedIn: state.auth.loggedIn,
    isMolobby: state.auth.isMolobby,
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(MlobbyIframeNew);
