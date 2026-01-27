/* eslint-disable no-fallthrough */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  RESET_STATE,
  SET_EVENT_TYPE,
  FETCH_COMPETITIONS_BY_EVENT_TYPE_SUCCESS,
  SET_COMPETITION,
  FETCH_EVENT_BY_COMPETITION_SUCCESS,
  SET_EXCH_EVENT,
  SET_PAGE_NUMBER,
  SET_LOADING,
  RESET_EVENTS,
  UPDATE_SECONDARY_MARKETS,
  DISABLE_EVENT_DATA,
  UPDATE_SCORECARD,
  UPDATE_SECONDARY_MATCH_ODDS,
  UPDATE_BINARY_MARKETS,
  UPDATE_PREMIUM_MARKETS,
  UPDATE_PREMIUM_MARKETS_WS,
  UPDATE_FANCY_MARKETS,
  UPDATE_BOOKMAKER_MARKETS,
  FETCH_TOTAL_EVENT_LIST,
  FETCH_SPORTS_LIVE_EVENT_LIST,
  FETCH_SPORTS_UPCOMING_EVENT_LIST,
  UPDATE_TOPIC_URLS,
  SUSPENDED_MARKETS,
  COMMISSION_MARKETS,
  TRIGGER_FETCH_MARKETS,
  TRIGGER_FETCH_ORDERS,
  TRIGGER_BET_STATUS,
  SET_BETFAIR_WS_CONNECTION,
  SET_SPORTS_RADAR_WS_CONNECTION,
  SET_DREAM_WS_CONNECTION,
  SET_PUSH_NOTIF_WS_CONNECTION,
  UPDATE_MARKET_NOTIFICATIONS,
  TRIGGER_MARKET_NOTIFICATIONS,
  DISABLED_MARKETS,
} from "./exchangeSportsActionTypes";

import {
  CompetitionEventTypeMap,
  ExchangeSportsState,
  SecondaryMarketsMap,
  SecondaryMarkets,
} from "../../models/ExchangeSportsState";
import { EXCHANGE_EVENT_TYPES } from "../../constants/ExchangeEventTypes";
import { CompetitionDTO } from "../../models/common/CompetitionDTO";
import {
  MatchOddsDTO,
  MatchOddsRunnerDTO,
} from "../../models/common/MatchOddsDTO";
import {
  BookmakerDTO,
  BookmakerRunnerDTO,
} from "../../models/common/BookmakerDTO";
import { FancyMarketDTO } from "../../models/common/FancyMarketDTO";
import { ExchangePriceDTO } from "../../models/common/ExchangePriceDTO";
import {
  DisabledMarketDTO,
  DisabledMarketDTOMap,
  MarketIdLimitMap,
  SuspendedMarketDTOMap,
} from "../../models/common/SuspendedMarketDTO";
import { SuspendedMarketDTO } from "../../models/common/SuspendedMarketDTO";
import { CommissionMarketDTO } from "../../models/common/CommissionMarketDTO";
import moment from "moment";
import {
  SPToBFIdMap,
  capitalizeWord,
  fancyCategories,
} from "../../util/stringUtil";
import { EventDTO } from "../../models/common/EventDTO";

type Action = {
  type: string;
  payload: any;
};

const initialState: ExchangeSportsState = {
  eventTypes: EXCHANGE_EVENT_TYPES,
  selectedEventType: { id: "", name: "", slug: "" },
  fetchingEvents: false,
  pageNumebr: 1,
  pageSize: 20,
  competitions: {},
  selectedCompetition: { id: "", name: "", slug: "" },
  events: {},
  selectedEvent: { id: "", name: "", slug: "" },
  secondaryMatchOddsMap: {},
  secondaryMarketsMap: {},
  premiumMarketsMap: {},
  scorecard: null,
  binaryMarkets: [],
  // totalCountEvents: {},
  topicUrls: {
    matchOddsBaseUrl: "",
    matchOddsTopic: "",
    bookMakerBaseUrl: "",
    bookMakerTopic: "",
    fancyBaseUrl: "",
    fancyTopic: "",
    premiumBaseUrl: "",
    premiumTopic: "",
  },
  suspendedMarketsMap: {},
  disabledMarketsMap: {},
  triggerFetchMarkets: null,
  triggerFetchOrders: null,
  triggerBetStatus: null,
  betFairWSConnected: false,
  pushNotifWSConnection: false,
  sportsRadarWSConnected: false,
  dreamWSConnected: false,
  marketIdLimitMap: {},
  marketNotifications: [],
  triggerMarketNotifications: null,
};

const getMatchOddsSet = (prices: ExchangePriceDTO[]) => {
  let pricesSet: ExchangePriceDTO[] = [];
  if (!prices || !prices.length) {
    return [
      { price: null, size: null },
      { price: null, size: null },
      { price: null, size: null },
    ];
  }
  for (let i = 0; i < 3; i += 1) {
    if (prices[i]) pricesSet.push(prices[i]);
    else pricesSet.push({ price: null, size: null });
  }
  return pricesSet;
};

const getFancyCategory = (category: string) => {
  return fancyCategories.indexOf(category) >= 0 ? category : "extramarket";
};

const getFancySuspendedValue = (
  suspendMarketsMap: SuspendedMarketDTOMap,
  providerId: string,
  sportId: string,
  competitionId: string,
  dtoEventId: string,
  dtoMarketType: string,
  dtoFancySuspend: boolean
) => {
  let fancySuspend: boolean;
  let key = dtoEventId + ":" + "*";
  if (suspendMarketsMap[key]) {
    // case for odds updates from websockets
    // suspend field will not be present in odds update from websocket
    let suspendedMarket = suspendMarketsMap[key];
    if (!suspendedMarket) {
      fancySuspend = false;
    } else if (suspendedMarket) {
      fancySuspend = suspendedMarket.suspend;
    }
  } else {
    fancySuspend = dtoFancySuspend;
    suspendMarketsMap[key] = {
      providerId: providerId,
      sportId: sportId,
      competitionId: competitionId,
      eventId: dtoEventId,
      marketType: dtoMarketType,
      marketId: "*",
      suspend: dtoFancySuspend,
    };
  }
  return fancySuspend;
};

const getSuspendValue = (
  suspendMarketsMap: SuspendedMarketDTOMap,
  providerId: string,
  sportId: string,
  competitionId: string,
  dtoEventId: string,
  dtoMarketType: string,
  dtoMarketId: string,
  dtoSuspsend: boolean
) => {
  let suspend: boolean;
  let key = dtoEventId + ":" + dtoMarketId;

  // case: for storing initial state from markets api call
  if (dtoSuspsend !== undefined) {
    suspend = dtoSuspsend;
    suspendMarketsMap[key] = {
      providerId: providerId,
      sportId: sportId,
      competitionId: competitionId,
      eventId: dtoEventId,
      marketType: dtoMarketType,
      marketId: dtoMarketId,
      suspend: dtoSuspsend,
    };
  } else {
    // case for odds updates from websockets
    // suspend field will not be present in odds update from websocket
    let suspendedMarket = suspendMarketsMap[key];
    if (!suspendedMarket) {
      suspend = false;
    } else if (suspendedMarket) {
      suspend = suspendedMarket.suspend;
    }
  }

  return suspend;
};

const getFancyDisabledValue = (
  disabledMarketsMap: DisabledMarketDTOMap,
  providerId: string,
  sportId: string,
  competitionId: string,
  dtoEventId: string,
  dtoMarketType: string,
  dtoFancyDisable: boolean
) => {
  let fancyDisable: boolean;
  let key = dtoEventId + ":" + "*";
  if (disabledMarketsMap[key]) {
    // case for odds updates from websockets
    // disable field will not be present in odds update from websocket
    let disabledMarket = disabledMarketsMap[key];
    if (!disabledMarket) {
      fancyDisable = false;
    } else if (disabledMarket) {
      fancyDisable = disabledMarket.disable;
    }
  } else {
    fancyDisable = dtoFancyDisable;
    disabledMarketsMap[key] = {
      providerId: providerId,
      sportId: sportId,
      competitionId: competitionId,
      eventId: dtoEventId,
      marketType: dtoMarketType,
      marketId: "*",
      disable: dtoFancyDisable,
    };
  }
  return fancyDisable;
};

const getDisableValue = (
  disableMarketsMap: DisabledMarketDTOMap,
  providerId: string,
  sportId: string,
  competitionId: string,
  dtoEventId: string,
  dtoMarketType: string,
  dtoMarketId: string,
  dtoDisable: boolean
) => {
  let disable: boolean;
  let key = dtoEventId + ":" + dtoMarketId;
  // case: for storing initial state from markets api call
  if (dtoDisable !== undefined) {
    disable = dtoDisable;
    disableMarketsMap[key] = {
      providerId: providerId,
      sportId: sportId,
      competitionId: competitionId,
      eventId: dtoEventId,
      marketType: dtoMarketType,
      marketId: dtoMarketId,
      disable: dtoDisable,
    };
  } else {
    // case for odds updates from websockets
    // disable field will not be present in odds update from websocket
    let disabledMarket = disableMarketsMap[key];
    if (!disabledMarket) {
      disable = false;
    } else if (disabledMarket) {
      disable = disabledMarket.disable;
    }
  }

  return disable;
};

const marketIdLimitExists = (
  marketIdLimitMap: MarketIdLimitMap,
  dtoEventId: string,
  dtoMarketType: string,
  dtoMarketId: string,
  marketIdLimit: boolean
) => {
  let limitSet: boolean;
  let key = dtoEventId + ":" + dtoMarketId;

  // case: for storing initial state from markets api call
  if (marketIdLimit !== undefined) {
    limitSet = marketIdLimit;
    marketIdLimitMap[key] = {
      marketType: dtoMarketType,
      marketId: dtoMarketId,
      isMarketLimitSet: marketIdLimit,
    };
  } else {
    // case for odds updates from websockets
    // market id limit field will not be present in odds update from websocket
    let isMarketLimitSet = marketIdLimitMap[key];
    if (!isMarketLimitSet) {
      limitSet = false;
    } else if (isMarketLimitSet) {
      limitSet = isMarketLimitSet.isMarketLimitSet;
    }
  }

  return limitSet;
};

const exchangeSportsReducer = (
  state = initialState,
  action: Action
): ExchangeSportsState => {
  switch (action.type) {
    case RESET_STATE: {
      return {
        ...state,
        eventTypes: [],
        selectedEventType: { id: "1", name: "Football", slug: "football" },
        competitions: {},
        selectedCompetition: { id: "", name: "", slug: "" },
        events: {},
      };
    }

    case UPDATE_MARKET_NOTIFICATIONS: {
      return {
        ...state,
        marketNotifications: action.payload,
      };
    }

    case SET_LOADING: {
      return {
        ...state,
        fetchingEvents: action.payload,
      };
    }

    case UPDATE_TOPIC_URLS: {
      return {
        ...state,
        topicUrls: action.payload,
      };
    }

    case SET_EVENT_TYPE: {
      return {
        ...state,
        selectedEventType: action.payload,
        pageNumebr: 1,
      };
    }

    case SET_PAGE_NUMBER: {
      return {
        ...state,
        pageNumebr: action.payload,
      };
    }

    case SUSPENDED_MARKETS: {
      let suspendedMarket: SuspendedMarketDTO = action.payload;
      let allSuspendedMarketsMap: SuspendedMarketDTOMap = {
        ...state.suspendedMarketsMap,
      };
      const sportId = suspendedMarket.sportId;
      const competitionId = suspendedMarket.competitionId;
      const eventId = suspendedMarket.eventId;
      const marketType = suspendedMarket.marketType;
      const marketId = suspendedMarket.marketId;
      const key = eventId + ":" + marketId;
      allSuspendedMarketsMap[key] = suspendedMarket;

      // TODO: check if the return statement is required or not ??
      switch (marketType) {
        case "MATCH_ODDS": {
          // Set suspend in match odds markets data
          const allEvents = { ...state.events };
          if (eventId && allEvents[sportId][competitionId][eventId]) {
            let matchOddsMarket =
              allEvents[sportId][competitionId][eventId]?.matchOdds;
            if (matchOddsMarket.marketId === marketId) {
              matchOddsMarket.suspend = suspendedMarket.suspend;
            }
          }

          // For secondary match odds data
          const allSecMatchOddsMap = { ...state.secondaryMatchOddsMap };
          if (allSecMatchOddsMap[eventId + "-" + marketId]) {
            let matchOddsMarket = allSecMatchOddsMap[eventId + "-" + marketId];
            matchOddsMarket.suspend = suspendedMarket.suspend;
          }
          break;
        }
        case "BOOKMAKER": {
          // Set suspend in bookmaker markets data
          let secondaryMarketsMap: SecondaryMarketsMap = {
            ...state.secondaryMarketsMap,
          };
          let secondaryMarkets: SecondaryMarkets = secondaryMarketsMap[eventId];
          let bookmakerMarkets: BookmakerDTO[] = secondaryMarkets.bookmakers;
          if (bookmakerMarkets && bookmakerMarkets.length) {
            for (let bm of bookmakerMarkets) {
              if (bm.marketId === marketId)
                bm.suspend = suspendedMarket.suspend;
            }
          }
          break;
        }
        case "FANCY": {
          // Set suspend in fancy markets data
          let secondaryMarketsMap: SecondaryMarketsMap = {
            ...state.secondaryMarketsMap,
          };
          let secondaryMarkets: SecondaryMarkets = secondaryMarketsMap[eventId];
          let fancyMarkets: FancyMarketDTO[] = secondaryMarkets.fancyMarkets;
          if (fancyMarkets && fancyMarkets.length) {
            if (marketId === "*") {
              secondaryMarkets.fancySuspended = suspendedMarket.suspend;
            } else {
              for (let f of fancyMarkets) {
                if (f.marketId === marketId)
                  f.suspend = suspendedMarket.suspend;
              }
            }
          }
          break;
        }
        default:
          console.log("SuspendMarket: Invalid market type: ", marketType);
      }

      return {
        ...state,
        suspendedMarketsMap: allSuspendedMarketsMap,
      };
    }

    case DISABLED_MARKETS: {
      let disabledMarket: DisabledMarketDTO = action.payload;
      let allDisabledMarketsMap: DisabledMarketDTOMap = {
        ...state.disabledMarketsMap,
      };
      const sportId = disabledMarket.sportId;
      const competitionId = disabledMarket.competitionId;
      const eventId = disabledMarket.eventId;
      const marketType = disabledMarket.marketType;
      const marketId = disabledMarket.marketId;
      const key = eventId + ":" + marketId;
      allDisabledMarketsMap[key] = disabledMarket;

      // TODO: check if the return statement is required or not ??
      switch (marketType) {
        case "MATCH_ODDS": {
          // Set disable in match odds markets data
          const allEvents = { ...state.events };
          if (eventId && allEvents[sportId][competitionId][eventId]) {
            let matchOddsMarket =
              allEvents[sportId][competitionId][eventId]?.matchOdds;
            if (matchOddsMarket.marketId === marketId) {
              matchOddsMarket.disable = disabledMarket.disable;
            }
          }

          // For secondary match odds data
          const allSecMatchOddsMap = { ...state.secondaryMatchOddsMap };
          if (allSecMatchOddsMap[eventId + "-" + marketId]) {
            let matchOddsMarket = allSecMatchOddsMap[eventId + "-" + marketId];
            matchOddsMarket.disable = disabledMarket.disable;
          }
          break;
        }
        case "BOOKMAKER": {
          // Set disable in bookmaker markets data
          let secondaryMarketsMap: SecondaryMarketsMap = {
            ...state.secondaryMarketsMap,
          };
          let secondaryMarkets: SecondaryMarkets = secondaryMarketsMap[eventId];
          let bookmakerMarkets: BookmakerDTO[] = secondaryMarkets.bookmakers;
          if (bookmakerMarkets && bookmakerMarkets.length) {
            for (let bm of bookmakerMarkets) {
              if (bm.marketId === marketId) bm.disable = disabledMarket.disable;
            }
          }
          break;
        }
        case "FANCY": {
          // Set disable in fancy markets data
          let secondaryMarketsMap: SecondaryMarketsMap = {
            ...state.secondaryMarketsMap,
          };
          let secondaryMarkets: SecondaryMarkets = secondaryMarketsMap[eventId];
          let fancyMarkets: FancyMarketDTO[] = secondaryMarkets.fancyMarkets;
          if (fancyMarkets && fancyMarkets.length) {
            if (marketId === "*") {
              secondaryMarkets.fancyDisabled = disabledMarket.disable;
            } else {
              for (let f of fancyMarkets) {
                if (f.marketId === marketId) f.disable = disabledMarket.disable;
              }
            }
          }
          break;
        }
        default:
          console.log("DisableMarket: Invalid market type: ", marketType);
      }

      return {
        ...state,
        disabledMarketsMap: allDisabledMarketsMap,
      };
    }

    case COMMISSION_MARKETS: {
      let commissionMarket: CommissionMarketDTO = action.payload;
      const eventId = commissionMarket.eventId;
      const marketType = commissionMarket.marketType;
      const marketId = commissionMarket.marketId;
      let secondaryMarketsMap: SecondaryMarketsMap = {
        ...state.secondaryMarketsMap,
      };
      let secondaryMarkets: SecondaryMarkets = secondaryMarketsMap[eventId];

      // TODO: check if the return statement is required or not ??
      switch (marketType) {
        case "BOOKMAKER": {
          // Set commission in bookmaker markets data
          let bookmakerMarkets: BookmakerDTO[] = secondaryMarkets.bookmakers;
          if (bookmakerMarkets && bookmakerMarkets.length) {
            for (let bm of bookmakerMarkets) {
              if (bm.marketId === marketId)
                bm.commissionEnabled = commissionMarket.commission;
            }
          }
          break;
        }
        case "FANCY": {
          // Set commission in fancy markets data
          let fancyMarkets: FancyMarketDTO[] = secondaryMarkets.fancyMarkets;
          if (fancyMarkets && fancyMarkets.length) {
            for (let f of fancyMarkets) {
              if (f.marketId === marketId)
                f.commissionEnabled = commissionMarket.commission;
            }
          }
          break;
        }
        default:
          console.log("CommissionMarket: Invalid market type: ", marketType);
      }

      return {
        ...state,
        secondaryMarketsMap: secondaryMarketsMap,
      };
    }

    case FETCH_COMPETITIONS_BY_EVENT_TYPE_SUCCESS: {
      let competitions: CompetitionDTO[] = [];
      let allCompetitions: CompetitionEventTypeMap = { ...state.competitions };
      const eId = action.payload.sportId;
      for (let c of action.payload.competitions) {
        const nameSlug = c.competitionName
          .toLocaleLowerCase()
          .replace(/[^a-z0-9]/g, " ")
          .replace(/ +/g, " ")
          .trim()
          .split(" ")
          .join("-");
        competitions.push({
          id: c.competitionId,
          name: c.competitionName,
          slug: nameSlug,
          sportId: eId,
        });
      }
      allCompetitions[eId] = competitions;
      return {
        ...state,
        competitions: allCompetitions,
      };
    }

    case SET_COMPETITION: {
      return {
        ...state,
        selectedCompetition: action.payload,
        pageNumebr: 1,
      };
    }

    case TRIGGER_FETCH_MARKETS: {
      return {
        ...state,
        triggerFetchMarkets: moment.now(),
      };
    }

    case TRIGGER_FETCH_ORDERS: {
      return {
        ...state,
        triggerFetchOrders: moment.now(),
      };
    }

    case TRIGGER_BET_STATUS: {
      return {
        ...state,
        triggerBetStatus: moment.now(),
      };
    }

    case TRIGGER_BET_STATUS: {
      return {
        ...state,
        triggerBetStatus: moment.now(),
      };
    }

    case TRIGGER_BET_STATUS: {
      return {
        ...state,
        triggerBetStatus: moment.now(),
      };
    }

    case TRIGGER_MARKET_NOTIFICATIONS: {
      return {
        ...state,
        triggerMarketNotifications: moment.now(),
      };
    }

    // case FETCH_TOTAL_EVENT_LIST: {
    //   return {
    //     ...state,
    //     totalCountEvents: { ...action.payload },
    //   };
    // }
    case FETCH_EVENT_BY_COMPETITION_SUCCESS: {
      const events = action.payload.events;

      // Initialize allEvents and suspendMarketsMap
      const allEvents = { ...state.events };
      let suspendMarketsMap = { ...state.suspendedMarketsMap };
      let disabledMarketsMap: DisabledMarketDTOMap = {
        ...state.disabledMarketsMap,
      };

      events?.forEach((event) => {
        const eId = event.sportId;
        let cId = event.competitionId?.split(":").join("_");
        let eventId = event.eventId?.split(":").join("_");

        // Add events map hierarchy
        if (!allEvents[eId]) {
          allEvents[eId] = {};
        }
        if (!allEvents[eId][cId]) {
          allEvents[eId][cId] = {};
        }

        let eData = event;
        let limitMap = new Map();
        if (allEvents[eId][cId][eventId]) {
          eData = { ...allEvents[eId][cId][eventId] };
          limitMap.set(
            allEvents[eId][cId][eventId]?.matchOdds?.marketId,
            allEvents[eId][cId][eventId]?.matchOdds?.marketLimits
          );
        } else {
          eData = {
            ...event,
            status: event.status === "OPEN" ? "IN_PLAY" : event.status,
          };
        }

        eData.competitionId = eData?.competitionId?.split(":").join("_");
        eData.eventId = eData?.eventId?.split(":").join("_");

        const eventName = eData?.eventName?.toLowerCase();
        // Use provided homeTeam/awayTeam if available, otherwise extract from eventName
        let homeTeam = eData.homeTeam || "";
        let awayTeam = eData.awayTeam || "";
        let homeTeamId = eData.homeTeamId || "";
        let awayTeamId = eData.awayTeamId || "";

        // Only extract from eventName if homeTeam and awayTeam are not already provided
        if (homeTeam === "" && awayTeam === "") {
          if (
            eventName?.includes(" v ") ||
            eventName?.includes(" vs ") ||
            eventName?.includes(" vs. ")
          ) {
            if (eventName?.includes(" vs. ")) {
              homeTeam = eventName?.split(" vs. ")[0];
              awayTeam = eventName?.split(" vs. ")[1];
            } else {
              homeTeam = eventName?.includes(" v ")
                ? eventName?.split(" v ")[0].trim()
                : eventName?.split(" vs ")[0].trim();
              awayTeam = eventName?.includes(" v ")
                ? eventName?.split(" v ")[1].trim().split(" - ")[0]
                : eventName?.split(" vs ")[1].trim().split(" - ")[0];
              homeTeam = capitalizeWord(homeTeam);
              awayTeam = capitalizeWord(awayTeam);
            }
          } else {
            homeTeam = capitalizeWord(eventName);
          }
        }

        // Set MatchOdds Data
        const matchOddsData = event.matchOddsData;
        const runners = [];
        if (matchOddsData) {
          if (matchOddsData.runners && matchOddsData.runners.length > 0) {
            let i = 0;
            for (let e of matchOddsData.runners) {
              if (e) {
                let runnerName = e.runnerName ? e.runnerName : e.RunnerName;
                if (runnerName === undefined) {
                  runnerName = "";
                }

                if (
                  eData?.provderId?.toLowerCase() !== "sportradar" &&
                  matchOddsData.marketName.toLowerCase().includes("winner")
                ) {
                  if (!runnerName.toLowerCase().includes("draw") && i === 0) {
                    if (runnerName === "") {
                      runnerName = homeTeam;
                    } else if (runnerName !== awayTeam) {
                      homeTeam = runnerName;
                    }
                  }

                  if (!runnerName.toLowerCase().includes("draw") && i !== 0) {
                    if (runnerName === "") {
                      runnerName = awayTeam;
                    } else if (runnerName !== homeTeam) {
                      awayTeam = runnerName;
                    }
                  }
                }
                if (!runnerName.toLowerCase().includes("draw") && i === 0) {
                  homeTeamId = e.runnerId;
                }

                if (!runnerName.toLowerCase().includes("draw") && i !== 0) {
                  awayTeamId = e.runnerId;
                }

                i += 1;
                runners.push({
                  runnerId: e.runnerId ? e.runnerId : e.runnerId,
                  runnerName: runnerName,
                  backPrices: getMatchOddsSet(e.backPrices),
                  layPrices: getMatchOddsSet(e.layPrices ? e.layPrices : []),
                  status: e.status,
                  clothNumber: e?.clothNumber,
                  jockeyName: e?.jockeyName,
                  runnerAge: e?.runnerAge,
                  runnerIcon: e?.runnerIcon,
                  stallDraw: e?.stallDraw,
                  trainerName: e?.trainerName,
                });
              }
            }
          }
          let suspend = getSuspendValue(
            suspendMarketsMap,
            eData?.providerId,
            eData?.sportId,
            eData?.competitionId,
            eData?.eventId,
            eData?.marketType,
            eData?.marketId,
            matchOddsData?.suspended
          );
          let disable = getDisableValue(
            disabledMarketsMap,
            eData?.providerId,
            eData?.sportId,
            eData?.competitionId,
            eData?.eventId,
            eData?.marketType,
            eData?.marketId,
            matchOddsData?.disabled
          );
          const bLimits = eData?.matchOdds?.limits;
          if (!matchOddsData.disable) {
            eData.matchOdds = {
              marketId: matchOddsData.marketId ? matchOddsData.marketId : "",
              marketName: matchOddsData.marketName
                ? matchOddsData.marketName
                : "",
              status: matchOddsData.status ? matchOddsData.status : "",
              runners: runners,
              limits: matchOddsData.limits ? matchOddsData?.limits : bLimits,
              marketLimits: matchOddsData?.marketLimits
                ? matchOddsData?.marketLimits
                : limitMap.get(matchOddsData.marketId),
              suspend: suspend,
              disable: disable,
            };
          } else {
            eData.matchOdds = null;
          }
        } else {
          let disable: boolean = getDisableValue(
            disabledMarketsMap,
            eData?.providerId,
            eData?.sportId,
            eData?.competitionId,
            eData?.eventId,
            eData?.marketType,
            eData?.marketId,
            matchOddsData?.disabled
          );
          let matchOdds = eData.matchOdds;
          if (!disable) {
            if (matchOdds) {
              eData.matchOdds = {
                marketId: matchOdds?.marketId,
                marketName: matchOdds?.marketName,
                status: "SUSPENDED",
                runners: matchOdds?.runners,
                limits: matchOddsData?.limits,
                marketLimits: matchOddsData?.marketLimits,
                suspend: true,
                disable: true,
              };
            } else {
              eData.matchOdds = {
                marketId: "",
                marketName: "",
                status: "SUSPENDED",
                runners: [],
                limits: null,
                suspend: true,
                disable: true,
              };
            }
          }
        }

        if (event.raceMarkets?.length > 0) {
          let markets = [];
          for (const rm of event.raceMarkets) {
            const runners = [];
            let suspend = getSuspendValue(
              suspendMarketsMap,
              eData?.providerId,
              eData?.sportId,
              eData?.competitionId,
              eData?.eventId,
              eData?.marketType,
              rm.marketId,
              rm?.suspended
            );
            let disable = getDisableValue(
              disabledMarketsMap,
              eData?.providerId,
              eData?.sportId,
              eData?.competitionId,
              eData?.eventId,
              eData?.marketType,
              rm.marketId,
              rm?.disabled
            );
            if (rm.runners && rm.runners.length > 0) {
              let i = 0;
              for (let e of rm.runners) {
                if (e && !disable) {
                  i += 1;
                  runners.push({
                    runnerId: e.runnerId,
                    runnerName: e.runnerName,
                    backPrices: getMatchOddsSet(e.backPrices),
                    layPrices: getMatchOddsSet(e.layPrices),
                    clothNumber: rm?.clothNumber,
                    jockeyName: rm?.jockeyName,
                    runnerAge: rm?.runnerAge,
                    runnerIcon: rm?.runnerIcon,
                    stallDraw: rm?.stallDraw,
                    trainerName: rm?.trainerName,
                    status: e.status,
                  });
                }
              }
            }
            if (!disable) {
              markets.push({
                marketId: rm.marketId,
                marketName: rm.marketName,
                marketTime: rm.marketTime,
                status: rm.status,
                runners: runners,
                suspend: suspend,
                disable: disable,
              });
            }
          }
          markets.sort((a, b) =>
            a.marketTime > b.marketTime
              ? 1
              : b.marketTime > a.marketTime
              ? -1
              : 0
          );
          eData.raceMarkets = markets;
        }

        // Ensure homeTeam and awayTeam are set (use extracted values if original were empty)
        eData.homeTeam = homeTeam || eData.homeTeam || "";
        eData.awayTeam = awayTeam || eData.awayTeam || "";

        eData.homeTeamId = homeTeamId;
        eData.awayTeamId = awayTeamId;

        eData.secondaryMatchOddsMarketIds = event.secondaryMatchOddsMarketIds
          ? event.secondaryMatchOddsMarketIds
          : eData.secondaryMatchOddsMarketIds
          ? eData.secondaryMatchOddsMarketIds
          : [];
        eData.eventSlug = eData.eventSlug
          ? eData.eventSlug
          : eData.eventName
          ? eData.eventName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, " ")
              .replace(/ +/g, " ")
              .trim()
              .split(" ")
              .join("-")
          : "";

        if (event.liveStreamChannelId) {
          eData.liveStreamChannelId = event.liveStreamChannelId;
        }

        allEvents[eId][cId][eData.eventId] = eData;
      });

      if (action.payload?.events?.[0]?.onRefresh) {
        const firstEvent = action.payload?.events?.[0];
        let currentSelectedCompetition;
        let currentSelectedEvent;
        let currentSelectedEventType;

        try {
          currentSelectedEventType =
            state.selectedEventType.id === firstEvent.sportId
              ? { ...state.selectedEventType }
              : {
                  id: firstEvent.sportId,
                  name: EXCHANGE_EVENT_TYPES.filter(
                    (e) =>
                      e.id === firstEvent.sportId ||
                      e.id === SPToBFIdMap[firstEvent.sportId]
                  )[0].name,
                  slug: EXCHANGE_EVENT_TYPES.filter(
                    (e) =>
                      e.id === firstEvent.sportId ||
                      e.id === SPToBFIdMap[firstEvent.sportId]
                  )[0].slug,
                };
          currentSelectedCompetition =
            state.selectedCompetition.id === firstEvent.competitionId
              ? { ...state.selectedCompetition }
              : {
                  id: firstEvent?.competitionId ? firstEvent.competitionId : "",
                  name: firstEvent?.competitionName
                    ? firstEvent.competitionName
                    : "",
                  slug: firstEvent?.competitionName
                    ? firstEvent.competitionName
                        .toLocaleLowerCase()
                        .replace(/[^a-z0-9]/g, " ")
                        .replace(/ +/g, " ")
                        .trim()
                        .split(" ")
                        .join("-")
                    : "",
                };

          currentSelectedEvent =
            state.selectedEvent.id === firstEvent?.eventId
              ? { ...state.selectedEvent }
              : {
                  id: firstEvent?.eventId,
                  slug: firstEvent?.eventName
                    .toLocaleLowerCase()
                    .replace(/[^a-z0-9]/g, " ")
                    .replace(/ +/g, " ")
                    .trim()
                    .split(" ")
                    .join("-"),
                  name: firstEvent?.eventName,
                };
        } catch (_) {
          currentSelectedCompetition = { ...state.selectedCompetition };
          currentSelectedEvent = { ...state.selectedEvent };
          currentSelectedEventType = { ...state.selectedEventType };
        }
        return {
          ...state,
          events: allEvents,
          selectedEventType: currentSelectedEventType,
          selectedCompetition: currentSelectedCompetition,
          selectedEvent: currentSelectedEvent,
          suspendedMarketsMap: suspendMarketsMap,
          disabledMarketsMap: disabledMarketsMap,
        };
      }
      return {
        ...state,
        events: allEvents,
      };
    }

    case UPDATE_SECONDARY_MATCH_ODDS: {
      const eventData = action.payload;
      const eventId: string = eventData.eventId;
      const marketId: string = action.payload.marketId;
      let suspendMarketsMap: SuspendedMarketDTOMap = {
        ...state.suspendedMarketsMap,
      };
      let disabledMarketsMap: DisabledMarketDTOMap = {
        ...state.disabledMarketsMap,
      };

      const allSecMatchOddsMap = { ...state.secondaryMatchOddsMap };

      const matchOddsData = action.payload.matchOddsData;
      const runners: MatchOddsRunnerDTO[] = [];
      let runnersData: MatchOddsRunnerDTO[] = allSecMatchOddsMap[
        eventId + "-" + marketId
      ]?.runners?.length
        ? [...allSecMatchOddsMap[eventId + "-" + marketId]?.runners]
        : [];

      if (matchOddsData) {
        let suspend: boolean = getSuspendValue(
          suspendMarketsMap,
          eventData?.providerId,
          eventData?.sportId,
          eventData?.competitionId,
          eventId,
          matchOddsData?.marketType,
          matchOddsData?.marketId,
          matchOddsData?.suspended
        );
        let disable: boolean = getDisableValue(
          disabledMarketsMap,
          eventData?.providerId,
          eventData?.sportId,
          eventData?.competitionId,
          eventId,
          matchOddsData?.marketType,
          matchOddsData?.marketId,
          matchOddsData?.disabled
        );
        if (matchOddsData.runners && matchOddsData.runners.length > 0) {
          let data: any = {};
          for (let e of matchOddsData.runners) {
            if (e) {
              data = runnersData?.find(
                (item) => item?.runnerId === e?.runnerId
              );

              runners.push({
                runnerId: e?.runnerId,
                runnerName: e?.runnerName,
                backPrices: getMatchOddsSet(e.backPrices),
                layPrices: getMatchOddsSet(e.layPrices),
                status: e?.status,
                clothNumber: e?.clothNumber
                  ? e?.clothNumber
                  : data?.clothNumber ?? "",
                jockeyName: e?.jockeyName
                  ? e?.jockeyName
                  : data?.jockeyName ?? "",
                runnerAge: e?.runnerAge ? e?.runnerAge : data?.runnerAge ?? "",
                runnerIcon: e?.runnerIcon
                  ? e?.runnerIcon
                  : data?.runnerIcon ?? "",
                stallDraw: e?.stallDraw ? e?.stallDraw : data?.stallDraw ?? "",
                trainerName: e?.trainerName
                  ? e?.trainerName
                  : data?.trainerName ?? "",
              });
            }
          }
        }
        if (!disable) {
          allSecMatchOddsMap[eventId + "-" + marketId] = {
            marketId: matchOddsData.marketId,
            marketName: matchOddsData.marketName,
            customMarketName:
              matchOddsData.customMarketName !== undefined
                ? matchOddsData.customMarketName
                : allSecMatchOddsMap[eventId + "-" + marketId]
                    ?.customMarketName || "",
            marketTime: matchOddsData.marketTime,
            // inplay: matchOddsData.inplay,
            status: matchOddsData.status,
            runners: runners,
            limits: matchOddsData.limits
              ? matchOddsData.limits
              : allSecMatchOddsMap[eventId + "-" + marketId]?.limits,
            marketLimits: matchOddsData?.marketLimits
              ? matchOddsData.marketLimits
              : allSecMatchOddsMap[eventId + "-" + marketId]?.marketLimits,
            suspend: suspend,
            disable: disable,
          };
        }
      } else {
        let matchOdds = allSecMatchOddsMap[eventId + "-" + marketId];
        if (matchOdds) {
          allSecMatchOddsMap[eventId + "-" + marketId] = {
            marketId: matchOdds.marketId,
            marketName: matchOdds.marketName,
            customMarketName:
              matchOdds.customMarketName !== undefined
                ? matchOdds.customMarketName
                : allSecMatchOddsMap[eventId + "-" + marketId]
                    ?.customMarketName || "",
            marketTime: matchOddsData.marketTime,
            // inplay: matchOdds.inplay,
            status: "SUSPENDED",
            runners: matchOdds.runners,
            limits: matchOdds.limits,
            marketLimits: matchOddsData?.marketLimits
              ? matchOddsData.marketLimits
              : allSecMatchOddsMap[eventId + "-" + marketId]?.marketLimits,
            suspend: true,
            disable: true,
          };
        } else {
          allSecMatchOddsMap[eventId + "-" + marketId] = {
            marketId: "",
            marketName: "",
            customMarketName: "",
            // inplay: false,
            status: "SUSPENDED",
            runners: [],
            limits: null,
            suspend: true,
            disable: true,
          };
        }
      }

      const secMatchOddsMap = { ...state.secondaryMatchOddsMap };
      secMatchOddsMap[eventId + "-" + marketId] =
        allSecMatchOddsMap[eventId + "-" + marketId];

      Object.keys(secMatchOddsMap).forEach((key) => {
        if (secMatchOddsMap[key] === undefined) {
          delete secMatchOddsMap[key];
        }
      });

      return {
        ...state,
        secondaryMatchOddsMap: secMatchOddsMap,
        suspendedMarketsMap: suspendMarketsMap,
        disabledMarketsMap: disabledMarketsMap,
      };
    }

    case UPDATE_FANCY_MARKETS: {
      try {
        const eventData = action.payload;
        const eventId: string = eventData.eventId;
        const fancyOddsData = action.payload.fancyUpdateData;
        const marketsMap = { ...state.secondaryMarketsMap };
        let suspendMarketsMap: SuspendedMarketDTOMap = {
          ...state.suspendedMarketsMap,
        };
        let disabledMarketsMap: DisabledMarketDTOMap = {
          ...state.disabledMarketsMap,
        };
        let marketIdLimitMap: MarketIdLimitMap = {
          ...state.marketIdLimitMap,
        };

        // key as marketId value as fancy data
        const fancyMarkets = marketsMap[eventId].fancyMarkets;
        const prevFancyMap = new Map();
        let limitMap = new Map();
        for (const {
          marketId,
          commissionEnabled,
          marketLimits,
        } of fancyMarkets) {
          if (commissionEnabled !== undefined) {
            prevFancyMap.set(marketId, commissionEnabled);
          }
          limitMap.set(marketId, marketLimits);
        }

        // Add event data
        if (action.payload.eventId) {
          if (!marketsMap[eventId]) {
            marketsMap[eventId] = {
              ...marketsMap[eventId],
              fancyMarkets: [],
              enableFancy: false,
              fancySuspended: false,
              fancyDisabled: false,
            };
          }

          // Set Fancy markets data
          let fancyOdds: FancyMarketDTO[] = [];
          if (fancyOddsData && fancyOddsData.length > 0) {
            for (let f of fancyOddsData) {
              // if (!f.marketName.toLowerCase().split(' ').includes('bhav')) {
              let suspend: boolean = getSuspendValue(
                suspendMarketsMap,
                eventData?.providerId,
                eventData?.sportId,
                eventData?.competitionId,
                eventId,
                f?.marketType,
                f?.marketId,
                f?.suspended
              );
              let disable: boolean = getDisableValue(
                disabledMarketsMap,
                eventData?.providerId,
                eventData?.sportId,
                eventData?.competitionId,
                eventId,
                f?.marketType,
                f?.marketId,
                f?.suspended
              );
              let marketLimitExists = marketIdLimitExists(
                marketIdLimitMap,
                eventId,
                f?.marketType,
                f?.marketId,
                f?.marketLimitSet
              );
              if (!disable) {
                // Find existing fancy market to preserve customMarketName
                const existingFancyMarket = marketsMap[
                  eventId
                ].fancyMarkets?.find((fm) => fm.marketId === f.marketId);
                fancyOdds.push({
                  marketId: f.marketId ? f.marketId : "",
                  marketName: f.marketName ? f.marketName : "",
                  customMarketName:
                    f.customMarketName !== undefined
                      ? f.customMarketName
                      : existingFancyMarket?.customMarketName || "",
                  status: f.status ? f.status : "",
                  sort: f.sort ? Number(f.sort) : 0,
                  layPrice: f.noValue
                    ? f.category === "fancy3" || f.category === "odd-even"
                      ? f.noValue.toFixed(2)
                      : f.noValue
                    : null,
                  backPrice: f.yesValue
                    ? f.category === "fancy3" || f.category === "odd-even"
                      ? f.yesValue.toFixed(2)
                      : f.yesValue
                    : null,
                  laySize: f.noRate ? f.noRate : null,
                  backSize: f.yesRate ? f.yesRate : null,
                  category: getFancyCategory(f.category),
                  commissionEnabled:
                    f.commissionEnabled !== undefined
                      ? f.commissionEnabled
                      : prevFancyMap.get(f.marketId),
                  marketLimits:
                    f?.marketLimits !== undefined
                      ? f?.marketLimits
                      : limitMap.get(f.marketId),
                  suspend: suspend,
                  disable: disable,
                  limits: f.limits,
                  isMarketLimitSet: marketLimitExists,
                });
              }
              // }
            }
          } else if (marketsMap[eventId].fancyMarkets) {
            fancyOdds = marketsMap[eventId].fancyMarkets;
            for (let fMarket of fancyOdds) {
              fMarket.status = "SUSPENDED";
              fMarket.suspend = true;
              fMarket.disable = true;
            }
          }

          fancyOdds.sort((a, b) => {
            if (a?.sort - b?.sort != 0) {
              return a?.sort - b?.sort;
            }
            const aDesc = a.marketName;
            const bDesc = b.marketName;
            if (aDesc > bDesc) return 1;
            else if (aDesc < bDesc) return -1;
            return 0;
          });
          marketsMap[eventId].fancyMarkets = fancyOdds;
          marketsMap[eventId].fancySuspended = getFancySuspendedValue(
            suspendMarketsMap,
            eventData?.provderId,
            eventData?.sportId,
            eventData?.competitionId,
            eventId,
            "FANCY",
            marketsMap[eventId]?.fancySuspended
          );
          marketsMap[eventId].fancyDisabled = getFancyDisabledValue(
            disabledMarketsMap,
            eventData?.provderId,
            eventData?.sportId,
            eventData?.competitionId,
            eventId,
            "FANCY",
            marketsMap[eventId]?.fancyDisabled
          );
          // marketsMap[eventId].enableFancy = action.payload.enableFancy;
          return {
            ...state,
            secondaryMarketsMap: marketsMap,
            suspendedMarketsMap: suspendMarketsMap,
            marketIdLimitMap: marketIdLimitMap,
            disabledMarketsMap: disabledMarketsMap,
          };
        }
      } catch (e) {
        console.error("Failed to update odds ", e);
      }
    }

    case UPDATE_BOOKMAKER_MARKETS: {
      try {
        const eventData = action.payload;
        const eventId: string = eventData.eventId;
        const marketsMap = { ...state.secondaryMarketsMap };
        let suspendMarketsMap: SuspendedMarketDTOMap = {
          ...state.suspendedMarketsMap,
        };
        let disabledMarketsMap: DisabledMarketDTOMap = {
          ...state.disabledMarketsMap,
        };
        if (action.payload.eventId) {
          if (!marketsMap[eventId]) {
            marketsMap[eventId] = {
              ...marketsMap[eventId],
              bookmakers: [],
              enableBookmaker: false,
            };
          }

          // Set BookmakerOdds Data.
          const bookMakerOddsData =
            action?.payload?.bookmakerOddsData &&
            Array.isArray(action?.payload?.bookmakerOddsData)
              ? action?.payload?.bookmakerOddsData
              : [action?.payload?.bookmakerOddsData];

          // key as marketId value as bm data
          const bookmakers = marketsMap[eventId].bookmakers;
          const prevBMMap = new Map();
          let limitMap = new Map();
          for (const {
            marketId,
            commissionEnabled,
            marketLimits,
          } of bookmakers) {
            if (commissionEnabled !== undefined) {
              prevBMMap.set(marketId, commissionEnabled);
            }
            limitMap.set(marketId, marketLimits);
          }

          let bookMakerOdds: BookmakerDTO[] = [];
          if (marketsMap[eventId]?.bookmakers?.length)
            bookMakerOdds = marketsMap[eventId]?.bookmakers;
          if (bookMakerOddsData && bookMakerOddsData.length) {
            for (let br of bookMakerOddsData) {
              let suspend: boolean = getSuspendValue(
                suspendMarketsMap,
                eventData?.providerId,
                eventData?.sportId,
                eventData?.competitionId,
                eventId,
                br?.marketType,
                br?.marketId,
                br?.suspended
              );
              let disable: boolean = getDisableValue(
                disabledMarketsMap,
                eventData?.providerId,
                eventData?.sportId,
                eventData?.competitionId,
                eventId,
                br?.marketType,
                br?.marketId,
                br?.disabled
              );
              let bmRunners: BookmakerRunnerDTO[] = [];
              for (let b of br.runners) {
                bmRunners.push({
                  runnerId: b.runnerId ? b.runnerId : "",
                  runnerName: b.runnerName ? b.runnerName : "",
                  backPrice: b.backPrices[0]?.price,
                  backSize: b.backPrices[0]?.size,
                  layPrice: b.layPrices[0]?.price,
                  laySize: b.layPrices[0]?.size,
                  status: b.status ? b.status : "",
                  sort: b.sort,
                });
              }
              // bmRunners.sort((a, b) => +a.runnerId - +b.runnerId);
              bmRunners.sort((a, b) => Number(a.sort) - Number(b.sort));
              let index = bookMakerOdds?.length
                ? bookMakerOdds.findIndex((itm) => itm.marketId === br.marketId)
                : -1;
              if (!disable) {
                if (index > -1)
                  bookMakerOdds[index] = {
                    suspend: suspend,
                    disable: disable,
                    marketId: br.marketId ? br.marketId : "-1",
                    marketName: br.marketName ? br.marketName : "Bookmaker",
                    customMarketName:
                      br.customMarketName !== undefined
                        ? br.customMarketName
                        : bookMakerOdds[index]?.customMarketName || "",
                    runners: bmRunners,
                    status: br.status ? br.status : "OPEN",
                    commissionEnabled:
                      br.commissionEnabled !== undefined
                        ? br.commissionEnabled
                        : bookMakerOdds[index].commissionEnabled,
                    marketLimits:
                      br.marketLimits !== undefined
                        ? br.marketLimits
                        : bookMakerOdds[index].marketLimits,
                  };
                else
                  bookMakerOdds.push({
                    suspend: suspend,
                    disable: disable,
                    marketId: br.marketId ? br.marketId : "-1",
                    marketName: br.marketName ? br.marketName : "Bookmaker",
                    customMarketName:
                      br.customMarketName !== undefined
                        ? br.customMarketName
                        : "",
                    runners: bmRunners,
                    status: br.status ? br.status : "OPEN",
                    commissionEnabled:
                      br.commissionEnabled !== undefined
                        ? br.commissionEnabled
                        : prevBMMap.get(br.marketId),
                    marketLimits:
                      br.marketLimits !== undefined
                        ? br.marketLimits
                        : limitMap.get(br.marketId),
                  });
              }
            }
          }
          bookMakerOdds.sort((a, b) => {
            const aDesc = a.marketId;
            const bDesc = b.marketId;
            if (aDesc > bDesc) return 1;
            else if (aDesc < bDesc) return -1;
            else return 0;
          });
          marketsMap[eventId].bookmakers = bookMakerOdds;
          marketsMap[eventId].enableBookmaker = action.payload.enableBookmaker;
          return {
            ...state,
            secondaryMarketsMap: marketsMap,
            suspendedMarketsMap: suspendMarketsMap,
            disabledMarketsMap: disabledMarketsMap,
          };
        }
      } catch (e) {
        console.error("Failed to update odds ", e);
      }
    }

    // Updated when list markets or events is called
    case UPDATE_SECONDARY_MARKETS: {
      const events = action.payload.events;
      const marketsMap = { ...state.secondaryMarketsMap };
      let suspendMarketsMap = { ...state.suspendedMarketsMap };
      let disabledMarketsMap: DisabledMarketDTOMap = {
        ...state.disabledMarketsMap,
      };
      let marketIdLimitMap = { ...state.marketIdLimitMap };
      events?.forEach((eventData) => {
        const eventId = eventData.eventId;

        // Initialize event data if not present
        if (!marketsMap[eventId]) {
          marketsMap[eventId] = {
            bookmakers: [],
            enableBookmaker: false,
            fancyMarkets: [],
            enableFancy: false,
            fancySuspended: false,
            fancyDisabled: false,
          };
        }

        // Set BookmakerOdds Data
        const bookMakerOddsData = eventData.bookmakerOddsData;
        const prevBMMap = new Map();
        const bookmakers = marketsMap[eventId].bookmakers;
        let limitMap = new Map();

        for (const {
          marketId,
          commissionEnabled,
          marketLimits,
        } of bookmakers) {
          if (commissionEnabled !== undefined) {
            prevBMMap.set(marketId, commissionEnabled);
          }
          if (marketLimits !== undefined) {
            limitMap.set(marketId, marketLimits);
          }
        }

        let bookMakerOdds = [];
        if (bookMakerOddsData && bookMakerOddsData.length) {
          for (let br of bookMakerOddsData) {
            let bmRunners = [];
            let suspend = getSuspendValue(
              suspendMarketsMap,
              eventData?.providerId,
              eventData?.sportId,
              eventData?.competitionId,
              eventId,
              br?.marketType,
              br?.marketId,
              br?.suspended
            );
            let disable: boolean = getDisableValue(
              disabledMarketsMap,
              eventData?.providerId,
              eventData?.sportId,
              eventData?.competitionId,
              eventId,
              br?.marketType,
              br?.marketId,
              br?.disabled
            );
            for (let b of br.runners) {
              bmRunners.push({
                runnerId: b.runnerId ? b.runnerId : "",
                runnerName: b.runnerName ? b.runnerName : "",
                backPrice: b.backPrices[0]?.price,
                backSize: b.backPrices[0]?.size,
                layPrice: b.layPrices[0]?.price,
                laySize: b.layPrices[0]?.size,
                status: b.status ? b.status : "",
                sort: b.sort,
              });
            }
            // bmRunners.sort((a, b) => +a.runnerId - +b.runnerId);
            bmRunners.sort((a, b) => Number(a.sort) - Number(b.sort));

            let index = bookMakerOdds.findIndex(
              (itm) => itm.marketId === br.marketId
            );
            if (index > -1) {
              bookMakerOdds[index] = {
                ...bookMakerOdds[index],
                suspend: suspend,
                disable: disable,
                runners: bmRunners,
                status: br.status ? br.status : "OPEN",
                commissionEnabled:
                  br.commissionEnabled !== undefined
                    ? br.commissionEnabled
                    : bookMakerOdds[index].commissionEnabled,
                marketLimits:
                  br.marketLimits !== undefined
                    ? br.marketLimits
                    : bookMakerOdds[index].marketLimits,
              };
            } else {
              // Find existing bookmaker to preserve customMarketName
              const existingBookmaker = bookMakerOdds.find(
                (bm) => bm.marketId === br.marketId
              );
              bookMakerOdds.push({
                suspend: suspend,
                disable: disable,
                marketId: br.marketId ? br.marketId : "-1",
                marketName: br.marketName ? br.marketName : "Bookmaker",
                customMarketName:
                  br.customMarketName !== undefined
                    ? br.customMarketName
                    : existingBookmaker?.customMarketName || "",
                runners: bmRunners,
                status: br.status ? br.status : "OPEN",
                commissionEnabled:
                  br.commissionEnabled !== undefined
                    ? br.commissionEnabled
                    : prevBMMap.get(br.marketId),
                marketLimits:
                  br.marketLimits !== undefined
                    ? br.marketLimits
                    : limitMap.get(br.marketId),
              });
            }
          }
        }
        bookMakerOdds.sort((a, b) => {
          const aDesc = a.marketId;
          const bDesc = b.marketId;
          if (aDesc > bDesc) return 1;
          else if (aDesc < bDesc) return -1;
          else return 0;
        });

        marketsMap[eventId].bookmakers = bookMakerOdds;
        marketsMap[eventId].enableBookmaker = eventData.enableBookmaker;

        // Set Fancy markets data
        const fancyOddsData = eventData.sessionOddsData;
        const prevFancyMap = new Map();
        const fancyMarkets = marketsMap[eventId].fancyMarkets;

        for (const {
          marketId,
          commissionEnabled,
          marketLimits,
        } of fancyMarkets) {
          if (commissionEnabled !== undefined) {
            prevFancyMap.set(marketId, commissionEnabled);
          }
          if (marketLimits !== undefined) {
            limitMap.set(marketId, marketLimits);
          }
        }

        let fancyOdds = [];
        if (fancyOddsData && fancyOddsData.length > 0) {
          for (let f of fancyOddsData) {
            // if (!f.marketName.toLowerCase().split(' ').includes('bhav')) {
            let suspend = getSuspendValue(
              suspendMarketsMap,
              eventData?.providerId,
              eventData?.sportId,
              eventData?.competitionId,
              eventId,
              f?.marketType,
              f?.marketId,
              f?.suspended
            );

            let disable: boolean = getDisableValue(
              disabledMarketsMap,
              eventData?.providerId,
              eventData?.sportId,
              eventData?.competitionId,
              eventId,
              f?.marketType,
              f?.marketId,
              f?.disabled
            );
            if (disable) {
              continue;
            }

            let marketLimitExists = marketIdLimitExists(
              marketIdLimitMap,
              eventId,
              f?.marketType,
              f?.marketId,
              f?.marketLimitSet
            );

            // Find existing fancy market to preserve customMarketName
            const existingFancyMarket = marketsMap[eventId].fancyMarkets?.find(
              (fm) => fm.marketId === f.marketId
            );
            fancyOdds.push({
              ...f,
              marketId: f.marketId ? f.marketId : "",
              marketName: f.marketName ? f.marketName : "",
              customMarketName:
                f.customMarketName !== undefined
                  ? f.customMarketName
                  : existingFancyMarket?.customMarketName || "",
              status: f.status ? f.status : "",
              sort: f.sort ? Number(f.sort) : 0,
              layPrice: f.noValue
                ? f.category === "fancy3" || f.category === "odd-even"
                  ? f.noValue.toFixed(2)
                  : f.noValue
                : null,
              backPrice: f.yesValue
                ? f.category === "fancy3" || f.category === "odd-even"
                  ? f.yesValue.toFixed(2)
                  : f.yesValue
                : null,
              laySize: f.noRate ? f.noRate : null,
              backSize: f.yesRate ? f.yesRate : null,
              category: getFancyCategory(f.category),
              commissionEnabled:
                f.commissionEnabled !== undefined
                  ? f.commissionEnabled
                  : prevFancyMap.get(f.marketId),
              marketLimits:
                f.marketLimits !== undefined
                  ? f.marketLimits
                  : limitMap.get(f.marketId),
              suspend: suspend,
              disable: disable,
              isMarketLimitSet: marketLimitExists,
            });
            // }
          }
        } else if (marketsMap[eventId].fancyMarkets) {
          fancyOdds = marketsMap[eventId].fancyMarkets;
          for (let fMarket of fancyOdds) {
            fMarket.status = "SUSPENDED";
            fMarket.suspend = true;
            fMarket.disable = true;
          }
        }
        fancyOdds.sort(
          (a, b) => a.sort - b.sort || b.marketName.localeCompare(a.marketName)
        );

        marketsMap[eventId].fancyMarkets = fancyOdds;
        marketsMap[eventId].enableFancy = eventData.enableFancy;
        marketsMap[eventId].fancySuspended = eventData.fancySuspended;
        marketsMap[eventId].fancyDisabled = eventData.fancyDisabled;
      });

      return {
        ...state,
        secondaryMarketsMap: marketsMap,
        suspendedMarketsMap: suspendMarketsMap,
        disabledMarketsMap: disabledMarketsMap,
        marketIdLimitMap: marketIdLimitMap,
      };
    }

    case DISABLE_EVENT_DATA: {
      const sportId = action.payload.sportId;
      const competitionId = action.payload.competitionId;
      const eventId = action.payload.eventId;
      let disableEvent = action.payload.disableEvent;
      if (!disableEvent && state.selectedEvent.id === eventId) {
        disableEvent = true;
      }

      const allEvents = { ...state.events };
      const allSecMarkets = { ...state.secondaryMarketsMap };

      if (allEvents[sportId][competitionId][eventId])
        if (disableEvent) {
          const eData = allEvents[sportId][competitionId][eventId];
          for (let runner of eData.matchOdds?.runners) {
            runner.status = "SUSPENDED";
          }
          allEvents[sportId][competitionId][eventId] = eData;
        } else {
          delete allEvents[sportId][competitionId][eventId];
        }
      if (allSecMarkets[eventId])
        if (disableEvent) {
          const secMarkets = allSecMarkets[eventId];
          for (let bookmaker of secMarkets?.bookmakers) {
            for (let runner of bookmaker.runners) {
              runner.backPrice = "0";
              runner.backSize = "0";
              runner.layPrice = "0";
              runner.laySize = "0";
            }
          }
          for (let fanctMarket of secMarkets?.fancyMarkets) {
            fanctMarket.status = "SUSPENDED";
          }
          allSecMarkets[eventId] = secMarkets;
        } else {
          delete allSecMarkets[eventId];
        }

      return {
        ...state,
        events: allEvents,
        secondaryMarketsMap: allSecMarkets,
      };
    }

    case UPDATE_PREMIUM_MARKETS_WS: {
      // const market = action.payload.eventData;
      const premiumSporsMap = { ...state.premiumMarketsMap };

      const key = action.payload.eventId;
      const eventData = action.payload.body;

      if (premiumSporsMap[key]) {
        if (
          premiumSporsMap[key].markets &&
          premiumSporsMap[key].markets.matchOdds.length > 0
        ) {
          for (let market of eventData?.markets?.matchOdds) {
            const index = premiumSporsMap[key].markets.matchOdds.findIndex(
              (x) => x.marketId === market.marketId
            );

            if (index !== -1) {
              premiumSporsMap[key].markets.matchOdds[index] = market;
            }
          }
        }
      }

      return {
        ...state,
        premiumMarketsMap: premiumSporsMap,
      };
    }

    case SET_EXCH_EVENT: {
      return {
        ...state,
        selectedEvent: action.payload,
      };
    }

    case RESET_EVENTS: {
      return {
        ...state,
        events: {},
      };
    }

    case UPDATE_SCORECARD: {
      return {
        ...state,
        scorecard: action.payload,
      };
    }

    case UPDATE_BINARY_MARKETS: {
      return {
        ...state,
        binaryMarkets: action.payload,
      };
    }
    case UPDATE_PREMIUM_MARKETS: {
      const eventData = action.payload.eventData;
      const premiumMarketsMap = { ...state.premiumMarketsMap };
      premiumMarketsMap[action.payload.eventId] = eventData;
      return {
        ...state,
        premiumMarketsMap: premiumMarketsMap,
      };
    }
    case SET_BETFAIR_WS_CONNECTION:
      return {
        ...state,
        betFairWSConnected: action.payload,
      };
    case SET_PUSH_NOTIF_WS_CONNECTION:
      return {
        ...state,
        pushNotifWSConnection: action.payload,
      };
    case SET_SPORTS_RADAR_WS_CONNECTION:
      return {
        ...state,
        sportsRadarWSConnected: action.payload,
      };
    case SET_DREAM_WS_CONNECTION:
      return {
        ...state,
        dreamWSConnected: action.payload,
      };
    default:
      return state;
  }
};

export default exchangeSportsReducer;
