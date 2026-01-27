import { IonRow, IonCol } from "@ionic/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { RootState } from "../../models/RootState";
import {
  fetchOpenBets,
  fetchMultiMarketEventData,
  getSecondaryMarketsByEvent,
  getSecondaryMatchOddsByEvent,
  getBookmakerMarketsByEvent,
  getHouseIdFromToken,
  getParentIdFromToken,
  fetchBalance,
} from "../../store";
import "./ExchangeAllMarkets.scss";
import ExchMultiMarket from "./ExchangeMultiMarket";
import { UserBet } from "../../models/UserBet";
import noBetsIcon from "../../assets/images/icons/no-bets-icon.svg";

import { NavLink, useLocation } from "react-router-dom";
import ExchBetslip from "../../components/ExchBetslip/ExchBetslip";
import ExchOpenBets from "../../components/ExchOpenBets/ExchOpenBets";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { PlaceBetRequest } from "../../models/BsData";
import { useMarketLocalState } from "../../hooks/storageHook";
import TabPanel from "../../components/TabPanel/TabPanel";
import { isIOS } from "react-device-detect";
import SVLS_API from "../../svls-api";
import { BRAND_NAME } from "../../constants/Branding";
import SEO from "../../components/SEO/Seo";

import moment from "moment";

import {
  betStatus,
  clearBetStatusResponse,
  clearExchcngeBets,
  setBettingInprogress,
} from "../../store/exchBetslip/exchBetslipActions";
import { BET_TIMEOUT } from "../../constants/CommonConstants";
import multipin from "../../assets/images/common/multipin.svg";
import NoDataComponent from "../../common/NoDataComponent/NoDataComponent";
import NoMultiMarketIcon from "../../assets/images/no_multi_market_icon.svg";
import { setAlertMsg } from "../../store/common/commonActions";
import { AlertDTO } from "../../models/Alert";
import {
  unsubscribePNWsforEvents,
  subscribeWsForNotificationsPerAdmin,
  subscribeWsForNotifications,
} from "../../webSocket/pnWebsocket";

type StoreProps = {
  fetchOpenBets: (eventId: string[] | string, sportId?: string) => void;
  fetchMultiMarketEventData: () => void;
  marketData: any;
  secondaryMultiMatchOdds: any;
  secondaryMultiMarket: any;
  openBets: UserBet[];
  totalOrders: number;
  loggedIn: boolean;
  bets: PlaceBetRequest[];
  triggerFetchMarkets: number;
  triggerFetchOrders: number;
  houseId: string;
  parentId: string;
  accountId: string;
  triggerBetStatus: number;
  betStatusResponse: any;
  clearExchangeBets: () => void;
  setBettingInprogress: (val: boolean) => void;
  clearBetStatusResponse: () => void;
  pushNotifWSConnection: boolean;
  setAlertMsg: Function;
  langData: any;
};

const MultiMarketView: React.FC<StoreProps> = (props) => {
  const {
    fetchMultiMarketEventData,
    marketData,
    secondaryMultiMatchOdds,
    secondaryMultiMarket,
    loggedIn,
    openBets,
    totalOrders,
    fetchOpenBets,
    bets,
    triggerFetchMarkets,
    triggerFetchOrders,
    houseId,
    parentId,
    accountId,
    triggerBetStatus,
    betStatusResponse,
    clearExchangeBets,
    setBettingInprogress,
    clearBetStatusResponse,
    pushNotifWSConnection,
    setAlertMsg,
    langData,
  } = props;
  const [openBetslip, setOpenBetslip] = useState<boolean>(true);
  const [tabVal, setTabVal] = useState(0);
  const isMobile = window.innerWidth > 1120 ? false : true;
  const [exposureMap, setExposureMap] = useState(new Map());
  const [enableFetchOrders, setEnableFetchOrders] = useState<boolean>(false);
  const pathLocation = useLocation();
  const [startTime, setStartTime] = useState<Date>();
  const [fetchOpenOrders, setFetchOpenOrders] = useState<number>(null);
  const [addNewBet, setAddNewBet] = useState<boolean>(true);
  const intervalRef = useRef(null);
  const isFirstRender = useRef(true);
  const isFirstRenderStartTime = useRef(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [multiMarketData] = useMarketLocalState();

  const fetchOpenBetsRisk = useCallback(async (multiMarketData) => {
    try {
      if (!multiMarketData?.length) {
        return;
      }

      let eventIds = [];
      let marketIds = [];
      multiMarketData.forEach((item) => {
        eventIds.push(item?.eventId);
        marketIds.push(item?.marketId);
      });

      const response = await SVLS_API.get(
        "/reports/v2/risk-management/user-risk",
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
          params: {
            eventId: Array.isArray(eventIds) ? eventIds.join(",") : eventIds,
            marketId: Array.isArray(marketIds)
              ? marketIds.join(",")
              : marketIds,
          },
        }
      );
      setExposureMap(response.data.marketExposureMap);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    fetchMultiMarketEventData();
  }, [triggerFetchMarkets]);

  useEffect(() => {
    if (multiMarketData?.length) {
      let eventIds = [];
      multiMarketData.forEach((item) => {
        eventIds.push(item?.eventId);
      });
      fetchOpenBets(eventIds);
      fetchOpenBetsRisk(multiMarketData);
    }
    setEnableFetchOrders(true);
  }, [multiMarketData?.length]);

  useEffect(() => {
    if (loggedIn && enableFetchOrders && multiMarketData?.length) {
      let eventIds = [];
      multiMarketData.forEach((item) => {
        eventIds.push(item?.eventId);
      });
      setTimeout(() => {
        fetchOpenBets(eventIds);
        fetchOpenBetsRisk(multiMarketData);
      }, 1000);
    }
  }, [loggedIn, triggerFetchOrders, fetchOpenOrders]);

  useEffect(() => {
    if (totalOrders && !isMobile) {
      setTabVal(1);
    }
  }, [totalOrders]);
  useEffect(() => {
    if (bets.length > 0) {
      setTabVal(0);
    }
  }, [bets]);

  useEffect(() => {
    if (loggedIn) {
      unsubscribePNWsforEvents(houseId);
      unsubscribePNWsforEvents(parentId);
      subscribeWsForNotificationsPerAdmin(true, houseId, parentId, accountId);
      subscribeWsForNotifications(true, houseId);
      return () => {
        unsubscribePNWsforEvents(houseId);
        unsubscribePNWsforEvents(parentId);
        if (!window.location.pathname.includes("multi-market")) {
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
  }, [pushNotifWSConnection, loggedIn]);

  useEffect(() => {
    if (betStatusResponse === null) {
      return;
    }

    switch (betStatusResponse.status) {
      case "IN_PROGRESS": {
        setAlertMsg({
          type: "error",
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
          // TODO: make this whole message come from api
          message:
            langData?.["bet_failed_prefix"] + " - " + betStatusResponse.message,
        });
        break;
      }
    }

    setBettingInprogress(false);
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

  useEffect(() => {
    setBettingInprogress(false);
    if (bets[0]?.amount) {
      clearExchangeBets();
    }
    clearBetStatusResponse();
  }, []);

  const handleTabChange = (value) => {
    setTabVal(value);
    setOpenBetslip(true);
  };

  const handleExpand = (isExpanded) => {
    setOpenBetslip(isExpanded);
  };

  return (
    <>
      <SEO
        title={BRAND_NAME}
        name={"Multi-market"}
        description={"Multi-market page"}
        type={"multimarket"}
        link={pathLocation?.pathname}
      />
      <IonRow className="eam-ctn">
        {/* <IonCol className="eam-competitions-menu-section">
          <div className="sticky-col">
            <CompetitionsMenu />
          </div>
        </IonCol> */}
        <IonCol className="eam-events-table-section">
          <div className="casino-header-ctn mt-12">
            <div className="casino-heading">
              <div className="casino-icon-img">
                <img src={multipin} />
              </div>
              {langData?.["multimarkets"]}
            </div>
            <div className="casino-search-ctn">
              <div className="eventTypes-menu-tabs"></div>
            </div>
          </div>
          {multiMarketData?.length &&
          marketData &&
          Object.keys(marketData)?.length ? (
            Object.keys(marketData).map((item) => {
              return (
                <ExchMultiMarket
                  key={item}
                  loggedIn={loggedIn}
                  eventData={marketData[item] ?? {}}
                  openBets={openBets}
                  secondaryMarkets={getSecondaryMarketsByEvent(
                    secondaryMultiMarket,
                    item
                  )}
                  secondaryMatchOdds={getSecondaryMatchOddsByEvent(
                    secondaryMultiMatchOdds,
                    item
                  )}
                  bmMData={getBookmakerMarketsByEvent(
                    secondaryMultiMarket,
                    item
                  )}
                  eventId={marketData[item]?.eventId}
                  isMultiMarket={true}
                  exposureMap={exposureMap ? exposureMap : null}
                />
              );
            })
          ) : (
            <NoDataComponent
              noDataImg={NoMultiMarketIcon}
              title={langData?.["no_market_followed_txt"]}
              bodyContent={langData?.["no_multimarket_follwed_txt"]}
            />
          )}
        </IonCol>

        {!isMobile ? (
          <IonCol className="stream-section">
            <div className="sticky-col bet-slip-open-bets-ctn">
              <div className="betslip-container">
                <div className="betslip-bg">
                  <div
                    className={`betslip-text ${tabVal === 0 ? "selected" : ""}`}
                    onClick={() => setTabVal(0)}
                  >
                    {langData?.["bet_slip"]}
                  </div>
                  <div
                    className={`betslip-text ${tabVal === 1 ? "selected" : ""}`}
                    onClick={() => setTabVal(1)}
                  >
                    ({langData?.["open_bets"]}) ({totalOrders})
                  </div>
                </div>
              </div>

              <TabPanel
                value={tabVal}
                index={0}
                className="event-stat-mobile-ctn"
              >
                {bets.length > 0 && !isMobile ? (
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
                        {langData?.["no_bet_placed_txt"]}
                      </div>
                    </div>
                  </>
                )}
              </TabPanel>
              <TabPanel
                value={tabVal}
                index={1}
                className="event-stat-mobile-ctn"
              >
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
            </div>
          </IonCol>
        ) : null}
      </IonRow>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    openBets: state.exchBetslip.openBets,
    totalOrders: state.exchBetslip.totalOrders,
    loggedIn: state.auth.loggedIn,
    secondaryMultiMarket: state.multiMarket.secondaryMultiMarketsMap,
    secondaryMultiMatchOdds: state.multiMarket.secondaryMultiMatchOddsMap,
    bets: state.exchBetslip.bets,
    marketData: state.multiMarket.multiMarketData,
    triggerFetchMarkets: state.multiMarket.triggerFetchMarkets,
    triggerFetchOrders: state.multiMarket.triggerFetchOrders,
    houseId: getHouseIdFromToken(),
    parentId: getParentIdFromToken(),
    accountId: sessionStorage.getItem("aid"),
    triggerBetStatus: state.multiMarket.triggerBetStatus,
    betStatusResponse: state.exchBetslip.betStatusResponse,
    pushNotifWSConnection: state.exchangeSports.pushNotifWSConnection,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    fetchOpenBets: (eventId: string[] | string, sportId?: string) =>
      dispatch(fetchOpenBets(eventId, sportId)),
    fetchMultiMarketEventData: () => dispatch(fetchMultiMarketEventData()),
    clearExchangeBets: () => dispatch(clearExchcngeBets()),
    setBettingInprogress: (val: boolean) => dispatch(setBettingInprogress(val)),
    clearBetStatusResponse: () => dispatch(clearBetStatusResponse()),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MultiMarketView);
