import { IonCol, IonRow } from "@ionic/react";

import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";

import ExpandLessSharpIcon from "@material-ui/icons/ExpandLessSharp";
import moment, { lang } from "moment";
import React, { useEffect, useRef, useState } from "react";
import { isIOS } from "react-device-detect";
import { connect } from "react-redux";
import { NavLink, useHistory, useLocation, useParams } from "react-router-dom";
import ExchBetslip from "../../components/ExchBetslip/ExchBetslip";
import BmMTable from "../../components/ExchBookmakerMarketTable/ExchBookmakerMarketTable";
import FMTable from "../../components/ExchFancyMarketsTable/ExchFancyMarketsTable";
import MatchOddsTable from "../../components/ExchMatchOddsTable/ExchMatchOddsTable";
import ExchOpenBets from "../../components/ExchOpenBets/ExchOpenBets";
import CricketLiveStream from "../../components/Livestream/CricketLiveStream";
import TabPanel from "../../components/TabPanel/TabPanel";
import MatchInfo from "../../components/MatchInfo/MatchInfo";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { CashoutProgressDTO, PlaceBetRequest } from "../../models/BsData";
import FingerPoint from "../../assets/images/Hand.gif";
import {
  MarketNotification,
  SecondaryMarkets,
  SelectedObj,
} from "../../models/ExchangeSportsState";
import { RootState } from "../../models/RootState";
import { SPEventDTO } from "../../models/SPEventDTO";
import { UserBet } from "../../models/UserBet";
import { EventDTO } from "../../models/common/EventDTO";
import { MatchOddsDTO } from "../../models/common/MatchOddsDTO";
import {
  clearExchcngeBets,
  fetchBalance,
  fetchMarketNotifications,
  fetchEvent,
  fetchOpenBets,
  fetchPremiummarketsByEventId,
  getAllMarketsByEvent,
  getBookmakerMarketsByEvent,
  getCurrencyTypeFromToken,
  getHouseIdFromToken,
  getLineMarketsByEvent,
  getParentIdFromToken,
  getPremiumMarkets,
  getSecondaryMarketsByEvent,
  getSecondaryMatchOddsByEvent,
  setExchEvent,
  updateBookMakerMarkets,
  updateEventScorecard,
  getFancyMarketsByEvent,
} from "../../store";
import {
  checkStompClientSubscriptions,
  connectToBFWS,
  connectToDreamWS,
  connectToSRWS,
  disconnectToWS,
  subscribeSportRadarEventOdds,
  subscribeWsForEventOdds,
  subscribeWsForFancyMarkets,
  subscribeWsForScorecardUrl,
  subscribeWsForSecondaryMarkets,
  subscribeWsForSecondaryMatchOdds,
  unsubscribeAllWsforEvents,
} from "../../webSocket/webSocket";

import "../../theme/scorecardtheme.css";

import { Button, Checkbox } from "@material-ui/core";

import noBetsIcon from "../../assets/images/icons/no-bets-icon.svg";
import NoDataComponent from "../../common/NoDataComponent/NoDataComponent";
import TrendingGames from "../../components/ProviderSidebar/TrendingGames";
import SEO from "../../components/SEO/Seo";
import {
  BRAND_NAME,
  BRAND_DOMAIN,
  IS_NEW_SCORECARD_ENABLED,
  PROVIDER_ID,
} from "../../constants/Branding";
import { BET_TIMEOUT } from "../../constants/CommonConstants";
import { AlertDTO } from "../../models/Alert";
import { BookmakerDTO } from "../../models/common/BookmakerDTO";
import { setAlertMsg } from "../../store/common/commonActions";
import {
  addExchangeBet,
  betStatus,
  clearBetStatusResponse,
  setBettingInprogress,
  setCashoutInProgress,
  setOneClickBettingLoading,
} from "../../store/exchBetslip/exchBetslipActions";
import {
  BFToSRIdMap,
  demoUser,
  getSportLangKeyByName,
} from "../../util/stringUtil";
import {
  subscribeWsForNotifications,
  subscribeWsForNotificationsPerAdmin,
  subscribeWsForNotificationsPerAdminAllMarkets,
  unsubscribePNWsforEvents,
} from "../../webSocket/pnWebsocket";
import "./ExchangeAllMarkets.scss";
import CricketScorecard from "../../components/ScoreCard/CricketScorecard";
import WinnerMarket from "./WinnerMarket";

import { usePageVisibility } from "../../hooks/visibility.hook";
import { FancyMarketDTO } from "../../models/common/FancyMarketDTO";

import { CheckBox } from "@material-ui/icons";
import { enableOneClickBetting } from "../../store/exchBetslip/exchBetslipActions";
import OneClickBetting from "../../components/OneClickBetting";
import EventName from "../../common/EventName/EventName";
import { eventData } from "../../description/eventData";

type StoreProps = {
  selectedEvent: SelectedObj;
  eventData: EventDTO;
  bmMData: BookmakerDTO[];
  secondaryMatchOdds: MatchOddsDTO[];
  lineMarkets: MatchOddsDTO[];
  secondaryMarkets: SecondaryMarkets;
  bets: PlaceBetRequest[];
  marketNotifications: MarketNotification[];
  openBets: UserBet[];
  totalOrders: number;
  loggedIn: boolean;
  selectedEventType: { id: ""; name: ""; slug: "" };
  clearExchcngeBets: () => void;
  fetchOpenBets: (eventId: string, sportId: string) => void;
  fetchMarketNotifications: (
    sportId: string,
    competitionId: string,
    eventId: string
  ) => void;
  fetchEvent: (
    sportId: string,
    competitionId: string,
    eventId: string,
    marketTime: string
  ) => void;
  fetchPremiummarketsByEventId: (
    providerId: string,
    sportid: string,
    competitionId: string,
    eventId: string,
    marketTime: string
  ) => void;
  setExchEvent: (event: SelectedObj) => void;
  updateEventScorecard: (scorecard: any) => void;
  seEventData: SPEventDTO;
  topicUrls: any;
  houseId: string;
  parentId: string;
  accountId: string;
  triggerMarketNotifications: number;
  triggerFetchMarkets: number;
  triggerFetchOrders: number;
  triggerBetStatus: number;
  betStatusResponse: any;
  clearExchangeBets: () => void;
  setBettingInprogress: (val: boolean) => void;
  clearBetStatusResponse: () => void;
  betFairWSConnected: boolean;
  dreamWSConnected: boolean;
  sportsRadarWSConnected: boolean;
  pushNotifWSConnection: boolean;
  eventInfoProp?: any;
  setAlertMsg: Function;
  premiumMarkets: SPEventDTO;
  langData: any;
  addExchangeBet: Function;
  fmData: FancyMarketDTO[];
  oneClickBettingEnabled: boolean;
  enableOneClickBetting: Function;
  setOneClickBettingLoading: Function;
  setCashoutInProgress: Function;
  cashoutInProgress: CashoutProgressDTO;
};

type RouteParams = {
  eventType: string;
  competition: string;
  eventId: string;
  eventInfo: string;
};

const ExchAllMarkets: React.FC<StoreProps> = (props) => {
  const {
    selectedEvent,
    secondaryMatchOdds,
    secondaryMarkets,
    bets,
    marketNotifications,
    openBets,
    totalOrders,
    loggedIn,
    clearExchcngeBets,
    fetchOpenBets,
    selectedEventType,
    fetchMarketNotifications,
    fetchEvent,
    fetchPremiummarketsByEventId,
    setExchEvent,
    updateEventScorecard,
    seEventData,
    bmMData,
    topicUrls,
    houseId,
    parentId,
    accountId,
    triggerMarketNotifications,
    triggerFetchMarkets,
    triggerFetchOrders,
    triggerBetStatus,
    betStatusResponse,
    clearExchangeBets,
    setBettingInprogress,
    setOneClickBettingLoading,
    clearBetStatusResponse,
    betFairWSConnected,
    pushNotifWSConnection,
    eventInfoProp,
    setAlertMsg,
    premiumMarkets,
    langData,
    addExchangeBet,
    dreamWSConnected,
    sportsRadarWSConnected,
    fmData,
    oneClickBettingEnabled,
    enableOneClickBetting,
    setCashoutInProgress,
    cashoutInProgress,
  } = props;

  const location = useLocation();
  const isVisible = usePageVisibility();
  const routeParams = useParams<RouteParams>();
  const [tabVal, setTabVal] = useState(0);
  const [betsTabVal, setBetsTabVal] = useState(0);
  const [openBetslip, setOpenBetslip] = useState<boolean>(true);
  const [backupStreamUrl, setBackupStreamUrl] = useState<string>(null);
  const [fancyTabVal, setFancyTabVal] = useState(0);
  const [scorecardID, setScorecardID] = useState<string>("");
  const [virtualScorecard, setVirtualScorecard] = useState();
  const [cFactor, setCFactor] = useState<number>(
    CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()]
  );
  const [exposureMap, setExposureMap] = useState(new Map());
  const [matchOddsBaseUrl, setMatchOddsBaseUrl] = useState<string>("");
  const [matchOddsTopic, setMatchOddsTopic] = useState<string>("");
  const [bookMakerBaseUrl, setBookMakerBaseUrl] = useState<string>("");
  const [bookMakerTopic, setBookMakerTopic] = useState<string>("");
  const [fancyBaseUrl, setFancyBaseUrl] = useState<string>("");
  const [fancyTopic, setFancyTopic] = useState<string>("");
  const [premiumBaseUrl, setPremiumBaseUrl] = useState<string>("");
  const [premiumTopic, setPremiumTopic] = useState<string>("");
  const [enableFetchOrders, setEnableFetchOrders] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date>();
  const [fetchOpenOrders, setFetchOpenOrders] = useState<number>(null);
  const [addNewBet, setAddNewBet] = useState<boolean>(true);
  const [winnerMarketEnabled, setWinnerMarketEnabled] =
    useState<boolean>(false);
  const [srScorecardEnabled, setSrScorecardEnabled] = useState<boolean>(false);
  const intervalRef = useRef(null);
  const isFirstRender = useRef(true);
  const isFirstRenderStartTime = useRef(true);
  const isFirstRenderVisibility = useRef(true);
  const isFirstRenderFetchMarkets = useRef(true);
  const [winnerMarket, setWinnerMarket] = useState<MatchOddsDTO>();
  const [premiumIframeUrl, setPremiumIframeUrl] = useState<string>("");
  const [premiumIframeLoading, setPremiumIframeLoading] =
    useState<boolean>(false);
  const [premiumIframeFetched, setPremiumIframeFetched] =
    useState<boolean>(false);
  const [liveStreamChannelId, setLiveStreamChannelId] = useState<string>("");
  const [provider, sportId, competitionId, eventId, providerId] = atob(
    routeParams.eventInfo ? routeParams.eventInfo : ""
  ).split(":");

  const isMobile = window.innerWidth > 1120 ? false : true;

  const [recentGame, setRecentGame] = useState<any>();
  const history = useHistory();

  // score card listener to change the height of iframe to its content
  useEffect(() => {
    window.addEventListener("message", (event) => {
      const element: HTMLIFrameElement = document.getElementById(
        "frame"
      ) as HTMLIFrameElement;

      if (element !== null && element !== undefined) {
        if (event && event.data && event.data.scoreWidgetHeight) {
          element.height = event.data.scoreWidgetHeight + 12;
        }
      }
    });
  }, []);

  // to get who will win the match from matchoddsdata
  useEffect(() => {
    if (secondaryMatchOdds?.length > 0) {
      let winner = secondaryMatchOdds?.filter((market) =>
        market.marketName?.toLowerCase()?.includes("who will win the match")
      );

      if (winner?.length > 0) {
        setWinnerMarket(winner?.[0]);
      }
    }
  }, [secondaryMatchOdds]);

  useEffect(() => {
    unsubscribeAllWsforEvents();
  }, [selectedEvent]);

  useEffect(() => {
    if (!loggedIn) {
      unsubscribeAllWsforEvents();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (loggedIn && eventData) {
      setCFactor(CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()]);
      if (topicUrls?.matchOddsTopic) {
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
          false
        );
        subscribeWsForScorecardUrl("/topic/rx_score/", eventData?.eventId);
      }

      if (
        eventData.sportId === "4" ||
        eventData.sportId === "2" ||
        eventData.sportId === "1" ||
        eventData.sportId === "99990" ||
        eventData.sportId === "99994" ||
        eventData.sportId === "2378961"
      ) {
        if (secondaryMarkets?.bookmakers?.length && topicUrls?.bookMakerTopic) {
          updateBookMakerTopic(
            topicUrls?.bookMakerTopic,
            topicUrls?.bookMakerBaseUrl
          );
          for (let itm of secondaryMarkets?.bookmakers) {
            subscribeWsForSecondaryMarkets(
              topicUrls?.bookMakerTopic,
              eventData?.eventId,
              itm.marketId
            );
          }
        }
        if (secondaryMarkets?.fancyMarkets?.length && topicUrls?.fancyTopic) {
          updateFancyTopic(topicUrls?.fancyTopic, topicUrls?.fancyBaseUrl);
          subscribeWsForFancyMarkets(topicUrls?.fancyTopic, eventData?.eventId);
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
            eventData.providerName
          );
        }
      }
    }
  }, [
    betFairWSConnected,
    selectedEvent,
    loggedIn,
    secondaryMatchOdds,
    secondaryMarkets,
  ]);

  const updateMatchOddsTopic = (
    currentTopic: string,
    currentBaseUrl: string
  ) => {
    if (
      matchOddsTopic !== currentTopic ||
      matchOddsBaseUrl !== currentBaseUrl
    ) {
      disconnectToWS();
      setMatchOddsTopic(currentTopic);
      setMatchOddsBaseUrl(currentBaseUrl);
    }
  };

  const updateBookMakerTopic = (
    currentTopic: string,
    currentBaseUrl: string
  ) => {
    if (
      bookMakerTopic !== currentTopic ||
      bookMakerBaseUrl !== currentBaseUrl
    ) {
      disconnectToWS();
      setBookMakerTopic(currentTopic);
      setBookMakerBaseUrl(currentBaseUrl);
    }
  };

  const updateFancyTopic = (currentTopic: string, currentBaseUrl: string) => {
    if (fancyTopic !== currentTopic || fancyBaseUrl !== currentBaseUrl) {
      disconnectToWS();
      setFancyTopic(currentTopic);
      setFancyBaseUrl(currentBaseUrl);
    }
  };

  const updatePremiumTopic = (currentTopic: string, currentBaseUrl: string) => {
    if (premiumTopic !== currentTopic || premiumBaseUrl !== premiumBaseUrl) {
      disconnectToWS();
      setPremiumTopic(currentTopic);
      setPremiumBaseUrl(currentBaseUrl);
    }
  };

  useEffect(() => {
    if (["1", "2"].includes(eventData?.sportId)) setFancyTabVal(1);
    if (
      !secondaryMarkets?.fancyMarkets ||
      secondaryMarkets?.fancyMarkets?.length === 0
    ) {
      setFancyTabVal(1);
    } else {
      setFancyTabVal(0);
    }
  }, [secondaryMarkets]);

  useEffect(() => {
    updateEventScorecard(null);
    if (
      eventData?.eventId &&
      eventData?.sportId == "4" &&
      eventData?.providerName != "SportRadar"
    ) {
      subscribeWsForScorecardUrl("/topic/rx_score/", eventData?.eventId);
    }
  }, [eventData?.eventId]);

  useEffect(() => {
    clearExchcngeBets();
    return () => {
      setExchEvent({ id: "", name: "", slug: "" });
    };
  }, []);

  // Get new Premium fancy markets
  useEffect(() => {
    try {
      let paramSId = null;
      let paramCId = null;
      let paramEId = null;
      let paramPName = null;
      if (loggedIn) {
        const [providerName, sportId, competitionId, eventId, marketTime] =
          atob(routeParams.eventInfo ? routeParams.eventInfo : "").split(":");

        if (eventInfoProp) {
          paramSId = eventInfoProp.sportId;
          paramCId = eventInfoProp.competitionId;
          paramEId = eventInfoProp.eventId;
          paramPName = "BetFair";
        } else {
          paramSId = selectedEventType.id;
          paramCId = competitionId?.includes("_")
            ? competitionId.split("_").join(":")
            : competitionId;
          paramEId = selectedEvent?.id.includes("_")
            ? selectedEvent?.id.split("_").join(":")
            : selectedEvent?.id;
          paramPName = selectedEvent?.id.includes("_")
            ? "SportRadar"
            : "BetFair";
        }
      }
    } catch (err) {}
  }, [loggedIn, selectedEvent?.id]);

  useEffect(() => {
    if (loggedIn && enableFetchOrders && selectedEvent.id) {
      if (
        selectedEvent?.id.includes("sr_") ||
        selectedEvent?.id.includes("sr:")
      ) {
        return;
      }
      setTimeout(() => {
        let sid = selectedEvent?.id.includes("_")
          ? BFToSRIdMap[selectedEventType?.id]
          : selectedEventType?.id;
        fetchOpenBets(selectedEvent?.id, sid);
      }, 1000);
    }
  }, [loggedIn, triggerFetchOrders, fetchOpenOrders]);

  useEffect(() => {
    try {
      let paramSId = null;
      let paramCId = null;
      let paramEId = null;
      const [providerName, sportId, competitionId, eventId, marketTime] = atob(
        routeParams.eventInfo ? routeParams.eventInfo : ""
      ).split(":");
      if (eventInfoProp) {
        paramSId = eventInfoProp.sportId;
        paramCId = eventInfoProp.competitionId;
        paramEId = eventInfoProp.eventId;
      } else {
        paramSId = sportId;
        paramCId = competitionId;
        paramEId = eventId;
      }
      if (loggedIn && !backupStreamUrl && (eventId || eventInfoProp?.eventId)) {
        // fetchStreamUrl(paramSId, paramCId, paramEId);
      }
    } catch (err) {}
  }, [loggedIn, routeParams?.eventId]);

  // Fetch market prices from URL encoded param

  useEffect(() => {
    try {
      let paramSId = null;
      let paramCId = null;
      let paramEId = null;
      let paramPName = null;
      const [providerName, sportId, competitionId, eventId, marketTime] = atob(
        routeParams.eventInfo ? routeParams.eventInfo : ""
      ).split(":");

      if (eventInfoProp) {
        paramSId = eventInfoProp.sportId;
        paramCId = eventInfoProp.competitionId;
        paramEId = eventInfoProp.eventId;
      } else {
        paramSId = sportId;
        paramCId = competitionId;
        paramEId = eventId;
      }

      if (!eventId.toLowerCase().includes("sr")) {
        fetchEvent(paramSId, paramCId, paramEId, marketTime);
        fetchMarketNotifications(paramSId, paramCId, paramEId);
      }
      if (loggedIn && routeParams?.eventId && providerName !== "SportRadar") {
        setEnableFetchOrders(true);

        let sid = paramEId?.includes("_") ? BFToSRIdMap[paramSId] : paramSId;
        fetchOpenBets(paramEId, sid);
      }
      if (!eventInfoProp) {
        paramCId = competitionId.includes("_")
          ? competitionId.split("_").join(":")
          : competitionId;
        paramPName = eventId.includes("_") ? "SportRadar" : "BetFair";
        paramEId = eventId.includes("_")
          ? eventId.split("_").join(":")
          : eventId;
      }
      // fetchPremiummarketsByEventId(
      //   paramPName,
      //   paramSId,
      //   paramCId,
      //   paramEId,
      //   marketTime
      // );

      setBettingInprogress(false);
      setCashoutInProgress(null);
      setOneClickBettingLoading(false);
      if (bets[0]?.amount) {
        clearExchangeBets();
      }
      clearBetStatusResponse();
    } catch (err) {}
  }, [routeParams?.eventId]);

  useEffect(() => {
    if (isFirstRenderFetchMarkets.current) {
      isFirstRenderFetchMarkets.current = false;
      return;
    }
    if (eventData !== null) {
      fetchEvent(
        eventData?.sportId,
        eventData?.competitionId,
        eventData?.eventId,
        ""
      );
    }
  }, [triggerFetchMarkets]);

  useEffect(() => {
    if (isFirstRenderFetchMarkets.current) {
      isFirstRenderFetchMarkets.current = false;
      return;
    }
    if (eventData !== null) {
      fetchMarketNotifications(
        eventData?.sportId,
        eventData?.competitionId,
        eventData.eventId
      );
    }
  }, [triggerMarketNotifications]);

  useEffect(() => {
    // if (eventData && eventData.status === 'IN_PLAY') {
    //   setTabVal(0);
    // }
    // if (totalOrders && !isMobile) {
    //   setBetsTabVal(1);
    // } else if (totalOrders && isMobile) {
    //   setTabVal(2);
    // } else {
    setTabVal(0);
    // }
  }, [totalOrders]);

  useEffect(() => {
    if (!openBetslip && bets.length > 0) {
      setOpenBetslip(true);
    }
  }, [bets]);

  useEffect(() => {
    if (openBets?.length > 0 && !isMobile) setBetsTabVal(1);
  }, [openBets?.length]);

  useEffect(() => {
    if (bets?.length > 0) setBetsTabVal(0);
  }, [bets]);

  useEffect(() => {
    if (loggedIn && eventData?.eventId) {
      unsubscribePNWsforEvents(houseId);
      unsubscribePNWsforEvents(parentId);
      subscribeWsForNotifications(
        false,
        houseId,
        eventData?.sportId,
        eventData?.competitionId,
        eventData?.eventId
      );
      subscribeWsForNotificationsPerAdminAllMarkets(
        false,
        houseId,
        parentId,
        accountId,
        eventData?.eventId
      );
      return () => {
        unsubscribePNWsforEvents(houseId);
        unsubscribePNWsforEvents(parentId + ":" + eventData?.eventId);
        if (!window.location.pathname.includes("==")) {
          subscribeWsForNotificationsPerAdmin(
            false,
            houseId,
            parentId,
            accountId
          );
          subscribeWsForNotifications(false, houseId);
        }
      };
    }
  }, [pushNotifWSConnection, loggedIn, eventData?.eventId]);

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

  useEffect(() => {
    updateBookMakerMarkets(bmMData);
  }, [bmMData]);

  useEffect(() => {
    if (betStatusResponse === null) {
      return;
    }
    switch (betStatusResponse.status) {
      case "IN_PROGRESS": {
        setAlertMsg({
          type: "success",
          message: betStatusResponse.message,
        });
        break;
      }
      case "SUCCESS": {
        setAlertMsg({
          type: "success",
          message: betStatusResponse.message,
        });

        if (addNewBet) {
          setFetchOpenOrders(moment.now());
        }
        break;
      }
      case "FAIL": {
        setAlertMsg({
          type: "error",
          message: betStatusResponse.message,
        });
        break;
      }
    }

    setBettingInprogress(false);
    setCashoutInProgress(null);
    setOneClickBettingLoading(false);
    if (bets[0]?.amount) {
      clearExchangeBets();
    }
    clearBetStatusResponse();
  }, [betStatusResponse]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    clearInterval(intervalRef.current);
    betStatus();
  }, [triggerBetStatus]);

  useEffect(() => {
    if (isFirstRenderStartTime.current) {
      isFirstRenderStartTime.current = false;
      return;
    }

    intervalRef.current = setInterval(() => {
      betStatus();
      clearInterval(intervalRef.current);
    }, BET_TIMEOUT);

    return () => clearInterval(intervalRef.current);
  }, [startTime]);

  // Connect to websocket immediately once the user comes back to page after page has been inactive
  useEffect(() => {
    if (isFirstRenderVisibility.current) {
      isFirstRenderVisibility.current = false;
      return;
    }

    if (isVisible) {
      if (
        ((eventData?.matchOdds?.runners?.length > 0 ||
          secondaryMatchOdds?.length > 0) &&
          !betFairWSConnected) ||
        ((bmMData?.length > 0 || fmData?.length > 0) && !dreamWSConnected)
      ) {
        let paramSId = null;
        let paramCId = null;
        let paramEId = null;
        let paramPName = null;

        const [providerId, sportId, competitionId, eventId, marketTime] = atob(
          routeParams.eventInfo ? routeParams.eventInfo : ""
        ).split(":");

        paramSId = sportId;
        paramCId = competitionId;
        paramEId = eventId;
        paramPName = providerId;

        if (!eventId?.toLowerCase()?.includes("sr")) {
          fetchEvent(paramSId, paramCId, paramEId, marketTime);

          if (
            !betFairWSConnected &&
            (eventData?.matchOdds?.runners?.length > 0 ||
              secondaryMatchOdds?.length > 0)
          ) {
            connectToBFWS(topicUrls?.matchOddsBaseUrl);
          }
          if (
            !dreamWSConnected &&
            (bmMData?.length > 0 || fmData?.length > 0)
          ) {
            connectToDreamWS(topicUrls?.bookMakerBaseUrl);
          }
        }
      }
      console.log("Welcome back! Page is visible.", new Date(moment.now()));
    } else {
      console.log(
        "User switched away. Page is hidden.",
        new Date(moment.now())
      );
    }
  }, [isVisible]);

  const streamToast = () => {
    if (demoUser()) {
      errorToast("Sorry for inconvenience Use real ID to watch streaming..");
    }
  };

  const errorToast = (mess: string) => {
    setAlertMsg({
      type: "error",
      message: mess ?? "",
    });
  };

  const defaultGame = {
    gameId: "150007",
    gameName: "Andar Bahar",
    gameCode: "MAC88-XAB101",
    provider: "MAC88",
    subProvider: "Mac88 Gaming",
    superProvider: "MACHUB",
  };

  useEffect(() => {
    const games = JSON.parse(localStorage.getItem("recent_games")) || [];
    setRecentGame(games.length > 0 ? games[0] : defaultGame);
  }, [localStorage.getItem("recent_games")]);

  const redirectToCasino = () => {
    history.push({
      pathname: `/dc/gamev1.1/${recentGame?.gameName
        ?.toLowerCase()
        .replace(/\s+/g, "-")}-${btoa(recentGame?.gameId?.toString())}-${btoa(
        recentGame?.gameCode
      )}-${btoa(recentGame?.provider)}-${btoa(recentGame?.subProvider)}-${btoa(
        recentGame?.superProvider
      )}`,
      state: { gameName: recentGame?.gameName },
    });
  };

  useEffect(() => {
    return () => {
      setScorecardID(null);
      if (typeof window !== "undefined" && window?.["SIR"]) {
        try {
          window?.["SIR"]("removeWidget", ".sr-widget-1");
          const widgetContainer = document.querySelector(".sr-widget-1");
          if (widgetContainer) {
            widgetContainer.innerHTML = "";
          }
        } catch (error) {
          console.warn("Sportradar widget cleanup failed:", error);
        }
      }
    };
  }, []);

  const [clientIp, setClientIp] = useState("");

  useEffect(() => {
    if (IS_NEW_SCORECARD_ENABLED) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "SCORECARD_HEIGHT") {
          const iframe = document.getElementById("scorecard-frame");
          if (iframe) iframe.style.height = `${event.data.height}px`;
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }
  }, []);

  return (
    <div>
      <SEO
        title={BRAND_NAME}
        name={eventData?.eventName}
        description={eventData?.eventName}
        type={eventData?.eventName}
        link={""}
      />
      {eventData ||
      atob(routeParams.eventInfo).split(":")[0] === "SportRadar" ? (
        <IonRow className="eam-ctn">
          {!virtualScorecard && scorecardID ? (
            <Script
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
          (function(a,b,c,d,e,f,g,h,i){a[e]||(i=a[e]=function(){(a[e].q=a[e].q||[]).push(arguments)},i.l=1*new Date,i.o=f,
          g=b.createElement(c),h=b.getElementsByTagName(c)[0],g.async=1,g.src=d,g.setAttribute("n",e),h.parentNode.insertBefore(g,h)
          )})(window,document,"script", "https://widgets.sir.sportradar.com/8ee45b574e2781d581b0b0a133803906/widgetloader", "SIR", {
              theme: false, // using custom theme
              language: "en"
          });
          SIR("addWidget", ".sr-widget-1", "match.lmtPlus", {layout: "double", scoreboard: "extended", momentum: "extended", collapseTo: "momentum", matchId:${scorecardID}});
            `,
              }}
            />
          ) : null}
          {/* Left Side compitation section */}
          {/* <IonCol className="eam-competitions-menu-section competitions-menu-section">
            <div className="sticky-col">
              <CompetitionsMenu />
            </div>
          </IonCol> */}

          {/* Mobile stream & Openbets & scorecard */}
          <IonCol className="mob-stream-section">
            {recentGame?.gameName && (
              <div className="recent-game" onClick={redirectToCasino}>
                <img src={FingerPoint} className="finger-point" />
                <span className="recent-game-name">{recentGame?.gameName}</span>
              </div>
            )}

            <MatchInfo eventData={eventData} routeParams={routeParams} />

            {loggedIn && isMobile && (openBets?.length > 0 || eventId) ? (
              <>
                <Tabs
                  value={tabVal}
                  className="eam-all-markets-header-tabs"
                  onChange={(_, newValue) => {
                    setTabVal(newValue);
                  }}
                >
                  <Tab
                    label={langData?.["scorecard"]}
                    value={0}
                    disabled={["99990"].includes(eventData?.sportId)}
                  />
                  {(eventData?.status === "IN_PLAY" ||
                    provider === "SportRadar") && (
                    <Tab
                      label={langData?.["live_stream"]}
                      value={1}
                      disabled={
                        (!(eventData && eventData.status === "IN_PLAY") ||
                          ["99990"].includes(eventData?.sportId)) &&
                        provider !== "SportRadar"
                      }
                      onClick={streamToast}
                    />
                  )}

                  <Tab
                    label={`${langData?.["open_bets"]} (${totalOrders})`}
                    value={2}
                  />
                </Tabs>
                <TabPanel
                  value={tabVal}
                  index={0}
                  className="event-stat-mobile-ctn"
                >
                  <div>
                    {tabVal === 0 &&
                    eventData &&
                    eventData?.sportId !== "99990" &&
                    eventData?.matchOdds ? (
                      <>
                        <Accordion
                          className="scorecard-accordion"
                          defaultExpanded={true}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ExpandLessSharpIcon className="expand-icon" />
                            }
                            aria-controls="panel1a-content"
                            className="scorecard-header"
                          >
                            {langData?.["live_score"]}
                          </AccordionSummary>
                          <AccordionDetails className="scorecard-detail">
                            <div className="widgets">
                              <div>
                                {eventData &&
                                eventData?.sportId == "4" &&
                                eventData?.providerName != "SportRadar" &&
                                !srScorecardEnabled ? (
                                  <CricketScorecard />
                                ) : IS_NEW_SCORECARD_ENABLED ? (
                                  <iframe
                                    title="sr-scorecard"
                                    id="scorecard-frame"
                                    allowFullScreen={false}
                                    src={`https://play.winadda.co.in/?sportId=${eventData?.sportId}&eventId=${eventData?.eventId}`}
                                    sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
                                  ></iframe>
                                ) : (
                                  <div className="sr-widget sr-widget-1"></div>
                                )}
                              </div>
                            </div>
                          </AccordionDetails>
                        </Accordion>
                      </>
                    ) : null}
                  </div>
                </TabPanel>
                <TabPanel
                  value={tabVal}
                  index={1}
                  className="eam-header-tab-panel"
                >
                  {tabVal === 1 ? (
                    <>
                      <div className="live-stream-ctn">
                        {/* {eventData.sportId === '4' ? ( */}
                        <CricketLiveStream
                          eventID={
                            eventData?.sportId === "99994"
                              ? secondaryMarkets?.bookmakers?.length > 0
                                ? eventData?.eventId
                                : "sr:match:" + scorecardID
                              : eventData?.matchOdds?.runners?.length === 0 &&
                                secondaryMarkets?.bookmakers?.length > 0 &&
                                premiumMarkets?.markets?.matchOdds.length > 0
                              ? "sr:match:" + scorecardID
                              : eventData?.eventId
                          }
                          providerUrl={backupStreamUrl}
                          channelId={
                            eventData?.liveStreamChannelId
                              ? eventData?.liveStreamChannelId
                              : liveStreamChannelId
                          }
                          clientIp={clientIp}
                        />
                      </div>
                    </>
                  ) : null}
                </TabPanel>
                <TabPanel
                  value={tabVal}
                  index={2}
                  className="event-stat-mobile-ctn"
                >
                  {openBets.length > 0 && loggedIn ? (
                    <ExchOpenBets />
                  ) : (
                    <>
                      <div className="no-bet-data mob-open-bets-ctn">
                        {langData?.["no_open_bets_txt"]}
                      </div>
                    </>
                  )}
                  <div className="btn-background">
                    <div className="btn-mybets">
                      <NavLink to="/my_bets">
                        <Button>{langData?.["view_all"]}</Button>
                      </NavLink>
                    </div>
                  </div>
                </TabPanel>
              </>
            ) : null}
          </IonCol>

          <IonCol
            className="eam-events-table-section"
            style={
              oneClickBettingEnabled && !isMobile
                ? { marginBottom: "50px" }
                : {}
            }
          >
            {!isMobile && recentGame?.gameName && (
              <div className="recent-game" onClick={redirectToCasino}>
                <img src={FingerPoint} className="finger-point" />
                <span className="recent-game-name">{recentGame?.gameName}</span>
              </div>
            )}

            <MatchInfo eventData={eventData} routeParams={routeParams} />

            {loggedIn &&
            !isMobile &&
            !["7", "4339", "99990"].includes(eventData?.sportId) ? (
              <Accordion className="scorecard-accordion" defaultExpanded={true}>
                <AccordionSummary
                  expandIcon={<ExpandLessSharpIcon className="expand-icon" />}
                  aria-controls="panel1a-content"
                  className="scorecard-header"
                >
                  {langData?.["live_score"]}
                </AccordionSummary>
                <AccordionDetails className="scorecard-detail">
                  <div className="widgets">
                    <div>
                      {eventData &&
                      eventData?.sportId == "4" &&
                      eventData?.providerName != "SportRadar" &&
                      !srScorecardEnabled ? (
                        <CricketScorecard />
                      ) : IS_NEW_SCORECARD_ENABLED ? (
                        <iframe
                          title="sr-scorecard"
                          id="scorecard-frame"
                          allowFullScreen={false}
                          src={`https://play.winadda.co.in/?sportId=${eventData?.sportId}&eventId=${eventData?.eventId}`}
                          sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
                        ></iframe>
                      ) : (
                        <div className="sr-widget sr-widget-1"></div>
                      )}
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            ) : null}

            {/* temporary condition - because of showing odds for premium in events page match odds are being shown */}
            {eventData &&
            eventData?.providerName?.toLowerCase() !== "sportradar" ? (
              <IonRow className="eam-table-section">
                <MatchOddsTable
                  exposureMap={exposureMap ? exposureMap : null}
                  loggedIn={loggedIn}
                  getFormattedMinLimit={getFormattedMinLimit}
                  getFormattedMaxLimit={getFormattedMaxLimit}
                  eventData={eventData}
                  fetchEvent={fetchEvent}
                  marketNotifications={marketNotifications}
                  secondaryMatchOdds={[]}
                  setBetStartTime={(date) => setStartTime(date)}
                  setAddNewBet={(val) => setAddNewBet(val)}
                  showMatchOdds={true}
                  showSecondaryMatchOdds={false}
                />
              </IonRow>
            ) : null}

            {eventData &&
            secondaryMarkets?.bookmakers?.length > 0 &&
            secondaryMarkets?.bookmakers[0]?.runners?.length > 0 ? (
              <>
                <IonRow className="eam-table-section">
                  <BmMTable
                    loggedIn={loggedIn}
                    getFormattedMinLimit={getFormattedMinLimit}
                    getFormattedMaxLimit={getFormattedMaxLimit}
                    bmMData={bmMData}
                    eventData={eventData}
                    exposureMap={exposureMap ? exposureMap : null}
                    fetchEvent={fetchEvent}
                    marketNotifications={marketNotifications}
                    setBetStartTime={(date) => setStartTime(date)}
                    setAddNewBet={(val) => setAddNewBet(val)}
                  />
                </IonRow>
              </>
            ) : null}

            {eventData &&
            eventData?.providerName?.toLowerCase() !== "sportradar" ? (
              <IonRow className="eam-table-section">
                <MatchOddsTable
                  exposureMap={exposureMap ? exposureMap : null}
                  loggedIn={loggedIn}
                  getFormattedMinLimit={getFormattedMinLimit}
                  getFormattedMaxLimit={getFormattedMaxLimit}
                  eventData={eventData}
                  fetchEvent={fetchEvent}
                  marketNotifications={marketNotifications}
                  secondaryMatchOdds={secondaryMatchOdds?.filter(
                    (i) => i.marketName !== "Tied Match"
                  )}
                  setBetStartTime={(date) => setStartTime(date)}
                  setAddNewBet={(val) => setAddNewBet(val)}
                  showMatchOdds={false}
                  showSecondaryMatchOdds={true}
                />
              </IonRow>
            ) : null}

            {eventData && winnerMarket?.marketName ? (
              <WinnerMarket
                winnerMarket={winnerMarket}
                addExchangeBet={addExchangeBet}
                eventData={eventData}
                bets={bets}
                exposureMap={exposureMap}
                marketNotifications={marketNotifications}
                setStartTime={(date) => setStartTime(date)}
                setAddNewBet={(val) => setAddNewBet(val)}
              />
            ) : null}

            <IonRow className="eam-table-section fancy-tab-section">
              <>
                <Tabs
                  value={fancyTabVal}
                  className="fancy-market-tabs"
                  onChange={(_, newValue) => {
                    setFancyTabVal(newValue);
                  }}
                >
                  {secondaryMarkets?.fancyMarkets?.length > 0 ? (
                    <Tab
                      label={langData?.["fancy"]}
                      className="fancy-tab"
                      value={0}
                    />
                  ) : null}
                  {!["99990", "2378961"].includes(eventData?.sportId) ? (
                    <Tab
                      label={langData?.["premium"]}
                      className="fancy-tab premium-markets"
                      value={1}
                    />
                  ) : null}
                </Tabs>
                <div className="fancy-tab-border"></div>
                <IonRow>
                  <TabPanel
                    value={fancyTabVal}
                    index={0}
                    className="fancy-tab-ctn"
                  >
                    {eventData && secondaryMarkets?.fancyMarkets?.length > 0 ? (
                      <>
                        <FMTable
                          loggedIn={loggedIn}
                          getFormattedMinLimit={getFormattedMinLimit}
                          getFormattedMaxLimit={getFormattedMaxLimit}
                          exposureMap={exposureMap ? exposureMap : null}
                          fetchEvent={fetchEvent}
                          marketNotifications={marketNotifications}
                          setBetStartTime={(date) => setStartTime(date)}
                          setAddNewBet={(val) => setAddNewBet(val)}
                        />
                      </>
                    ) : null}
                  </TabPanel>

                  <IonRow className="row-100">
                    {" "}
                    <TabPanel
                      value={fancyTabVal}
                      index={1}
                      className="fancy-tab-ctn premium-iframe-container"
                    >
                      {!["99990", "2378961"].includes(eventData?.sportId) ? (
                        <>
                          {premiumIframeLoading ? (
                            <div className="no-fancy-msg">
                              {langData?.["loading"] || "Loading..."}
                            </div>
                          ) : premiumIframeUrl ? (
                            <iframe
                              src={premiumIframeUrl}
                              className="premium-iframe"
                              title="Premium Markets"
                              sandbox="allow-same-origin allow-forms allow-scripts allow-top-navigation allow-popups"
                            />
                          ) : (
                            <div className="no-fancy-msg">
                              {langData?.["premium_markets_not_found_txt"]}
                            </div>
                          )}
                        </>
                      ) : null}
                    </TabPanel>
                  </IonRow>
                </IonRow>
              </>
            </IonRow>

            {eventData &&
            eventData?.providerName?.toLowerCase() !== "sportradar" ? (
              <IonRow className="eam-table-section mb-40">
                <MatchOddsTable
                  exposureMap={exposureMap ? exposureMap : null}
                  loggedIn={loggedIn}
                  getFormattedMinLimit={getFormattedMinLimit}
                  getFormattedMaxLimit={getFormattedMaxLimit}
                  eventData={eventData}
                  fetchEvent={fetchEvent}
                  marketNotifications={marketNotifications}
                  secondaryMatchOdds={secondaryMatchOdds?.filter(
                    (i) => i.marketName === "Tied Match"
                  )}
                  setBetStartTime={(date) => setStartTime(date)}
                  setAddNewBet={(val) => setAddNewBet(val)}
                  showMatchOdds={false}
                  showSecondaryMatchOdds={true}
                />
              </IonRow>
            ) : null}

            {secondaryMatchOdds?.length === 0 &&
              secondaryMarkets?.bookmakers?.length === 0 &&
              secondaryMarkets?.fancyMarkets?.length === 0 && (
                <NoDataComponent
                  title={langData?.["markets_not_found_txt"]}
                  bodyContent={""}
                  noDataImg={undefined}
                />
              )}

            {isMobile && !oneClickBettingEnabled && (
              <div className="one-click-betting-container">
                <div className="one-click-betting-text">
                  <Checkbox
                    color="primary"
                    onClick={() =>
                      enableOneClickBetting(!oneClickBettingEnabled)
                    }
                    checked={oneClickBettingEnabled}
                  />{" "}
                  {langData?.["oneClickBettingEnabled"]}
                </div>
              </div>
            )}
          </IonCol>

          {!isMobile ? (
            <IonCol className="stream-section">
              <div className="sticky-col">
                {loggedIn &&
                ((eventData &&
                  (eventData.status === "IN_PLAY" ||
                    eventData.status === "SUSPENDED")) ||
                  provider === "SportRadar") &&
                !["99990"].includes(sportId) ? (
                  <div className="stream-accordion">
                    <div className="stream-header" onClick={streamToast}>
                      {langData?.["live_stream"]}
                    </div>
                    <div className="stream-body">
                      {/* {streamAccordion ? (
                        <> */}
                      <div className="live-stream-ctn">
                        <CricketLiveStream
                          eventID={
                            eventData?.sportId === "99994"
                              ? secondaryMarkets?.bookmakers?.length > 0
                                ? eventData?.eventId
                                : "sr:match:" + scorecardID
                              : eventData?.matchOdds?.runners?.length === 0 &&
                                secondaryMarkets?.bookmakers?.length > 0 &&
                                premiumMarkets?.markets?.matchOdds.length > 0
                              ? "sr:match:" + scorecardID
                              : eventData?.eventId
                          }
                          providerUrl={backupStreamUrl}
                          channelId={
                            eventData?.liveStreamChannelId
                              ? eventData?.liveStreamChannelId
                              : liveStreamChannelId
                          }
                          clientIp={clientIp}
                        />
                      </div>
                      {/* </>
                      ) : null} */}
                    </div>
                  </div>
                ) : null}

                <div
                  className="one-click-betting-container"
                  style={{ marginBottom: "10px" }}
                >
                  <div className="one-click-betting-text">
                    <Checkbox
                      color="primary"
                      onClick={() =>
                        enableOneClickBetting(!oneClickBettingEnabled)
                      }
                      checked={oneClickBettingEnabled}
                    />{" "}
                    {langData?.["oneClickBettingEnabled"]}
                  </div>
                </div>

                <div className="bet-slip-open-bets-ctn">
                  <div className="betslip-container">
                    <div className="betslip-bg">
                      <div
                        className={`betslip-text ${
                          betsTabVal === 0 ? "selected" : ""
                        }`}
                        onClick={() => setBetsTabVal(0)}
                      >
                        {langData?.["bet_slip"]}
                      </div>
                      <div
                        className={`betslip-text ${
                          betsTabVal === 1 ? "selected" : ""
                        }`}
                        onClick={() => setBetsTabVal(1)}
                      >
                        ({langData?.["open_bets"]}) ({totalOrders})
                      </div>
                    </div>
                  </div>

                  <TabPanel
                    value={betsTabVal}
                    index={0}
                    className="event-stat-mobile-ctn"
                  >
                    {!oneClickBettingEnabled && bets.length > 0 && !isMobile ? (
                      <ExchBetslip
                        setBetStartTime={(date) => setStartTime(date)}
                        setAddNewBet={(val) => setAddNewBet(val)}
                      />
                    ) : (
                      <div className="no-bets-div">
                        <div className="no-bets-icon-div">
                          <img src={noBetsIcon} />
                        </div>

                        <div className="no-bet-data">
                          {langData?.["no_bet_placed_txt"]}
                        </div>
                      </div>
                    )}
                  </TabPanel>
                  <TabPanel
                    value={betsTabVal}
                    index={1}
                    className="event-stat-mobile-ctn"
                  >
                    {/* <div className="btn-background">
                      <div className="btn-mybets">
                        <NavLink to="/my_bets">
                          <Button>View All</Button>
                        </NavLink>
                      </div>
                    </div> */}
                    {openBets.length > 0 && loggedIn ? (
                      <ExchOpenBets />
                    ) : (
                      <>
                        <div className="no-bets-div">
                          <div className="no-bets-icon-div">
                            <img src={noBetsIcon} />
                          </div>
                          <div className="no-bet-data">
                            {langData?.["no_bet_placed_txt"]}
                          </div>
                        </div>
                      </>
                    )}
                  </TabPanel>

                  {/* <div className="all-markets-promotions web-view">
                  <PromotionSidebar />
                </div> */}
                </div>
                {!isMobile && (
                  <div className="mt-10">
                    <TrendingGames langData={langData} />
                  </div>
                )}
              </div>
            </IonCol>
          ) : null}
        </IonRow>
      ) : null}

      {oneClickBettingEnabled && !isMobile ? (
        <div
          style={{
            position: "fixed",
            bottom: "36px",
            zIndex: 1000,
            width: "calc(100% - 525px)",
          }}
        >
          <OneClickBetting />
        </div>
      ) : null}

      {/* WEB - Right sdie section(Stream & Betslip ) */}
      {bets.length > 0 ? (
        <div
          className={
            isIOS
              ? "betslip-section ios-betslip mob-betslip-section"
              : "betslip-section mob-betslip-section"
          }
        >
          {/* <Accordion
            className="stream-accordion"
            expanded={openBetslip}
            onChange={(_, expanded) => {
              setIsExpanded(expanded);
            }}
          >
            <AccordionSummary
              expandIcon={
                <>
                  <div onClick={() => handleExpand(isExpanded)}>
                    <ExpandMoreIcon className="expand-icon expand-icon-dup" />
                  </div>
                </>
              }
              aria-controls="panel1a-content"
              className="stream-header"
            >
              <div className="betslip-bg">
                <div
                  className={`betslip-text ${tabVal === 0 ? 'selected' : ''}`}
                  onClick={() => handleTabChange(0)}
                >
                  Bet Slip
                </div>
                <div
                  className={`betslip-text ${tabVal === 1 ? 'selected' : ''}`}
                  onClick={() => handleTabChange(1)}
                >
                  Open Bets({totalOrders})
                </div>
              </div>
            </AccordionSummary>
            <AccordionDetails className="stream-body">
              {tabVal === 0 ? (
                bets.length > 0 && isMobile && tabVal === 0 ? (
                  <ExchBetslip
                    setBetStartTime={(date) => setStartTime(date)}
                    setAddNewBet={(val) => setAddNewBet(val)}
                  />
                ) : (
                  <>
                    <div className="no-bets-div">
                      <div className="no-bets-icon-div">
                        <img src={noBetsIcon} />
                      </div>

                      <div className="no-bet-data">
                        There is no bet placed till now.
                      </div>
                    </div>
                  </>
                )
              ) : openBets.length > 0 && loggedIn && tabVal === 1 ? (
                <ExchOpenBets />
              ) : (
                <>
                  <div className="no-bets-div">
                    <div className="no-bets-icon-div">
                      <img src={noBetsIcon} />
                    </div>

                    <div className="no-bet-data">
                      There is no bet placed till now.
                    </div>
                  </div>
                </>
              )}
            </AccordionDetails>
          </Accordion> */}
        </div>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: RootState, ownProps) => {
  const selectedEvent = state.exchangeSports.selectedEvent;
  const event = state.exchangeSports.selectedEvent;

  return {
    eventData: getAllMarketsByEvent(
      state.exchangeSports.events,
      state.exchangeSports.selectedEventType.id,
      state.exchangeSports.selectedCompetition.id,
      selectedEvent.id
    ),
    secondaryMarkets: getSecondaryMarketsByEvent(
      state.exchangeSports.secondaryMarketsMap,
      selectedEvent.id
    ),
    secondaryMatchOdds: getSecondaryMatchOddsByEvent(
      state.exchangeSports.secondaryMatchOddsMap,
      selectedEvent.id
    ),
    bmMData: getBookmakerMarketsByEvent(
      state.exchangeSports.secondaryMarketsMap,
      selectedEvent.id
    ),

    seEventData: getPremiumMarkets(
      state.exchangeSports.premiumMarketsMap,
      selectedEvent.id
    ),
    lineMarkets: getLineMarketsByEvent(
      state.exchangeSports.secondaryMatchOddsMap,
      selectedEvent.id
    ),
    premiumMarkets: getPremiumMarkets(
      state.exchangeSports.premiumMarketsMap,
      event.id
    ),
    marketNotifications: state.exchangeSports.marketNotifications,
    selectedEventType: state.exchangeSports.selectedEventType,
    selectedEvent: selectedEvent,
    bets: state.exchBetslip.bets,
    openBets: state.exchBetslip.openBets,
    totalOrders: state.exchBetslip.totalOrders,
    loggedIn: state.auth.loggedIn,
    streamUrl: state.common.streamUrl,
    topicUrls: state?.exchangeSports?.topicUrls,
    houseId: getHouseIdFromToken(),
    parentId: getParentIdFromToken(),
    accountId: sessionStorage.getItem("aid"),
    triggerMarketNotifications: state.exchangeSports.triggerMarketNotifications,
    triggerFetchMarkets: state.exchangeSports.triggerFetchMarkets,
    triggerFetchOrders: state.exchangeSports.triggerFetchOrders,
    triggerBetStatus: state.exchangeSports.triggerBetStatus,
    betStatusResponse: state.exchBetslip.betStatusResponse,
    betFairWSConnected: state.exchangeSports.betFairWSConnected,
    dreamWSConnected: state.exchangeSports.dreamWSConnected,
    sportsRadarWSConnected: state.exchangeSports.sportsRadarWSConnected,
    pushNotifWSConnection: state.exchangeSports.pushNotifWSConnection,
    alert: state.common.alert,
    langData: state.common.langData,
    fmData: getFancyMarketsByEvent(
      state.exchangeSports.secondaryMarketsMap,
      selectedEvent.id
    ),
    oneClickBettingEnabled: state.exchBetslip.oneClickBettingEnabled,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    clearExchcngeBets: () => dispatch(clearExchcngeBets()),
    updateBookMakerMarkets: (data: BookmakerDTO) =>
      dispatch(updateBookMakerMarkets(data)),
    fetchOpenBets: (eventId: string, sportId: string) =>
      dispatch(fetchOpenBets(eventId, sportId)),
    fetchMarketNotifications: (
      sportId: string,
      competitionId: string,
      eventId: string
    ) => dispatch(fetchMarketNotifications(sportId, competitionId, eventId)),
    fetchEvent: (
      sportId: string,
      competitionId: string,
      eventId: string,
      marketTime: string
    ) => dispatch(fetchEvent(sportId, competitionId, eventId, marketTime)),
    fetchPremiummarketsByEventId: (
      providerId: string,
      competitionId: string,
      sportId: string,
      eventId: string,
      marketTime: string
    ) =>
      dispatch(
        fetchPremiummarketsByEventId(
          providerId,
          competitionId,
          sportId,
          eventId,
          marketTime
        )
      ),
    setExchEvent: (event: SelectedObj) => dispatch(setExchEvent(event)),
    updateEventScorecard: (scorecard: any) =>
      dispatch(updateEventScorecard(scorecard)),
    clearExchangeBets: () => dispatch(clearExchcngeBets()),
    setBettingInprogress: (val: boolean) => dispatch(setBettingInprogress(val)),
    setOneClickBettingLoading: (val: boolean) =>
      dispatch(setOneClickBettingLoading(val)),
    clearBetStatusResponse: () => dispatch(clearBetStatusResponse()),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
    addExchangeBet: (data: PlaceBetRequest) => dispatch(addExchangeBet(data)),
    enableOneClickBetting: (val: boolean) =>
      dispatch(enableOneClickBetting(val)),
    setCashoutInProgress: (val: CashoutProgressDTO) =>
      dispatch(setCashoutInProgress(val)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExchAllMarkets);
