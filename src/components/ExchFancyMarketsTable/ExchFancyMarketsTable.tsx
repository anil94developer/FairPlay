import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect, useSelector } from "react-redux";

import { RootState } from "../../models/RootState";
import {
  getAllMarketsByEvent,
  getFancyMarketsByEvent,
  addExchangeBet,
  getCurrencyTypeFromToken,
  isFancyMarketSuspended,
} from "../../store";
import "./ExchFancyMarketsTable.scss";

import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";

import { PlaceBetRequest } from "../../models/BsData";
import ExchOddBtn from "../ExchOddButton/ExchOddButton";
import { UserBet } from "../../models/UserBet";
import moment from "moment";
import { EventDTO } from "../../models/common/EventDTO";
import { FancyMarketDTO } from "../../models/common/FancyMarketDTO";
import API from "../../api";
import Modal from "../../components/Modal/Modal";
import MarketTermsCondi from "../../components/MarketTermsCondi/MarketTermsCondi";
import FancyBookView from "./FancyBookView/FancyBookView";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { ThousandFormatter } from "../../util/stringUtil";
import CloseOutlined from "@material-ui/icons/CloseOutlined";
import ExpandLessSharpIcon from "@material-ui/icons/ExpandLessSharp";
import ExchBetslip from "../ExchBetslip/ExchBetslip";
import { isMobile } from "react-device-detect";
import { isFancyMarketDisabled } from "../../store/exchangeSports/exchangeSportsSelectors";
import CATALOG_API from "../../catalog-api";
import { oneClickBetPlaceHandler } from "../../store/exchBetslip/exchBetslipActions";
import { OneClickBettingCountdown } from "../OneClickBetting/OneClickCountdown";
import { setAlertMsg } from "../../store/common/commonActions";
import { AlertDTO } from "../../models/Alert";

type StoreProps = {
  eventData: EventDTO;
  fmData: FancyMarketDTO[];
  openBets: UserBet[];
  commissionEnabled: boolean;
  addExchangeBet: (data: PlaceBetRequest) => void;
  loggedIn: boolean;
  getFormattedMinLimit: (num: number) => string;
  getFormattedMaxLimit: (num: number) => string;
  bets: PlaceBetRequest[];
  exposureMap: any;
  fancySuspended: boolean;
  fancyDisabled: boolean;
  fetchEvent: (
    sportId: string,
    competitionId: string,
    eventId: string,
    marketTime: string
  ) => void;
  setBetStartTime: Function;
  setAddNewBet: Function;
  marketNotifications: any;
  setAlertMsg: Function;
  langData: any;
  bettingInprogress: boolean;
};

type OddsInfoMsg = {
  launch: boolean;
  oddsType: string;
  eventTypeID: string;
};

const FMTable: React.FC<StoreProps> = (props) => {
  const {
    eventData,
    fmData,
    bets,
    openBets,
    commissionEnabled,
    addExchangeBet,
    loggedIn,
    exposureMap,
    fancySuspended,
    fancyDisabled,
    setBetStartTime,
    setAddNewBet,
    marketNotifications,
    setAlertMsg,
    langData,
    bettingInprogress,
  } = props;

  // Ensure fmData is always an array to prevent iteration errors
  const safeFmData = Array.isArray(fmData) ? fmData : [];

  const {
    oneClickBettingEnabled,
    oneClickBettingStake,
    oneClickBettingLoading,
  } = useSelector((state: RootState) => state.exchBetslip);

  const disabledStatus = ["suspended", "suspended-manually", "ball_running"];
  const [showBooksModal, setShowBooksModal] = useState<boolean>(false);
  const [fancyBookOutcomeId, setFancyBookOutcomeId] = useState<string>();
  const [fancyBookOutcomeName, setFancyBookOutcomeName] = useState<string>();
  const [fancyCategories, setFancyCategories] = useState<Set<string>>(
    new Set()
  );
  const [notifications, setNotifications] = useState<Map<String, string>>(
    new Map()
  );
  const fancyCategoriesOrder = [
    { fancyCategory: "All", langKey: "all_capital" },
    { fancyCategory: "sessions", langKey: "sessions" },
    { fancyCategory: "wpmarket", langKey: "wp_market" },
    { fancyCategory: "extramarket", langKey: "extra_market" },
    // { fancyCategory: "BALL_BY_BALL_SESSION", label: "BALL BY BALL" },
    { fancyCategory: "oddeven", langKey: "odd_even" },
    // { fancyCategory: "THREE_SELECTIONS", label: "XTRA MARKET" },
  ];
  const [tabVal, setTabVal] = useState(0);
  const [selectedRow, setSelectedRow] = useState<string>("");
  const [infoDilalog, setInfoDialog] = useState<OddsInfoMsg>({
    launch: false,
    oddsType: null,
    eventTypeID: null,
  });
  const [marketLimits, setMarketLimits] = useState<any>({});
  const marketLimitsRef = useRef<any>({});
  const [filteredFancyMarketsData, setFilteredFancyMarketsData] = useState<
    FancyMarketDTO[]
  >([]);
  const [hasScrolledToBetslip, setHasScrolledToBetslip] =
    useState<boolean>(false);

  // Reset scroll state when bets change
  useEffect(() => {
    setHasScrolledToBetslip(false);
  }, [bets]);

  const isFancyDisabled = (fMarketDisabled: boolean) => {
    return fancyDisabled ? true : fMarketDisabled;
  };

  const fetchBetLimits = async (marketId: string, localMCategory: string) => {
    try {
      const payload = {
        competitionId: eventData.competitionId,
        eventId: eventData.eventId,
        marketId: marketId,
        marketType: "FANCY",
        outcomeDesc: "fancy",
        sessionId: marketId,
        sportId: eventData.sportId,
        mcategory: localMCategory,
      };

      let response;
      if (sessionStorage.getItem("jwt_token")) {
        response = await CATALOG_API.post(
          "/catalog/v2/limits/market",
          payload,
          {
            headers: {
              Authorization: sessionStorage.getItem("jwt_token"),
            },
          }
        );
      } else {
        response = await CATALOG_API.post("/catalog/v2/limits/market", payload);
      }
      if (response.status === 200 && response.data.success) {
        let limits = marketLimits;

        limits[marketId ? marketId : eventData.marketId] = {
          minStake: response.data.limits.minStake,
          maxStake: response.data.limits.maxStake,
          maxOdd: response.data.limits.maxOdd,
        };

        setMarketLimits((marketLimits) => {
          return {
            ...marketLimits,
            ...limits,
          };
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    let localFancyCategories = new Set<string>();
    
    for (const fm of safeFmData) {
      if (fm?.marketId && !fm?.marketLimits && !marketLimitsRef.current[fm?.marketId]) {
        //setting a default value and the calling the fetch bet limits
        //so that fetch market limits is not multiple times for a single market
        marketLimitsRef.current[fm?.marketId] = {
          minStake: 100,
          maxStake: 100,
          maxOdd: 4,
        };
        // Update state for display purposes
        setMarketLimits({ ...marketLimitsRef.current });
        // fetchBetLimits(fm?.marketId, fm?.category);
      }
      if (fm?.category) {
        localFancyCategories.add(fm.category);
      }
    }
    
    setFancyCategories(localFancyCategories);
    
    // Debug logging
    if (process.env.NODE_ENV === 'development' && safeFmData.length > 0) {
      console.log("[FMTable] Categories found:", Array.from(localFancyCategories));
      console.log("[FMTable] Total markets:", safeFmData.length);
      console.log("[FMTable] Sample market category:", safeFmData[0]?.category);
      console.log("[FMTable] Sample market:", safeFmData[0]);
    }
  }, [safeFmData]);
  
  const handletabs = useCallback(async (localFancyCategory: string) => {
    setFilteredFancyMarketsData(
      localFancyCategory === "All"
        ? safeFmData
        : safeFmData.filter((fm) => {
            return fm.category === localFancyCategory;
          })
    );
  }, [safeFmData]);

  // Initialize filtered data when data is available (only when data length changes)
  const prevDataLengthRef = useRef(0);
  
  useEffect(() => {
    // Only initialize if data length changed (new data arrived)
    if (safeFmData.length > 0 && safeFmData.length !== prevDataLengthRef.current) {
      // Initialize with all data (equivalent to "All" tab)
      setFilteredFancyMarketsData(safeFmData);
      prevDataLengthRef.current = safeFmData.length;
    } else if (safeFmData.length === 0 && prevDataLengthRef.current > 0) {
      // Clear filtered data when data is cleared
      setFilteredFancyMarketsData([]);
      prevDataLengthRef.current = 0;
    }
  }, [safeFmData.length]);

  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const getFancyMarketsByGroup = (category: string) => {
    return safeFmData
      .filter((fm) => fm.category === category)
      .sort((a, b) => {
        if (a?.sort - b?.sort != 0) {
          return a?.sort - b?.sort;
        }
        const aDesc = a.marketName;
        const bDesc = b.marketName;
        if (aDesc > bDesc) return 1;
        else if (aDesc < bDesc) return -1;
        return 0;
      });
  };

  useEffect(() => {
    if (marketNotifications) {
      const map = new Map();
      marketNotifications.forEach((msgObj) => {
        map.set(msgObj.marketId, msgObj.message);
      });
      setNotifications(map);
    }
  }, [marketNotifications]);

  return (
    <>
      <div className="fm-table-ctn">
        <div
          className="fm-table-content table-ctn"
          style={{ position: "relative" }}
        >
          {(bettingInprogress || oneClickBettingLoading) &&
            bets?.[0]?.marketType === "FANCY" && (
              <OneClickBettingCountdown delay={bets?.[0]?.delay || 0} />
            )}
          <TableContainer component={Paper}>
            <Table className="fm-table">
              <TableHead>
                <TableRow>
                  <TableCell className="tabs-table-cell" colSpan={12}>
                    <div className="tabs-fancy">
                      {fancyCategories.size > 0 ? (
                        <span
                          className={tabVal === 0 ? "sel-tab" : "ind-tab"}
                          onClick={() => {
                            handletabs("All");
                            setTabVal(0);
                          }}
                        >
                          <div>{langData?.["all"]}</div>
                        </span>
                      ) : null}
                      {fancyCategoriesOrder.map((fc, index) => {
                        return fancyCategories.has(fc.fancyCategory) ? (
                          <span
                            className={
                              tabVal === index + 1 ? "sel-tab" : "ind-tab"
                            }
                            onClick={() => {
                              setTabVal(index + 1);
                              handletabs(fc.fancyCategory);
                            }}
                          >
                            <div>{langData?.[fc.langKey]}</div>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFancyMarketsData &&
                filteredFancyMarketsData.length > 0 ? (
                  <>
                    {fancyCategoriesOrder.map((group) => (
                      <>
                        {filteredFancyMarketsData.filter(
                          (fm) =>
                            fm.category === group.fancyCategory &&
                            fancyCategories.has(group.fancyCategory)
                        ).length > 0 ? (
                          <>
                            <Accordion
                              defaultExpanded={true}
                              className="markets-accordian"
                              style={{
                                position: "relative",
                              }}
                            >
                              <AccordionSummary
                                expandIcon={
                                  <ExpandLessSharpIcon className="expand-icon" />
                                }
                                aria-controls="panel1a-content"
                              >
                                <FancyHeaderRow
                                  groupName={langData?.[group.langKey]}
                                />
                              </AccordionSummary>
                              <FancyHeaderRow
                                groupName={langData?.[group.langKey]}
                                className="row-hidden"
                              />
                              {getFancyMarketsByGroup(group.fancyCategory).map(
                                (fMarket, index) => {
                                  return !isFancyDisabled(fMarket.disable) ? (
                                    <>
                                      <FancyMarketRow
                                        eventData={eventData}
                                        fMarket={fMarket}
                                        index={index}
                                        cFactor={cFactor}
                                        loggedIn={loggedIn}
                                        openBets={openBets}
                                        disabledStatus={disabledStatus}
                                        addExchangeBet={addExchangeBet}
                                        setShowBooksModal={() => {
                                          setFancyBookOutcomeId(
                                            fMarket.marketId
                                          );
                                          setFancyBookOutcomeName(
                                            fMarket.marketName
                                          );
                                          setShowBooksModal(true);
                                        }}
                                        outcomeOpenBets={openBets.filter(
                                          (b) =>
                                            b.marketType === 2 &&
                                            b.outcomeId === fMarket.marketId
                                        )}
                                        exposureMap={exposureMap}
                                        bets={bets}
                                        selectedRow={selectedRow}
                                        setSelectedRow={setSelectedRow}
                                        // fetchBetLimits={(mId, mcategory) => fetchBetLimits(mId, mcategory)}
                                        minStake={
                                          fMarket.isMarketLimitSet
                                            ? fMarket?.marketLimits?.minStake
                                              ? fMarket?.marketLimits?.minStake
                                              : marketLimits[fMarket?.marketId]
                                                  ?.minStake
                                            : fMarket.limits.minBetValue
                                        }
                                        maxStake={
                                          fMarket.isMarketLimitSet
                                            ? fMarket?.marketLimits?.maxStake
                                              ? fMarket?.marketLimits?.maxStake
                                              : marketLimits[fMarket?.marketId]
                                                  ?.maxStake
                                            : fMarket.limits.maxBetValue
                                        }
                                        oddLimit={
                                          fMarket?.marketLimits?.maxOdd?.toString()
                                            ? fMarket?.marketLimits?.maxOdd?.toString()
                                            : marketLimits[fMarket?.marketId]
                                                ?.maxOdd
                                        }
                                        commissionEnabled={commissionEnabled}
                                        fancySuspended={fancySuspended}
                                        fancyDisabled={fancyDisabled}
                                        setBetStartTime={(date) =>
                                          setBetStartTime(date)
                                        }
                                        setAddNewBet={(val) =>
                                          setAddNewBet(val)
                                        }
                                        oneClickBettingEnabled={
                                          oneClickBettingEnabled
                                        }
                                        setAlertMsg={setAlertMsg}
                                        langData={langData}
                                        oneClickBettingLoading={
                                          oneClickBettingLoading ||
                                          bettingInprogress
                                        }
                                        hasScrolledToBetslip={
                                          hasScrolledToBetslip
                                        }
                                        setHasScrolledToBetslip={
                                          setHasScrolledToBetslip
                                        }
                                      />
                                      {notifications.get(fMarket.marketId) ? (
                                        <TableRow>
                                          <TableCell colSpan={5} padding="none">
                                            <div
                                              className="marque-new"
                                              style={{
                                                animationDuration: `${Math.max(
                                                  10,
                                                  notifications.get(
                                                    fMarket.marketId
                                                  ).length / 5
                                                )}s`,
                                              }}
                                            >
                                              <div className="notifi-mssage">
                                                {notifications.get(
                                                  fMarket.marketId
                                                )}
                                              </div>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ) : null}
                                    </>
                                  ) : null;
                                }
                              )}
                            </Accordion>
                          </>
                        ) : null}
                      </>
                    ))}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <div className="fm-table-msg-text">
                        {langData?.["fancy_markets_not_found_txt"]}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Drawer
            anchor={"bottom"}
            open={infoDilalog.launch}
            onClose={() =>
              setInfoDialog({
                launch: false,
                oddsType: null,
                eventTypeID: null,
              })
            }
            className="light-bg-title game-rules-drawer web-view"
            title="Rules"
            // size="md"
          >
            <div className="game-rules-header">
              <div className="game-rules-title">{langData?.["game_rules"]}</div>
              <div
                className="game-rules-close cursor"
                onClick={() =>
                  setInfoDialog({
                    launch: false,
                    oddsType: null,
                    eventTypeID: null,
                  })
                }
              >
                <CloseOutlined />
              </div>
            </div>
            <MarketTermsCondi oddsType={infoDilalog.oddsType} />
          </Drawer>

          <Drawer
            anchor={"bottom"}
            open={infoDilalog.launch}
            onClose={() =>
              setInfoDialog({
                launch: false,
                oddsType: null,
                eventTypeID: null,
              })
            }
            className="light-bg-title game-rules-drawer mob-view"
            // TODO: check if this also needs to be changed ??
            title="Rules"
            // size="md"
          >
            <div className="game-rules-header">
              <div className="game-rules-title">{langData?.["game_rules"]}</div>
              <div
                className="game-rules-close cursor"
                onClick={() =>
                  setInfoDialog({
                    launch: false,
                    oddsType: null,
                    eventTypeID: null,
                  })
                }
              >
                <CloseOutlined />
              </div>
            </div>
            <MarketTermsCondi oddsType={infoDilalog.oddsType} />
          </Drawer>

          <Modal
            open={showBooksModal}
            closeHandler={() => {
              setShowBooksModal(false);
              setFancyBookOutcomeId(null);
            }}
            customClass="fancy-book-dialog"
            title="Book List"
            size="sm"
          >
            <FancyBookView
              fancyBookOutcomeId={fancyBookOutcomeId}
              exposureMap={
                exposureMap &&
                exposureMap &&
                exposureMap[`${fancyBookOutcomeId}:${fancyBookOutcomeName}`]
                  ? exposureMap[`${fancyBookOutcomeId}:${fancyBookOutcomeName}`]
                  : {}
              }
            />
          </Modal>
        </div>
      </div>
    </>
  );
};

type FancyHeaderRowProps = {
  groupName: string;
  className?: string;
};

const FancyHeaderRow: React.FC<FancyHeaderRowProps> = (props) => {
  const { groupName, className } = props;
  const tableFields = [
    {
      key: "groupName",
      Label: groupName,
      className: "market-name-cell-head",
      align: "left",
    },
    {
      key: "odds-no",
      Label: "",
      className: "odds-cell-head book-btn-cell",
      align: "center",
    },
    {
      key: "odds-no",
      Label: "No",
      className: "odds-cell-head odds-no-cell",
      align: "center",
    },
    {
      key: "odds-yes",
      Label: "Yes",
      className: "odds-cell-head odds-yes-cell",
      align: "center",
    },
    {
      key: "limits",
      Label: "",
      className: "odds-cell-head limits-cell",
      align: "center",
    },
  ];

  return (
    <TableRow className={"header-row " + className}>
      {tableFields.map((tF, index) => (
        <TableCell
          key={tF.key + index}
          align={tF.align === "left" ? "left" : "center"}
          className={tF.className}
        >
          {tF.key === "odds-no" ||
          tF.key === "odds-yes" ||
          tF.key === "groupName" ? (
            <div className={tF.key.toLowerCase() + "-cell"}>
              {tF.Label?.toLowerCase()}
            </div>
          ) : null}
        </TableCell>
      ))}
    </TableRow>
  );
};

type FancyMarketRowProps = {
  eventData: EventDTO;
  fMarket: FancyMarketDTO;
  index: number;
  cFactor: number;
  loggedIn: boolean;
  disabledStatus: string[];
  addExchangeBet: (data: PlaceBetRequest) => void;
  setShowBooksModal: () => void;
  outcomeOpenBets: UserBet[];
  bets: PlaceBetRequest[];
  selectedRow: string;
  setSelectedRow: (data) => void;
  openBets: UserBet[];
  exposureMap: any;
  // fetchBetLimits: (mId, mcategory) => void;
  maxStake: number;
  minStake: number;
  oddLimit: string;
  commissionEnabled: boolean;
  fancySuspended: boolean;
  fancyDisabled: boolean;
  setBetStartTime: Function;
  setAddNewBet: Function;
  oneClickBettingEnabled: boolean;
  setAlertMsg: Function;
  oneClickBettingLoading: boolean;
  langData: any;
  hasScrolledToBetslip: boolean;
  setHasScrolledToBetslip: (value: boolean) => void;
};

const FancyMarketRow: React.FC<FancyMarketRowProps> = (props) => {
  const {
    eventData,
    fMarket,
    index,
    cFactor,
    loggedIn,
    disabledStatus,
    addExchangeBet,
    setShowBooksModal,
    setBetStartTime,
    bets,
    setAddNewBet,
    setSelectedRow,
    openBets,
    exposureMap,
    // fetchBetLimits,
    minStake,
    maxStake,
    oddLimit,
    commissionEnabled,
    fancySuspended,
    langData,
    fancyDisabled,
    oneClickBettingEnabled,
    setAlertMsg,
    oneClickBettingLoading,
    hasScrolledToBetslip,
    setHasScrolledToBetslip,
  } = props;

  // useEffect(() => {
  //   if (fMarket) {
  //     fetchBetLimits(fMarket.marketId, fMarket.category);
  //   }
  // }, [loggedIn]);

  // useEffect(() => {
  //   if (fMarket) {
  //     const interval = setInterval(() => {
  //       console.log("fmarket: ", fMarket)

  //       fetchBetLimits(fMarket.marketId, fMarket.category);
  //     }, 5000);
  //     return () => clearInterval(interval);
  //   }
  // }, [fMarket.marketId]);

  const isFancySuspended = (fMarketSuspended: boolean) => {
    return fancySuspended === true ? true : fMarketSuspended;
  };

  const isFancyDisabled = (fMarketDisabled: boolean) => {
    return fancyDisabled ? true : fMarketDisabled;
  };

  return (
    <>
      <TableRow key={"row-" + index}>
        <TableCell className="market-name-cell" key={"row-" + index + "cell-1"}>
          <div className="market">
            {fMarket.customMarketName
              ? fMarket.customMarketName
              : fMarket.marketName}{" "}
            {fMarket.commissionEnabled
              ? // && commissionEnabled
                "*"
              : null}
          </div>
        </TableCell>
        <TableCell
          className="odds-cell book-btn-cell"
          key={"row-" + index + "cell-4"}
        >
          <Button
            className="fancy-book-btn"
            onClick={() => {
              if (
                exposureMap &&
                exposureMap[`${fMarket.marketId}:${fMarket.marketName}`]
              )
                setShowBooksModal();
            }}
            disabled={
              !(
                exposureMap &&
                exposureMap[`${fMarket.marketId}:${fMarket.marketName}`]
              )
            }
          >
            {langData?.["book"]}
          </Button>
        </TableCell>
        <TableCell className="odds-cell" key={"row-" + index + "cell-2"}>
          <div className="odds-block">
            <ExchOddBtn
              mainValue={fMarket.layPrice}
              mainValueClass="runs"
              subValue={fMarket.laySize}
              subValueClass="odds"
              oddType="odds-no-cell"
              valueType="fancyMarketOdds"
              disable={
                disabledStatus.includes(fMarket.status.toLowerCase()) ||
                isFancySuspended(fMarket.suspend) === true ||
                isFancyDisabled(fMarket.disable) === true
              }
              onClick={() => {
                if (oneClickBettingLoading) {
                  setAlertMsg({
                    message: langData?.betIsInProgress,
                    type: "error",
                  });
                  return;
                }
                if (
                  !disabledStatus.includes(fMarket.status.toLowerCase()) ||
                  isFancySuspended(fMarket.suspend) === true ||
                  isFancyDisabled(fMarket.disable) === true
                ) {
                  const betData: PlaceBetRequest = {
                    providerId: eventData.fancyProvider,
                    sportId: eventData.sportId,
                    seriesId: eventData.competitionId,
                    seriesName: eventData.competitionName,
                    eventId: eventData.eventId,
                    eventName: eventData.eventName,
                    eventDate: eventData.openDate,
                    marketId: fMarket.marketId,
                    marketName: fMarket.marketName,
                    marketType: "FANCY" as const,
                    outcomeId: fMarket.marketId,
                    outcomeDesc: "@ " + fMarket.layPrice,
                    betType: "LAY",
                    amount: 0,
                    oddValue: fMarket.laySize,
                    sessionPrice: fMarket.layPrice,
                    oddLimt: oddLimit,
                    minStake: minStake,
                    maxStake: maxStake,
                    mcategory: fMarket.category,
                    displayOddValue: fMarket.layPrice,
                    delay: fMarket?.marketLimits?.delay || 0,
                  };

                  if (oneClickBettingEnabled) {
                    addExchangeBet(betData);
                    oneClickBetPlaceHandler(
                      [betData],
                      langData,
                      setAlertMsg,
                      eventData
                    );
                  } else {
                    setSelectedRow(fMarket.marketName + "FM");
                    addExchangeBet(betData);
                  }
                }
              }}
            />
          </div>
        </TableCell>

        <TableCell className="odds-cell" key={"row-" + index + "cell-3"}>
          <div className="odds-block">
            <ExchOddBtn
              mainValue={fMarket.backPrice}
              mainValueClass="runs"
              subValue={fMarket.backSize}
              subValueClass="odds"
              oddType="odds-yes-cell"
              valueType="fancyMarketOdds"
              disable={
                disabledStatus.includes(fMarket.status.toLowerCase()) ||
                isFancySuspended(fMarket.suspend) === true ||
                isFancyDisabled(fMarket.disable) === true
              }
              onClick={() => {
                if (oneClickBettingLoading) {
                  setAlertMsg({
                    message: langData?.betIsInProgress,
                    type: "error",
                  });
                  return;
                }
                if (
                  !disabledStatus.includes(fMarket.status.toLowerCase()) ||
                  isFancySuspended(fMarket.suspend) === true ||
                  isFancyDisabled(fMarket.disable) === true
                ) {
                  const betData: PlaceBetRequest = {
                    providerId: eventData.fancyProvider,
                    sportId: eventData.sportId,
                    seriesId: eventData.competitionId,
                    seriesName: eventData.competitionName,
                    eventId: eventData.eventId,
                    eventName: eventData.eventName,
                    eventDate: eventData.openDate,
                    marketId: fMarket.marketId,
                    marketName: fMarket.marketName,
                    marketType: "FANCY" as const,
                    outcomeId: fMarket.marketId,
                    outcomeDesc: "@ " + fMarket.backPrice,
                    betType: "BACK",
                    amount: 0,
                    oddValue: fMarket.backSize,
                    sessionPrice: fMarket.backPrice,
                    oddLimt: oddLimit,
                    minStake: minStake,
                    maxStake: maxStake,
                    mcategory: fMarket.category,
                    displayOddValue: fMarket.backPrice,
                    delay: fMarket?.marketLimits?.delay || 0,
                  };

                  if (oneClickBettingEnabled) {
                    addExchangeBet(betData);
                    oneClickBetPlaceHandler(
                      [betData],
                      langData,
                      setAlertMsg,
                      eventData
                    );
                  } else {
                    setSelectedRow(fMarket.marketName + "FM");
                    addExchangeBet(betData);
                  }
                }
              }}
            />
          </div>
        </TableCell>

        <TableCell className="limits-cell">
          <div className="limits-data">
            <div className="row web-view">
              <div>
                {langData?.["min"]}:{" "}
                {(() => {
                  if (!minStake || !cFactor || cFactor === 0) return 0;
                  const result = minStake / cFactor;
                  return isNaN(result) || !isFinite(result) ? 0 : ThousandFormatter(result);
                })()}
              </div>
              <div>
                {langData?.["max"]}:{" "}
                {(() => {
                  if (!maxStake || !cFactor || cFactor === 0) return 0;
                  const result = maxStake / cFactor;
                  if (isNaN(result) || !isFinite(result)) return 0;
                  return maxStake % 1000 === 0
                    ? ThousandFormatter(result)
                    : result;
                })()}
              </div>
            </div>
            <div className="row mob-view">
              <div>
                {langData?.["min"]}:{" "}
                {(() => {
                  if (!minStake || !cFactor || cFactor === 0) return 0;
                  const result = minStake / cFactor;
                  return isNaN(result) || !isFinite(result) ? 0 : ThousandFormatter(result);
                })()}
              </div>{" "}
              <div>
                {" "}
                {langData?.["max"]}:{" "}
                {(() => {
                  if (!maxStake || !cFactor || cFactor === 0) return 0;
                  const result = maxStake / cFactor;
                  if (isNaN(result) || !isFinite(result)) return 0;
                  return maxStake % 1000 === 0
                    ? ThousandFormatter(result)
                    : result;
                })()}
              </div>
            </div>
            {/* <div className="row"></div> */}
          </div>
        </TableCell>
        {disabledStatus.includes(fMarket.status.toLowerCase()) ||
        isFancySuspended(fMarket.suspend) === true ||
        isFancyDisabled(fMarket.disable) === true ? (
          <TableCell key={"row-" + index + "cell-5"}>
            <div className="disabled-odds-cell">
              {fMarket.status.toLowerCase().includes("suspended") ||
              isFancySuspended(fMarket.suspend) === true ||
              isFancyDisabled(fMarket.disable) === true
                ? "SUSPENDED"
                : fMarket.status.replace("_", " ")}
            </div>
          </TableCell>
        ) : null}
      </TableRow>
      {!oneClickBettingEnabled &&
      bets?.length > 0 &&
      bets?.[0]?.marketName === fMarket?.marketName &&
      bets?.[0]?.marketId === fMarket?.marketId &&
      isMobile ? (
        <TableRow
          className="inline-betslip"
          ref={(el) => {
            if (el && !hasScrolledToBetslip) {
              // Scroll to the betslip with smooth behavior only once
              setHasScrolledToBetslip(true);
              setTimeout(() => {
                el.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "nearest",
                });
              }, 100);
            }
          }}
        >
          <TableCell colSpan={12}>
            {" "}
            <ExchBetslip
              setBetStartTime={(date) => setBetStartTime(date)}
              setAddNewBet={(val) => setAddNewBet(val)}
            />{" "}
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  const eventType = state.exchangeSports.selectedEventType;
  const competition = state.exchangeSports.selectedCompetition;
  const event = state.exchangeSports.selectedEvent;
  return {
    eventData: getAllMarketsByEvent(
      state.exchangeSports.events,
      eventType.id,
      competition.id,
      event.id
    ),
    fmData: getFancyMarketsByEvent(
      state.exchangeSports.secondaryMarketsMap,
      event.id
    ),
    fancySuspended: isFancyMarketSuspended(
      state.exchangeSports.secondaryMarketsMap,
      event.id
    ),
    fancyDisabled: isFancyMarketDisabled(
      state.exchangeSports.secondaryMarketsMap,
      event.id
    ),
    bets: state.exchBetslip.bets,
    openBets: state.exchBetslip.openBets,
    commissionEnabled: state.common.commissionEnabled,
    langData: state.common.langData,
    bettingInprogress: state.exchBetslip.bettingInprogress,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    addExchangeBet: (data: PlaceBetRequest) => dispatch(addExchangeBet(data)),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FMTable);
