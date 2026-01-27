import React, { lazy, useEffect } from "react";
import { connect } from "react-redux";
import { Route, useRouteMatch } from "react-router-dom";
import { Switch } from "react-router";

import { RootState } from "../../models/RootState";
import { fetchButtonVariables } from "../../store";
import { connectToWS, disconnectToWS } from "../../webSocket/webSocket";
import "./ExchangeSportsHomeView.scss";
import "../../pages/SportsProvider/SportsProviderIframe.scss";
import ExchSportsView from "./ExchangeSportsView";
const ExchInplayEventsView = lazy(
  () => import("../ExchInplayEvents/ExchInplayEventsView")
);
const ExchangeAllMarkets = lazy(() => import("./ExchangeAllMarkets"));
const MultimarketView = lazy(() => import("./MultimarketView"));
const ExchangeVirtualMarkets = lazy(() => import("./ExchangeVirtualMarkets"));

const InplayPage = lazy(
  () => import("../ExchInplayEvents/ExchInplayEventsView")
);

type StoreProps = {
  loggedIn: boolean;
  fetchButtonVariables: () => void;
  topicUrls: any;
  betFairWSConnected: boolean;
};

// Dummy button variables data
const dummyButtonVariables = [
  { label: "100", stake: 100 },
  { label: "500", stake: 500 },
  { label: "1000", stake: 1000 },
  { label: "5000", stake: 5000 },
  { label: "10000", stake: 10000 },
  { label: "25000", stake: 25000 },
];

// Dummy topic URLs
const dummyTopicUrls = {
  matchOddsBaseUrl: "https://feed.ogpanel.vip/odds-feed",
  matchOddsTopic: "/topic/betfair_match_odds_update",
  bookMakerBaseUrl: "https://feed.ogpanel.vip/odds-feed",
  bookMakerTopic: "/topic/bookmaker_update",
  fancyBaseUrl: "https://feed.ogpanel.vip/odds-feed",
  fancyTopic: "/topic/fancy_update",
  premiumBaseUrl: "https://feed.ogpanel.vip/odds-feed",
  premiumTopic: "/topic/premium_update",
};

const ExchangeSportsBook: React.FC<StoreProps> = (props) => {
  const { loggedIn, betFairWSConnected } = props;
  const { path } = useRouteMatch();

  // Use dummy data instead of API call
  useEffect(() => {
    if (loggedIn) {
      // Instead of calling API, you can dispatch dummy data directly to store
      console.log("Using dummy button variables:", dummyButtonVariables);
      // If you want to set dummy data to store, uncomment below:
      // props.fetchButtonVariables(); // This would need to be modified to accept dummy data
    }
  }, [loggedIn]);

  // Websocket handler with dummy data
  useEffect(() => {
    if (loggedIn) {
      if (betFairWSConnected) {
        disconnectToWS();
      }

      // Use dummy topic URLs
      const baseUrlsPayload = {
        matchOddsBaseUrl: dummyTopicUrls.matchOddsBaseUrl,
        bookMakerAndFancyBaseUrl: dummyTopicUrls.bookMakerBaseUrl,
        premiumBaseUrl: dummyTopicUrls.premiumBaseUrl,
      };

      console.log("Connecting to WebSocket with dummy URLs:", baseUrlsPayload);
      connectToWS(baseUrlsPayload);

      return () => {
        if (betFairWSConnected) {
          disconnectToWS();
        }
      };
    }
  }, [loggedIn]);

  return (
    <>
      <div className="ds-view-ctn">
        <div className="punter-view" id="main-content">
          <div
            className={
              path?.length > 36
                ? "sports-view-ctn sports-margin"
                : "sports-view-ctn"
            }
          >
            <Switch>
              <Route exact path={path}>
                <ExchInplayEventsView loggedIn={loggedIn} />
              </Route>
              <Route
                exact
                path={`${path}/inplay`}
                render={() => <InplayPage loggedIn={loggedIn} />}
              ></Route>
              <Route
                exact
                path={`${path}/multi-markets`}
                render={() => <MultimarketView />}
              />
              <Route
                exact
                path={`${path}/:eventType`}
                render={() => <ExchSportsView />}
              />
              <Route
                exact
                path={`${path}/:eventType/:competition`}
                render={() => <ExchSportsView />}
              />

              <Route
                exact
                path={`${path}/:eventType/:competition/:eventId/:eventInfo`}
                render={() => <ExchangeAllMarkets loggedIn={loggedIn} />}
              />

              <Route
                exact
                path={`${path}/virtuals/:eventType/:competition/:eventId/:eventInfo`}
                render={() => <ExchangeVirtualMarkets loggedIn={loggedIn} />}
              />
            </Switch>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    loggedIn: state.auth.loggedIn,
    // Use dummy topicUrls if not available in state
    topicUrls: state?.exchangeSports?.topicUrls || dummyTopicUrls,
    betFairWSConnected: state.exchangeSports.betFairWSConnected,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    // Modified to potentially use dummy data
    fetchButtonVariables: () => {
      // You can dispatch dummy data directly here
      console.log("Fetching button variables with dummy data");
      return dispatch(fetchButtonVariables());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExchangeSportsBook);
