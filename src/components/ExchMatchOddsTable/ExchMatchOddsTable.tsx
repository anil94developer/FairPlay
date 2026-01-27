import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import CloseOutlined from "@material-ui/icons/CloseOutlined";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { connect, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import multipin from "../../assets/images/common/multipin.svg";
import RemoveMultiPinDarkGreen from "../../assets/images/common/remove_multi_pin_dark_green.svg";
import RemoveMultiPinDarkViolet from "../../assets/images/common/remove_multi_pin_dark_violet.svg";
import RemoveMultiPin from "../../assets/images/common/removemultimarket.svg";
import JercyIcon from "../../assets/images/sportsbook/icons/horse-jercy.png";
import MarketTermsCondi from "../../components/MarketTermsCondi/MarketTermsCondi";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { useMarketLocalState } from "../../hooks/storageHook";
import { CashoutProgressDTO, PlaceBetRequest } from "../../models/BsData";
import { SelectedObj } from "../../models/ExchangeSportsState";
import { RootState } from "../../models/RootState";
import { UserBet } from "../../models/UserBet";
import { EventDTO } from "../../models/common/EventDTO";
import {
  MatchOddsDTO,
  MatchOddsRunnerDTO,
} from "../../models/common/MatchOddsDTO";
import {
  addExchangeBet,
  addToMultiMarket,
  checkIncludeMultiMarket,
  getCurrencyTypeFromToken,
  removeToMultiMarket,
} from "../../store";
import {
  ThousandFormatter,
  formatTime,
  getMarketLangKeyByName,
} from "../../util/stringUtil";
import ExchOddBtn from "../ExchOddButton/ExchOddButton";
import "./ExchMatchOddsTable.scss";
import ExchBetslip from "../ExchBetslip/ExchBetslip";
import { setAlertMsg } from "../../store/common/commonActions";
import { AlertDTO } from "../../models/Alert";
import API from "../../api";
import Dialog from "@material-ui/core/Dialog";
import {
  oneClickBetPlaceHandler,
  setBettingInprogress,
  setCashoutInProgress,
} from "../../store/exchBetslip/exchBetslipActions";
import CircularProgress from "@material-ui/core/CircularProgress";
import { OneClickBettingCountdown } from "../OneClickBetting/OneClickCountdown";
import Modal from "../Modal/Modal";

type OddsInfoMsg = {
  launch: boolean;
  oddsType: string;
  eventTypeID: string;
};

export type CashoutInfo = {
  selectionId: string;
  betType: any;
  oddValue: number;
  stakeAmount: number;
};

type StoreProps = {
  eventData: EventDTO;
  bets: PlaceBetRequest[];
  openBets: UserBet[];
  addExchangeBet: (data: PlaceBetRequest) => void;
  selectedEventType: SelectedObj;
  secondaryMatchOdds: MatchOddsDTO[];
  getFormattedMinLimit: (num: number) => string;
  getFormattedMaxLimit: (num: number) => string;
  loggedIn?: boolean;
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
  showMatchOdds: boolean;
  showSecondaryMatchOdds: boolean;
  bettingInprogress: boolean;
  setBettingInprogress: Function;
  setCashoutInProgress: Function;
  cashoutInProgress: CashoutProgressDTO;
  betStatusResponse: any;
};

const multiPinsMap = {
  purple: RemoveMultiPin,
  darkvoilet: RemoveMultiPinDarkViolet,
  darkgreen: RemoveMultiPinDarkGreen,
};

const MatchOddsTable: React.FC<StoreProps> = (props) => {
  const {
    eventData,
    bets,
    openBets,
    addExchangeBet,
    selectedEventType,
    secondaryMatchOdds,
    loggedIn,
    isMultiMarket,
    exposureMap,
    setBetStartTime,
    setAddNewBet,
    marketNotifications,
    setAlertMsg,
    langData,
    showMatchOdds,
    showSecondaryMatchOdds,
    bettingInprogress,
    setBettingInprogress,
    setCashoutInProgress,
    cashoutInProgress,
    betStatusResponse,
  } = props;
  const { oneClickBettingEnabled, oneClickBettingStake } = useSelector(
    (state: RootState) => state.exchBetslip
  );
  const { oneClickBettingLoading } = useSelector(
    (state: RootState) => state.exchBetslip
  );

  const history = useHistory();
  const [multiMarketData, setMultiMarketData] = useMarketLocalState();
  const [matchOddsData, setMatchOddsData] = useState<MatchOddsDTO>();
  const [notifications, setNotifications] = useState<Map<String, string>>(
    new Map()
  );
  //todo: remove commented market limits code if everything works fine
  const [marketLimits, setMarketLimits] = useState<any>({});
  const [selectedRow, setSelectedRow] = useState<string>("");
  const [infoDilalog, setInfoDialog] = useState<OddsInfoMsg>({
    launch: false,
    oddsType: null,
    eventTypeID: null,
  });
  const [open, setOpen] = useState<String[]>([]);
  const disabledStatus = ["suspended", "closed", "suspended-manually"];
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];
  const [openBetsMap, setOpenBetsMap] = useState<Map<String, UserBet[]>>(
    new Map()
  );
  const [confirmCashout, setConfirmCashout] = useState<boolean>(false);
  const [confirmTurboCashout, setConfirmTurboCashout] =
    useState<boolean>(false);
  const [coMarket, setCoMarket] = useState<MatchOddsDTO>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [speedCashCountdown, setSpeedCashCountdown] = useState<
    Map<string, number>
  >(new Map());

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
      className: "odds-cell-head",
      align: "right",
    },
    {
      key: "Lay",
      Label: "Lay",
      labelKey: "lay",
      className: "odds-cell-head",
      align: "left",
    },
  ];

  useEffect(() => {
    if (eventData !== null) {
      setMatchOddsData(eventData.matchOdds);
    }
  }, [eventData]);

  useEffect(() => {
    if (marketNotifications) {
      const map = new Map();
      marketNotifications.forEach((msgObj) => {
        map.set(msgObj.marketId, msgObj.message);
      });
      setNotifications(map);
    }
  }, [marketNotifications]);

  useEffect(() => {
    let moMap = new Map();
    openBets
      .filter((b) => b.marketType == "MATCH_ODDS")
      .forEach((bet) => {
        const key = `${bet.marketId}:${bet.marketName}`;
        if (moMap.has(key)) {
          let boBets: UserBet[] = moMap.get(key);
          boBets.push(bet);
          moMap.set(key, boBets);
        } else {
          moMap.set(key, [bet]);
        }
      });
    setOpenBetsMap(moMap);
  }, [openBets]);

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

  const getCashoutProfit = (market: MatchOddsDTO) => {
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
  const calCashout = (market: MatchOddsDTO): CashoutResponse => {
    const key = `${market.marketId}:${market.marketName}`;
    const riskRows = exposureMap[key] as RiskRow[];

    if (!riskRows || riskRows.length < 2) return null;

    const [A, B] = market.runners;
    const riskMap = new Map(
      riskRows.map((r) => [r.runnerId, Number(r.userRisk) || 0])
    );
    const PA = Number(riskMap.get(A.runnerId) ?? 0);
    const PB = Number(riskMap.get(B.runnerId) ?? 0);

    const result = getResponse({ market, PA, PB });
    return result;
  };

  const getResponse = ({
    market,
    PA,
    PB,
  }: {
    market: MatchOddsDTO;
    PA: number;
    PB: number;
  }): CashoutResponse => {
    const [A, B] = market.runners;

    // Early exit if already equal
    const epsilon = 0.01;
    if (Math.abs(PA - PB) <= epsilon) return null;

    // Get odds
    const bestBack = (r: MatchOddsRunnerDTO): number | null => {
      const p = r?.backPrices?.[0]?.price;
      if (!p || p === 0) {
        return null;
      }
      const n = Number(p);
      return Number.isFinite(n) ? n : null;
    };
    const bestLay = (r: MatchOddsRunnerDTO): number | null => {
      const p = r?.layPrices?.[0]?.price;
      if (!p || p === 0) {
        return null;
      }
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
      onRunner: MatchOddsRunnerDTO,
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
      runner: MatchOddsRunnerDTO;
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

    if (candsIdeal.length === 0) return null;

    // Score and sort candidates
    const scoreWorst = (riskAfter: { [key: string]: number }) =>
      Math.min(...Object.values(riskAfter));
    candsIdeal.forEach(
      (c) => (c.riskAfter = simulate(c.betType, c.runner, c.stake, c.odds))
    );
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
      if (!cand) return null;

      let s = Math.max(cand.stake, minStake);
      s = Math.min(s, maxStake);

      if (!(s > 0) || !Number.isFinite(s)) return null;

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

  const autoCashout = async (market: MatchOddsDTO) => {
    if (market == null) return;
    const response = calCashout(market);

    if (response == null || response.oddValue == 0) return;
    const payload = {
      sportId: eventData.sportId,
      seriesId: eventData.competitionId,
      seriesName: eventData.competitionName,
      eventId: eventData.eventId,
      eventName: eventData.eventName,
      eventDate: eventData.openDate,
      marketId: market.marketId,
      marketName: market.marketName,
      marketType: "MO",
      outcomeId: response.runnerId,
      betType: response.betType,
      oddValue: +response.oddValue.toFixed(2),
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

    console.log("payload", payload);

    // const LOCAL_API = axios.create({
    //   baseURL: 'http://localhost:8080/api/v1',
    //   responseType: 'json',
    //   withCredentials: false,
    //   timeout: 10000, // 10 seconds
    // });
    setCashoutInProgress({
      loading: true,
      marketId: market.marketId,
      marketName: market.marketName,
    });
    setBettingInprogress(true);

    try {
      const response = await API.post(`/bs/place-matchodds-bet`, payload, {
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
      // setBettingInprogress(false);
    } finally {
      setCashoutInProgress({
        loading: false,
        marketId: market.marketId,
        marketName: market.marketName,
      });
      // setBettingInprogress(false);
    }
    setLoading(false);
  };

  const getTurboCashoutData = (market: MatchOddsDTO) => {
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

  const turboCashout = async (matchOddsData?: MatchOddsDTO) => {
    const marketData = matchOddsData;
    if (marketData == null) {
      console.log("marketData is null");
      return;
    }

    const payload = {
      providerId: eventData.providerName,
      sportId: eventData.sportId,
      eventId: eventData.eventId,
      marketId: marketData.marketId,
      marketType: "MO",
    };

    try {
      const response = await API.post(`/bs/cashout`, payload, {
        headers: {
          Authorization: sessionStorage.getItem("jwt_token"),
        },
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

  const isTurboCashoutAvailable = (market: MatchOddsDTO) => {
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

  const getSpeedCashCountdown = (market: MatchOddsDTO) => {
    const key = `${market.marketId}:${market.marketName}`;
    return speedCashCountdown.get(key) || 0;
  };

  const getOpenBetsPL = (
    marketId: string,
    marketName: string,
    runner: MatchOddsRunnerDTO
  ) => {
    let returns = null;

    if (exposureMap && exposureMap?.[`${marketId}:${marketName}`]) {
      for (let rn of exposureMap[`${marketId}:${marketName}`]) {
        if (rn.runnerId === runner.runnerId) {
          return rn?.userRisk / cFactor;
        }
      }
    }
  };

  const getOpenBetsPLInArray = (
    marketId: string,
    marketName: string,
    runner: MatchOddsRunnerDTO
  ) => {
    let pl = getOpenBetsPL(marketId, marketName, runner);
    return pl ? [pl] : [];
  };

  const getTotalPL = (
    marketId: string,
    marketName: string,
    runner: MatchOddsRunnerDTO
  ) => {
    let returns = null;
    const mBetslipBets = bets.filter(
      (b) =>
        // (b.marketName === 'Match Odds' || b.marketName === 'Goal Markets') &&
        b.marketId === marketId && b.amount && b.amount > 0
    );

    if (mBetslipBets.length > 0) {
      returns = getOpenBetsPL(marketId, marketName, runner);
      for (let bet of mBetslipBets) {
        const plVal = bet.oddValue * bet.amount - bet.amount;
        if (bet.betType === "BACK") {
          if (bet.outcomeId === runner.runnerId) {
            returns ? (returns += plVal) : (returns = plVal);
          } else {
            returns ? (returns -= bet.amount) : (returns = 0 - bet.amount);
          }
        } else if (bet.betType === "LAY") {
          if (bet.outcomeId !== runner.runnerId) {
            returns ? (returns += bet.amount) : (returns = bet.amount);
          } else {
            returns ? (returns -= plVal) : (returns = 0 - plVal);
          }
        }
      }
    }
    return [returns];
  };

  const getMarketStatus = (marketTime: Date) => {
    let duration = moment.duration(moment(marketTime).diff(moment()));
    return duration.asMinutes() < 10 && duration.asMinutes() > 0
      ? "OPEN"
      : "SUSPENDED";
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

  const getOutcomeId = (selectionId: string, runners: MatchOddsRunnerDTO[]) => {
    for (let mo of runners) {
      if (mo.runnerId === selectionId) {
        return mo.runnerName;
      }
    }
  };

  const isHaveCashOut = (matchOddsData: MatchOddsDTO) => {
    if (matchOddsData?.runners?.length !== 2) {
      return false;
    }
    if (disabledStatus.includes(matchOddsData?.status?.toLowerCase())) {
      return false;
    }

    // Check if risk difference is greater than 0.1
    const key = `${matchOddsData.marketId}:${matchOddsData.marketName}`;
    const riskRows = exposureMap[key] as RiskRow[];

    if (!riskRows || riskRows.length < 2) {
      return false;
    }

    const [A, B] = matchOddsData.runners;
    const riskMap = new Map(
      riskRows.map((r) => [r.runnerId, Number(r.userRisk) || 0])
    );
    const PA = Number(riskMap.get(A.runnerId) ?? 0);
    const PB = Number(riskMap.get(B.runnerId) ?? 0);

    const riskDifference = Math.abs(PA - PB);
    return riskDifference > 0.1;
  };

  return (
    <>
      <div className="matchodds-table-ctn">
        <div className="matchodds-table-content table-ctn">
          {matchOddsData?.runners?.length > 0 &&
          matchOddsData.status.toLowerCase() !== "closed" ? (
            <>
              {((!matchOddsData.disable && !isMultiMarket) ||
                checkIncludeMultiMarket(
                  multiMarketData,
                  matchOddsData.marketId,
                  eventData.eventId
                )) &&
              showMatchOdds ? (
                <TableContainer component={Paper}>
                  <Table className="matchodds-table">
                    <TableHead>
                      <TableRow>
                        <TableCell colSpan={3}>
                          <div className="market-name-cell-head-ctn">
                            <span className="market-name">
                              {!checkIncludeMultiMarket(
                                multiMarketData,
                                matchOddsData.marketId,
                                eventData?.eventId
                              ) ? (
                                <Tooltip
                                  title={langData?.["add_to_multi_markets_txt"]}
                                  placement="left-start"
                                >
                                  <img
                                    // color="primary"
                                    className="multi-add-icon"
                                    src={multipin}
                                    alt="multimarket"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      multiMarketData?.length < 10 &&
                                        handleMultiMarket(
                                          eventData?.competitionId,
                                          eventData?.eventId,
                                          matchOddsData.marketId,
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
                                    langData?.["remove_from_multi_markets_txt"]
                                  }
                                  placement="left-start"
                                >
                                  <img
                                    className="multi-remove-icon"
                                    src={
                                      multiPinsMap[
                                        localStorage.getItem("userTheme")
                                      ]
                                    }
                                    alt="multimarket"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMultiMarket(
                                        eventData?.competitionId,
                                        eventData?.eventId,
                                        matchOddsData.marketId,
                                        eventData?.providerName,
                                        eventData?.sportId,
                                        false
                                      );
                                    }}
                                  />
                                </Tooltip>
                              )}{" "}
                              {langData?.["match_odds"]}{" "}
                              <span className="event-name">
                                {isMultiMarket && !isMobile
                                  ? "(" + eventData?.eventName + ")"
                                  : null}
                              </span>
                            </span>
                            {matchOddsData?.runners?.length < 3 && (
                              <div className="cashout-option">
                                {!isTurboCashoutAvailable(matchOddsData) && (
                                  <Button
                                    size="small"
                                    color="primary"
                                    variant="contained"
                                    className={`btn cashout-btn ${
                                      getCashoutProfit(matchOddsData) > 0
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
                                      !isHaveCashOut(matchOddsData) ||
                                      disabledStatus.includes(
                                        matchOddsData.status.toLowerCase()
                                      ) ||
                                      matchOddsData.suspend ||
                                      matchOddsData.disable ||
                                      !(
                                        `${matchOddsData?.marketId}:${matchOddsData?.marketName}` in
                                        exposureMap
                                      ) ||
                                      getCashoutProfit(matchOddsData) ===
                                        Infinity
                                    }
                                    onClick={() => {
                                      setCoMarket(matchOddsData);
                                      // setConfirmCashout(true);
                                      setLoading(true);
                                      autoCashout(matchOddsData);
                                    }}
                                  >
                                    {langData?.["cashout"]}{" "}
                                    {getCashoutProfit(matchOddsData) !==
                                    Infinity
                                      ? `: ₹${getCashoutProfit(matchOddsData)}`
                                      : ""}
                                  </Button>
                                )}

                                {isTurboCashoutAvailable(matchOddsData) && (
                                  <Button
                                    size="small"
                                    color="secondary"
                                    variant="contained"
                                    className="btn turbo-cashout-btn profit"
                                    disabled={
                                      disabledStatus.includes(
                                        matchOddsData.status.toLowerCase()
                                      ) ||
                                      matchOddsData.suspend ||
                                      matchOddsData.disable ||
                                      loading
                                    }
                                    onClick={() => {
                                      if (
                                        getSpeedCashCountdown(matchOddsData) > 0
                                      ) {
                                        return; // Prevent click during countdown
                                      }
                                      setCoMarket(matchOddsData);
                                      setConfirmTurboCashout(true);
                                    }}
                                  >
                                    {/* add in language file */}
                                    {getSpeedCashCountdown(matchOddsData) > 0
                                      ? `Speed Cash (${getSpeedCashCountdown(
                                          matchOddsData
                                        )}s)`
                                      : "Speed Cash"}
                                  </Button>
                                )}
                              </div>
                            )}

                            <span className="bet-limits-section web-view">
                              {langData?.["min"]}:{" "}
                              {ThousandFormatter(
                                eventData?.matchOdds?.marketLimits
                                  ? eventData?.matchOdds?.marketLimits
                                      ?.minStake / cFactor
                                  : 100
                              )}{" "}
                              {langData?.["max"]}:{" "}
                              {eventData?.matchOdds?.marketLimits?.maxStake %
                                1000 ===
                              0
                                ? ThousandFormatter(
                                    eventData?.matchOdds?.marketLimits
                                      ? eventData?.matchOdds?.marketLimits
                                          ?.maxStake / cFactor
                                      : 5000
                                  )
                                : eventData?.matchOdds?.marketLimits
                                ? eventData?.matchOdds?.marketLimits?.maxStake /
                                  cFactor
                                : 5000}
                              {/* {ThousandFormatter(
                                eventData?.matchOdds?.marketLimits
                                  ? eventData?.matchOdds?.marketLimits.?.maxStake /
                                  cFactor
                                  : 5000
                              )} */}
                            </span>
                            <span className="bet-limits-section mob-view">
                              <div>
                                {langData?.["min"]}:{" "}
                                {ThousandFormatter(
                                  eventData?.matchOdds?.marketLimits
                                    ? eventData?.matchOdds?.marketLimits
                                        ?.minStake / cFactor
                                    : 100
                                )}{" "}
                              </div>
                              <div>
                                {langData?.["max"]}:{" "}
                                {eventData?.matchOdds?.marketLimits?.maxStake %
                                  1000 ===
                                0
                                  ? ThousandFormatter(
                                      eventData?.matchOdds?.marketLimits
                                        ? eventData?.matchOdds?.marketLimits
                                            ?.maxStake / cFactor
                                        : 5000
                                    )
                                  : eventData?.matchOdds?.marketLimits
                                  ? eventData?.matchOdds?.marketLimits
                                      ?.maxStake / cFactor
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
                            align={
                              tF.align === "left"
                                ? "left"
                                : tF.align === "right"
                                ? "right"
                                : "center"
                            }
                            colSpan={1}
                            className={tF.className}
                          >
                            {tF.key === "lay" || "back" ? (
                              <div className={tF.key.toLowerCase() + "-odd"}>
                                {langData?.[tF.labelKey]}
                              </div>
                            ) : (
                              <>
                                <span>{langData?.[tF.labelKey]} </span>
                              </>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      {matchOddsData ? (
                        <>
                          {((bettingInprogress || oneClickBettingLoading) &&
                            bets?.[0]?.marketName ===
                              matchOddsData?.marketName &&
                            bets?.[0]?.marketId === matchOddsData?.marketId &&
                            bets?.[0]?.marketType === "MO") ||
                          (bettingInprogress &&
                            cashoutInProgress?.marketId ===
                              matchOddsData?.marketId &&
                            cashoutInProgress?.marketName ===
                              matchOddsData?.marketName) ? (
                            <OneClickBettingCountdown
                              delay={matchOddsData?.marketLimits?.delay || 0}
                            />
                          ) : null}
                          {matchOddsData.runners
                            .filter(
                              (runner, idx) =>
                                runner?.status.toLowerCase() !== "loser"
                            )
                            .map((runner, index) => (
                              <MatchOddsRow
                                minStake={
                                  matchOddsData?.marketLimits
                                    ? matchOddsData?.marketLimits?.minStake /
                                      cFactor
                                    : 100
                                }
                                maxStake={
                                  matchOddsData?.marketLimits
                                    ? matchOddsData?.marketLimits?.maxStake /
                                      cFactor
                                    : 5000
                                }
                                eventData={eventData}
                                marketName="Match Odds"
                                // marketLimits={marketLimits}
                                matchOddsData={matchOddsData}
                                runner={runner}
                                getOpenBetsPL={getOpenBetsPLInArray}
                                getTotalPL={getTotalPL}
                                disabledStatus={disabledStatus}
                                addExchangeBet={addExchangeBet}
                                bets={bets}
                                selectedRow={selectedRow}
                                setSelectedRow={setSelectedRow}
                                open={open}
                                setOpen={setOpen}
                                index={index}
                                setBetStartTime={(date) =>
                                  setBetStartTime(date)
                                }
                                setAddNewBet={(val) => setAddNewBet(val)}
                                langData={langData}
                                oneClickBettingEnabled={oneClickBettingEnabled}
                                oneClickBettingStake={oneClickBettingStake}
                                oneClickBettingLoading={
                                  oneClickBettingLoading || bettingInprogress
                                }
                              />
                            ))}
                        </>
                      ) : (
                        <>
                          <TableRow>
                            <TableCell colSpan={3}>
                              <div className="fm-table-msg-text">
                                {langData?.["match_odds_not_found_txt"]}
                              </div>
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                      {notifications.get(matchOddsData.marketId) ? (
                        <TableRow>
                          <TableCell colSpan={3} padding="none">
                            <div
                              className="marque-new"
                              style={{
                                animationDuration: `${Math.max(
                                  10,
                                  notifications.get(matchOddsData.marketId)
                                    .length / 5
                                )}s`,
                              }}
                            >
                              <div className="notifi-mssage">
                                {notifications.get(matchOddsData.marketId)}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
            </>
          ) : null}

          {secondaryMatchOdds.map((moData, idx) => (
            <>
              {moData.status.toLowerCase() !== "closed" &&
              !moData.marketName
                ?.toLowerCase()
                ?.includes("who will win the match") ? (
                <>
                  {((!moData.disable && !isMultiMarket) ||
                    checkIncludeMultiMarket(
                      multiMarketData,
                      moData.marketId,
                      eventData.eventId
                    )) &&
                  showSecondaryMatchOdds ? (
                    <TableContainer component={Paper}>
                      <span className="event-name">
                        {isMultiMarket && isMobile
                          ? "(" + eventData?.eventName + ")"
                          : null}
                      </span>
                      <Table
                        className="matchodds-table sec-mo-tbl"
                        style={{ position: "relative" }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={3}>
                              <div className="market-name-cell-head-ctn">
                                <span className="market-name">
                                  {!checkIncludeMultiMarket(
                                    multiMarketData,
                                    moData.marketId,
                                    eventData?.eventId
                                  ) ? (
                                    <Tooltip
                                      title={
                                        langData?.["add_to_multi_markets_txt"]
                                      }
                                      placement="left-start"
                                    >
                                      <img
                                        className="multi-add-icon"
                                        src={multipin}
                                        alt="multimarket"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          multiMarketData?.length < 10 &&
                                            handleMultiMarket(
                                              eventData?.competitionId,
                                              eventData?.eventId,
                                              moData.marketId,
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
                                        className="multi-remove-icon"
                                        src={
                                          multiPinsMap[
                                            localStorage.getItem("userTheme")
                                          ]
                                        }
                                        alt="multimarket"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMultiMarket(
                                            eventData?.competitionId,
                                            eventData?.eventId,
                                            moData.marketId,
                                            eventData?.providerName,
                                            eventData?.sportId,
                                            false
                                          );
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                  {moData.customMarketName ||
                                    (moData.marketName?.length > 15
                                      ? moData.marketName.includes("Half Goals")
                                        ? getMarketLangKeyByName(
                                            moData.marketName?.slice(0, 16)
                                          )
                                          ? langData?.[
                                              getMarketLangKeyByName(
                                                moData.marketName?.slice(0, 16)
                                              )
                                            ] +
                                            " " +
                                            moData.marketName?.slice(17)
                                          : moData.marketName
                                        : getMarketLangKeyByName(
                                            moData.marketName?.slice(0, 11)
                                          )
                                        ? langData?.[
                                            getMarketLangKeyByName(
                                              moData.marketName?.slice(0, 11)
                                            )
                                          ] +
                                          " " +
                                          moData.marketName?.slice(11, 14) +
                                          " " +
                                          (isMobile
                                            ? ".."
                                            : langData?.["goals"])
                                        : moData.marketName
                                      : getMarketLangKeyByName(
                                          moData.marketName
                                        )
                                      ? langData?.[
                                          getMarketLangKeyByName(
                                            moData.marketName
                                          )
                                        ]
                                      : moData.marketName)}{" "}
                                  <span className="event-name">
                                    {isMultiMarket && !isMobile
                                      ? "(" + eventData?.eventName + ")"
                                      : null}
                                  </span>
                                  {["7", "4339"].includes(
                                    selectedEventType?.id
                                  ) ? (
                                    <span className="market-start-time">
                                      {formatTime(moData?.marketTime)}
                                    </span>
                                  ) : null}
                                </span>
                                <span>
                                  {["7", "4339"].includes(
                                    selectedEventType?.id
                                  ) ? (
                                    <span
                                      className={
                                        getMarketStatus(moData.marketTime) ===
                                        "OPEN"
                                          ? "profit web-view"
                                          : "loss web-view"
                                      }
                                    >
                                      {" "}
                                      {getMarketStatus(moData.marketTime)}
                                    </span>
                                  ) : null}
                                </span>
                                {moData?.runners?.length < 3 && (
                                  <div className="cashout-option">
                                    {!isTurboCashoutAvailable(moData) && (
                                      <Button
                                        size="small"
                                        color="primary"
                                        variant="contained"
                                        className={`btn cashout-btn ${
                                          getCashoutProfit(moData) > 0
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
                                          !isHaveCashOut(moData) ||
                                          disabledStatus.includes(
                                            moData.status.toLowerCase()
                                          ) ||
                                          moData.suspend ||
                                          moData.disable ||
                                          !(
                                            `${moData?.marketId}:${moData?.marketName}` in
                                            exposureMap
                                          ) ||
                                          getCashoutProfit(moData) === Infinity
                                        }
                                        onClick={() => {
                                          setCoMarket(moData);
                                          // setConfirmCashout(true);
                                          setLoading(true);
                                          autoCashout(moData);
                                        }}
                                      >
                                        {langData?.["cashout"]}{" "}
                                        {getCashoutProfit(moData) !== Infinity
                                          ? `: ₹${getCashoutProfit(moData)}`
                                          : ""}
                                      </Button>
                                    )}
                                    {isTurboCashoutAvailable(moData) && (
                                      <Button
                                        size="small"
                                        color="secondary"
                                        variant="contained"
                                        className="btn turbo-cashout-btn profit"
                                        disabled={
                                          disabledStatus.includes(
                                            moData.status.toLowerCase()
                                          ) ||
                                          moData.suspend ||
                                          moData.disable ||
                                          loading
                                        }
                                        onClick={() => {
                                          if (
                                            getSpeedCashCountdown(moData) > 0
                                          ) {
                                            return; // Prevent click during countdown
                                          }
                                          setCoMarket(moData);
                                          setConfirmTurboCashout(true);
                                        }}
                                      >
                                        {/* add in language file */}
                                        {getSpeedCashCountdown(moData) > 0
                                          ? `Speed Cash (${getSpeedCashCountdown(
                                              moData
                                            )}s)`
                                          : "Speed Cash"}
                                      </Button>
                                    )}
                                  </div>
                                )}

                                <span className="bet-limits-section web-view">
                                  {langData?.["min"]}:{" "}
                                  {moData?.marketLimits
                                    ? ThousandFormatter(
                                        moData?.marketLimits?.minStake / cFactor
                                      )
                                    : 100}{" "}
                                  {langData?.["max"]}:{" "}
                                  {moData?.marketLimits?.maxStake % 1000 === 0
                                    ? ThousandFormatter(
                                        moData?.marketLimits
                                          ? moData?.marketLimits?.maxStake /
                                              cFactor
                                          : 5000
                                      )
                                    : moData?.marketLimits
                                    ? moData?.marketLimits?.maxStake / cFactor
                                    : 5000}
                                </span>
                                <span className="bet-limits-section mob-view">
                                  <div>
                                    {langData?.["min"]}:{" "}
                                    {moData?.marketLimits
                                      ? ThousandFormatter(
                                          moData?.marketLimits?.minStake /
                                            cFactor
                                        )
                                      : 100}{" "}
                                  </div>
                                  <div>
                                    {langData?.["max"]}:{" "}
                                    {moData?.marketLimits?.maxStake % 1000 === 0
                                      ? ThousandFormatter(
                                          moData?.marketLimits
                                            ? moData?.marketLimits?.maxStake /
                                                cFactor
                                            : 5000
                                        )
                                      : moData?.marketLimits
                                      ? moData?.marketLimits?.maxStake / cFactor
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
                                align={
                                  tF.align === "left"
                                    ? "left"
                                    : tF.align === "right"
                                    ? "right"
                                    : "center"
                                }
                                colSpan={1}
                                className={tF.className}
                              >
                                {tF.key === "lay" || "back" ? (
                                  <div
                                    className={tF.key.toLowerCase() + "-odd"}
                                  >
                                    {langData?.[tF.labelKey]}

                                    {index === 0 &&
                                    ["7", "4339"].includes(
                                      selectedEventType?.id
                                    ) ? (
                                      <label
                                        className={
                                          getMarketStatus(moData.marketTime) ===
                                          "OPEN"
                                            ? "profit mob-view"
                                            : "loss mob-view"
                                        }
                                      >
                                        {" "}
                                        {getMarketStatus(moData.marketTime)}
                                      </label>
                                    ) : null}
                                  </div>
                                ) : (
                                  <>
                                    <span>{langData?.[tF.labelKey]} </span>
                                  </>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>

                          {((oneClickBettingLoading || bettingInprogress) &&
                            bets?.[0]?.marketName === moData?.marketName &&
                            bets?.[0]?.marketId === moData?.marketId) ||
                          (bettingInprogress &&
                            cashoutInProgress?.marketId === moData?.marketId &&
                            cashoutInProgress?.marketName ===
                              moData?.marketName) ? (
                            <OneClickBettingCountdown
                              delay={moData?.marketLimits?.delay || 0}
                            />
                          ) : null}
                          {moData ? (
                            <>
                              {moData.runners
                                .filter(
                                  (runner, idx) =>
                                    runner?.status.toLowerCase() !== "loser"
                                )
                                .map((runner, index) => (
                                  <MatchOddsRow
                                    minStake={
                                      moData?.marketLimits
                                        ? moData?.marketLimits?.minStake /
                                          cFactor
                                        : 100
                                    }
                                    maxStake={
                                      moData?.marketLimits
                                        ? moData?.marketLimits?.maxStake /
                                          cFactor
                                        : 5000
                                    }
                                    eventData={eventData}
                                    marketName={moData?.marketName}
                                    // marketLimits={marketLimits}
                                    matchOddsData={moData}
                                    runner={runner}
                                    getOpenBetsPL={getOpenBetsPLInArray}
                                    getTotalPL={getTotalPL}
                                    disabledStatus={disabledStatus}
                                    addExchangeBet={addExchangeBet}
                                    bets={bets}
                                    selectedRow={selectedRow}
                                    setSelectedRow={setSelectedRow}
                                    setBetStartTime={(date) =>
                                      setBetStartTime(date)
                                    }
                                    setAddNewBet={(val) => setAddNewBet(val)}
                                    langData={langData}
                                    oneClickBettingEnabled={
                                      oneClickBettingEnabled
                                    }
                                    oneClickBettingStake={oneClickBettingStake}
                                    oneClickBettingLoading={
                                      oneClickBettingLoading ||
                                      bettingInprogress
                                    }
                                  />
                                ))}
                            </>
                          ) : (
                            <>
                              <TableRow>
                                <TableCell colSpan={3}>
                                  <div className="fm-table-msg-text">
                                    {langData?.["goal_markets_not_found_txt"]}
                                  </div>
                                </TableCell>
                              </TableRow>
                            </>
                          )}
                          {notifications.get(moData.marketId) ? (
                            <TableRow>
                              <TableCell colSpan={3} padding="none">
                                <div
                                  className="marque-new"
                                  style={{
                                    animationDuration: `${Math.max(
                                      10,
                                      notifications.get(moData.marketId)
                                        .length / 5
                                    )}s`,
                                  }}
                                >
                                  <div className="notifi-mssage">
                                    {notifications.get(moData.marketId)}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : null}
                </>
              ) : null}
            </>
          ))}

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
        </div>
      </div>
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
                  {/* add in language file */}
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

type MatchOddsRowProps = {
  minStake: any;
  maxStake: any;
  eventData: EventDTO;
  marketName: string;
  matchOddsData: MatchOddsDTO;
  runner: MatchOddsRunnerDTO;
  // marketLimits: any;
  getOpenBetsPL: (
    marketId: string,
    marketName: string,
    runner: MatchOddsRunnerDTO,
    type: string
  ) => number[];
  getTotalPL: (
    marketId: string,
    marketName: string,
    runner: MatchOddsRunnerDTO
  ) => number[];
  disabledStatus: string[];
  addExchangeBet: (data: PlaceBetRequest) => void;
  bets: PlaceBetRequest[];
  selectedRow: string;
  setSelectedRow: (data) => void;
  open?: String[];
  setOpen?: (data) => void;
  index?: number;
  setBetStartTime: Function;
  setAddNewBet: Function;
  langData: any;
  oneClickBettingEnabled: boolean;
  oneClickBettingStake: number;
  oneClickBettingLoading: boolean;
};

const MatchOddsRow: React.FC<MatchOddsRowProps> = (props) => {
  const {
    eventData,
    marketName,
    // marketLimits,
    matchOddsData,
    runner,
    getOpenBetsPL,
    getTotalPL,
    disabledStatus,
    addExchangeBet,
    minStake,
    maxStake,
    setSelectedRow,
    setAddNewBet,
    setBetStartTime,
    bets,
    langData,
    oneClickBettingEnabled,
    oneClickBettingStake,
    oneClickBettingLoading,
  } = props;

  const [startTime, setStartTime] = useState<Date>();
  const [hasScrolledToBetslip, setHasScrolledToBetslip] =
    useState<boolean>(false);

  // Reset scroll state when bets change
  useEffect(() => {
    setHasScrolledToBetslip(false);
  }, [bets]);

  const isOddDisable = (
    eventData: EventDTO,
    status: string,
    suspend: boolean,
    disable: boolean,
    betType: string,
    odd: number,
    marketTime?: Date
  ) => {
    if (disabledStatus.includes(status.toLowerCase()) || suspend || disable)
      return true;

    // if (matchOddsData?.marketLimits?.maxOdd < odd) return true;

    // WORLD CUP
    if (matchOddsData?.marketName?.toLowerCase()?.includes("winner"))
      return false;

    if (["7", "4339"].includes(eventData.sportId)) {
      if (betType === "lay") return true;

      let duration = moment.duration(moment(marketTime).diff(moment()));
      return duration.asMinutes() < 10 && duration.asMinutes() > 0
        ? false
        : true;
    }

    //IPl matches
    if (eventData.competitionId === "101480") {
      if (moment(eventData.openDate).diff(moment(), "minutes") < 15) {
        return false;
      }
    }

    return eventData.sportId != "2"
      ? eventData?.status === "IN_PLAY"
        ? false
        : true
      : false;
    // return eventData?.status === 'IN_PLAY' ? false : true;
  };

  useEffect(() => {
    document.getElementsByClassName("router-ctn")[0].scrollIntoView();
  }, []);

  return (
    <>
      <TableRow>
        <TableCell className="team-name-cell">
          {eventData.sportId === "7" ? (
            <div className="horseracing-ctn">
              <div className="item1">
                <span className="list-item11">{runner.clothNumber}</span>
                <span className="list-item1">({runner.stallDraw})</span>
              </div>
              <div className="horseracing-img">
                <img
                  src={runner?.runnerIcon}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = JercyIcon;
                  }}
                  className="runner-img"
                />
              </div>

              <div className="runner-section">
                <div className="runner-name">{runner.runnerName}</div>

                <div className="runner-desc">
                  <ul className="runner-desc-list">
                    <li className="list-item">
                      <span className="label">J: </span>
                      {runner?.jockeyName ? runner?.jockeyName : "-"}
                    </li>
                    {/* <li className="list-item">
                    <span className="label">Trainer: </span>
                    {runner?.trainerName ? runner?.trainerName : '-'}
                  </li> */}
                    <li className="list-item">
                      <span className="label">{langData?.["age"]}: </span>
                      {runner?.runnerAge ? runner?.runnerAge : "-"}
                    </li>
                  </ul>
                </div>
              </div>
              {getOpenBetsPL(
                matchOddsData.marketId,
                matchOddsData.marketName,
                runner,
                "array"
              ).map((ret) =>
                ret !== null ? (
                  <div className="profit-loss-box">
                    <span className={ret >= 0 ? "profit" : "loss"}>
                      {ret > 0
                        ? "+" + Number(ret).toFixed(2)
                        : Number(ret).toFixed(2)}
                    </span>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <div className="team">
              {runner.runnerName}
              {getOpenBetsPL(
                matchOddsData.marketId,
                matchOddsData.marketName,
                runner,
                "array"
              ).map((ret) =>
                ret !== null ? (
                  <span className={ret >= 0 ? "profit" : "loss"}>
                    {ret > 0
                      ? "+" + Number(ret).toFixed(2)
                      : Number(ret).toFixed(2)}
                  </span>
                ) : null
              )}
            </div>
          )}
          {getTotalPL(
            matchOddsData.marketId,
            matchOddsData.marketName,
            runner
          ).map((ret) =>
            ret !== null ? (
              <div className="profit-loss-box">
                <span className={ret >= 0 ? "profit" : "loss"}>
                  {ret > 0
                    ? "+" + Number(ret).toFixed(2)
                    : Number(ret).toFixed(2)}
                </span>
              </div>
            ) : null
          )}
        </TableCell>

        <TableCell className="odds-cell">
          <div className="odds-block web-view back-odds-block">
            {runner.backPrices?.length > 0 ? (
              runner.backPrices.map((odds, idx) => (
                <ExchOddBtn
                  mainValue={odds?.price}
                  subValue={odds.size}
                  showSubValueinKformat={true}
                  oddType="back-odd"
                  valueType="matchOdds"
                  oddsSet={[
                    runner.backPrices[0] ? runner.backPrices[0]?.price : 0,
                    runner.backPrices[1] ? runner.backPrices[1]?.price : 0,
                    runner.backPrices[2] ? runner.backPrices[2]?.price : 0,
                  ]}
                  key={idx}
                  disable={isOddDisable(
                    eventData,
                    matchOddsData.status.toLowerCase(),
                    matchOddsData.suspend,
                    matchOddsData.disable,
                    "back",
                    odds.price,
                    matchOddsData.marketTime
                  )}
                  // disable={
                  //   disabledStatus.includes(matchOddsData.status.toLowerCase()) ||
                  //   moment(eventData?.openDate).diff(moment(), 'minutes') >
                  //     60 * 24 * 2 ||
                  //   matchOddsData?.marketLimits?.maxOdd < odds?.price
                  // }
                  onClick={() => {
                    if (oneClickBettingLoading) {
                      setAlertMsg({
                        message: langData?.betIsInProgress,
                        type: "error",
                      });
                      return;
                    }
                    if (
                      moment(eventData?.openDate).diff(moment(), "hour") <=
                        24 ||
                      eventData?.status === "IN_PLAY" ||
                      disabledStatus.includes(
                        matchOddsData.status.toLowerCase()
                      ) ||
                      matchOddsData.suspend ||
                      matchOddsData.disable ||
                      !["7", "4339"].includes(eventData.sportId)
                    ) {
                      const betRequest: PlaceBetRequest = {
                        providerId: eventData.providerName,
                        sportId: eventData.sportId,
                        seriesId: eventData.competitionId,
                        seriesName: eventData.competitionName,
                        eventId: eventData.eventId,
                        eventName: eventData.eventName,
                        eventDate: eventData.openDate,
                        marketId: matchOddsData.marketId,
                        marketName: marketName,
                        marketType: "MO",
                        outcomeId: runner.runnerId,
                        outcomeDesc: runner.runnerName,
                        betType: "BACK",
                        amount: 0,
                        oddValue: odds?.price,
                        oddSize: odds.size,
                        sessionPrice: -1,
                        srEventId: eventData.eventId,
                        srSeriesId: eventData.competitionId,
                        srSportId: eventData.sportId,
                        minStake: minStake,
                        maxStake: maxStake,
                        oddLimt: matchOddsData?.marketLimits?.maxOdd.toString(),
                        mcategory: "ALL",
                      };
                      if (oneClickBettingEnabled) {
                        addExchangeBet(betRequest);
                        oneClickBetPlaceHandler(
                          [betRequest],
                          langData,
                          setAlertMsg,
                          eventData
                        );
                      } else {
                        setSelectedRow(runner.runnerId + marketName + "MO");
                        addExchangeBet(betRequest);
                      }
                    }
                  }}
                />
              ))
            ) : (
              <></>
            )}
          </div>
          <div className="odds-block mob-view">
            <ExchOddBtn
              mainValue={runner.backPrices[0]?.price}
              subValue={runner.backPrices[0]?.size}
              showSubValueinKformat={true}
              oddType="back-odd"
              valueType="matchOdds"
              disable={isOddDisable(
                eventData,
                matchOddsData.status.toLowerCase(),
                matchOddsData.suspend,
                matchOddsData.disable,
                "back",
                runner.backPrices[0]?.price,
                matchOddsData.marketTime
              )}
              onClick={() => {
                if (oneClickBettingLoading) {
                  setAlertMsg({
                    message: langData?.betIsInProgress,
                    type: "error",
                  });
                  return;
                }
                if (
                  moment(eventData?.openDate).diff(moment(), "hour") <= 24 ||
                  eventData?.status === "IN_PLAY" ||
                  disabledStatus.includes(matchOddsData.status.toLowerCase()) ||
                  matchOddsData.suspend ||
                  matchOddsData.disable ||
                  !["7", "4339"].includes(eventData.sportId)
                ) {
                  const betRequest: PlaceBetRequest = {
                    providerId: eventData.providerName,
                    sportId: eventData.sportId,
                    seriesId: eventData.competitionId,
                    seriesName: eventData.competitionName,
                    eventId: eventData.eventId,
                    eventName: eventData.eventName,
                    eventDate: eventData.openDate,
                    marketId: matchOddsData.marketId,
                    marketName: marketName,
                    marketType: "MO",
                    outcomeId: runner.runnerId,
                    outcomeDesc: runner.runnerName,
                    betType: "BACK",
                    amount: 0,
                    oddValue: runner.backPrices[0].price,
                    oddSize: runner.backPrices[0].size,
                    sessionPrice: -1,
                    srEventId: eventData.eventId,
                    srSeriesId: eventData.competitionId,
                    srSportId: eventData.sportId,
                    minStake: minStake,
                    maxStake: maxStake,
                    oddLimt: matchOddsData?.marketLimits?.maxOdd.toString(),
                    mcategory: "ALL",
                  };
                  if (oneClickBettingEnabled) {
                    addExchangeBet(betRequest);
                    oneClickBetPlaceHandler(
                      [betRequest],
                      langData,
                      setAlertMsg,
                      eventData
                    );
                  } else {
                    setSelectedRow(runner.runnerId + marketName + "MO");
                    addExchangeBet(betRequest);
                  }
                }
              }}
            />
          </div>
        </TableCell>

        <TableCell className="odds-cell">
          <div className="odds-block web-view">
            {runner.layPrices?.length > 0 ? (
              runner.layPrices.map((odds, idx) => (
                <ExchOddBtn
                  mainValue={
                    ["7", "4339"].includes(eventData.sportId) ? 0 : odds?.price
                  }
                  subValue={odds.size}
                  showSubValueinKformat={true}
                  oddType="lay-odd"
                  valueType="matchOdds"
                  oddsSet={[
                    runner.layPrices[0] ? runner.layPrices[0]?.price : 0,
                    runner.layPrices[1] ? runner.layPrices[1]?.price : 0,
                    runner.layPrices[2] ? runner.layPrices[2]?.price : 0,
                  ]}
                  key={idx}
                  disable={isOddDisable(
                    eventData,
                    matchOddsData.status.toLowerCase(),
                    matchOddsData.suspend,
                    matchOddsData.disable,
                    "lay",
                    odds.price
                  )}
                  onClick={() => {
                    if (oneClickBettingLoading) {
                      setAlertMsg({
                        message: langData?.betIsInProgress,
                        type: "error",
                      });
                      return;
                    }
                    if (
                      moment(eventData?.openDate).diff(moment(), "hour") <=
                        24 ||
                      eventData?.status === "IN_PLAY" ||
                      disabledStatus.includes(
                        matchOddsData.status.toLowerCase()
                      ) ||
                      matchOddsData.suspend ||
                      matchOddsData.disable ||
                      !["7", "4339"].includes(eventData.sportId)
                    ) {
                      const betRequest: PlaceBetRequest = {
                        providerId: eventData.providerName,
                        sportId: eventData.sportId,
                        seriesId: eventData.competitionId,
                        seriesName: eventData.competitionName,
                        eventId: eventData.eventId,
                        eventName: eventData.eventName,
                        eventDate: eventData.openDate,
                        marketId: matchOddsData.marketId,
                        marketName: marketName,
                        marketType: "MO",
                        outcomeId: runner.runnerId,
                        outcomeDesc: runner.runnerName,
                        betType: "LAY",
                        amount: 0,
                        oddValue: odds?.price,
                        oddSize: odds.size,
                        sessionPrice: -1,
                        srEventId: eventData.eventId,
                        srSeriesId: eventData.competitionId,
                        srSportId: eventData.sportId,
                        minStake: minStake,
                        maxStake: maxStake,
                        oddLimt: matchOddsData?.marketLimits?.maxOdd.toString(),
                        mcategory: "ALL",
                      };
                      if (oneClickBettingEnabled) {
                        addExchangeBet(betRequest);
                        oneClickBetPlaceHandler(
                          [betRequest],
                          langData,
                          setAlertMsg,
                          eventData
                        );
                      } else {
                        setSelectedRow(runner.runnerId + marketName + "MO");
                        addExchangeBet(betRequest);
                      }
                    }
                  }}
                />
              ))
            ) : (
              <></>
            )}
          </div>
          <div className="odds-block mob-view">
            <ExchOddBtn
              mainValue={
                ["7", "4339"].includes(eventData.sportId)
                  ? 0
                  : runner.layPrices[0]?.price
              }
              subValue={runner.layPrices[0]?.size}
              showSubValueinKformat={true}
              oddType="lay-odd"
              valueType="matchOdds"
              disable={isOddDisable(
                eventData,
                matchOddsData?.status?.toLowerCase(),
                matchOddsData.suspend,
                matchOddsData.disable,
                "lay",
                runner?.layPrices[0]?.price
              )}
              onClick={() => {
                if (oneClickBettingLoading) {
                  setAlertMsg({
                    message: langData?.betIsInProgress,
                    type: "error",
                  });
                  return;
                }
                if (
                  moment(eventData?.openDate).diff(moment(), "hour") <= 24 ||
                  eventData?.status === "IN_PLAY" ||
                  disabledStatus.includes(matchOddsData.status.toLowerCase()) ||
                  matchOddsData.suspend ||
                  matchOddsData.disable ||
                  !["7", "4339"].includes(eventData.sportId)
                ) {
                  const betRequest: PlaceBetRequest = {
                    providerId: eventData.providerName,
                    sportId: eventData.sportId,
                    seriesId: eventData.competitionId,
                    seriesName: eventData.competitionName,
                    eventId: eventData.eventId,
                    eventName: eventData.eventName,
                    eventDate: eventData.openDate,
                    marketId: matchOddsData.marketId,
                    marketName: marketName,
                    marketType: "MO",
                    outcomeId: runner.runnerId,
                    outcomeDesc: runner.runnerName,
                    betType: "LAY",
                    amount: 0,
                    oddValue: runner.layPrices[0]?.price,
                    oddSize: runner.layPrices[0]?.size,
                    sessionPrice: -1,
                    srEventId: eventData.eventId,
                    srSeriesId: eventData.competitionId,
                    srSportId: eventData.sportId,
                    minStake: minStake,
                    maxStake: maxStake,
                    oddLimt: matchOddsData?.marketLimits?.maxOdd.toString(),
                    mcategory: "ALL",
                  };
                  if (oneClickBettingEnabled) {
                    addExchangeBet(betRequest);
                    oneClickBetPlaceHandler(
                      [betRequest],
                      langData,
                      setAlertMsg,
                      eventData
                    );
                  } else {
                    setSelectedRow(runner.runnerId + marketName + "MO");
                    addExchangeBet(betRequest);
                  }
                }
              }}
            />
          </div>
        </TableCell>
      </TableRow>

      {!oneClickBettingEnabled &&
      bets?.length > 0 &&
      bets?.[0]?.marketName === marketName &&
      bets?.[0]?.marketId === matchOddsData.marketId &&
      bets?.[0]?.outcomeId === runner.runnerId &&
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
          <TableCell colSpan={3}>
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
  return {
    selectedEventType: eventType,
    bets: state.exchBetslip.bets,
    openBets: state.exchBetslip.openBets,
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

export default connect(mapStateToProps, mapDispatchToProps)(MatchOddsTable);
