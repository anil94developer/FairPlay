import moment from "moment";
import SockJS from "sockjs-client";
import Stomp, { Frame } from "stompjs";
import { getBaseUrl } from "../api-services/environment-url/environment-url";
import {
  setPushNotifWSConnection,
  triggerBetStatus,
  triggerFetchMarkets,
  triggerFetchOrders,
  triggerMarketNotifications,
  updateCommissionMarkets,
  updateDisabledMarkets,
  updateSuspendedMarkets,
} from "../store/exchangeSports/exchangeSportsActions";
import store from "../store/store";
import { NotificationType } from "../models/NotificationTypes";
import { updateMultiCommissionMarkets } from "../store";
import {
  triggerFetchNotifications,
  triggerFetchBalance,
} from "../store/common/commonActions";
import {
  updateMultiSuspendedMarkets,
  triggerMultiFetchMarkets,
  triggerMultiFetchOrders,
  triggerMultiBetStatus,
} from "../store/multimarket/multimarketAction";

let pushNotClient: Stomp.Client = null;

// Push notifications Subscription
let wsPushNotSubscriptions = {};

let refreshPushNotificationInterval: NodeJS.Timeout | undefined;

// Check WS connection.
export const isPushNotificationConnected = () =>
  pushNotClient && pushNotClient.connected;

export const checkPNStompClientSubscriptions = () => {
  if (!store.getState().exchangeSports.pushNotifWSConnection) {
    connectToPushNotification();
  }
};

export const unsubscribePNWsforEvents = (id: string) => {
  if (store.getState().exchangeSports.pushNotifWSConnection) {
    wsPushNotSubscriptions[id]?.unsubscribe();
    console.log("unsubscribed PN " + id);
    delete wsPushNotSubscriptions[id];
  }
};

export const connectToPushNotification = () => {
  if (pushNotClient == null) {
    const baseUrl = getBaseUrl(
      process.env.REACT_APP_NODE_ENV,
      "REACT_APP_WEBSOCKET_URL_PUSH_NOTIFICATIONS"
    );
    const socket = new SockJS(baseUrl);
    pushNotClient = Stomp.over(socket);
    pushNotClient.heartbeat.outgoing = 5000;
    pushNotClient.connect(
      {},
      function (frame) {
        console.log("PN Connected: " + frame + " time " + moment.now());
        store.dispatch(setPushNotifWSConnection(true));
        clearInterval(refreshPushNotificationInterval);
        refreshPushNotificationInterval = undefined;
      },
      function (error: Frame | string) {
        store.dispatch(setPushNotifWSConnection(false));
        disConnectToPushNotificationWS();
        console.log("pn ws_error: " + error + " time " + moment.now());
        if (typeof refreshPushNotificationInterval === "undefined") {
          refreshPushNotificationInterval &&
            clearInterval(refreshPushNotificationInterval);
          refreshPushNotificationInterval = setInterval(() => {
            connectToPushNotification();
          }, 30 * 1000);
        }
      }
    );
  }
};

export const disConnectToPushNotificationWS = () => {
  if (pushNotClient != null) {
    for (const houseId of Object.keys(wsPushNotSubscriptions)) {
      wsPushNotSubscriptions[houseId].unsubscribe();
      console.log("pn unsubscribed " + houseId);
      delete wsPushNotSubscriptions[houseId];
    }

    wsPushNotSubscriptions = {};

    if (store.getState().exchangeSports.pushNotifWSConnection) {
      pushNotClient.disconnect(() =>
        console.log("PN Disconnected - time " + moment.now())
      );
    }
    pushNotClient = null;
  }
};

export const subscribeWsForNotifications = (
  isMultiMarket: boolean,
  houseId: string,
  sportId?: string,
  competitionId?: string,
  eventId?: string
) => {
  if (store.getState().exchangeSports.pushNotifWSConnection) {
    if (wsPushNotSubscriptions[houseId] === undefined) {
      wsPushNotSubscriptions[houseId] = pushNotClient.subscribe(
        `/topic/notifications/${houseId}`,
        function (message) {
          try {
            const notification = JSON.parse(message.body);
            if (isMultiMarket) {
              switch (notification.notification_type) {
                case NotificationType.MARKET_SUSPENDED: {
                  store.dispatch(
                    updateMultiSuspendedMarkets(notification.data)
                  );
                  break;
                }
                case NotificationType.MARKET_DISABLED: {
                  store.dispatch(updateDisabledMarkets(notification.data));
                  break;
                }
                case NotificationType.MARKET_COMMISSION_ENABLED: {
                  store.dispatch(
                    updateMultiCommissionMarkets(notification.data)
                  );
                  break;
                }
                case NotificationType.ORDER_LIMIT_UPDATED: {
                  store.dispatch(triggerMultiFetchMarkets(notification.data));
                  break;
                }
                case NotificationType.NOTIFICATION_UPDATED: {
                  store.dispatch(triggerFetchNotifications(notification.data));
                  break;
                }
                default:
                  console.log(
                    "Invalid notification type: ",
                    notification.notification_type
                  );
              }
            } else {
              switch (notification.notification_type) {
                case NotificationType.MARKET_SUSPENDED: {
                  if (
                    notification.data?.eventId &&
                    eventId === notification.data.eventId
                  ) {
                    store.dispatch(updateSuspendedMarkets(notification.data));
                  }
                  break;
                }
                case NotificationType.MARKET_DISABLED: {
                  if (
                    notification.data?.eventId &&
                    eventId === notification.data.eventId
                  ) {
                    store.dispatch(updateDisabledMarkets(notification.data));
                  }
                  break;
                }
                case NotificationType.MARKET_COMMISSION_ENABLED: {
                  if (
                    notification.data?.eventId &&
                    eventId === notification.data.eventId
                  ) {
                    store.dispatch(updateCommissionMarkets(notification.data));
                  }
                  break;
                }
                case NotificationType.ORDER_LIMIT_UPDATED: {
                  store.dispatch(
                    triggerFetchMarkets(
                      sportId,
                      competitionId,
                      eventId,
                      notification.data
                    )
                  );
                  break;
                }
                case NotificationType.MARKET_NOTIFICATION_UPDATED: {
                  if (
                    notification.data?.eventId &&
                    eventId === notification.data.eventId
                  ) {
                    store.dispatch(triggerMarketNotifications());
                  }
                  break;
                }
                case NotificationType.NOTIFICATION_UPDATED: {
                  store.dispatch(triggerFetchNotifications(notification.data));
                  break;
                }
                default:
                  console.log(
                    "Invalid notification type: ",
                    notification.notification_type
                  );
              }
            }
          } catch (ex) {
            console.error("Failed to update suspend market details ", ex);
          }
        }
      );
    }
  } else {
    // TODO: is this required ?
    setTimeout(
      () =>
        subscribeWsForNotifications(
          isMultiMarket,
          houseId,
          sportId,
          competitionId,
          eventId
        ),
      1000
    );
  }
};

export const subscribeWsForNotificationsPerAdmin = (
  isMultiMarket: boolean,
  houseId: string,
  parentId: string,
  accountId: string
) => {
  if (store.getState().exchangeSports.pushNotifWSConnection) {
    if (wsPushNotSubscriptions[parentId] === undefined) {
      wsPushNotSubscriptions[parentId] = pushNotClient.subscribe(
        `/topic/notifications/${houseId}/${parentId}`,
        function (message) {
          try {
            const notification = JSON.parse(message.body);
            if (notification.data.accountId.toString() === accountId) {
              switch (notification.notification_type) {
                case NotificationType.BALANCE_CHANGED: {
                  store.dispatch(triggerFetchBalance(moment.now()));
                  break;
                }
                case NotificationType.ORDER_UPDATED: {
                  if (isMultiMarket) {
                    store.dispatch(
                      triggerMultiFetchOrders(notification?.data?.eventId)
                    );
                  }
                  break;
                }
                case NotificationType.ORDER_PLACED:
                case NotificationType.ORDER_FAILED: {
                  if (isMultiMarket) {
                    store.dispatch(
                      triggerMultiBetStatus(notification?.data?.eventId)
                    );
                  }
                  break;
                }
                default:
                  console.log(
                    "Invalid notification type: ",
                    notification.notification_type
                  );
              }
            }
          } catch (ex) {
            console.error("Failed process notification ", ex);
          }
        }
      );
    }
  } else {
    setTimeout(
      () =>
        subscribeWsForNotificationsPerAdmin(
          isMultiMarket,
          houseId,
          parentId,
          accountId
        ),
      1000
    );
  }
};

export const subscribeWsForNotificationsPerAdminAllMarkets = (
  isMultiMarket: boolean,
  houseId: string,
  parentId: string,
  accountId: string,
  eventId: string
) => {
  var key = eventId ? parentId + ":" + eventId : parentId;
  if (store.getState().exchangeSports.pushNotifWSConnection) {
    if (wsPushNotSubscriptions[key] === undefined && eventId !== undefined) {
      wsPushNotSubscriptions[key] = pushNotClient.subscribe(
        `/topic/notifications/${houseId}/${parentId}`,
        function (message) {
          try {
            const notification = JSON.parse(message.body);
            if (notification.data.accountId.toString() === accountId) {
              switch (notification.notification_type) {
                case NotificationType.BALANCE_CHANGED: {
                  store.dispatch(triggerFetchBalance(moment.now()));
                  break;
                }
                case NotificationType.ORDER_UPDATED: {
                  if (!isMultiMarket) {
                    if (eventId && eventId === notification?.data?.eventId) {
                      store.dispatch(triggerFetchOrders());
                    }
                  }
                  break;
                }
                case NotificationType.ORDER_PLACED:
                case NotificationType.ORDER_FAILED: {
                  if (!isMultiMarket) {
                    if (eventId && eventId === notification?.data?.eventId) {
                      store.dispatch(triggerBetStatus());
                    }
                  }
                  break;
                }
                default:
                  console.log(
                    "Invalid notification type: ",
                    notification.notification_type
                  );
              }
            }
          } catch (ex) {
            console.error("Failed process notification ", ex);
          }
        }
      );
    }
  } else {
    setTimeout(
      () =>
        subscribeWsForNotificationsPerAdminAllMarkets(
          isMultiMarket,
          houseId,
          parentId,
          accountId,
          eventId
        ),
      1000
    );
  }
};
