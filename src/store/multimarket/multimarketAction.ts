import {
  SET_MULTIMARKET_EVENT_DATA,
  UPDATE_MULTIMARKET_SECONDARY_MATCH_ODDS,
  UPDATE_MULTIMARKET_SECONDARY_MARKETS,
  UPDATE_MULTIMARKET_BOOKMAKER_MARKETS,
  MULTI_SUSPENDED_MARKETS,
  MULTI_COMMISSION_MARKETS,
  TRIGGER_MULTI_FETCH_MARKETS,
  TRIGGER_MULTI_FETCH_ORDERS,
  TRIGGER_MULTI_BET_STATUS,
} from "./multimarketActionTypes";
import { UPDATE_TOPIC_URLS } from "../exchangeSports/exchangeSportsActionTypes";
import { EventDTO } from "../../models/common/EventDTO";
import { PROVIDER_ID } from "../../constants/Branding";
import { getAccountPathFromToken } from "../auth/authActions";
import { isAccountPath } from "../common/commonActions";
import { eventData } from "../../description/eventData";

export const addToMultiMarket = (
  competitionId,
  eventId,
  marketId,
  providerId,
  sportId
) => {
  const username = sessionStorage.getItem("username") ?? "";
  if (marketId && username) {
    let data = [];
    const localData = localStorage.getItem(`multiMarket_${username}`) ?? "";
    if (localData) data = JSON.parse(atob(localData));
    const marketInclue = data?.filter((itm) => itm.marketId === marketId);
    if (marketInclue?.length === 0) {
      data.push({
        competitionId,
        eventId,
        marketId,
        providerId,
        sportId,
      });
      localStorage.setItem(
        `multiMarket_${username}`,
        btoa(JSON.stringify(data))
      );
    }
  }
};
export const removeToMultiMarket = (eventId, marketId) => {
  const username = sessionStorage.getItem("username") ?? "";
  if (username && marketId) {
    let data = [];
    const localData = localStorage.getItem(`multiMarket_${username}`) ?? "";
    if (localData) data = JSON.parse(atob(localData));
    const index = data?.findIndex(
      (itm) => itm.eventId === eventId && itm.marketId === marketId
    );
    index > -1 && data.splice(index, 1);
    index > -1 &&
      localStorage.setItem(
        `multiMarket_${username}`,
        btoa(JSON.stringify(data))
      );
  }
};

export const checkIncludeMultiMarket = (marketData, marketId, eventId) => {
  let marketInclue = marketData.filter((itm) => itm.marketId === marketId);
  return marketInclue.length ? true : false;
};

const setMultiMarketEventData = (payload) => {
  return {
    type: SET_MULTIMARKET_EVENT_DATA,
    payload: payload,
  };
};

export const updateMultiSecondaryMatchOdds = (payload) => {
  return {
    type: UPDATE_MULTIMARKET_SECONDARY_MATCH_ODDS,
    payload: payload,
  };
};

const updateMultiSecondaryMarkets = (payload) => {
  return {
    type: UPDATE_MULTIMARKET_SECONDARY_MARKETS,
    payload: payload,
  };
};

// export const updateMultiFancyMarkets = (payload) => {
//   return {
//     type: UPDATE_MULTIMARKET_FANCY_MARKETS,
//     payload: payload,
//   };
// };

export const updateMultiOddsfromWS = (payload) => {
  return {
    type: SET_MULTIMARKET_EVENT_DATA,
    payload: payload,
  };
};

export const updateMultiSuspendedMarkets = (payload) => {
  return {
    type: MULTI_SUSPENDED_MARKETS,
    payload: payload,
  };
};

export const updateMultiCommissionMarkets = (payload) => {
  return {
    type: MULTI_COMMISSION_MARKETS,
    payload: payload,
  };
};

export const updateMultiBookMakerMarkets = (payload) => {
  return {
    type: UPDATE_MULTIMARKET_BOOKMAKER_MARKETS,
    payload: payload,
  };
};

export const triggerMultiFetchMarkets = (payload) => {
  return {
    type: TRIGGER_MULTI_FETCH_MARKETS,
    payload: {
      accountPath: isAccountPath(payload.limitKey)
        ? getAccountPathFromToken()
        : null,
      data: payload,
    },
  };
};

export const triggerMultiFetchOrders = (eventId) => {
  return {
    type: TRIGGER_MULTI_FETCH_ORDERS,
    payload: eventId,
  };
};

export const triggerMultiBetStatus = (eventId) => {
  return {
    type: TRIGGER_MULTI_BET_STATUS,
    payload: eventId,
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

export const updateTopicUrls = (payload) => {
  return {
    type: UPDATE_TOPIC_URLS,
    payload: payload,
  };
};

export const fetchMultiMarketEventData = () => {
  return async (dispatch: Function) => {
    try {
      let data = [];
      const username = sessionStorage.getItem("username") ?? "";
      const multiMarket = localStorage.getItem(`multiMarket_${username}`);
      if (multiMarket) data = JSON.parse(atob(multiMarket));
      if (data?.length) {
        // Use dummy data from eventData instead of API call
        const response = { data: eventData };
        if (response?.data?.length > 0) {
          updateTopicUrlsInStore(dispatch, response.data[0]);
          for (let i = 0; i < response?.data?.length; i++) {
            const eventDataItem = response.data[i];
            if (eventDataItem.eventId) {
              const eData: EventDTO = {
                // inPlay: eventDataItem.inPlay,
                status: eventDataItem.status,
                openDate: eventDataItem.openDate,
                sportId: eventDataItem.sportId,
                competitionId: eventDataItem.competitionId,
                competitionName: eventDataItem.competitionName
                  ? eventDataItem.competitionName
                  : "Other",
                eventId: eventDataItem.eventId,
                eventName: eventDataItem.eventName,
                marketId: eventDataItem.marketId,
                providerName: eventDataItem.providerName,
                enabled: eventDataItem.enabled,
                catId: eventDataItem?.catId,
                forcedInplay: eventDataItem.forcedInplay,
                virtualEvent: eventDataItem.virtualEvent,
              };

              const payload = {
                eventData: eData,
                //eventData: response.data,
                sportId: eData.sportId,
                competitionId: eData.competitionId,
                eventId: eventDataItem.eventId,
                matchOddsData:
                  eventDataItem.markets && eventDataItem.markets.matchOdds
                    ? eventDataItem.markets.matchOdds.find(
                        (mo) =>
                          mo.marketName === "Match Odds" ||
                          mo.marketName.toLowerCase() === "moneyline"
                      )
                    : null,
                onRefresh: true,
              };

              dispatch(setMultiMarketEventData(payload));
              // if (eData.sportId === '1') {
              //|| eData.sportId === '4'
              if (eventDataItem.markets && eventDataItem.markets.matchOdds) {
                for (let mo of eventDataItem.markets.matchOdds) {
                  if (eData.sportId === "4") {
                    if (
                      mo.marketName !== "Match Odds" &&
                      mo.marketName.toLowerCase() !== "moneyline" &&
                      mo.marketId !== "1.196548297" &&
                      mo.marketId !== "1.196548301"
                    ) {
                      const secMOPayload = {
                        sportId: eventDataItem.sportId,
                        competitionId: eventDataItem.competitionId,
                        eventId: eventDataItem.eventId,
                        marketId: mo.marketId,
                        matchOddsData: mo,
                      };

                      dispatch(updateMultiSecondaryMatchOdds(secMOPayload));
                    }
                  } else {
                    if (
                      mo.marketName !== "Match Odds" &&
                      mo.marketName.toLowerCase() !== "moneyline"
                    ) {
                      const secMOPayload = {
                        sportId: eventDataItem.sportId,
                        competitionId: eventDataItem.competitionId,
                        eventId: eventDataItem.eventId,
                        marketId: mo.marketId,
                        matchOddsData: mo,
                      };

                      dispatch(updateMultiSecondaryMatchOdds(secMOPayload));
                    }
                  }
                }
              }
              // }

              if (
                eData.sportId === "4" ||
                eData.sportId === "2" ||
                eData.sportId === "1"
              ) {
                const secMarketsPayload = {
                  eventId: eData.eventId,
                  sportId: eData?.sportId,
                  competitionId: eData?.competitionId,
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
                dispatch(updateMultiSecondaryMarkets(secMarketsPayload));
              }
            }
          }
        }
      }
    } catch (ex) {
      console.log(ex);
    }
  };
};
