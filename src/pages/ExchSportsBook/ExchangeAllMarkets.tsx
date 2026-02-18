import { IonCol, IonRow } from "@ionic/react";

import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import ExpandLessSharpIcon from "@material-ui/icons/ExpandLessSharp";
import moment, { lang } from "moment";
import React, { useEffect, useRef, useState, useMemo } from "react";
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
  updateSecondaryMatchOdds,
  updateSecondaryMarkets,
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
import USABET_API from "../../api-services/usabet-api";
import { useSelector } from "react-redux";
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
    eventId: string,
  ) => void;
  fetchEvent: (
    sportId: string,
    competitionId: string,
    eventId: string,
    marketTime: string,
  ) => void;
  fetchPremiummarketsByEventId: (
    providerId: string,
    sportid: string,
    competitionId: string,
    eventId: string,
    marketTime: string,
  ) => void;
  setExchEvent: (event: SelectedObj) => void;
  updateEventScorecard: (scorecard: any) => void;
  updateSecondaryMatchOdds: (payload: any) => void;
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
  commissionEnabled?: boolean;
  bettingInprogress?: boolean;
};

type RouteParams = {
  eventType: string;
  competition: string;
  eventId: string;
  eventInfo: string;
  marketId?: string;
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
    updateSecondaryMatchOdds,
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
    commissionEnabled = false,
    bettingInprogress = false,
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
    CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()],
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
  const [addNewBet, setAddNewBet] = useState<boolean>(false);
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
    routeParams.eventInfo ? routeParams.eventInfo : "",
  ).split(":");

  // State for match details and fancy data from API
  const [matchDetails, setMatchDetails] = useState<any[]>([]);
  const [fancyData, setFancyData] = useState<any[]>([]);
  console.log("fancyData", fancyData);
  const [transformedFancyData, setTransformedFancyData] = useState<
    FancyMarketDTO[]
  >([]);
  const [fancyCategoryMap, setFancyCategoryMap] = useState<any>({});
  const [loadingMatchDetails, setLoadingMatchDetails] =
    useState<boolean>(false);
  const [loadingFancy, setLoadingFancy] = useState<boolean>(false);
  const [eventData, setEventData] = useState<EventDTO>();
  /** Team position P/L from bet/getTeamPosition: match to runner by selectionId === selection_id */
  const [teamPositionPL, setTeamPositionPL] = useState<
    | {
        selectionId?: string | number;
        outcomeId?: string;
        runnerId?: string;
        profit: number;
      }[]
    | null
  >(null);
  /** Fancy liability from bet/getFancyLiability: keys "match_id_fancy_id" -> user_pl; used to show Active Book for fancies in list */
  const [fancyLiabilityMap, setFancyLiabilityMap] = useState<Record<
    string,
    number
  > | null>(null);
  const isMobile = window.innerWidth > 1120 ? false : true;

  // Use props.eventData directly (comes from Redux) or local eventData state
  const currentEventData = useMemo(
    () => props.eventData || eventData,
    [props.eventData, eventData],
  );

  const [recentGame, setRecentGame] = useState<any>();
  const history = useHistory();

  // score card listener to change the height of iframe to its content
  useEffect(() => {
    window.addEventListener("message", (event) => {
      const element: HTMLIFrameElement = document.getElementById(
        "frame",
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
        market.marketName?.toLowerCase()?.includes("who will win the match"),
      );

      if (winner?.length > 0) {
        setWinnerMarket(winner?.[0]);
      }
    }
  }, [secondaryMatchOdds]);

  // Initialize eventData from props when it changes
  useEffect(() => {
    if (
      props.eventData &&
      (!eventData || props.eventData.eventId !== eventData.eventId)
    ) {
      setEventData(props.eventData);
    }
  }, [props.eventData?.eventId]);

  useEffect(() => {
    unsubscribeAllWsforEvents();
  }, [selectedEvent]);

  useEffect(() => {
    if (!loggedIn) {
      unsubscribeAllWsforEvents();
    }
  }, [loggedIn]);
  // Set eventData from selectedEvent or fetch from API
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchMatchDetails = async () => {
      if (!eventId) return;

      setLoadingMatchDetails(true);
      try {
        let marketIdToUse: string | undefined = undefined;
        const urlParams = new URLSearchParams(location.search);
        const marketIdFromUrl = urlParams.get("market_id");
        if (marketIdFromUrl) {
          marketIdToUse = marketIdFromUrl;
        } else if (routeParams.marketId) {
          marketIdToUse = routeParams.marketId;
        } else if (currentEventData?.marketId) {
          marketIdToUse = currentEventData.marketId;
        } else if (currentEventData?.matchOdds?.marketId) {
          marketIdToUse = currentEventData.matchOdds.marketId;
        } else if (selectedEvent?.marketId) {
          marketIdToUse = selectedEvent.marketId;
        } else {
          const lastMarketId = sessionStorage.getItem("last_market_id");
          if (lastMarketId) marketIdToUse = lastMarketId;
        }

        // Build request payload
        const requestPayload: any = {
          match_id: eventId,
          combine: true,
        };

        if (
          marketIdToUse &&
          (props.eventData?.sportId == "7" ||
            props.eventData?.sportId == "4339")
        ) {
          requestPayload.market_id = marketIdToUse;
        }

        const response = await USABET_API.post(
          `/match/matchDetails`,
          requestPayload,
        );

        let marketsData: any[] = [];
        if (
          response?.data?.status === true &&
          Array.isArray(response.data.data)
        ) {
          marketsData = response.data.data;
        } else if (Array.isArray(response?.data?.data)) {
          marketsData = response.data.data;
        } else if (Array.isArray(response?.data)) {
          marketsData = response.data;
        }

        if (marketsData.length > 0) {
          // Define market display order
          const marketOrder = [
            "Winner",
            "who will win the match",
            "Match Odds",
            "MATCH_ODDS",
            "BOOKMAKER",
            "TO WIN THE TOSS",
            "Tied Match",
            "TIED_MATCH",
          ];

          // Helper function to get market sort order
          const getMarketSortOrder = (market: any): number => {
            const marketName = (
              market.market_name ||
              market.name ||
              ""
            ).toLowerCase();
            const marketType = (market.market_type || "").toLowerCase();

            for (let i = 0; i < marketOrder.length; i++) {
              const orderItem = marketOrder[i].toLowerCase();
              if (marketName.includes(orderItem) || marketType === orderItem) {
                return i;
              }
            }
            // Markets not in the order list go to the end
            return marketOrder.length;
          };

          // Sort markets according to specified order
          const sortedMarkets = [...marketsData].sort((a, b) => {
            const orderA = getMarketSortOrder(a);
            const orderB = getMarketSortOrder(b);
            return orderA - orderB;
          });

          setMatchDetails(sortedMarkets);
        }
      } catch (error) {
        console.error("Error fetching match details:", error);
      } finally {
        setLoadingMatchDetails(false);
      }
    };

    // Fetch fancy data from API - only if sportId is NOT "4339" (greyhound) or "7" (horseracing)
    const fetchFancyData = async () => {
      if (!eventId) return;

      // Skip getFancies API call for greyhound (4339) and horseracing (7)
      if (sportId === "4339" || sportId === "7") return;

      setLoadingFancy(true);
      try {
        const response = await USABET_API.post(`/fancy/getFancies`, {
          match_id: eventId,
          combine: true,
        });

        let fancyMarkets: any[] = [];
        let categoryMap: any = {};

        // Handle API response structure
        if (response?.data) {
          if (
            response.data.fancy_category &&
            typeof response.data.fancy_category === "object"
          ) {
            categoryMap = response.data.fancy_category;
            setFancyCategoryMap(categoryMap);
          }

          if (Array.isArray(response.data.data)) {
            fancyMarkets = response.data.data;
          } else if (
            response.data.status === true &&
            Array.isArray(response.data.data)
          ) {
            fancyMarkets = response.data.data;
          } else if (Array.isArray(response.data)) {
            fancyMarkets = response.data;
          } else if (typeof response.data === "object") {
            const dataKeys = Object.keys(response.data);
            for (const key of dataKeys) {
              if (
                Array.isArray(response.data[key]) &&
                key !== "fancy_category"
              ) {
                fancyMarkets = response.data[key];
                break;
              }
            }
          }

          if (fancyMarkets.length === 0 && Array.isArray(response?.data)) {
            fancyMarkets = response.data;
          }
        }

        if (fancyMarkets.length > 0) {
          setFancyData(fancyMarkets);
          // Transform API data to FancyMarketDTO format
          const transformed = fancyMarkets.map((fancy: any) => {
            const marketId =
              fancy.fancy_id ||
              fancy.market_id ||
              fancy.marketId ||
              fancy.id ||
              "";
            const marketName =
              fancy.name ||
              fancy.fancy_name ||
              fancy.market_name ||
              fancy.marketName ||
              "";
            let status = "OPEN";
            if (fancy.GameStatus && fancy.GameStatus !== "") {
              status = fancy.GameStatus.toUpperCase();
            } else if (fancy.is_active === 0) {
              status = "SUSPENDED";
            } else if (fancy.MarkStatus === "1" || fancy.MarkStatus === 1) {
              status = "SUSPENDED";
            } else if (fancy.is_lock === true || fancy.isLock === true) {
              status = "SUSPENDED";
            } else if (fancy.status) {
              status = fancy.status.toUpperCase();
            }

            const categoryId =
              fancy.category !== undefined ? String(fancy.category) : "0";
            const categoryName = categoryMap[categoryId]
              ? String(categoryMap[categoryId])
              : categoryId;
            const category = categoryName || categoryId;

            const parsePrice = (val: any): number | null => {
              if (
                val === null ||
                val === undefined ||
                val === "" ||
                val === "--"
              )
                return null;
              const num =
                typeof val === "number" ? val : parseFloat(String(val));
              return isNaN(num) ? null : num;
            };

            let layPrice = parsePrice(
              fancy.LayPrice1 ||
                fancy.LayPrice ||
                fancy.layPrice1 ||
                fancy.layPrice,
            );
            let laySize = parsePrice(
              fancy.LaySize1 ||
                fancy.LaySize ||
                fancy.laySize1 ||
                fancy.laySize,
            );
            let backPrice = parsePrice(
              fancy.BackPrice1 ||
                fancy.BackPrice ||
                fancy.backPrice1 ||
                fancy.backPrice,
            );
            let backSize = parsePrice(
              fancy.BackSize1 ||
                fancy.BackSize ||
                fancy.backSize1 ||
                fancy.backSize,
            );

            if (layPrice === null) {
              layPrice = parsePrice(fancy.noValue || fancy.no_value);
            }
            if (laySize === null) {
              laySize = parsePrice(fancy.noRate || fancy.no_rate);
            }
            if (backPrice === null) {
              backPrice = parsePrice(fancy.yesValue || fancy.yes_value);
            }
            if (backSize === null) {
              backSize = parsePrice(fancy.yesRate || fancy.yes_rate);
            }

            const minStake =
              fancy.Min ||
              fancy.session_min_stack ||
              fancy.session_before_inplay_min_stack ||
              100;
            const maxStake =
              fancy.Max ||
              fancy.session_max_stack ||
              fancy.session_before_inplay_max_stack ||
              100000;

            const markStatus =
              fancy.MarkStatus === "1" || fancy.MarkStatus === 1;
            const isSuspended =
              markStatus ||
              fancy.is_lock === true ||
              fancy.isLock === true ||
              (status === "SUSPENDED" && !fancy.GameStatus);
            const isDisabled = fancy.is_active === 0 || isSuspended;

            return {
              marketId: marketId,
              marketName: marketName,
              customMarketName: fancy.customMarketName || marketName,
              status: status,
              sort:
                fancy.chronology !== undefined
                  ? Number(fancy.chronology)
                  : fancy.sort
                    ? Number(fancy.sort)
                    : 0,
              layPrice: layPrice,
              backPrice: backPrice,
              laySize: laySize,
              backSize: backSize,
              category: category,
              commissionEnabled:
                fancy.is_commission_applied || fancy.commissionEnabled || false,
              marketLimits: fancy.marketLimits || {
                minStake: minStake,
                maxStake: maxStake,
                maxOdd: fancy.maxOdd || 4,
                delay: fancy.delay || 0,
              },
              suspend: isSuspended,
              disable: isDisabled,
              limits: {
                minBetValue: minStake,
                maxBetValue: maxStake,
              },
              isMarketLimitSet: !!fancy.marketLimits,
            };
          });

          if (transformed.length > 0) {
            setTransformedFancyData(transformed);
          } else {
            setTransformedFancyData([]);
          }
        } else {
          setTransformedFancyData([]);
          setFancyData([]);
        }
      } catch (error) {
        console.error("Error fetching fancy data:", error);
        setTransformedFancyData([]);
        setFancyData([]);
      } finally {
        setLoadingFancy(false);
      }
    };

    const fetchTeamPosition = async () => {
      if (!eventId) return;
      try {
        const response = await USABET_API.post("/bet/getTeamPosition", {
          match_id: eventId,
        });
        const data = response?.data;
        // API returns { "market_id": [ { selection_id, user_pl, ... }, ... ] } (or wrapped in { status, data })
        let positionsArray: any[] = [];
        const byMarket =
          data?.status === true &&
          data?.data &&
          typeof data.data === "object" &&
          !Array.isArray(data.data)
            ? (data.data as Record<string, any[]>)
            : data && typeof data === "object" && !Array.isArray(data)
              ? (data as Record<string, any[]>)
              : null;
        if (byMarket) {
          const marketIdToUse =
            currentEventData?.matchOdds?.marketId || currentEventData?.marketId;
          const firstArray = Object.values(byMarket).find((v) =>
            Array.isArray(v),
          ) as any[] | undefined;
          positionsArray =
            (marketIdToUse && Array.isArray(byMarket[marketIdToUse])
              ? byMarket[marketIdToUse]
              : firstArray) || [];
        }
        if (positionsArray && positionsArray.length > 0) {
          setTeamPositionPL(
            positionsArray.map((item: any) => ({
              selectionId: item.selection_id ?? item.selectionId,
              outcomeId: item.outcome_id ?? item.outcomeId,
              runnerId: item.runner_id ?? item.runnerId,
              profit: Number(item.user_pl) ?? Number(item.profit) ?? 0,
            })),
          );
        } else {
          setTeamPositionPL(null);
        }
      } catch (err) {
        console.warn("[ExchangeAllMarkets] getTeamPosition failed:", err);
        setTeamPositionPL(null);
      }
    };

    const fetchFancyLiability = async () => {
      if (!eventId || sportId === "4339" || sportId === "7") return;
      try {
        const response = await USABET_API.post("/bet/getFancyLiability", {
          match_id: eventId,
        });
        const data = response?.data;
        if (
          data?.status === true &&
          data?.data &&
          typeof data.data === "object" &&
          !Array.isArray(data.data)
        ) {
          setFancyLiabilityMap(data.data as Record<string, number>);
        } else if (
          data?.data &&
          typeof data.data === "object" &&
          !Array.isArray(data.data)
        ) {
          setFancyLiabilityMap(data.data as Record<string, number>);
        } else {
          setFancyLiabilityMap(null);
        }
      } catch (err) {
        console.warn("[ExchangeAllMarkets] getFancyLiability failed:", err);
        setFancyLiabilityMap(null);
      }
    };

    // Combined function to fetch match details, team position, fancy liability, and fancy list (getFancies) every 3s
    const fetchAllData = async () => {
      await fetchMatchDetails();
      await fetchTeamPosition();
      await fetchFancyLiability();
      await fetchFancyData();
    };

    if (eventId) {
      // Initial fetch
      fetchAllData();

      // Set up 3-second interval for all APIs
      intervalId = setInterval(() => {
        fetchAllData();
      }, 3000);
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [eventId, location.search, sportId, updateSecondaryMatchOdds]);

  // Always show Fancy tab, default to it if no data yet
  useEffect(() => {
    const hasPremiumTab =
      currentEventData &&
      !["99990", "2378961"].includes(currentEventData?.sportId);

    // Default to Fancy tab (0), Premium is 1 if available
    if (fancyTabVal > (hasPremiumTab ? 1 : 0)) {
      setFancyTabVal(0);
    }
  }, [currentEventData?.sportId, fancyTabVal]);

  useEffect(() => {
    if (loggedIn && currentEventData) {
      setCFactor(CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()]);
      if (topicUrls?.matchOddsTopic) {
        updateMatchOddsTopic(
          topicUrls?.matchOddsTopic,
          topicUrls?.matchOddsBaseUrl,
        );
        subscribeWsForEventOdds(
          topicUrls?.matchOddsTopic,
          currentEventData?.sportId,
          currentEventData.competitionId,
          currentEventData.eventId,
          currentEventData?.matchOdds?.marketId,
          currentEventData?.providerName,
        );
        subscribeWsForScorecardUrl(
          "/topic/rx_score/",
          currentEventData?.eventId,
        );
      }

      if (secondaryMarkets?.bookmakers?.length && topicUrls?.bookMakerTopic) {
        updateBookMakerTopic(
          topicUrls?.bookMakerTopic,
          topicUrls?.bookMakerBaseUrl,
        );
        for (let itm of secondaryMarkets?.bookmakers) {
          subscribeWsForSecondaryMarkets(
            topicUrls?.bookMakerTopic,
            currentEventData?.eventId,
            itm.marketId,
          );
        }
      }

      if (secondaryMarkets?.fancyMarkets?.length && topicUrls?.fancyTopic) {
        updateFancyTopic(topicUrls?.fancyTopic, topicUrls?.fancyBaseUrl);
        subscribeWsForFancyMarkets(
          topicUrls?.fancyTopic,
          currentEventData?.eventId,
        );
      }

      if (topicUrls?.matchOddsTopic && secondaryMatchOdds?.length > 0) {
        updateMatchOddsTopic(
          topicUrls?.matchOddsTopic,
          topicUrls?.matchOddsBaseUrl,
        );
        for (let mo of secondaryMatchOdds) {
          subscribeWsForSecondaryMatchOdds(
            topicUrls?.matchOddsTopic,
            currentEventData?.eventId,
            mo.marketId,
            currentEventData?.providerName,
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
    currentEventData,
    topicUrls,
  ]);

  const updateMatchOddsTopic = (
    currentTopic: string,
    currentBaseUrl: string,
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
    currentBaseUrl: string,
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

  // Always default to Fancy tab (0) when data is loaded
  useEffect(() => {
    if (transformedFancyData?.length > 0 || fancyData?.length > 0) {
      // If we have fancy data and we're on Premium tab, switch to Fancy tab
      if (fancyTabVal === 1) {
        setFancyTabVal(0);
      }
    }
  }, [transformedFancyData, fancyData, fancyTabVal]);
  useEffect(() => {
    updateEventScorecard(null);
    if (
      currentEventData?.eventId &&
      currentEventData?.sportId == "4" &&
      currentEventData?.providerName != "SportRadar"
    ) {
      subscribeWsForScorecardUrl("/topic/rx_score/", currentEventData?.eventId);
    }
  }, [currentEventData?.eventId]);

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
        routeParams.eventInfo ? routeParams.eventInfo : "",
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
        routeParams.eventInfo ? routeParams.eventInfo : "",
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
        currentEventData?.sportId,
        currentEventData?.competitionId,
        currentEventData?.eventId,
        "",
      );
    }
  }, [triggerFetchMarkets]);

  useEffect(() => {
    if (isFirstRenderFetchMarkets.current) {
      isFirstRenderFetchMarkets.current = false;
      return;
    }
    if (eventData !== null && eventData !== undefined) {
      fetchMarketNotifications(
        currentEventData?.sportId,
        currentEventData?.competitionId,
        currentEventData?.eventId,
      );
    }
  }, [triggerMarketNotifications, eventData]);

  useEffect(() => {
    // if (currentEventData && eventData.status === 'IN_PLAY') {
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
    if (bets?.length > 0) {
      setBetsTabVal(0);
      setOpenBetslip(true);
      // Scroll to betslip section on mobile after a short delay to ensure it's rendered
      if (isMobile) {
        setTimeout(() => {
          const betslipSection = document.getElementById("betslip-section");
          if (betslipSection) {
            betslipSection.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }, 100);
      }
    }
  }, [bets]);

  useEffect(() => {
    if (loggedIn && currentEventData?.eventId) {
      unsubscribePNWsforEvents(houseId);
      unsubscribePNWsforEvents(parentId);
      subscribeWsForNotifications(
        false,
        houseId,
        currentEventData?.sportId,
        currentEventData?.competitionId,
        currentEventData?.eventId,
      );
      subscribeWsForNotificationsPerAdminAllMarkets(
        false,
        houseId,
        parentId,
        accountId,
        currentEventData?.eventId,
      );
      return () => {
        unsubscribePNWsforEvents(houseId);
        unsubscribePNWsforEvents(parentId + ":" + currentEventData?.eventId);
        if (!window.location.pathname.includes("==")) {
          subscribeWsForNotificationsPerAdmin(
            false,
            houseId,
            parentId,
            accountId,
          );
          subscribeWsForNotifications(false, houseId);
        }
      };
    }
  }, [pushNotifWSConnection, loggedIn, currentEventData?.eventId]);

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
    // Wrap in try-catch to handle errors gracefully
    betStatus().catch((error) => {
      console.warn("[ExchangeAllMarkets] Error in betStatus:", error);
    });
  }, [triggerBetStatus]);

  useEffect(() => {
    if (isFirstRenderStartTime.current) {
      isFirstRenderStartTime.current = false;
      return;
    }

    intervalRef.current = setInterval(() => {
      // Wrap in try-catch to handle errors gracefully
      betStatus().catch((error) => {
        console.warn(
          "[ExchangeAllMarkets] Error in betStatus interval:",
          error,
        );
      });
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
        ((currentEventData?.matchOdds?.runners?.length > 0 ||
          secondaryMatchOdds?.length > 0) &&
          !betFairWSConnected) ||
        ((bmMData?.length > 0 || fmData?.length > 0) && !dreamWSConnected)
      ) {
        let paramSId = null;
        let paramCId = null;
        let paramEId = null;
        let paramPName = null;

        const [providerId, sportId, competitionId, eventId, marketTime] = atob(
          routeParams.eventInfo ? routeParams.eventInfo : "",
        ).split(":");

        paramSId = sportId;
        paramCId = competitionId;
        paramEId = eventId;
        paramPName = providerId;

        if (!eventId?.toLowerCase()?.includes("sr")) {
          fetchEvent(paramSId, paramCId, paramEId, marketTime);

          if (
            !betFairWSConnected &&
            (currentEventData?.matchOdds?.runners?.length > 0 ||
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
        recentGame?.gameCode,
      )}-${btoa(recentGame?.provider)}-${btoa(recentGame?.subProvider)}-${btoa(
        recentGame?.superProvider,
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
        name={currentEventData?.eventName}
        description={currentEventData?.eventName}
        type={currentEventData?.eventName}
        link={""}
      />
      {currentEventData || routeParams?.eventInfo ? (
        <IonRow className="eam-ctn">
          {!virtualScorecard && scorecardID ? (
            <div
              dangerouslySetInnerHTML={{
                __html: `
          <script>
          (function(a,b,c,d,e,f,g,h,i){a[e]||(i=a[e]=function(){(a[e].q=a[e].q||[]).push(arguments)},i.l=1*new Date,i.o=f,
          g=b.createElement(c),h=b.getElementsByTagName(c)[0],g.async=1,g.src=d,g.setAttribute("n",e),h.parentNode.insertBefore(g,h)
          )})(window,document,"script", "https://widgets.sir.sportradar.com/8ee45b574e2781d581b0b0a133803906/widgetloader", "SIR", {
              theme: false, // using custom theme
              language: "en"
          });
          SIR("addWidget", ".sr-widget-1", "match.lmtPlus", {layout: "double", scoreboard: "extended", momentum: "extended", collapseTo: "momentum", matchId:${scorecardID}});
          </script>
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

            <MatchInfo eventData={currentEventData} routeParams={routeParams} />

            {loggedIn && isMobile && (openBets?.length > 0 || eventId) ? (
              <>
                <Tabs
                  value={tabVal ?? 0}
                  className="eam-all-markets-header-tabs"
                  onChange={(_, newValue) => {
                    setTabVal(newValue ?? 0);
                  }}
                >
                  <Tab
                    label={langData?.["scorecard"]}
                    value={0}
                    disabled={["99990"].includes(currentEventData?.sportId)}
                  />
                  {(currentEventData?.status === "IN_PLAY" ||
                    provider === "SportRadar") && (
                    <Tab
                      label={langData?.["live_stream"]}
                      value={1}
                      disabled={
                        (!(
                          currentEventData &&
                          currentEventData.status === "IN_PLAY"
                        ) ||
                          ["99990"].includes(currentEventData?.sportId)) &&
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
                    currentEventData &&
                    currentEventData?.sportId !== "99990" &&
                    currentEventData?.matchOdds ? (
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
                                {currentEventData &&
                                currentEventData?.sportId == "4" &&
                                currentEventData?.providerName !=
                                  "SportRadar" &&
                                !srScorecardEnabled ? (
                                  <CricketScorecard />
                                ) : IS_NEW_SCORECARD_ENABLED ? (
                                  <iframe
                                    title="sr-scorecard"
                                    id="scorecard-frame"
                                    allowFullScreen={false}
                                    src={`https://play.winadda.co.in/?sportId=${currentEventData?.sportId}&eventId=${currentEventData?.eventId}`}
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
                            currentEventData?.sportId === "99994"
                              ? secondaryMarkets?.bookmakers?.length > 0
                                ? currentEventData?.eventId
                                : "sr:match:" + scorecardID
                              : currentEventData?.matchOdds?.runners?.length ===
                                    0 &&
                                  secondaryMarkets?.bookmakers?.length > 0 &&
                                  premiumMarkets?.markets?.matchOdds.length > 0
                                ? "sr:match:" + scorecardID
                                : currentEventData?.eventId
                          }
                          providerUrl={backupStreamUrl}
                          channelId={
                            currentEventData?.liveStreamChannelId
                              ? currentEventData?.liveStreamChannelId
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

            <MatchInfo eventData={currentEventData} routeParams={routeParams} />

            {loggedIn &&
            !isMobile &&
            !["7", "4339", "99990"].includes(currentEventData?.sportId) ? (
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
                      {currentEventData &&
                      currentEventData?.sportId == "4" &&
                      currentEventData?.providerName != "SportRadar" &&
                      !srScorecardEnabled ? (
                        <CricketScorecard />
                      ) : IS_NEW_SCORECARD_ENABLED ? (
                        <iframe
                          title="sr-scorecard"
                          id="scorecard-frame"
                          allowFullScreen={false}
                          src={`https://play.winadda.co.in/?sportId=${currentEventData?.sportId}&eventId=${currentEventData?.eventId}`}
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

            {/* 2. Match Odds */}
            {/* {currentEventData &&
            currentEventData?.providerName?.toLowerCase() !== "sportradar" ? ( */}
            {matchDetails.map((matchDetail, index) => {
              const eventDataForMarket = currentEventData
                ? {
                    ...currentEventData,
                    eventId:
                      currentEventData.eventId ||
                      matchDetail.match_id ||
                      matchDetail.matchId ||
                      eventId ||
                      "",
                    sportId:
                      currentEventData.sportId ||
                      matchDetail.sport_id ||
                      matchDetail.sportId,
                    eventName:
                      currentEventData.eventName ||
                      matchDetail.match_name ||
                      matchDetail.matchName,
                    competitionId: currentEventData.competitionId,
                    competitionName: currentEventData.competitionName,
                    providerName: currentEventData.providerName || "BetFair",
                    matchOdds: matchDetail,
                  }
                : {
                    eventId:
                      matchDetail.match_id ||
                      matchDetail.matchId ||
                      eventId ||
                      "",
                    sportId: matchDetail.sport_id || matchDetail.sportId,
                    eventName: matchDetail.match_name || matchDetail.matchName,
                    openDate: matchDetail.match_date || matchDetail.matchDate,
                    competitionId: matchDetail.competition_id || competitionId,
                    competitionName: "",
                    providerName: "BetFair",
                    matchOdds: matchDetail,
                  };

              return (
                <IonRow className="eam-table-section" key={index}>
                  <MatchOddsTable
                    data={matchDetail}
                    eventData={eventDataForMarket}
                    fallbackEventId={eventId}
                    exposureMap={exposureMap ? exposureMap : null}
                    loggedIn={loggedIn}
                    getFormattedMinLimit={getFormattedMinLimit}
                    getFormattedMaxLimit={getFormattedMaxLimit}
                    fetchEvent={fetchEvent}
                    marketNotifications={marketNotifications}
                    setBetStartTime={(date) => setStartTime(date)}
                    setAddNewBet={(val) => setAddNewBet(val)}
                    setBetsTabVal={(val) => setBetsTabVal(val)}
                    teamPositionPL={teamPositionPL}
                  />
                </IonRow>
              );
            })}

            {/* Only show fancy tab section if there's fancy data or premium tab available */}
            {((Array.isArray(fmData) && fmData.length > 0) ||
              (Array.isArray(fancyData) && fancyData.length > 0) ||
              (Array.isArray(transformedFancyData) &&
                transformedFancyData.length > 0) ||
              !["99990", "2378961"].includes(currentEventData?.sportId)) && (
              <IonRow className="eam-table-section fancy-tab-section">
                <>
                  <Tabs
                    value={fancyTabVal ?? 0}
                    className="fancy-market-tabs"
                    onChange={(_, newValue) => {
                      setFancyTabVal(newValue ?? 0);
                    }}
                  >
                    {/* Show Fancy tab only if there's fancy data available */}
                    {/* { transformedFancyData.length > 0 ? ( */}
                    <Tab
                      label={langData?.["fancy"] || "Fancy"}
                      className="fancy-tab"
                      value={0}
                    />
                    {/* ) : null} */}
                    {/* Premium tab - show for non-virtual sports */}
                    {!["99990", "2378961"].includes(
                      currentEventData?.sportId,
                    ) ? (
                      <Tab
                        label={langData?.["premium"] || "Premium"}
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
                      <>
                        <FMTable
                          eventData={(() => {
                            // Map selectedEvent (with id) to EventDTO (with eventId)
                            if (selectedEvent) {
                              const mappedEventData: EventDTO = {
                                eventId:
                                  selectedEvent.id ||
                                  selectedEvent.eventId ||
                                  eventId ||
                                  "",
                                eventName:
                                  selectedEvent.name ||
                                  selectedEvent.eventName ||
                                  "",
                                eventSlug:
                                  selectedEvent.slug ||
                                  selectedEvent.eventSlug ||
                                  "",
                                competitionId:
                                  selectedEvent.competitionId ||
                                  competitionId ||
                                  "",
                                sportId: selectedEvent.sportId || sportId || "",
                                ...selectedEvent,
                              };
                              return mappedEventData;
                            }
                            // Fallback to currentEventData or create from route params
                            return (
                              currentEventData ||
                              (eventId
                                ? ({
                                    eventId: eventId,
                                    competitionId: competitionId || "",
                                    sportId: sportId || "",
                                  } as EventDTO)
                                : null)
                            );
                          })()}
                          fmData={transformedFancyData || []}
                          fancyLiabilityMap={fancyLiabilityMap}
                          openBets={openBets}
                          commissionEnabled={commissionEnabled}
                          addExchangeBet={addExchangeBet}
                          loggedIn={loggedIn}
                          getFormattedMinLimit={getFormattedMinLimit}
                          getFormattedMaxLimit={getFormattedMaxLimit}
                          bets={bets}
                          exposureMap={exposureMap ? exposureMap : null}
                          fancySuspended={false}
                          fancyDisabled={false}
                          fetchEvent={fetchEvent}
                          marketNotifications={marketNotifications}
                          setBetStartTime={(date) => setStartTime(date)}
                          setAddNewBet={(val) => setAddNewBet(val)}
                          setBetsTabVal={(val) => setBetsTabVal(val)}
                          setAlertMsg={setAlertMsg}
                          langData={langData}
                          bettingInprogress={bettingInprogress}
                          fancyCategoryMap={fancyCategoryMap}
                        />
                      </>
                    </TabPanel>

                    <IonRow className="row-100">
                      {" "}
                      <TabPanel
                        value={fancyTabVal}
                        index={1}
                        className="fancy-tab-ctn premium-iframe-container"
                      >
                        {currentEventData &&
                        !["99990", "2378961"].includes(
                          currentEventData?.sportId,
                        ) ? (
                          premiumIframeUrl ? (
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
                          )
                        ) : null}
                      </TabPanel>
                    </IonRow>
                  </IonRow>
                </>
              </IonRow>
            )}

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
                ((currentEventData &&
                  (currentEventData.status === "IN_PLAY" ||
                    currentEventData.status === "SUSPENDED")) ||
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
                            currentEventData?.sportId === "99994"
                              ? secondaryMarkets?.bookmakers?.length > 0
                                ? currentEventData?.eventId
                                : "sr:match:" + scorecardID
                              : currentEventData?.matchOdds?.runners?.length ===
                                    0 &&
                                  secondaryMarkets?.bookmakers?.length > 0 &&
                                  premiumMarkets?.markets?.matchOdds.length > 0
                                ? "sr:match:" + scorecardID
                                : currentEventData?.eventId
                          }
                          providerUrl={backupStreamUrl}
                          channelId={
                            currentEventData?.liveStreamChannelId
                              ? currentEventData?.liveStreamChannelId
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
                    {!oneClickBettingEnabled &&
                    bets?.length > 0 &&
                    !isMobile ? (
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

      {/* Betslip section - visible on mobile; on desktop show when bets exist */}
      {
        !isMobile && (bets?.length ?? 0) > 0 &&
          <div
            id="betslip-section"
            className={
              isIOS
                ? "betslip-section ios-betslip mob-betslip-section"
                : "betslip-section mob-betslip-section"
            }
          >
            <ExchBetslip
              setBetStartTime={(date) => setStartTime(date)}
              setAddNewBet={(val) => setAddNewBet(val)}
            />
          </div>
      }
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
      selectedEvent.id,
    ),
    secondaryMarkets: getSecondaryMarketsByEvent(
      state.exchangeSports.secondaryMarketsMap,
      selectedEvent.id,
    ),
    secondaryMatchOdds: getSecondaryMatchOddsByEvent(
      state.exchangeSports.secondaryMatchOddsMap,
      selectedEvent.id,
    ),
    bmMData: getBookmakerMarketsByEvent(
      state.exchangeSports.secondaryMarketsMap,
      selectedEvent.id,
    ),

    seEventData: getPremiumMarkets(
      state.exchangeSports.premiumMarketsMap,
      selectedEvent.id,
    ),
    lineMarkets: getLineMarketsByEvent(
      state.exchangeSports.secondaryMatchOddsMap,
      selectedEvent.id,
    ),
    premiumMarkets: getPremiumMarkets(
      state.exchangeSports.premiumMarketsMap,
      event.id,
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
      selectedEvent.id,
    ),
    oneClickBettingEnabled: state.exchBetslip.oneClickBettingEnabled,
    commissionEnabled: state.exchBetslip.commissionEnabled || false,
    bettingInprogress: state.exchBetslip.bettingInprogress || false,
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
      eventId: string,
    ) => dispatch(fetchMarketNotifications(sportId, competitionId, eventId)),
    fetchEvent: (
      sportId: string,
      competitionId: string,
      eventId: string,
      marketTime: string,
    ) => dispatch(fetchEvent(sportId, competitionId, eventId, marketTime)),
    fetchPremiummarketsByEventId: (
      providerId: string,
      competitionId: string,
      sportId: string,
      eventId: string,
      marketTime: string,
    ) =>
      dispatch(
        fetchPremiummarketsByEventId(
          providerId,
          competitionId,
          sportId,
          eventId,
          marketTime,
        ),
      ),
    setExchEvent: (event: SelectedObj) => dispatch(setExchEvent(event)),
    updateEventScorecard: (scorecard: any) =>
      dispatch(updateEventScorecard(scorecard)),
    updateSecondaryMatchOdds: (payload: any) =>
      dispatch(updateSecondaryMatchOdds(payload)),
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
