import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { IonRow, IonCol, IonIcon } from "@ionic/react";
import BmMTable from "../../components/ExchBookmakerMarketTable/ExchBookmakerMarketTable";
import MatchOddsTable from "../../components/ExchMatchOddsTable/ExchMatchOddsTable";
import { UserBet } from "../../models/UserBet";
import { RootState } from "../../models/RootState";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { PlaceBetRequest } from "../../models/BsData";
import {
  subscribeWsForEventOdds,
  subscribeWsForSecondaryMarkets,
  subscribeWsForSecondaryMatchOdds,
  unsubscribeAllWsforEvents,
  checkStompClientSubscriptions,
  disconnectToWS,
  connectToWS,
} from "../../webSocket/webSocket";
import { fetchEvent, getCurrencyTypeFromToken } from "../../store";
import "./ExchangeAllMarkets.scss";
import { isMobile } from "react-device-detect";
import { useMarketLocalState } from "../../hooks/storageHook";
import { MatchOddsDTO } from "../../models/common/MatchOddsDTO";

type T_ExchMultiMarket = {
  loggedIn: boolean;
  eventData: any;
  secondaryMatchOdds: any;
  secondaryMarkets: any;
  bmMData: any;
  fmData: any;
  eventId: string;
  seEventData: any;
  isMultiMarket: boolean;
  bets: PlaceBetRequest[];
  openBets: UserBet[];
  exposureMap: any;
  topicUrls: any;
  betFairWSConnected: boolean;
};

const ExchMultiMarket: React.FC<T_ExchMultiMarket> = (props) => {
  const {
    loggedIn,
    eventData,
    openBets,
    secondaryMatchOdds,
    secondaryMarkets,
    eventId,
    bmMData,
    fmData,
    seEventData,
    isMultiMarket,
    bets,
    exposureMap,
    topicUrls,
    betFairWSConnected,
  } = props;
  const [multiMarketData] = useMarketLocalState();

  const [matchOddsData, setMatchOddsData] = useState<MatchOddsDTO>();
  const [cFactor, setCFactor] = useState<number>(
    CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()]
  );
  const [showBooksModal, setShowBooksModal] = useState<boolean>(false);
  const [matchOddsBaseUrl, setMatchOddsBaseUrl] = useState<string>("");
  const [matchOddsTopic, setMatchOddsTopic] = useState<string>("");
  const [bookMakerBaseUrl, setBookMakerBaseUrl] = useState<string>("");
  const [bookMakerTopic, setBookMakerTopic] = useState<string>("");

  const updateMatchOddsTopic = (currentTopic, currentBaseUrl) => {
    if (
      matchOddsTopic !== currentTopic ||
      matchOddsBaseUrl !== currentBaseUrl
    ) {
      disconnectToWS();
      setMatchOddsTopic(currentTopic);
      setMatchOddsBaseUrl(currentBaseUrl);
    }
  };

  const updateBookMakerTopic = (currentTopic, currentBaseUrl) => {
    if (
      bookMakerTopic !== currentTopic ||
      bookMakerBaseUrl !== currentBaseUrl
    ) {
      disconnectToWS();
      setBookMakerTopic(currentTopic);
      setBookMakerBaseUrl(currentBaseUrl);
    }
  };

  useEffect(() => {
    unsubscribeAllWsforEvents();
  }, []);

  // Websocket handler
  useEffect(() => {
    if (loggedIn && topicUrls?.matchOddsBaseUrl) {
      if (betFairWSConnected) {
        disconnectToWS();
      }
      const baseUrlsPayload = {
        matchOddsBaseUrl: topicUrls?.matchOddsBaseUrl,
        bookMakerAndFancyBaseUrl: topicUrls?.bookMakerBaseUrl,
        premiumBaseUrl: topicUrls?.premiumBaseUrl,
      };
      connectToWS(baseUrlsPayload);

      return () => {
        if (betFairWSConnected) {
          disconnectToWS();
        }
      };
    }
  }, [loggedIn, topicUrls]);

  useEffect(() => {
    if (eventData !== null && eventData?.matchOdds) {
      setMatchOddsData(eventData.matchOdds);
    }
  }, [eventData?.eventId]);

  useEffect(() => {
    if (
      loggedIn &&
      eventData &&
      eventData?.matchOdds?.marketId &&
      topicUrls?.matchOddsTopic
    ) {
      setCFactor(CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()]);
      updateMatchOddsTopic(
        topicUrls?.matchOddsTopic,
        topicUrls?.matchOddsBaseUrl
      );
      subscribeWsForEventOdds(
        topicUrls?.matchOddsTopic,
        eventData.sportId,
        eventData.competitionId,
        eventData.eventId,
        eventData?.matchOdds?.marketId,
        eventData.providerName,
        true
      );
    }
    if (secondaryMarkets?.bookmakers?.length && topicUrls?.bookMakerTopic) {
      updateBookMakerTopic(
        topicUrls?.bookMakerTopic,
        topicUrls?.bookMakerBaseUrl
      );
      for (let itm of secondaryMarkets?.bookmakers) {
        subscribeWsForSecondaryMarkets(
          topicUrls?.bookMakerTopic,
          eventData?.eventId,
          itm.marketId,
          eventData.sportId,
          eventData.competitionId,
          true
        );
      }
    }
    if (topicUrls?.matchOddsTopic) {
      updateMatchOddsTopic(
        topicUrls?.matchOddsTopic,
        topicUrls?.matchOddsBaseUrl
      );
      for (let mo of secondaryMatchOdds) {
        subscribeWsForSecondaryMatchOdds(
          topicUrls?.matchOddsTopic,
          eventData.eventId,
          mo.marketId,
          eventData.providerName,
          eventData.sportId,
          eventData.competitionId,
          true
        );
      }
    }
  }, [
    betFairWSConnected,
    loggedIn,
    secondaryMatchOdds,
    secondaryMarkets,
    eventData?.eventId,
  ]);

  useEffect(() => {
    if (loggedIn) {
      // let refreshInterval = setInterval(() => {
      if (topicUrls?.matchOddsBaseUrl) {
        const baseUrlsPayload = {
          matchOddsBaseUrl: topicUrls?.matchOddsBaseUrl,
          bookMakerAndFancyBaseUrl: topicUrls?.bookMakerBaseUrl,
          premiumBaseUrl: topicUrls?.premiumBaseUrl,
        };
        checkStompClientSubscriptions(baseUrlsPayload);
      }
      // }, 10000);
      // return () => {
      //   clearInterval(refreshInterval);
      // };
    }
  }, []);

  const getFormattedMaxLimit = (max: number) => {
    const num = Number(max / cFactor);
    const fMax = Number(Math.floor(num / 50) * 50);
    return fMax > 999 ? Number(fMax / 1000).toFixed() + "K" : fMax.toFixed();
  };

  const getFormattedMinLimit = (min: number) => {
    const num = Number(min / cFactor);
    const fMin = Number(Math.ceil(num / 10) * 10);
    return fMin > 999 ? Number(fMin / 1000).toFixed() + "K" : fMin.toFixed();
  };

  return (
    <>
      {eventData ? (
        <>
          <div className="multi-market-eventname mob-view">
            {isMobile &&
            multiMarketData?.filter(
              (i) => i?.marketId === eventData?.matchOdds?.marketId
            ).length > 0
              ? eventData?.eventName
              : null}
          </div>
          <MatchOddsTable
            exposureMap={exposureMap ? exposureMap : null}
            loggedIn={loggedIn}
            getFormattedMinLimit={getFormattedMinLimit}
            getFormattedMaxLimit={getFormattedMaxLimit}
            eventData={eventData}
            secondaryMatchOdds={secondaryMatchOdds}
            isMultiMarket={isMultiMarket}
            fetchEvent={fetchEvent}
            marketNotifications={null}
            showMatchOdds={true}
            showSecondaryMatchOdds={true}
          />
          {secondaryMarkets?.bookmakers?.length > 0 &&
          secondaryMarkets?.bookmakers[0].runners.length > 0 ? (
            <>
              <IonRow className="eam-table-section">
                <div className="multi-market-eventname mob-view">
                  {isMobile &&
                  multiMarketData?.filter(
                    (i) =>
                      i?.marketId === secondaryMarkets?.bookmakers[0]?.marketId
                  ).length > 0
                    ? eventData?.eventName
                    : null}
                </div>
                <BmMTable
                  exposureMap={exposureMap ? exposureMap : null}
                  loggedIn={loggedIn}
                  getFormattedMinLimit={getFormattedMinLimit}
                  getFormattedMaxLimit={getFormattedMaxLimit}
                  bmMData={bmMData}
                  eventData={eventData}
                  isMultiMarket={isMultiMarket}
                  fetchEvent={fetchEvent}
                  marketNotifications={null}
                />
              </IonRow>
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
};

const mapStateToProps = (state: RootState, ownProps) => {
  const selectedEvent = state.exchangeSports.selectedEvent;
  return {
    bets: state.exchBetslip.bets,
    openBets: state.exchBetslip.openBets,
    topicUrls: state?.exchangeSports?.topicUrls,
    betFairWSConnected: state.exchangeSports.betFairWSConnected,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ExchMultiMarket);
