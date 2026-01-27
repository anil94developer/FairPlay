import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";

import { RootState } from "../../models/RootState";
import LoadingPage from "../../pages/LoadingPage/LoadingPage";
import SVLS_API from "../../svls-api";
import "./SportsProviderIframe.scss";
import { BRAND_DOMAIN } from "../../constants/Branding";

type StoreProps = {
  gameUrl: string;
  loggedIn: boolean;
  prefersDark?: string;
};

type RouteParams = {
  gamePath: string;
};

const SportsProviderIframe: React.FC<StoreProps> = (props) => {
  const [gameSrc, setGameSrc] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { loggedIn } = props;

  const { gamePath } = useParams<RouteParams>();
  const history = useHistory();

  useEffect(() => {
    document.getElementsByClassName("router-ctn")[0].scrollIntoView();
  }, []);

  const getGameUrl = async () => {
    if (loggedIn) {
      setLoading(true);
      const claims = sessionStorage?.getItem("jwt_token")?.split(".")[1];
      const userStatus = claims ? JSON.parse(window.atob(claims))?.status : 0;

      if (userStatus === 0 || userStatus === 3) {
        return history.push(`/home`);
      }
      // Replaced API call with dummy data
      const reqBody = "desktop";
      const dummyResponse = {
        data: {
          url: "https://example.com/sports-book/lobby",
        },
      };

      if (dummyResponse.data.url) {
        const callBackUrl = `&callBackUrl=https://dev.hypexexch.com/exchange_sports/inplay`;
        // if (prefersDark === 'yellow') {
        let gameUrl = dummyResponse.data.url;
        setGameSrc(gameUrl + callBackUrl);
        // } else {
        //   setGameSrc(
        //     dummyResponse.data.url +
        //       +callBackUrl +
        //       '&primary=ED1B24&secondary=fff&background=fff&background1=231f20&textColor=000'
        //   );
        // }
      }
      setLoading(false);
      setLoading(false);
    } else {
      history.push(`/`);
    }
  };

  useEffect(() => {
    getGameUrl();
  }, []);

  return (
    <div className="ps-iframe-ctn">
      {loading ? (
        <LoadingPage />
      ) : (
        <iframe
          src={gameSrc}
          title="Sports Book"
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

export default connect(mapStateToProps)(SportsProviderIframe);
