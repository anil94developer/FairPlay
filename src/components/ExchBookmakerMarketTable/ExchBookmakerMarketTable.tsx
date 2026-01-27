import React, { useEffect, useState } from "react";
import { useCountdown } from "../../hooks/countdown.hook";
import { connect, useSelector } from "react-redux";
import { RootState } from "../../models/RootState";
import {
  addExchangeBet,
  addToMultiMarket,
  checkIncludeMultiMarket,
  getCurrencyTypeFromToken,
  removeToMultiMarket,
} from "../../store";
import "./ExchBookmakerMarketTable.scss";

import Drawer from "@material-ui/core/Drawer";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";

import Button from "@material-ui/core/Button/Button";
import CloseOutlined from "@material-ui/icons/CloseOutlined";
import { isMobile } from "react-device-detect";
import { useHistory } from "react-router-dom";
import multipin from "../../assets/images/common/multipin.svg";
import { ReactComponent as RemoveMultiPin } from "../../assets/images/common/removemultimarket.svg?react";
import RemoveMultiPinDarkGreen from "../../assets/images/common/remove_multi_pin_dark_green.svg";
import { ReactComponent as RemoveMultiPinDarkViolet } from "../../assets/images/common/remove_multi_pin_dark_violet.svg?react";
import MarketTermsCondi from "../../components/MarketTermsCondi/MarketTermsCondi";
import { TOSS_ODD_VALUE } from "../../constants/CommonConstants";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { useMarketLocalState } from "../../hooks/storageHook";
import { CashoutProgressDTO, PlaceBetRequest } from "../../models/BsData";
import { UserBet } from "../../models/UserBet";
import {
  BookmakerDTO,
  BookmakerRunnerDTO,
} from "../../models/common/BookmakerDTO";
import { EventDTO } from "../../models/common/EventDTO";
import {
  getMarketLangKeyByName,
  replaceLeagueName,
  ThousandFormatter,
} from "../../util/stringUtil";
import { CashoutInfo } from "../ExchMatchOddsTable/ExchMatchOddsTable";
import ExchOddBtn from "../ExchOddButton/ExchOddButton";
import ExchBetslip from "../ExchBetslip/ExchBetslip";
import { setAlertMsg } from "../../store/common/commonActions";
import API from "../../api";
import { AlertDTO } from "../../models/Alert";
import Dialog from "@material-ui/core/Dialog";
import {
  oneClickBetPlaceHandler,
  setBettingInprogress,
  setCashoutInProgress,
} from "../../store/exchBetslip/exchBetslipActions";
import { OneClickBettingCountdown } from "../OneClickBetting/OneClickCountdown";
import Modal from "../Modal/Modal";

type StoreProps = {
  eventData: EventDTO;
  bmMData: BookmakerDTO[];
  bets: PlaceBetRequest[];
  openBets: UserBet[];
  commissionEnabled: boolean;
  addExchangeBet: (data: PlaceBetRequest) => void;
  loggedIn: boolean;
  getFormattedMinLimit: (num: number) => string;
  getFormattedMaxLimit: (num: number) => string;
  isMultiMarket?: boolean;
  exposureMap: any;
  fetchEvent: (
    sportId: string,
    competitionId: string,
    eventId: string,
    marketTime: string
  ) => void;
  setBetStartTime?: Function;
  setAddNewBet?: Function;
  marketNotifications: any;
  setAlertMsg: Function;
  langData: any;
  bettingInprogress: boolean;
  setBettingInprogress: Function;
  setCashoutInProgress: Function;
  cashoutInProgress: CashoutProgressDTO;
  betStatusResponse: any;
};

type OddsInfoMsg = {
  launch: boolean;
  oddsType: string;
  eventTypeID: string;
};

const multiPinsMap = {
  purple: RemoveMultiPin,
  darkvoilet: RemoveMultiPinDarkViolet,
  darkgreen: RemoveMultiPinDarkGreen,
};

const BmMTable: React.FC<StoreProps> = (props) => {
  const {
    eventData,
    bmMData,
    bets,
    openBets,
    setAddNewBet,
    setBetStartTime,
    addExchangeBet,
    isMultiMarket,
    loggedIn,
    exposureMap,
    fetchEvent,
    marketNotifications,
    setAlertMsg,
    langData,
    bettingInprogress,
    setBettingInprogress,
    setCashoutInProgress,
    cashoutInProgress,
    betStatusResponse,
  } = props;
  let history = useHistory();
  const {
    oneClickBettingEnabled,
    oneClickBettingStake,
    oneClickBettingLoading,
  } = useSelector((state: RootState) => state.exchBetslip);
  const [multiMarketData, setMultiMarketData] = useMarketLocalState();
  const [openBetsMap, setOpenBetsMap] = useState<Map<String, UserBet[]>>(
    new Map()
  );
  const [confirmCashout, setConfirmCashout] = useState<boolean>(false);
  const [confirmTurboCashout, setConfirmTurboCashout] =
    useState<boolean>(false);
  const [coMarket, setCoMarket] = useState<BookmakerDTO>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasScrolledToBetslip, setHasScrolledToBetslip] =
    useState<boolean>(false);
  const [speedCashCountdown, setSpeedCashCountdown] = useState<
    Map<string, number>
  >(new Map());

  // Reset scroll state when bets change
  useEffect(() => {
    setHasScrolledToBetslip(false);
  }, [bets]);

  // Effect to handle speed cash countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      // Handle speed cash countdown
      setSpeedCashCountdown((prevCountdown) => {
        const newCountdown = new Map(prevCountdown);
        newCountdown.forEach((value, key) => {
          if (value > 0) {
            const newValue = value - 1;
            if (newValue > 0) {
              newCountdown.set(key, newValue);
            } else {
              newCountdown.delete(key);
            }
          }
        });
        return newCountdown;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Effect to start countdown when cashout completes successfully
  useEffect(() => {
    if (
      betStatusResponse?.status === "SUCCESS" &&
      cashoutInProgress?.marketId &&
      cashoutInProgress?.marketName
    ) {
      const key = `${cashoutInProgress.marketId}:${cashoutInProgress.marketName}`;
      setSpeedCashCountdown((prev) => {
        const newCountdown = new Map(prev);
        newCountdown.set(key, 7); // Start 7-second countdown
        return newCountdown;
      });
    }
  }, [betStatusResponse, cashoutInProgress]);

  const [bmLimits, setBMLimits] = useState<any>({});
  const [infoDilalog, setInfoDialog] = useState<OddsInfoMsg>({
    launch: false,
    oddsType: null,
    eventTypeID: null,
  });
  const marketData = useMarketLocalState();
  const [notifications, setNotifications] = useState<Map<String, string>>(
    new Map()
  );
  const disabledStatus = [
    "suspended",
    "closed",
    "suspended-manually",
    "ball_running",
  ];

  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];
  const tableFields = [
    {
      key: "teamName",
      Label: "Market",
      labelKey: "market",
      className: "market-name-cell-head",
      align: "left",
    },
    {
      key: "Back",
      Label: "Back",
      labelKey: "back",
      className: "odds-cell-head back-odd",
      align: "center",
    },
    {
      key: "Lay",
      Label: "Lay",
      labelKey: "lay",
      className: "odds-cell-head lay-odd",
      align: "center",
    },
  ];

  const getOpenBetsPL = (
    runner: BookmakerRunnerDTO,
    marketId: string,
    marketName: string
  ) => {
    if (exposureMap && exposureMap?.[`${marketId}:${marketName}`]) {
      for (let rn of exposureMap[`${marketId}:${marketName}`]) {
        if (rn.runnerId === runner.runnerId) {
          return rn?.userRisk / cFactor;
        }
      }
    }
  };

  const getOpenBetsPLInArray = (
    runner: BookmakerRunnerDTO,
    marketId: string,
    marketName: string
  ) => {
    let pl = getOpenBetsPL(runner, marketId, marketName);
    return pl ? [pl] : [];
  };

  const getTotalPL = (
    runner: BookmakerRunnerDTO,
    marketId: string,
    marketName: string
  ) => {
    let returns = null;
    const mBetslipBets = bets.filter(
      (b) => b.marketId === marketId && b.amount && b.amount > 0
    );
    if (mBetslipBets.length > 0) {
      returns = getOpenBetsPL(runner, marketId, marketName);
      for (let bet of mBetslipBets) {
        const plVal = (bet.oddValue / 100 + 1) * bet.amount - bet.amount;
        if (bet.betType === "BACK") {
          if (bet.outcomeId === runner.runnerId)
            returns ? (returns += plVal) : (returns = plVal);
          else returns ? (returns -= bet.amount) : (returns = 0 - bet.amount);
        } else if (bet.betType === "LAY") {
          if (bet.outcomeId === runner.runnerId)
            returns ? (returns -= plVal) : (returns = 0 - plVal);
          else returns ? (returns += bet.amount) : (returns = bet.amount);
        }
      }
    }
    return [returns];
  };

  const getOutcomeId = (selectionId: string, runners: BookmakerRunnerDTO[]) => {
    for (let mo of runners) {
      if (mo.runnerId === selectionId) {
        return mo.runnerName;
      }
    }
  };
  const isHaveCashOut = (bmMarket: BookmakerDTO) => {
    if (bmMarket?.runners?.length !== 2) {
      return false;
    }
    if (disabledStatus.includes(bmMarket?.status?.toLowerCase())) {
      return false;
    }

    // Check if risk difference is greater than 0.1
    const key = `${bmMarket.marketId}:${bmMarket.marketName}`;
    const riskRows = exposureMap[key] as RiskRow[];

    if (!riskRows || riskRows.length < 2) {
      return false;
    }

    const [A, B] = bmMarket.runners;
    const riskMap = new Map(
      riskRows.map((r) => [r.runnerId, Number(r.userRisk) || 0])
    );
    const PA = Number(riskMap.get(A.runnerId) ?? 0);
    const PB = Number(riskMap.get(B.runnerId) ?? 0);

    const riskDifference = Math.abs(PA - PB);
    return riskDifference > 0.1;
  };

  useEffect(() => {
    let boMap = new Map();
    openBets
      .filter((b) => b.marketType == "BOOKMAKER")
      .forEach((bet) => {
        const key = `${bet.marketId}:${bet.marketName}`;
        if (boMap.has(key)) {
          let boBets: UserBet[] = boMap.get(key);
          boBets.push(bet);
          boMap.set(key, boBets);
        } else {
          boMap.set(key, [bet]);
        }
      });
    setOpenBetsMap(boMap);
  }, [openBets]);

  const getCashoutProfit = (market: BookmakerDTO) => {
    // Proceed only for markets with 2 runners
    if (market.runners.length !== 2) return 0;

    const key = `${market.marketId}:${market.marketName}`;

    if (!openBetsMap.has(key) || openBetsMap.get(key).length == 0) return 0;

    const response = calCashout(market);

    return response?.riskAfter?.[market.runners[0].runnerId] || 0;
  };

  // ===================== Cashout (drop-in) =====================

  // Define the risk row structure
  type RiskRow = {
    runnerId: string;
    runnerName: string;
    userRisk: number;
  };

  // Define the return type for calCashout
  type CashoutResponse = {
    runnerId: string;
    runnerName: string;
    betType: "BACK" | "LAY";
    oddValue: number;
    stake: number;
    riskAfter: { [key: string]: number };
  } | null;

  // main entry
  const calCashout = (market: BookmakerDTO): CashoutResponse => {
    const key = `${market.marketId}:${market.marketName}`;
    const riskRows = exposureMap[key] as RiskRow[];

    if (!riskRows || riskRows.length < 2) {
      return null;
    }

    const [A, B] = market.runners;
    const riskMap = new Map(
      riskRows.map((r) => [r.runnerId, Number(r.userRisk) || 0])
    );
    const PA = Number(riskMap.get(A.runnerId) ?? 0);
    const PB = Number(riskMap.get(B.runnerId) ?? 0);

    return getResponse({ market, PA, PB });
  };

  const getResponse = ({
    market,
    PA,
    PB,
  }: {
    market: BookmakerDTO;
    PA: number;
    PB: number;
  }): CashoutResponse => {
    const [A, B] = market.runners;

    // Early exit if already equal
    const epsilon = 0.01;
    const riskDiff = Math.abs(PA - PB);

    if (riskDiff <= epsilon) {
      return null;
    }

    // Get odds
    const bestBack = (r: BookmakerRunnerDTO): number | null => {
      const backPrice = r?.backPrice;
      if (!backPrice || backPrice === "0") {
        return null;
      }
      const p = (Number(backPrice) + 100) / 100;
      const n = Number(p);
      return Number.isFinite(n) ? n : null;
    };
    const bestLay = (r: BookmakerRunnerDTO): number | null => {
      const layPrice = r?.layPrice;
      if (!layPrice || layPrice === "0") {
        return null;
      }
      const p = (Number(layPrice) + 100) / 100;
      const n = Number(p);
      return Number.isFinite(n) ? n : null;
    };

    const oA_back = bestBack(A),
      oA_lay = bestLay(A);
    const oB_back = bestBack(B),
      oB_lay = bestLay(B);

    const minStake = Number(market?.marketLimits?.minStake ?? 0);
    const maxStake = Number(
      market?.marketLimits?.maxStake ?? Number.POSITIVE_INFINITY
    );

    // Simulate post-trade risk
    const simulate = (
      betType: "BACK" | "LAY",
      onRunner: BookmakerRunnerDTO,
      s: number,
      o: number
    ): { [key: string]: number } => {
      let a = Number(PA),
        b = Number(PB);
      const onA = onRunner.runnerId === A.runnerId;

      if (betType === "BACK") {
        const win = (o - 1) * s,
          lose = -s;

        if (onA) {
          a += win;
          b += lose;
        } else {
          b += win;
          a += lose;
        }
      } else {
        const win = -(o - 1) * s,
          lose = +s;

        if (onA) {
          a += win;
          b += lose;
        } else {
          b += win;
          a += lose;
        }
      }

      return { [A.runnerId]: +a.toFixed(2), [B.runnerId]: +b.toFixed(2) };
    };

    // Generate candidates
    const candsIdeal: Array<{
      betType: "BACK" | "LAY";
      runner: BookmakerRunnerDTO;
      odds: number;
      stake: number;
      riskAfter?: { [key: string]: number };
    }> = [];

    const worseIsA = PA < PB;
    const pnlDiff = Math.abs(PB - PA);

    if (worseIsA) {
      if (Number.isFinite(oA_back)) {
        const s = pnlDiff / oA_back;
        if (s > 0)
          candsIdeal.push({
            betType: "BACK",
            runner: A,
            odds: oA_back,
            stake: s,
          });
      }
      if (Number.isFinite(oB_lay)) {
        const s = pnlDiff / oB_lay;
        if (s > 0)
          candsIdeal.push({
            betType: "LAY",
            runner: B,
            odds: oB_lay,
            stake: s,
          });
      }
    } else {
      if (Number.isFinite(oB_back)) {
        const s = pnlDiff / oB_back;
        if (s > 0)
          candsIdeal.push({
            betType: "BACK",
            runner: B,
            odds: oB_back,
            stake: s,
          });
      }
      if (Number.isFinite(oA_lay)) {
        const s = pnlDiff / oA_lay;
        if (s > 0)
          candsIdeal.push({
            betType: "LAY",
            runner: A,
            odds: oA_lay,
            stake: s,
          });
      }
    }

    if (candsIdeal.length === 0) {
      return null;
    }

    // Score and sort candidates
    const scoreWorst = (riskAfter: { [key: string]: number }) =>
      Math.min(...Object.values(riskAfter));

    candsIdeal.forEach((c) => {
      c.riskAfter = simulate(c.betType, c.runner, c.stake, c.odds);
    });

    candsIdeal.sort(
      (x, y) => scoreWorst(y.riskAfter!) - scoreWorst(x.riskAfter!)
    );

    const ideal = candsIdeal[0]
      ? {
          runnerId: candsIdeal[0].runner.runnerId,
          runnerName: candsIdeal[0].runner.runnerName,
          betType: candsIdeal[0].betType,
          oddValue: +candsIdeal[0].odds.toFixed(2),
          stake: +candsIdeal[0].stake.toFixed(2),
          riskAfter: candsIdeal[0].riskAfter!,
        }
      : null;

    // Apply constraints
    const applyConstraints = (
      cand: (typeof candsIdeal)[0]
    ): CashoutResponse => {
      if (!cand) {
        return null;
      }

      let s = Math.max(cand.stake, minStake);
      s = Math.min(s, maxStake);

      if (!(s > 0) || !Number.isFinite(s)) {
        return null;
      }

      return {
        runnerId: cand.runner.runnerId,
        runnerName: cand.runner.runnerName,
        betType: cand.betType,
        oddValue: +cand.odds.toFixed(2),
        stake: +s.toFixed(2),
        riskAfter: simulate(cand.betType, cand.runner, s, cand.odds),
      };
    };

    const constrained = applyConstraints(candsIdeal[0]);

    // Pick best option
    const pick = (a: CashoutResponse, b: CashoutResponse): CashoutResponse => {
      if (a && b) {
        const sa = scoreWorst(a.riskAfter),
          sb = scoreWorst(b.riskAfter);
        return sa >= sb ? a : b;
      }
      return a ?? b ?? null;
    };

    return pick(constrained, ideal);
  };

  const autoCashout = async (market: BookmakerDTO) => {
    if (market == null) return;
    const response = calCashout(market);

    if (response.oddValue == 0) return;

    const payload = {
      sportId: eventData.sportId,
      seriesId: eventData.competitionId,
      seriesName: eventData.competitionName,
      eventId: eventData.eventId,
      eventName: eventData.eventName,
      eventDate: eventData.openDate,
      marketId: market.marketId,
      marketName: market.marketName,
      marketType: "BM",
      outcomeId: response.runnerId,
      betType: response.betType,
      oddValue: +(+response.oddValue * 100 - 100).toFixed(2),
      amount: +(response.stake / cFactor).toFixed(2),
      outcomeDesc: getOutcomeId(response.runnerId, market.runners),
      sessionPrice: -1,
      srEventId: eventData.eventId,
      srSeriesId: eventData.competitionId,
      srSportId: eventData.sportId,
      oddLimt: market?.marketLimits?.maxOdd.toString(),
      mcategory: "ALL",
    };

    if (payload.amount < 100) {
      setAlertMsg({
        type: "error",
        message: langData?.["minimum_stake_txt"] + " " + 100 + ".",
      });
      setLoading(false);
      return false;
    }

    setCashoutInProgress({
      loading: true,
      marketId: market.marketId,
      marketName: market.marketName,
    });
    setBettingInprogress(true);

    try {
      const response = await API.post(`/bs/place-bookmaker-bet`, payload, {
        headers: {
          Authorization: sessionStorage.getItem("jwt_token"),
        },
        timeout: 1000 * 20,
      });

      if (response.status === 200) {
        setCashoutInProgress({
          loading: false,
          marketId: market.marketId,
          marketName: market.marketName,
        });
      }
    } catch (error) {
      setAlertMsg({
        type: "error",
        message: error?.response?.data?.message,
      });
      setCashoutInProgress({
        loading: false,
        marketId: market.marketId,
        marketName: market.marketName,
      });
    } finally {
      setCashoutInProgress({
        loading: false,
        marketId: market.marketId,
        marketName: market.marketName,
      });
    }
    setLoading(false);
  };

  const getTurboCashoutData = (market: BookmakerDTO) => {
    const key = `${market.marketId}:${market.marketName}`;
    const riskRows = exposureMap[key] as RiskRow[];

    if (!riskRows || riskRows.length < 2) return null;

    const [A, B] = market.runners;
    const riskMap = new Map(
      riskRows.map((r) => [r.runnerId, Number(r.userRisk) || 0])
    );
    const PA = Number(riskMap.get(A.runnerId) ?? 0);
    const PB = Number(riskMap.get(B.runnerId) ?? 0);

    // Get the least risk value
    const leastRisk = Math.min(PA, PB);
    const turboCashoutAmount = leastRisk * 0.97; // 3% fee deducted

    return {
      runnerA: { name: A.runnerName, risk: PA },
      runnerB: { name: B.runnerName, risk: PB },
      turboCashoutAmount: +turboCashoutAmount.toFixed(2),
    };
  };

  const turboCashout = async (market?: BookmakerDTO) => {
    const marketData = market || coMarket;
    if (marketData == null) return;

    const payload = {
      providerId: "BetFair",
      sportId: eventData.sportId,
      eventId: eventData.eventId,
      marketId: marketData.marketId,
      marketType: "BM",
    };

    console.log("speed cash payload (bookmaker)", payload);

    try {
      const response = await API.post(`/bs/cashout`, payload, {
        headers: {
          Authorization: sessionStorage.getItem("jwt_token"),
        },
        timeout: 1000 * 20,
      });

      if (response.status === 200) {
        setAlertMsg({
          type: "success",
          message: "Speed cash successful",
        });
      }
    } catch (error) {
      setAlertMsg({
        type: "error",
        message: error?.response?.data?.message || "Speed cash failed",
      });
      throw error; // Re-throw to be caught by the button handler
    }
  };

  const isTurboCashoutAvailable = (market: BookmakerDTO) => {
    // Disable turbo cashout for sport ID '1' and '2'
    if (["1", "2"].includes(eventData.sportId)) return false;

    const key = `${market.marketId}:${market.marketName}`;
    const riskRows = exposureMap[key] as RiskRow[];

    if (!riskRows || riskRows.length < 2) return false;

    const [A, B] = market.runners;
    const riskMap = new Map(
      riskRows.map((r) => [r.runnerId, Number(r.userRisk) || 0])
    );
    const PA = Number(riskMap.get(A.runnerId) ?? 0);
    const PB = Number(riskMap.get(B.runnerId) ?? 0);

    // Both runners should have positive P&L greater than 100
    // Risk difference should be less than 10
    const riskDifference = Math.abs(PA - PB);
    const meetsConditions = PA >= 100 && PB >= 100 && riskDifference <= 10;

    // Check if countdown is active for this market
    const countdownValue = speedCashCountdown.get(key);
    if (countdownValue && countdownValue > 0) {
      return true; // Show button during countdown but it will be disabled
    }

    return meetsConditions;
  };

  const getSpeedCashCountdown = (market: BookmakerDTO) => {
    const key = `${market.marketId}:${market.marketName}`;
    return speedCashCountdown.get(key) || 0;
  };

  const handleMultiMarket = (
    competitionId,
    eventId,
    marketId,
    providerName,
    sportId,
    isAdd = true
  ) => {
    if (loggedIn) {
      if (isAdd) {
        addToMultiMarket(
          competitionId,
          eventId,
          marketId,
          providerName,
          sportId
        );
        marketId &&
          setMultiMarketData((prevState) => {
            return [
              ...prevState,
              {
                competitionId,
                eventId,
                marketId,
                providerName,
                sportId,
              },
            ];
          });
      } else {
        removeToMultiMarket(eventId, marketId);
        marketId &&
          setMultiMarketData((prevState) => {
            let data = [...prevState];
            const index = data?.findIndex(
              (itm) => itm.eventId === eventId && itm.marketId === marketId
            );
            index > -1 && data.splice(index, 1);
            return [...data];
          });
      }
    } else {
      history.push("/login");
    }
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
      {bmMData.map((market, index) => (
        <>
          {(!market.disable && !isMultiMarket) ||
          checkIncludeMultiMarket(
            multiMarketData,
            market.marketId,
            eventData.eventId
          ) ? (
            <>
              <div className="bm-table-ctn">
                <div className="bm-table-content table-ctn">
                  <TableContainer component={Paper}>
                    <Table className="bm-table">
                      <TableHead>
                        <TableRow>
                          <TableCell colSpan={3}>
                            <div className="market-name-cell-head-ctn">
                              <span className="market-name">
                                {!checkIncludeMultiMarket(
                                  multiMarketData,
                                  market.marketId,
                                  eventData?.eventId
                                ) ? (
                                  <Tooltip
                                    title={
                                      langData?.["add_to_multi_markets_txt"]
                                    }
                                    placement="left-start"
                                  >
                                    <img
                                      src={multipin}
                                      alt="multipin"
                                      className="multi-add-icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        multiMarketData?.length < 10 &&
                                          handleMultiMarket(
                                            eventData?.competitionId,
                                            eventData?.eventId,
                                            market.marketId,
                                            eventData?.providerName,
                                            eventData?.sportId,
                                            true
                                          );
                                      }}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Tooltip
                                    title={
                                      langData?.[
                                        "remove_from_multi_markets_txt"
                                      ]
                                    }
                                    placement="left-start"
                                  >
                                    <img
                                      src={
                                        multiPinsMap[
                                          localStorage.getItem("userTheme")
                                        ]
                                      }
                                      alt="multipin"
                                      className="multi-remove-icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMultiMarket(
                                          eventData?.competitionId,
                                          eventData?.eventId,
                                          market.marketId,
                                          eventData?.providerName,
                                          eventData?.sportId,
                                          false
                                        );
                                      }}
                                    />
                                  </Tooltip>
                                )}{" "}
                                {market.customMarketName ||
                                  replaceLeagueName(
                                    market.marketName
                                      .toLowerCase()
                                      .includes("over bookmaker")
                                      ? market.marketName.slice(0, 2) +
                                          " " +
                                          langData?.[
                                            getMarketLangKeyByName(
                                              "over bookmaker"
                                            )
                                          ] +
                                          market.marketName.slice(17)
                                      : market.marketName
                                          .toLowerCase()
                                          .includes("over market")
                                      ? market.marketName.slice(0, 2) +
                                        " " +
                                        langData?.[
                                          getMarketLangKeyByName("over market")
                                        ] +
                                        market.marketName.slice(14)
                                      : getMarketLangKeyByName(
                                          market.marketName
                                        )
                                      ? langData?.[
                                          getMarketLangKeyByName(
                                            market.marketName
                                          )
                                        ]
                                      : market.marketName
                                  )}{" "}
                                <span className="event-name">
                                  {isMultiMarket && !isMobile
                                    ? "(" + eventData?.eventName + ")"
                                    : null}
                                </span>
                                {/* <IonIcon
                                  onClick={() =>
                                    setInfoDialog({
                                      launch: true,
                                      oddsType: 'Bookmaker',
                                      eventTypeID: eventData.sportId,
                                    })
                                  }
                                  className="info-img"
                                  src={InfoImg}
                                /> */}
                                {market.commissionEnabled ? (
                                  //  && commissionEnabled
                                  <span>*</span>
                                ) : null}
                                {/* <span className="no-commission">No Commission</span> */}
                              </span>
                              <>
                                {market.runners.length < 3 && (
                                  <div className="cashout-option">
                                    {!isTurboCashoutAvailable(market) && (
                                      <Button
                                        size="small"
                                        color="primary"
                                        variant="contained"
                                        className={`btn cashout-btn ${
                                          getCashoutProfit(market) > 0
                                            ? "profit"
                                            : "loss"
                                        }`}
                                        style={{
                                          borderRadius:
                                            eventData.sportId === "1"
                                              ? "20px"
                                              : undefined,
                                        }}
                                        disabled={
                                          bettingInprogress ||
                                          !isHaveCashOut(market) ||
                                          disabledStatus.includes(
                                            market.status.toLowerCase()
                                          ) ||
                                          market.suspend === true ||
                                          !(
                                            `${market?.marketId}:${market?.marketName}` in
                                            exposureMap
                                          ) ||
                                          getCashoutProfit(market) == Infinity
                                        }
                                        onClick={() => {
                                          setCoMarket(market);
                                          // setConfirmCashout(true);
                                          setLoading(true);
                                          autoCashout(market);
                                        }}
                                      >
                                        {langData?.["cashout"]}{" "}
                                        {getCashoutProfit(market) != Infinity
                                          ? `: ₹${getCashoutProfit(market)}`
                                          : ""}
                                      </Button>
                                    )}
                                    {isTurboCashoutAvailable(market) && (
                                      <Button
                                        size="small"
                                        color="secondary"
                                        variant="contained"
                                        className="btn turbo-cashout-btn profit"
                                        disabled={
                                          disabledStatus.includes(
                                            market.status.toLowerCase()
                                          ) ||
                                          market.suspend === true ||
                                          loading
                                        }
                                        onClick={() => {
                                          if (
                                            getSpeedCashCountdown(market) > 0
                                          ) {
                                            return; // Prevent click during countdown
                                          }
                                          setCoMarket(market);
                                          setConfirmTurboCashout(true);
                                        }}
                                      >
                                        {getSpeedCashCountdown(market) > 0
                                          ? `Speed Cash (${getSpeedCashCountdown(
                                              market
                                            )}s)`
                                          : "Speed Cash"}
                                      </Button>
                                    )}
                                  </div>
                                )}

                                <span className="bet-limits-section web-view">
                                  {langData?.["min"]}:
                                  {ThousandFormatter(
                                    market?.marketLimits
                                      ? market?.marketLimits.minStake / cFactor
                                      : 100
                                  )}{" "}
                                  {langData?.["max"]}:
                                  {market?.marketLimits?.maxStake % 1000 === 0
                                    ? ThousandFormatter(
                                        market?.marketLimits
                                          ? market?.marketLimits.maxStake /
                                              cFactor
                                          : 5000
                                      )
                                    : market?.marketLimits
                                    ? market?.marketLimits.maxStake / cFactor
                                    : 5000}
                                  {/* {ThousandFormatter(
                                  market?.marketLimits
                                    ? market?.marketLimits.max / cFactor
                                    : 5000
                                )} */}
                                </span>
                              </>
                              <span className="bet-limits-section mob-view">
                                <div>
                                  {langData?.["min"]}:
                                  {ThousandFormatter(
                                    market?.marketLimits
                                      ? market?.marketLimits.minStake / cFactor
                                      : 100
                                  )}{" "}
                                </div>
                                <div>
                                  {langData?.["max"]}:
                                  {market?.marketLimits?.maxStake % 1000 === 0
                                    ? ThousandFormatter(
                                        market?.marketLimits
                                          ? market?.marketLimits.maxStake /
                                              cFactor
                                          : 5000
                                      )
                                    : market?.marketLimits
                                    ? market?.marketLimits.maxStake / cFactor
                                    : 5000}
                                </div>
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow className="header-row">
                          {tableFields.map((tF, index) => (
                            <TableCell
                              key={tF.key + index}
                              align={tF.align === "left" ? "left" : "center"}
                              className={tF.className}
                            >
                              {tF.key === "lay" || "back" ? (
                                <div className={tF.key.toLowerCase() + "-odd"}>
                                  {langData?.[tF.labelKey]}
                                </div>
                              ) : (
                                langData?.[tF.labelKey]
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        {market ? (
                          <>
                            {((bettingInprogress || oneClickBettingLoading) &&
                              bets?.[0]?.marketName === market?.marketName &&
                              bets?.[0]?.marketId === market?.marketId &&
                              bets?.[0]?.marketType === "BM") ||
                            (bettingInprogress &&
                              cashoutInProgress?.marketId ===
                                market?.marketId &&
                              cashoutInProgress?.marketName ===
                                market?.marketName) ? (
                              <TableRow>
                                <TableCell colSpan={3} padding="none">
                                  <OneClickBettingCountdown
                                    delay={market?.marketLimits?.delay || 0}
                                  />
                                </TableCell>
                              </TableRow>
                            ) : null}
                            {market.runners.map((bmSelection, index) => (
                              <>
                                <TableRow>
                                  <TableCell className="team-name-cell">
                                    <div className="team">
                                      {bmSelection.runnerName}
                                      {getOpenBetsPLInArray(
                                        bmSelection,
                                        market.marketId,
                                        market.marketName
                                      ).map((ret) =>
                                        ret !== null ? (
                                          <span
                                            className={
                                              ret >= 0 ? "profit" : "loss"
                                            }
                                          >
                                            {ret > 0
                                              ? "+" + Number(ret).toFixed(2)
                                              : Number(ret).toFixed(2)}
                                          </span>
                                        ) : null
                                      )}
                                    </div>
                                    {bets.length > 0 && bets[0].amount > 0 ? (
                                      <div>
                                        {getTotalPL(
                                          bmSelection,
                                          market.marketId,
                                          market.marketName
                                        ).map((ret) =>
                                          ret !== null ? (
                                            <span
                                              className={
                                                ret >= 0 ? "profit" : "loss"
                                              }
                                            >
                                              {ret > 0
                                                ? "+" + Number(ret).toFixed(2)
                                                : Number(ret).toFixed(2)}
                                            </span>
                                          ) : null
                                        )}
                                      </div>
                                    ) : null}
                                  </TableCell>
                                  <TableCell className="odds-cell">
                                    <div className="odds-block">
                                      <ExchOddBtn
                                        mainValue={
                                          disabledStatus.includes(
                                            market.status?.toLowerCase()
                                          ) ||
                                          disabledStatus.includes(
                                            bmSelection.status?.toLowerCase()
                                          ) ||
                                          market.suspend === true ||
                                          market.disable
                                            ? 0
                                            : bmSelection.backPrice
                                        }
                                        subValue={Number(
                                          market?.marketLimits?.maxStake %
                                            1000 ===
                                            0
                                            ? market?.marketLimits
                                              ? market?.marketLimits.maxStake /
                                                cFactor
                                              : 5000
                                            : market?.marketLimits
                                            ? market?.marketLimits.maxStake /
                                              cFactor
                                            : 5000
                                        )}
                                        oddType="back-odd"
                                        valueType="bookmakerOdds"
                                        showSubValueinKformat={true}
                                        disable={
                                          disabledStatus.includes(
                                            market.status?.toLowerCase()
                                          ) ||
                                          disabledStatus.includes(
                                            bmSelection.status?.toLowerCase()
                                          ) ||
                                          market.suspend ||
                                          market.disable
                                        }
                                        onClick={() => {
                                          if (oneClickBettingLoading) {
                                            setAlertMsg({
                                              message:
                                                langData?.betIsInProgress,
                                              type: "error",
                                            });
                                            return;
                                          }
                                          if (
                                            disabledStatus.includes(
                                              market.status?.toLowerCase()
                                            ) ||
                                            disabledStatus.includes(
                                              bmSelection.status?.toLowerCase()
                                            ) ||
                                            market.suspend === true ||
                                            market.disable
                                          ) {
                                            return;
                                          }
                                          const betData: PlaceBetRequest = {
                                            providerId:
                                              eventData.bookMakerProvider,
                                            sportId: eventData.sportId,
                                            seriesId: eventData.competitionId,
                                            seriesName:
                                              eventData.competitionName,
                                            eventId: eventData.eventId,
                                            eventName: eventData.eventName,
                                            eventDate: eventData.openDate,
                                            marketId: market.marketId,
                                            marketName: market.marketName,
                                            marketType: "BM",
                                            outcomeId: bmSelection.runnerId,
                                            outcomeDesc: bmSelection.runnerName,
                                            betType: "BACK",
                                            amount: 0,
                                            oddValue: Number(
                                              bmSelection.backPrice
                                            ),
                                            sessionPrice: -1,
                                            oddLimt:
                                              market?.marketLimits?.maxOdd.toString(),
                                            minStake:
                                              market?.marketLimits?.minStake,
                                            maxStake:
                                              market?.marketLimits?.maxStake,
                                            mcategory: "ALL",
                                            delay: market?.marketLimits?.delay,
                                          };
                                          if (
                                            market.marketName.toUpperCase() ===
                                              "TOSS" &&
                                            Number(bmSelection.backPrice) > 0
                                          ) {
                                            betData["displayOddValue"] =
                                              TOSS_ODD_VALUE;
                                          }
                                          if (oneClickBettingEnabled) {
                                            addExchangeBet(betData);
                                            oneClickBetPlaceHandler(
                                              [betData],
                                              langData,
                                              setAlertMsg,
                                              eventData
                                            );
                                          } else {
                                            addExchangeBet(betData);
                                          }
                                        }}
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="odds-cell">
                                    <div className="odds-block">
                                      <ExchOddBtn
                                        mainValue={
                                          disabledStatus.includes(
                                            market.status?.toLowerCase()
                                          ) ||
                                          disabledStatus.includes(
                                            bmSelection.status?.toLowerCase()
                                          ) ||
                                          market.suspend === true ||
                                          market.disable
                                            ? 0
                                            : bmSelection.layPrice
                                        }
                                        subValue={Number(
                                          market?.marketLimits?.maxStake %
                                            1000 ===
                                            0
                                            ? market?.marketLimits
                                              ? market?.marketLimits.maxStake /
                                                cFactor
                                              : 5000
                                            : market?.marketLimits
                                            ? market?.marketLimits.maxStake /
                                              cFactor
                                            : 5000
                                        )}
                                        oddType="lay-odd"
                                        valueType="bookmakerOdds"
                                        showSubValueinKformat={true}
                                        disable={
                                          disabledStatus.includes(
                                            market.status?.toLowerCase()
                                          ) ||
                                          disabledStatus.includes(
                                            bmSelection.status?.toLowerCase()
                                          ) ||
                                          market.suspend === true ||
                                          market.disable
                                        }
                                        onClick={() => {
                                          if (oneClickBettingLoading) {
                                            setAlertMsg({
                                              message:
                                                langData?.betIsInProgress,
                                              type: "error",
                                            });
                                            return;
                                          }
                                          if (
                                            disabledStatus.includes(
                                              market.status?.toLowerCase()
                                            ) ||
                                            disabledStatus.includes(
                                              bmSelection.status?.toLowerCase()
                                            ) ||
                                            market.suspend === true ||
                                            market.disable
                                          ) {
                                            return;
                                          }
                                          const betData: PlaceBetRequest = {
                                            providerId:
                                              eventData.bookMakerProvider,
                                            sportId: eventData.sportId,
                                            seriesId: eventData.competitionId,
                                            seriesName:
                                              eventData.competitionName,
                                            eventId: eventData.eventId,
                                            eventName: eventData.eventName,
                                            eventDate: eventData.openDate,
                                            marketId: market.marketId,
                                            marketName: market.marketName,
                                            marketType: "BM",
                                            outcomeId: bmSelection.runnerId,
                                            outcomeDesc: bmSelection.runnerName,
                                            betType: "LAY",
                                            amount: 0,
                                            oddValue: Number(
                                              bmSelection.layPrice
                                            ),
                                            sessionPrice: -1,
                                            oddLimt:
                                              market?.marketLimits?.maxOdd.toString(),
                                            minStake:
                                              market?.marketLimits?.minStake,
                                            maxStake:
                                              market?.marketLimits?.maxStake,
                                            mcategory: "ALL",
                                            delay: market?.marketLimits?.delay,
                                          };
                                          if (
                                            market.marketName.toUpperCase() ===
                                              "TOSS" &&
                                            Number(bmSelection.layPrice) > 0
                                          ) {
                                            betData["displayOddValue"] =
                                              TOSS_ODD_VALUE;
                                          }
                                          if (oneClickBettingEnabled) {
                                            addExchangeBet(betData);
                                            oneClickBetPlaceHandler(
                                              [betData],
                                              langData,
                                              setAlertMsg,
                                              eventData
                                            );
                                          } else {
                                            addExchangeBet(betData);
                                          }
                                        }}
                                      />
                                    </div>
                                  </TableCell>
                                </TableRow>
                                {!oneClickBettingEnabled &&
                                bets?.length > 0 &&
                                bets?.[0]?.marketName === market.marketName &&
                                bets?.[0]?.marketId === market.marketId &&
                                bets?.[0]?.outcomeId ===
                                  bmSelection?.runnerId &&
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
                                        setBetStartTime={(date) =>
                                          setBetStartTime(date)
                                        }
                                        setAddNewBet={(val) =>
                                          setAddNewBet(val)
                                        }
                                      />{" "}
                                    </TableCell>
                                  </TableRow>
                                ) : null}
                              </>
                            ))}
                          </>
                        ) : (
                          <>
                            <TableRow>
                              <TableCell colSpan={3}>
                                <div className="bm-table-msg-text">
                                  {
                                    langData?.[
                                      "bookmaker_markets_not_found_txt"
                                    ]
                                  }
                                </div>
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                        {notifications.get(market.marketId) ? (
                          <TableRow>
                            <TableCell colSpan={12} padding="none">
                              <div
                                className="marque-new"
                                style={{
                                  animationDuration: `${Math.max(
                                    10,
                                    notifications.get(market.marketId).length /
                                      5
                                  )}s`,
                                }}
                              >
                                <div className="notifi-mssage">
                                  {notifications.get(market.marketId)}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Drawer
                    anchor={"right"}
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
                      <div className="game-rules-title">
                        {langData?.["game_rules"]}
                      </div>
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
                    title="Rules"
                    // size="md"
                  >
                    <div className="game-rules-header">
                      <div className="game-rules-title">
                        {langData?.["game_rules"]}
                      </div>
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
                </div>
              </div>
            </>
          ) : null}
        </>
      ))}
      {/* <Modal
        open={confirmCashout}
        size="xs"
        closeHandler={() => setConfirmCashout(false)}
        title={langData?.['cashout']}
        // onClose={() => setConfirmCashout(false)}
        customClass="cashout-modal cnf-dialog"
      >
        <div className="cnf-dialog-content">
          {langData?.['cashout_confirm_txt']}
        </div>
        <div className="cnf-dialog-footer">
          <Button
            size="small"
            color="primary"
            variant="outlined"
            className="cnf-cancel-btn"
            onClick={() => setConfirmCashout(false)}
          >
            {langData?.['cancel']}
          </Button>
          <Button
            size="small"
            color="primary"
            variant="contained"
            className="cnf-action-btn"
            onClick={() => {
              setLoading(true);
              autoCashout();
              setConfirmCashout(false);
            }}
            disabled={loading}
          >
            {langData?.['cashout']}
          </Button>
        </div>
      </Modal> */}

      {/* Speed Cash Dialog */}
      <Modal
        open={confirmTurboCashout}
        customClass="cashout-modal cnf-dialog"
        size="xs"
        title={langData?.["speed_cash"] ?? "Speed Cash"}
        closeHandler={() => setConfirmTurboCashout(false)}
      >
        <div className="cnf-dialog-content">
          <div className="turbo-cashout-risk-display">
            {coMarket && getTurboCashoutData(coMarket) ? (
              <>
                <div className="risk-section">
                  <div className="risk-left">
                    <div className="runner-name">
                      {getTurboCashoutData(coMarket).runnerA.name}
                    </div>
                    <div className="risk-value profit">
                      ₹
                      {Number(
                        getTurboCashoutData(coMarket).runnerA.risk
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div className="risk-divider"></div>
                  <div className="risk-right">
                    <div className="runner-name">
                      {getTurboCashoutData(coMarket).runnerB.name}
                    </div>
                    <div className="risk-value profit">
                      ₹
                      {Number(
                        getTurboCashoutData(coMarket).runnerB.risk
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="fee-section">
                  We are deducting 3% fee on Speed Cashout.
                </div>
                <div className="turbo-cashout-button-section">
                  <Button
                    size="large"
                    color="primary"
                    variant="contained"
                    className="turbo-cashout-action-btn"
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await turboCashout(coMarket);
                        setConfirmTurboCashout(false);
                      } catch (error) {
                        // Error is already handled in turboCashout function
                        // Close dialog on error
                        setConfirmTurboCashout(false);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    {/* add in language file */}
                    {loading
                      ? "PROCESSING..."
                      : `SPEED CASH ₹${
                          getTurboCashoutData(coMarket).turboCashoutAmount
                        }`}
                  </Button>
                </div>
              </>
            ) : (
              <div>No risk data available</div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  const eventType = state.exchangeSports.selectedEventType;
  const competition = state.exchangeSports.selectedCompetition;
  const event = state.exchangeSports.selectedEvent;

  return {
    // eventData: getAllMarketsByEvent(
    //   state.exchangeSports.events,
    //   eventType.id,
    //   competition.id,
    //   event.id
    // ),
    // bmMData: getBookmakerMarketsByEvent(
    //   state.exchangeSports.secondaryMarketsMap,
    //   event.id
    // ),
    bets: state.exchBetslip.bets,
    openBets: state.exchBetslip.openBets,
    commissionEnabled: state.common.commissionEnabled,
    langData: state.common.langData,
    bettingInprogress: state.exchBetslip.bettingInprogress,
    cashoutInProgress: state.exchBetslip.cashoutInProgress,
    betStatusResponse: state.exchBetslip.betStatusResponse,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    addExchangeBet: (data: PlaceBetRequest) => dispatch(addExchangeBet(data)),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
    setBettingInprogress: (val: boolean) => dispatch(setBettingInprogress(val)),
    setCashoutInProgress: (val: CashoutProgressDTO) =>
      dispatch(setCashoutInProgress(val)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BmMTable);
