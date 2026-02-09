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
  UPDATE_FANCY_MARKETS,
  UPDATE_BOOKMAKER_MARKETS,
  DISABLE_EVENT_DATA,
  UPDATE_SCORECARD,
  UPDATE_SECONDARY_MATCH_ODDS,
  UPDATE_BINARY_MARKETS,
  UPDATE_PREMIUM_MARKETS,
  UPDATE_PREMIUM_MARKETS_WS,
  FETCH_TOTAL_EVENT_LIST,
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
import { SelectedObj } from "../../models/ExchangeSportsState";
import { AxiosResponse } from "axios";
import { EventDTO } from "../../models/common/EventDTO";
import { PROVIDER_ID } from "../../constants/Branding";
import { EXCH_COMPETITIONS_MENU } from "../../constants/CommonConstants";
import { getAccountPathFromToken } from "../auth/authActions";
import { isAccountPath } from "../common/commonActions";
import { BFToSRIdMap, SPToBFIdMap } from "../../util/stringUtil";
import { marketNotifications } from "../../description/notificationsData";
import { eventData } from "../../description/eventData";

// redux Actions
export const resetExchangeState = () => {
  return {
    type: RESET_STATE,
    payload: {},
  };
};

// EventTypes
export const setEventType = (eventType: SelectedObj) => {
  return {
    type: SET_EVENT_TYPE,
    payload: eventType,
  };
};

export const setPageNumber = (pageNo: number) => {
  return {
    type: SET_PAGE_NUMBER,
    payload: pageNo,
  };
};

const setLoading = (laoding: boolean) => {
  return {
    type: SET_LOADING,
    payload: laoding,
  };
};

const updateTopicUrlsInStore = (dispatch: Function, eventData: any) => {
  // Dispatch topic urls
  const topicUrlPayload = {
    matchOddsBaseUrl: eventData?.markets?.matchOddsBaseUrl,
    matchOddsTopic: eventData?.markets?.matchOddsTopic,
    bookMakerBaseUrl: eventData?.markets?.bookMakerBaseUrl,
    bookMakerTopic: eventData?.markets?.bookMakerTopic,
    fancyBaseUrl: eventData?.markets?.fancyBaseUrl,
    fancyTopic: eventData?.markets?.fancyTopic,
    premiumBaseUrl: eventData?.markets?.premiumBaseUrl,
    premiumTopic: eventData?.markets?.premiumTopic,
  };
  dispatch(updateTopicUrls(topicUrlPayload));
};

// Competitions
export const fetchCompetitions = (sportId: string) => {
  return async (dispatch: Function) => {
    try {
      if (sportId !== "") {
        // Use dummy data from eventData instead of API call
        const dummyCompetitions = [
          {
            competitionId: eventData[0].competitionId,
            competitionName: eventData[0].competitionName,
            sportId: eventData[0].sportId,
          },
        ];
        const payload = {
          sportId: sportId,
          competitions: dummyCompetitions,
        };
        dispatch(fetchCompetitionsSuccess(payload));
      }
    } catch (err) {
      console.log(err);
    }
  };
};

const fetchCompetitionsSuccess = (result) => {
  return {
    type: FETCH_COMPETITIONS_BY_EVENT_TYPE_SUCCESS,
    payload: result,
  };
};
const fetchPremiumMarketsSuccess = (result) => {
  return {
    type: UPDATE_PREMIUM_MARKETS,
    payload: result,
  };
};

export const setCompetition = (competition: SelectedObj) => {
  return {
    type: SET_COMPETITION,
    payload: competition,
  };
};

// Events
export const fetchEventsByCompetition = (
  sportId: string,
  competitionId: string,
  events: EventDTO[],
  track: string = ""
) => {
  return async (dispatch: Function) => {
    try {
      if (sportId !== "" && competitionId !== "") {
        dispatch(setLoading(true));
        // Use dummy data from eventData instead of API call
        let result = { data: eventData };

        let newList = [];
        let eventsList = [];
        let secondaryMarketEvents = [];
        let secondaryMatchOddsEvents = [];
        if (result && result.data.length > 0) {
          updateTopicUrlsInStore(dispatch, result.data[0]);
          for (let eventData of result.data) {
            try {
              if (eventData?.eventId) {
                newList.push(eventData?.eventId);
                const eData = {
                  enabled: eventData?.enabled,
                  status: eventData?.status,
                  openDate: eventData?.openDate,
                  customOpenDate: eventData?.customOpenDate,
                  sportId: eventData?.sportId.includes(":")
                    ? SPToBFIdMap[eventData?.sportId]
                    : eventData?.sportId,
                  competitionId: eventData?.competitionId,
                  competitionName: eventData?.competitionName
                    ? eventData?.competitionName
                    : "Other",
                  eventId: eventData?.eventId,
                  eventName: eventData?.eventName,
                  customEventName: eventData?.customEventName,
                  homeTeam: eventData?.homeTeam || "",
                  awayTeam: eventData?.awayTeam || "",
                  marketId: eventData?.marketId,
                  providerName: eventData?.providerName,
                  enableFancy: eventData?.markets
                    ? eventData?.markets?.enableFancy
                    : false,
                  enableMatchOdds: eventData?.markets
                    ? eventData?.markets?.enableMatchOdds
                    : false,
                  enableBookmaker: eventData?.markets
                    ? eventData?.markets?.enableBookmaker
                    : false,
                  bookMakerProvider: eventData?.markets
                    ? eventData?.markets?.bookMakerProvider
                    : "",
                  fancyProvider: eventData?.markets
                    ? eventData?.markets?.fancyProvider
                    : "",
                  enablePremium: eventData?.markets
                    ? eventData?.markets?.enablePremium
                    : false,
                  enableToss: eventData?.markets
                    ? eventData?.markets?.enableToss
                    : false,
                  catId: eventData?.catId,
                  forcedInplay: eventData.forcedInplay,
                  virtualEvent: eventData.virtualEvent,
                };

                eventsList.push({
                  ...eData,
                  sportId: eData.sportId,
                  competitionId: eData.competitionId,
                  matchOddsData:
                    eventData?.markets && eventData?.markets?.matchOdds
                      ? eventData?.markets?.matchOdds?.find(
                          (mo) =>
                            mo.marketName === "Match Odds" ||
                            mo?.marketName?.toLowerCase() === "moneyline" ||
                            eventData?.providerName?.toLowerCase() ===
                              "sportradar"
                        )
                      : null,
                  raceMarkets:
                    eventData.markets && eventData.markets.matchOdds
                      ? eventData.markets.matchOdds
                      : [],
                });

                if (eData.sportId === "1" || eData.sportId === "4") {
                  for (let mo of eventData.markets.matchOdds) {
                    if (
                      mo.marketName !== "Match Odds" &&
                      mo.marketName.toLowerCase() !== "moneyline"
                    ) {
                      const secMOPayload = {
                        eventId: eData.eventId,
                        marketId: mo.marketId,
                        matchOddsData: mo,
                      };
                      secondaryMatchOddsEvents.push(secMOPayload);
                    }
                  }
                }
                if (eData.sportId === "1" || eData.sportId === "4") {
                  for (let mo of eventData.markets.matchOdds) {
                    if (
                      mo.marketName !== "Match Odds" &&
                      mo.marketName.toLowerCase() !== "moneyline"
                    ) {
                      const secMOPayload = {
                        eventId: eData.eventId,
                        marketId: mo.marketId,
                        matchOddsData: mo,
                      };
                      dispatch(updateSecondaryMatchOdds(secMOPayload));
                    }
                  }
                }
                if (eData.sportId === "4") {
                  const secMarketsPayload = {
                    eventId: eData.eventId,
                    bookmakerOddsData: eventData.markets
                      ? eventData.markets.bookmakers
                      : null,
                    enableBookmaker: eventData.markets
                      ? eventData.markets.enableBookmaker
                      : false,
                    sessionOddsData: eventData.markets
                      ? eventData.markets.fancyMarkets
                      : null,
                    enableFancy: eventData.markets
                      ? eventData.markets.enableFancy
                      : false,
                  };
                  if (!(track === EXCH_COMPETITIONS_MENU)) {
                    secondaryMarketEvents.push(secMarketsPayload);
                  }
                }
              }
            } catch (err) {
              console.log(err);
            }
          }

          // Dispatch a single action with all events
          dispatch(updateSecondaryMarkets({ events: secondaryMarketEvents }));
          dispatch(fetchEventByCompetitionSuccess({ events: eventsList }));

          if (events && events.length > 0) {
            for (let ie of events) {
              if (!newList.includes(ie.eventId)) {
                const payload = {
                  sportId: ie.sportId,
                  competitionId: ie.competitionId,
                  eventId: ie.eventId,
                  disableEvent: false,
                };
                dispatch(disableEventData(payload));
              }
            }
          }
        } else {
          for (let ie of events) {
            const payload = {
              sportId: ie.sportId,
              competitionId: ie.competitionId,
              eventId: ie.eventId,
              disableEvent: true,
            };
            dispatch(disableEventData(payload));
          }
        }
        dispatch(setLoading(false));
      }
    } catch (err) {
      console.log(err);
      dispatch(setLoading(false));
    }
  };
};

// Fav Events
export const fetchFavEvents = async () => {
  try {
    // Use dummy data from eventData instead of API call
    return eventData;
  } catch (err) {
    console.log(err);
  }
};

export const fetchEventsBySport = (sportId: string, events: EventDTO[]) => {
  return async (dispatch: Function) => {
    try {
      if (sportId !== "") {
        // convert to sport radar id if it includes _
        sportId = sportId.split("_").join(":");

        dispatch(setLoading(true));
        
        // Use the events parameter passed in (from API) instead of dummy data
        // This is critical for horseracing and other sports that fetch from API
        let eventsToProcess = events && events.length > 0 ? events : [];
        
        console.log(`[fetchEventsBySport] Processing events:`, {
          sportId: sportId,
          eventCount: eventsToProcess.length,
          hasEventsParam: events && events.length > 0,
        });

        let newList = [];
        let eventsList = [];
        
        if (eventsToProcess.length > 0) {
          // Use the first event to update topic URLs if available
          if (eventsToProcess[0]) {
            updateTopicUrlsInStore(dispatch, eventsToProcess[0] as any);
          }
          
          for (let eventData of eventsToProcess) {
            try {
              // Support multiple event ID field names
              const eventId = eventData?.eventId || eventData?.match_id || eventData?.matchId || "";
              if (!eventId) {
                console.warn("[fetchEventsBySport] Skipping event without ID:", eventData);
                continue;
              }
              
              newList.push(eventId);
              
              // Use the sportId parameter passed to the function (already normalized)
              // This ensures events are stored with the correct sport ID for retrieval
              // For horseracing, this will be "7"
              const eventSportId = String(eventData?.sportId || eventData?.sport_id || sportId || "");
              // Use the sportId parameter if available, otherwise normalize the event's sportId
              const normalizedSportId = sportId && sportId !== "" 
                ? sportId  // Use the parameter (already normalized, e.g., "7" for horseracing)
                : (eventSportId.includes(":")
                    ? (SPToBFIdMap[eventSportId] || eventSportId)
                    : eventSportId);
              
              // Get competition ID and name
              const competitionId = eventData?.competitionId || eventData?.competition_id || eventData?.series_id || eventData?.seriesId || "";
              const competitionName = eventData?.competitionName || eventData?.competition_name || eventData?.series_name || eventData?.seriesName || "Other";
              
              const eData = {
                enabled: eventData?.enabled !== false && eventData?.is_active !== 0,
                status: eventData?.status || "UPCOMING",
                openDate: eventData?.openDate || eventData?.open_date || eventData?.match_date || eventData?.matchDate || new Date().toISOString(),
                customOpenDate: eventData?.customOpenDate,
                sportId: normalizedSportId,
                competitionId: competitionId,
                competitionName: competitionName,
                eventId: eventId,
                eventName: eventData?.eventName || eventData?.event_name || eventData?.match_name || eventData?.matchName || "",
                customEventName: eventData?.customEventName,
                homeTeam: eventData?.homeTeam || eventData?.home_team || "",
                awayTeam: eventData?.awayTeam || eventData?.away_team || "",
                marketId: eventData?.marketId || eventData?.market_id || "",
                providerName: eventData?.providerName || eventData?.provider_name || "BetFair",
                enableFancy: eventData?.enableFancy || (eventData?.markets ? eventData?.markets?.enableFancy : false) || (eventData?.enable_fancy === 1),
                enableMatchOdds: eventData?.enableMatchOdds !== false,
                enableBookmaker: eventData?.enableBookmaker || (eventData?.markets ? eventData?.markets?.enableBookmaker : false),
                bookMakerProvider: eventData?.bookMakerProvider || (eventData?.markets ? eventData?.markets?.bookMakerProvider : ""),
                fancyProvider: eventData?.fancyProvider || (eventData?.markets ? eventData?.markets?.fancyProvider : ""),
                enablePremium: eventData?.enablePremium || (eventData?.markets ? eventData?.markets?.enablePremium : false),
                enableToss: eventData?.enableToss || (eventData?.markets ? eventData?.markets?.enableToss : false),
                catId: eventData?.catId,
                virtualEvent: eventData?.virtualEvent || eventData?.virtual_event || false,
                inplay: eventData?.inplay || eventData?.inPlay || eventData?.in_play || false,
                forcedInplay: eventData?.forcedInplay || eventData?.forcedInPlay || false,
              };

              // Get matchOdds from eventData - could be in matchOdds property or markets.matchOdds
              const matchOddsData = eventData?.matchOdds 
                ? eventData.matchOdds 
                : (eventData?.markets && eventData?.markets?.matchOdds
                    ? (Array.isArray(eventData.markets.matchOdds)
                        ? eventData.markets.matchOdds.find(
                            (mo: any) =>
                              mo.marketName === "Match Odds" ||
                              mo?.marketName?.toLowerCase() === "moneyline" ||
                              eventData?.providerName?.toLowerCase() === "sportradar"
                          )
                        : eventData.markets.matchOdds)
                    : null);

              eventsList.push({
                ...eData,
                ...eventData, // Include all original event data for compatibility
                sportId: normalizedSportId,
                competitionId: competitionId,
                matchOddsData: matchOddsData,
                matchOdds: matchOddsData, // Also set as matchOdds for compatibility
                raceMarkets:
                  eventData.raceMarkets || (eventData.markets && eventData.markets.matchOdds
                    ? (Array.isArray(eventData.markets.matchOdds) ? eventData.markets.matchOdds : [eventData.markets.matchOdds])
                    : []) || [],
              });

              if (eData.sportId === "1") {
                if (eventData?.markets?.matchOdds?.length > 0) {
                  for (let mo of eventData.markets.matchOdds) {
                    if (
                      mo.marketName !== "Match Odds" &&
                      mo.marketName.toLowerCase() !== "moneyline"
                    ) {
                      const secMOPayload = {
                        eventId: eData.eventId,
                        marketId: mo.marketId,
                        matchOddsData: mo,
                      };
                      dispatch(updateSecondaryMatchOdds(secMOPayload));
                    }
                  }
                }
              }
            } catch (err) {
              console.log(err);
            }
          }
          }

          // Dispatch a single action with all events
          console.log(`[fetchEventsBySport] Dispatching ${eventsList.length} events to Redux:`, {
            sportId: sportId,
            eventCount: eventsList.length,
            sampleEvent: eventsList[0] ? {
              eventId: eventsList[0].eventId,
              sportId: eventsList[0].sportId,
              eventName: eventsList[0].eventName,
            } : null,
          });
          
          dispatch(fetchEventByCompetitionSuccess({ events: eventsList }));

          if (events && events.length > 0) {
            for (let ie of events) {
              //todo : revisit this piece of code
              if (!newList.includes(ie.eventId.split("_").join(":"))) {
                const payload = {
                  sportId: ie.sportId,
                  competitionId: ie.competitionId,
                  eventId: ie.eventId,
                  disableEvent: false,
                };
                dispatch(disableEventData(payload));
              }
            }
          }
        } else {
          if (events) {
            for (let ie of events) {
              const payload = {
                sportId: ie.sportId,
                competitionId: ie.competitionId,
                eventId: ie.eventId,
                disableEvent: false,
              };
              dispatch(disableEventData(payload));
            }
          }
        }
        dispatch(setLoading(false));
      }
     catch (err) {
      console.log(err);
      dispatch(setLoading(false));
    }
  };
};

export const fetchInplayEvents = () => {
  return async (dispatch: Function) => {
    try {
      dispatch(setLoading(true));
      // Use dummy data from eventData instead of API call
      let result = { data: eventData };
      updateEventsInStore(dispatch, result);
      dispatch(setLoading(false));
    } catch (err) {
      console.log(err);
      dispatch(setLoading(false));
    }
  };
};

export const fetchEventsInDateRange = (startDate, endDate) => {
  return async (dispatch: Function) => {
    try {
      dispatch(setLoading(true));
      // Use dummy data from eventData instead of API call
      let result = { data: eventData };
      updateEventsInStore(dispatch, result);
    } catch (err) {
      console.log(err);
    }
    dispatch(setLoading(false));
  };
};

export const updateOddsfromWS = (payload) => {
  return {
    type: FETCH_EVENT_BY_COMPETITION_SUCCESS,
    payload: payload,
  };
};

export const disableEventData = (payload) => {
  return {
    type: DISABLE_EVENT_DATA,
    payload: payload,
  };
};

export const updatePremiumMarkes = (payload) => {
  return {
    type: UPDATE_PREMIUM_MARKETS_WS,
    payload: payload,
  };
};

const fetchEventByCompetitionSuccess = (result) => {
  return {
    type: FETCH_EVENT_BY_COMPETITION_SUCCESS,
    payload: result,
  };
};

export const clearAllEvents = () => {
  return {
    type: RESET_EVENTS,
    payload: {},
  };
};

export const setExchEvent = (event: SelectedObj) => {
  return {
    type: SET_EXCH_EVENT,
    payload: event,
  };
};

export const fetchEvent = (
  sportId: string,
  competitionId: string,
  eventId: string,
  marketTime?: string
) => {
  return async (dispatch: Function) => {
    try {
      if (sportId !== "" && competitionId !== "" && eventId !== "") {
        // Use dummy data from eventData instead of API call
        const eventDataItem = eventData[0];
        let eventsList = [];
        let secondaryMarketEvents = [];

        updateTopicUrlsInStore(dispatch, eventDataItem);
        if (eventDataItem?.eventId) {
          const eData = {
            enabled: eventDataItem?.enabled,
            status: eventDataItem?.status,
            openDate: eventDataItem?.openDate,
            customOpenDate: eventDataItem?.customOpenDate,
            sportId: eventDataItem?.sportId.includes(":")
              ? SPToBFIdMap[eventDataItem?.sportId]
              : eventDataItem?.sportId,
            competitionId: eventDataItem?.competitionId,
            competitionName: eventDataItem?.competitionName
              ? eventDataItem?.competitionName
              : "Other",
            eventId: eventDataItem?.eventId,
            eventName: eventDataItem?.eventName,
            customEventName: eventDataItem?.customEventName,
            homeTeam: eventDataItem?.homeTeam || "",
            awayTeam: eventDataItem?.awayTeam || "",
            marketId: eventDataItem?.marketId,
            providerName: eventDataItem?.providerName,
            enableFancy: eventDataItem?.markets
              ? eventDataItem?.markets?.enableFancy
              : false,
            enableMatchOdds: eventDataItem?.markets
              ? eventDataItem?.markets?.enableMatchOdds
              : false,
            enableBookmaker: eventDataItem?.markets
              ? eventDataItem?.markets?.enableBookmaker
              : false,
            bookMakerProvider: eventDataItem?.markets
              ? eventDataItem?.markets?.bookMakerProvider
              : "",
            fancyProvider: eventDataItem?.markets
              ? eventDataItem?.markets?.fancyProvider
              : "",
            enablePremium: eventDataItem?.markets
              ? eventDataItem?.markets?.enablePremium
              : false,
            catId: eventDataItem?.catId,
            forcedInplay: eventDataItem.forcedInplay,
            virtualEvent: eventDataItem.virtualEvent,
            liveStreamChannelId: eventDataItem.liveStreamChannelId,
          };

          eventDataItem?.markets?.matchOdds?.forEach((mo) => {
            if (eData.sportId === "4") {
              if (
                mo.marketName !== "Match Odds" &&
                mo.marketName.toLowerCase() !== "moneyline" &&
                mo.marketId !== "1.196548297" &&
                mo.marketId !== "1.196548301"
              ) {
                const secMOPayload = {
                  eventId: eventDataItem.eventId,
                  marketId: mo.marketId,
                  matchOddsData: mo,
                };
                dispatch(updateSecondaryMatchOdds(secMOPayload));
              }
            } else {
              if (
                mo?.marketName !== "Match Odds" &&
                mo?.marketName?.toLowerCase() !== "moneyline"
              ) {
                const secMOPayload = {
                  eventId: eventDataItem.eventId,
                  marketId: mo.marketId,
                  matchOddsData: mo,
                };
                dispatch(updateSecondaryMatchOdds(secMOPayload));
              }
            }
          });

          if (
            eData.sportId === "4" ||
            eData.sportId === "2" ||
            eData.sportId === "99990" ||
            eData.sportId === "1" ||
            eData.sportId === "2378961" ||
            eData.sportId === "99994"
          ) {
            const secMarketsPayload = {
              eventId: eData.eventId,
              bookmakerOddsData: eventDataItem.markets
                ? eventDataItem.markets.bookmakers
                : null,
              enableBookmaker: eventDataItem.markets
                ? eventDataItem.markets.enableBookmaker
                : false,
              sessionOddsData: eventDataItem.markets
                ? eventDataItem.markets.fancyMarkets
                : null,
              enableFancy: eventDataItem.markets
                ? eventDataItem.markets.enableFancy
                : false,
            };
            secondaryMarketEvents.push(secMarketsPayload);
          }

          const secondaryMatchOddsMarketIds: string[] = [];
          let matchOddsData = null;
          if (eventDataItem.markets && eventDataItem.markets.matchOdds) {
            for (let mo of eventDataItem.markets.matchOdds) {
              if (mo?.marketName === "Match Odds") {
                matchOddsData = mo;
              } else {
                secondaryMatchOddsMarketIds.push(mo.marketId);
              }
            }
          }
          eventsList.push({
            ...eData,
            sportId: SPToBFIdMap[eData.sportId]
              ? SPToBFIdMap[eData.sportId]
              : eData.sportId,
            competitionId: eData.competitionId,
            matchOddsData: matchOddsData,
            secondaryMatchOddsMarketIds: secondaryMatchOddsMarketIds,
            onRefresh: true,
          });
        }
        // Dispatch a single action with all events
        dispatch(updateSecondaryMarkets({ events: secondaryMarketEvents }));
        dispatch(fetchEventByCompetitionSuccess({ events: eventsList }));
      }
    } catch (ex) {
      console.log(ex);
    }
  };
};

export const updateSecondaryMarkets = (payload) => {
  return {
    type: UPDATE_SECONDARY_MARKETS,
    payload: payload,
  };
};
export const updateFancyMarkets = (payload) => {
  return {
    type: UPDATE_FANCY_MARKETS,
    payload: payload,
  };
};
export const updateBookMakerMarkets = (payload) => {
  return {
    type: UPDATE_BOOKMAKER_MARKETS,
    payload: payload,
  };
};

export const updateSuspendedMarkets = (payload) => {
  return {
    type: SUSPENDED_MARKETS,
    payload: payload,
  };
};

export const updateDisabledMarkets = (payload) => {
  return {
    type: DISABLED_MARKETS,
    payload: payload,
  };
};

export const updateCommissionMarkets = (payload) => {
  return {
    type: COMMISSION_MARKETS,
    payload: payload,
  };
};

export const updateSecondaryMatchOdds = (payload) => {
  return {
    type: UPDATE_SECONDARY_MATCH_ODDS,
    payload: payload,
  };
};

export const updateBinaryMarkets = (payload) => {
  return {
    type: UPDATE_BINARY_MARKETS,
    payload: payload,
  };
};

export const updateEventScorecard = (payload) => {
  return {
    type: UPDATE_SCORECARD,
    payload: payload,
  };
};

export const updateTopicUrls = (payload) => {
  return {
    type: UPDATE_TOPIC_URLS,
    payload: payload,
  };
};

export const fetchPremiummarketsByEventId = (
  providerId: string,
  sportId: string,
  competitionId: string,
  eventId: string,
  marketTime: string
) => {
  return async (dispatch: Function) => {
    try {
      if (eventId !== "") {
        // Use dummy data from eventData instead of API call
        const eventDataItem = { ...eventData[0], onRefresh: true };
        updateTopicUrlsInStore(dispatch, eventDataItem);
        if (eventDataItem.eventId) {
          const payload = {
            eventId: eventId,
            eventData: eventDataItem,
          };
          if (providerId !== PROVIDER_ID) {
            dispatch(
              fetchEventByCompetitionSuccess({ events: [eventDataItem] })
            );
          }
          dispatch(fetchPremiumMarketsSuccess(payload));
        }
      }
    } catch (ex) {
      console.log(ex);
    }
  };
};

export const fetchMarketNotifications = (
  sportId: string,
  competitionId: string,
  eventId: string
) => {
  return async (dispatch: Function) => {
    dispatch(updateMarketNotifications(marketNotifications));
  };
};

const updateMarketNotifications = (payload) => {
  return {
    type: UPDATE_MARKET_NOTIFICATIONS,
    payload: payload,
  };
};

const fetchCountCategoryEventsSuccess = (result) => {
  return {
    type: FETCH_TOTAL_EVENT_LIST,
    payload: result,
  };
};

export const triggerFetchMarkets = (
  sportId,
  competitionId,
  eventId,
  notificationData
) => {
  var limitKey = notificationData.limitKey;
  var trigger = false;

  if (isAccountPath(limitKey)) {
    if (getAccountPathFromToken().includes(limitKey)) {
      trigger = true;
    }
  } else {
    limitKey = limitKey.concat("/");
    const checkKey = limitKey.includes("/EI/")
      ? `/EI/${eventId}/`
      : limitKey.includes("/CI/")
      ? `/CI/${competitionId}/`
      : limitKey.includes("/SI/")
      ? `/SI/${sportId}/`
      : limitKey.includes("/SPORTS/")
      ? `/SPORTS/`
      : null;

    trigger = !!checkKey && limitKey.includes(checkKey);
  }
  if (trigger) {
    return {
      type: TRIGGER_FETCH_MARKETS,
    };
  }
};

export const triggerMarketNotifications = () => {
  return {
    type: TRIGGER_MARKET_NOTIFICATIONS,
  };
};

export const triggerFetchOrders = () => {
  return {
    type: TRIGGER_FETCH_ORDERS,
  };
};

export const triggerBetStatus = () => {
  return {
    type: TRIGGER_BET_STATUS,
  };
};

export const fetchCountCategoryEvents = () => {
  return async (dispatch: Function) => {
    try {
      // Use dummy data instead of API call
      const dummyCountData = {
        cricket: 1,
        football: 0,
        tennis: 0,
        binary: 0,
        politics: 0,
        kabaddi: 0,
      };
      dispatch(fetchCountCategoryEventsSuccess(dummyCountData));
    } catch (ex) {
      console.log(ex);
    }
  };
};

export const setBetFairWSConnection = (betFairWSConnected: boolean) => {
  return {
    type: SET_BETFAIR_WS_CONNECTION,
    payload: betFairWSConnected,
  };
};

export const setPushNotifWSConnection = (pushNotifWSConnection: boolean) => {
  return {
    type: SET_PUSH_NOTIF_WS_CONNECTION,
    payload: pushNotifWSConnection,
  };
};

export const setSportsRadarWSConnection = (sportsRadarWSConnected: boolean) => {
  return {
    type: SET_SPORTS_RADAR_WS_CONNECTION,
    payload: sportsRadarWSConnected,
  };
};

export const setDreamWSConnection = (dreamWSConnected: boolean) => {
  return {
    type: SET_DREAM_WS_CONNECTION,
    payload: dreamWSConnected,
  };
};

const updateEventsInStore = (dispatch, result) => {
  let newList = [];
  let eventsList = [];
  if (result && result.data.length > 0) {
    updateTopicUrlsInStore(dispatch, result.data[0]);
    for (let eventData of result.data) {
      try {
        if (eventData?.eventId) {
          newList.push(eventData?.eventId);
          const eData = {
            enabled: eventData?.enabled,
            status: eventData?.status,
            openDate: eventData?.openDate,
            customOpenDate: eventData?.customOpenDate,
            sportId: eventData?.sportId.includes(":")
              ? SPToBFIdMap[eventData?.sportId]
              : eventData?.sportId,
            competitionId: eventData?.competitionId,
            competitionName: eventData?.competitionName
              ? eventData?.competitionName
              : "Other",
            eventId: eventData?.eventId,
            eventName: eventData?.eventName,
            customEventName: eventData?.customEventName,
            homeTeam: eventData?.homeTeam || "",
            awayTeam: eventData?.awayTeam || "",
            marketId: eventData?.marketId,
            providerName: eventData?.providerName,
            enableFancy: eventData?.markets
              ? eventData?.markets?.enableFancy
              : false,
            enableMatchOdds: eventData?.markets
              ? eventData?.markets?.enableMatchOdds
              : false,
            enableBookmaker: eventData?.markets
              ? eventData?.markets?.enableBookmaker
              : false,
            bookMakerProvider: eventData?.markets
              ? eventData?.markets?.bookMakerProvider
              : "",
            fancyProvider: eventData?.markets
              ? eventData?.markets?.fancyProvider
              : "",
            enablePremium: eventData?.markets
              ? eventData?.markets?.enablePremium
              : false,
            enableToss: eventData?.markets
              ? eventData?.markets?.enableToss
              : false,
            catId: eventData?.catId,
            forcedInplay: eventData.forcedInplay,
            virtualEvent: eventData.virtualEvent,
          };

          eventsList.push({
            ...eData,
            sportId: eData.sportId,
            competitionId: eData.competitionId,
            matchOddsData:
              eventData?.markets && eventData?.markets?.matchOdds
                ? eventData?.markets?.matchOdds?.find(
                    (mo) =>
                      mo?.marketName === "Match Odds" ||
                      mo?.marketName?.toLowerCase() === "moneyline" ||
                      eventData?.providerName?.toLowerCase() === "sportradar"
                  )
                : null,
            raceMarkets:
              eventData.markets && eventData.markets.matchOdds
                ? eventData.markets.matchOdds
                : [],
          });
        }
      } catch (err) {
        console.log(err);
      }
    }

    // Dispatch a single action with all events
    dispatch(fetchEventByCompetitionSuccess({ events: eventsList }));
  }
};
