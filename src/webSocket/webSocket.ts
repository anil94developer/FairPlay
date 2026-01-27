import moment from "moment";
import SockJS from "sockjs-client";
import Stomp, { Frame } from "stompjs";
import {
  getSapTokenFromToken,
  updateBookMakerMarkets,
  updateFancyMarkets,
  updateMultiBookMakerMarkets,
  updateMultiOddsfromWS,
  updateMultiSecondaryMatchOdds,
  updateOddsfromWS,
  updatePremiumMarkes,
  updateSecondaryMatchOdds,
} from "../store";
import {
  setBetFairWSConnection,
  setDreamWSConnection,
  setSportsRadarWSConnection,
  updateEventScorecard,
} from "../store/exchangeSports/exchangeSportsActions";
import store from "../store/store";

let pushNotClient: Stomp.Client = null;
let stompClient: Stomp.Client = null;
let binaryStompClient: Stomp.Client = null;
let sportRadarClient: Stomp.Client = null;
let dreamClient: Stomp.Client = null;

// Match Odds Subscriptions
let wsSubscriptions = {};
let wsScorecardSubscriptions = {};
let eventHierarchyMap: Map<string, string> = new Map();

let wsSpSubscriptions = {};

// Bookmaker & Fancy Subscriptions
let wsSecMarketSubscritions = {};
let wsFancyMarketSubscritions = {};

// Secondary Match Odds Subscriptions
let wsSecMatchOddsSubscritions = {};

let refreshBetFairInterval: NodeJS.Timeout | undefined;
let refreshSportsRadarInterval: NodeJS.Timeout | undefined;
let refreshDreamInterval: NodeJS.Timeout | undefined;

// Check WS connection.
export const isPushNotificationConnected = () =>
  pushNotClient && pushNotClient.connected;

export const isConnected = () => stompClient && stompClient.connected;
export const isBinaryConnected = () =>
  binaryStompClient && binaryStompClient.connected;
export const isSportRadarConnected = () =>
  sportRadarClient && sportRadarClient.connected;
export const isDreamWsConnected = () => dreamClient && dreamClient.connected;

// Exchange Events.
export const connectToBFWS = (baseUrl: string) => {
  if (stompClient == null) {
    // Match odds
    const socket = new SockJS(baseUrl);
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.heartbeat.outgoing = 5000;
    stompClient.connect(
      {},
      function (frame) {
        console.log("BF Connected: " + frame + " time " + moment.now());
        store.dispatch(setBetFairWSConnection(true));
        clearInterval(refreshBetFairInterval);
        refreshBetFairInterval = undefined;
      },
      function (error: Frame | string) {
        store.dispatch(setBetFairWSConnection(false));
        disConnectToBFWS();
        console.log("bf ws_error: " + error + " time " + moment.now());
        if (typeof refreshBetFairInterval === "undefined") {
          refreshBetFairInterval && clearInterval(refreshBetFairInterval);
          refreshBetFairInterval = setInterval(() => {
            connectToBFWS(baseUrl);
          }, 30 * 1000);
        }
      }
    );
  }
};

const disConnectToBFWS = () => {
  if (stompClient != null) {
    for (const wsEvent of Object.keys(wsSubscriptions)) {
      wsSubscriptions[wsEvent].unsubscribe();
      console.log("bf unsubscribed " + wsEvent);
      delete wsSubscriptions[wsEvent];
    }

    for (const wsEvent of Object.keys(wsSecMatchOddsSubscritions)) {
      wsSecMatchOddsSubscritions[wsEvent].unsubscribe();
      console.log("bf unsubscribed " + wsEvent);
      delete wsSecMatchOddsSubscritions[wsEvent];
    }

    for (const wsEvent of Object.keys(wsScorecardSubscriptions)) {
      wsScorecardSubscriptions[wsEvent].unsubscribe();
      console.log("scorecard unsubscribed " + wsEvent);
      delete wsScorecardSubscriptions[wsEvent];
    }

    wsSubscriptions = {};
    wsSecMatchOddsSubscritions = {};
    wsScorecardSubscriptions = {};

    if (store.getState().exchangeSports.betFairWSConnected) {
      stompClient.disconnect(() =>
        console.log("BF Disconnected - time " + moment.now())
      );
    }
    stompClient = null;
  }
};

export const connectToDreamWS = (baseUrl: string) => {
  if (dreamClient == null && baseUrl) {
    // Bookmaker & Fancy
    const dreamSocket = new SockJS(baseUrl);
    dreamClient = Stomp.over(dreamSocket);
    dreamClient.debug = null;
    dreamClient.heartbeat.outgoing = 5000;
    dreamClient.connect(
      { token: `Bearer ${getSapTokenFromToken()}` },
      function (frame) {
        console.log("DR Connected: " + frame + " time " + moment.now());
        store.dispatch(setDreamWSConnection(true));
        clearInterval(refreshDreamInterval);
        refreshDreamInterval = undefined;
      },
      function (error: Frame | string) {
        store.dispatch(setDreamWSConnection(false));
        disConnectToDreamWS();
        console.log("dream ws_error: " + error + " time " + moment.now());
        if (typeof refreshDreamInterval === "undefined") {
          refreshDreamInterval && clearInterval(refreshDreamInterval);

          refreshDreamInterval = setInterval(() => {
            connectToDreamWS(baseUrl);
          }, 30 * 1000);
        }
      }
    );
  }
};

const disConnectToDreamWS = () => {
  if (dreamClient != null) {
    for (const wsEvent of Object.keys(wsSecMarketSubscritions)) {
      wsSecMarketSubscritions[wsEvent].unsubscribe();
      console.log("dream unsubscribed " + wsEvent);
      delete wsSecMarketSubscritions[wsEvent];
    }

    wsSecMarketSubscritions = {};

    for (const wsEvent of Object.keys(wsFancyMarketSubscritions)) {
      wsFancyMarketSubscritions[wsEvent].unsubscribe();
      console.log("dream unsubscribed " + wsEvent);
      delete wsFancyMarketSubscritions[wsEvent];
    }

    wsFancyMarketSubscritions = {};

    dreamClient.disconnect(() =>
      console.log("Dream Disconnected - time " + moment.now())
    );
    dreamClient = null;
  }
};

export const connectToSRWS = (baseUrl: string) => {
  if (sportRadarClient == null && baseUrl) {
    // Sportradar
    const spSocket = new SockJS(baseUrl);
    sportRadarClient = Stomp.over(spSocket);
    sportRadarClient.debug = null;
    sportRadarClient.heartbeat.outgoing = 10000;
    sportRadarClient.connect(
      { token: `Bearer ${getSapTokenFromToken()}` },
      function (frame) {
        console.log("SR Connected: " + frame + " time " + moment.now());
        store.dispatch(setSportsRadarWSConnection(true));
        clearInterval(refreshSportsRadarInterval);
        refreshSportsRadarInterval = undefined;
      },
      function (error: Frame | string) {
        store.dispatch(setSportsRadarWSConnection(false));
        disConnectToSRWS();
        console.log("SR ws_error: " + error + " time " + moment.now());
        if (typeof refreshSportsRadarInterval === "undefined") {
          refreshSportsRadarInterval &&
            clearInterval(refreshSportsRadarInterval);
          refreshSportsRadarInterval = setInterval(() => {
            connectToSRWS(baseUrl);
          }, 30 * 1000);
        }
      }
    );
  }
};

const disConnectToSRWS = () => {
  if (sportRadarClient != null) {
    for (const wsEvent of Object.keys(wsSpSubscriptions)) {
      wsSpSubscriptions[wsEvent].unsubscribe();
      console.log("dream unsubscribed " + wsEvent);
      delete wsSpSubscriptions[wsEvent];
    }

    wsSpSubscriptions = {};

    sportRadarClient.disconnect(() =>
      console.log("SR Disconnected - time " + moment.now())
    );
    sportRadarClient = null;
  }
};

//connecting to websocket
export const connectToWS = (baseUrlsPayload: any) => {
  if (baseUrlsPayload?.matchOddsBaseUrl) {
    connectToBFWS(baseUrlsPayload?.matchOddsBaseUrl);
  }
  if (baseUrlsPayload?.bookMakerAndFancyBaseUrl) {
    connectToDreamWS(baseUrlsPayload?.bookMakerAndFancyBaseUrl);
  }
  if (baseUrlsPayload?.premiumBaseUrl) {
    connectToSRWS(baseUrlsPayload?.premiumBaseUrl);
  }
};

export const subscribeSportRadarEventOdds = (
  url: string,
  dreamEventId: string,
  eventId: string
) => {
  const topicUrl = `${url}/${eventId}`;
  if (store.getState().exchangeSports.sportsRadarWSConnected) {
    if (wsSpSubscriptions[`sp-${eventId}`] === undefined) {
      wsSpSubscriptions[`sp-${eventId}`] = sportRadarClient.subscribe(
        topicUrl,
        function (message) {
          const msgObj = JSON.parse(message.body);
          if (eventId) {
            const payload = {
              eventId: dreamEventId,
              body: msgObj,
            };
            store.dispatch(updatePremiumMarkes(payload));
          }
        }
      );
    }
  }
  // else {
  //   setTimeout(() => subscribeSportRadarEventOdds(dreamEventId, eventId), 1000);
  // }
};

export const checkStompClientSubscriptions = (baseUrlsPayload: any) => {
  if (!store.getState().exchangeSports.betFairWSConnected) {
    console.log("BetFair client is null or not connected");
    connectToBFWS(baseUrlsPayload.matchOddsBaseUrl);
  }
  // if (moment.now() - bfLastMsgTime > 5000) {
  //   console.log(
  //     'BetFair last message is > 5000' + (moment.now() - bfLastMsgTime) + 'ms'
  //   );
  //   disConnectToBFWS();
  //   connectToBFWS(baseUrlsPayload.matchOddsBaseUrl);
  // }
  if (!store.getState().exchangeSports.dreamWSConnected) {
    console.log("Dream client is null or not connected");
    connectToDreamWS(baseUrlsPayload.bookMakerAndFancyBaseUrl);
  }
  // if (moment.now() - dreamLastMsgTime > 5000) {
  //   console.log(
  //     'Dream last message is > 5000' +
  //       (moment.now() - dreamLastMsgTime > 5000) +
  //       'ms'
  //   );
  //   disConnectToDreamWS();
  //   connectToDreamWS(baseUrlsPayload.bookMakerAndFancyBaseUrl);
  // }
  if (!store.getState().exchangeSports.sportsRadarWSConnected) {
    console.log("SR client is null or not connected");
    connectToSRWS(baseUrlsPayload.premiumBaseUrl);
  }
  // if (moment.now() - srLastMsgTime > 5000) {
  //   console.log(
  //     'SR last message is > 5000' + (moment.now() - srLastMsgTime) + 'ms'
  //   );
  //   disConnectToSRWS();
  //   connectToSRWS(baseUrlsPayload.premiumBaseUrl);
  // }
};

export const subscribeWsForEventOdds = (
  urlTopic: string,
  sportId: string,
  competitionId: string,
  eventId: string,
  marketId: string,
  providerId?: string,
  isMultiMarket?: boolean
) => {
  if (store.getState().exchangeSports.betFairWSConnected) {
    if (wsSubscriptions[eventId] === undefined) {
      eventHierarchyMap.set(eventId, `${sportId}-${competitionId}`);
      wsSubscriptions[eventId] = stompClient.subscribe(
        `${urlTopic}/${eventId}/${marketId}`,
        function (message) {
          const msgObj = JSON.parse(message.body);
          const msgBody = {
            eventId: msgObj.eventId,
            matchOdds: {
              marketId: msgObj.marketId,
              marketTime: msgObj.marketTime,
              marketName: msgObj.marketName,
              status: msgObj.status,
              runners: msgObj.runners,
            },
          };
          const eventId = msgObj.eventId;
          if (eventId) {
            const payload = {
              eventData: msgBody.matchOdds ? msgBody.matchOdds : "no-data",
              sportId: eventHierarchyMap.get(eventId).split("-")[0],
              competitionId: eventHierarchyMap.get(eventId).split("-")[1],
              eventId: eventId,
              matchOddsData: msgBody.matchOdds ? msgBody.matchOdds : null,
              isMultiMarket: isMultiMarket ? true : false,
            };
            if (payload && payload !== undefined) {
              isMultiMarket
                ? store.dispatch(updateMultiOddsfromWS({ events: [payload] }))
                : store.dispatch(updateOddsfromWS({ events: [payload] }));
              // store.dispatch(updateBetslipfromWS(payload));
            }
          }
        }
      );
    }
  } else {
    setTimeout(
      () =>
        subscribeWsForEventOdds(
          urlTopic,
          sportId,
          competitionId,
          eventId,
          marketId,
          providerId,
          isMultiMarket
        ),
      1000
    );
  }
};

export const subscribeWsForSecondaryMarkets = (
  url: string,
  eventId: string,
  marketId?: string,
  sportId?: string,
  competitionId?: string,
  isMultiMarket?: boolean
) => {
  if (store.getState().exchangeSports.dreamWSConnected) {
    let bmUrl = url.includes("tommy")
      ? `${url}/${eventId}/${marketId}`
      : `${url}/${eventId}`;

    if (wsSecMarketSubscritions[eventId] === undefined) {
      wsSecMarketSubscritions[eventId] = dreamClient.subscribe(
        bmUrl,
        function (message) {
          try {
            const msgObj = JSON.parse(message.body);
            // const eventId = msgObj.eventId;
            const bookmakers = msgObj;
            if (eventId) {
              const secMarketsPayload = {
                eventId: eventId,
                bookmakerOddsData: bookmakers ? bookmakers : [],
                enableBookmaker: true,
              };
              // store.dispatch(updateSecondaryMarkets(secMarketsPayload));
              isMultiMarket
                ? store.dispatch(
                    updateMultiBookMakerMarkets({
                      ...secMarketsPayload,
                      sportId,
                      competitionId,
                    })
                  )
                : store.dispatch(updateBookMakerMarkets(secMarketsPayload));
            }
          } catch (e) {
            console.error("Failed to update bm odds ", e);
          }
        }
      );
      // console.log(wsSecMarketSubscritions[eventId]);
    }
  } else {
    setTimeout(
      () =>
        subscribeWsForSecondaryMarkets(
          url,
          eventId,
          marketId,
          sportId,
          competitionId,
          isMultiMarket
        ),
      1000
    );
  }
};

export const subscribeWsForScorecardUrl = (url: string, eventId: string) => {
  if (
    store.getState().exchangeSports.betFairWSConnected ||
    store.getState().exchangeSports.dreamWSConnected
  ) {
    let scorecardUrl = `${url}${eventId}`;

    let client = store.getState().exchangeSports.betFairWSConnected
      ? stompClient
      : dreamClient;

    if (wsScorecardSubscriptions[eventId] === undefined) {
      wsScorecardSubscriptions[eventId] = client.subscribe(
        scorecardUrl,
        function (message) {
          try {
            let msgBody = message.body;
            const htmlStart = msgBody.indexOf("<html");
            if (htmlStart != -1) {
              const htmlContent = msgBody.substring(htmlStart);
              store.dispatch(updateEventScorecard(htmlContent));
            }
          } catch (e) {
            console.error("Failed to update scorecard", e);
          }
        }
      );
    }
  } else {
    setTimeout(() => subscribeWsForScorecardUrl(url, eventId), 1000);
  }
};

export const subscribeWsForFancyMarkets = (url: string, eventId: string) => {
  if (store.getState().exchangeSports.dreamWSConnected) {
    let fmUrl = `${url}/${eventId}`;

    if (wsFancyMarketSubscritions[eventId] === undefined) {
      wsFancyMarketSubscritions[eventId] = dreamClient.subscribe(
        fmUrl,
        function (message) {
          try {
            const msgObj = JSON.parse(message.body);
            if (eventId) {
              const fancyMarketsPayload = {
                eventId: eventId,
                fancyUpdateData: msgObj,
              };
              // store.dispatch(updateSecondaryMarkets(secMarketsPayload));
              store.dispatch(updateFancyMarkets(fancyMarketsPayload));
            }
          } catch (e) {
            console.error("Failed to update fancy odds ", e);
          }
        }
      );
      // console.log(wsFancyMarketSubscritions[eventId]);
    }
  } else {
    setTimeout(() => subscribeWsForFancyMarkets(url, eventId), 1000);
  }
};

export const subscribeWsForSecondaryMatchOdds = (
  urlTopic: string,
  eventId: string,
  marketId: string,
  providerId: string,
  sportId?: string,
  competitionId?: string,
  isMultiMarket?: boolean
) => {
  if (store.getState().exchangeSports.betFairWSConnected) {
    console.log("bf subscribed " + urlTopic);
    if (wsSecMatchOddsSubscritions[eventId + "-" + marketId] === undefined) {
      wsSecMatchOddsSubscritions[eventId + "-" + marketId] =
        stompClient.subscribe(
          `${urlTopic}/${eventId}/${marketId}`,
          function (message) {
            const msgObj = JSON.parse(message.body);
            const msgBody = {
              eventId: msgObj.eventId,
              matchOdds: {
                marketId: msgObj.marketId,
                marketTime: msgObj.marketTime,
                marketName: msgObj.marketName,
                status: msgObj.status,
                runners: msgObj.runners,
              },
            };
            const eventId = msgObj.eventId;
            if (eventId) {
              const secMatchOddsPayload = {
                eventId: eventId,
                marketId: msgBody.matchOdds?.marketId,
                matchOddsData: msgBody.matchOdds ? msgBody.matchOdds : null,
              };
              isMultiMarket
                ? store.dispatch(
                    updateMultiSecondaryMatchOdds({
                      ...secMatchOddsPayload,
                      sportId,
                      competitionId,
                    })
                  )
                : store.dispatch(updateSecondaryMatchOdds(secMatchOddsPayload));
            }
          }
        );
      // console.log(wsSecMatchOddsSubscritions[eventId + '-' + marketId]);
    }
  }
  // else {
  //   setTimeout(
  //     () => subscribeWsForSecondaryMatchOdds(eventId, marketId, providerId),
  //     1000
  //   );
  // }
};

export const unsubscribeAllWsforEvents = () => {
  if (store.getState().exchangeSports.betFairWSConnected) {
    for (const wsEvent of Object.keys(wsSubscriptions)) {
      wsSubscriptions[wsEvent].unsubscribe();
      console.log("unsubscribed " + wsEvent);
      delete wsSubscriptions[wsEvent];
    }

    for (const wsEvent of Object.keys(wsSecMatchOddsSubscritions)) {
      wsSecMatchOddsSubscritions[wsEvent].unsubscribe();
      console.log("unsubscribed " + wsEvent);
      delete wsSecMatchOddsSubscritions[wsEvent];
    }

    for (const wsEvent of Object.keys(wsScorecardSubscriptions)) {
      wsScorecardSubscriptions[wsEvent].unsubscribe();
      console.log("unsubscribed " + wsEvent);
      delete wsScorecardSubscriptions[wsEvent];
    }

    wsSubscriptions = {};
    wsSecMatchOddsSubscritions = {};
    wsScorecardSubscriptions = {};
  }

  if (store.getState().exchangeSports.dreamWSConnected) {
    for (const wsEvent of Object.keys(wsSecMarketSubscritions)) {
      wsSecMarketSubscritions[wsEvent].unsubscribe();
      console.log("unsubscribed " + wsEvent);
      delete wsSecMarketSubscritions[wsEvent];
    }
    wsSecMarketSubscritions = {};

    for (const wsEvent of Object.keys(wsScorecardSubscriptions)) {
      wsScorecardSubscriptions[wsEvent].unsubscribe();
      console.log("unsubscribed " + wsEvent);
      delete wsScorecardSubscriptions[wsEvent];
    }
    wsScorecardSubscriptions = {};
  }

  if (store.getState().exchangeSports.dreamWSConnected) {
    for (const wsEvent of Object.keys(wsFancyMarketSubscritions)) {
      wsFancyMarketSubscritions[wsEvent].unsubscribe();
      console.log("unsubscribed " + wsEvent);
      delete wsFancyMarketSubscritions[wsEvent];
    }
    wsFancyMarketSubscritions = {};
  }

  if (store.getState().exchangeSports.sportsRadarWSConnected) {
    for (const wsEvent of Object.keys(wsSpSubscriptions)) {
      wsSpSubscriptions[wsEvent].unsubscribe();
      console.log("sr unsubscribed " + wsEvent);
      delete wsSpSubscriptions[wsEvent];
    }

    wsSpSubscriptions = {};
  }
};

export const unsubscribeWsforEvent = (wsEvent: string) => {
  if (store.getState().exchangeSports.betFairWSConnected) {
    wsSubscriptions[wsEvent].unsubscribe();
    wsSecMarketSubscritions[wsEvent].unsubscribe();
    delete wsSubscriptions[wsEvent];

    delete wsSecMarketSubscritions[wsEvent];
  }

  if (store.getState().exchangeSports.betFairWSConnected) {
    wsSubscriptions[wsEvent].unsubscribe();
    wsFancyMarketSubscritions[wsEvent].unsubscribe();
    delete wsSubscriptions[wsEvent];

    delete wsFancyMarketSubscritions[wsEvent];
  }

  if (store.getState().exchangeSports.dreamWSConnected) {
    wsSecMatchOddsSubscritions[wsEvent].unsubscribe();
    delete wsSecMatchOddsSubscritions[wsEvent];
    console.log("unsubscribed " + wsEvent);
  }
};

export const disconnectToWS = () => {
  if (stompClient !== null) {
    unsubscribeAllWsforEvents();
  }
};
