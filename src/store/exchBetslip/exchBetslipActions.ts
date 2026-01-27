import { AxiosResponse } from "axios";
import API from "../../api";
import {
  BinaryBetrequest,
  BsResponse,
  CashoutProgressDTO,
  PlaceBetRequest,
} from "../../models/BsData";
import { ButtonVariable } from "../../models/ButtonVariables";
import {
  ADD_EXCH_BET,
  EXCH_BET_ODDS_CHANGE,
  REMOVE_EXCH_BET,
  SET_EXCH_BET_STAKE,
  CLEAR_EXCHANGE_BETS,
  FETCH_OPEN_BETS_SUCCESS,
  CLEAR_SUCCESS_BETS,
  SET_BUTTON_VARIABLES,
  SET_BETTING_INPROGRESS,
  ADD_OPEN_BETS,
  BET_CANCEL_SUCCESS,
  ENABLE_ONE_CLICK_BETS,
  ADD_ONE_CLICK_AMOUNT,
  UPDATE_BET_SLIP,
  RESET_BETSLIP_ODDS_CHANGE_MSG,
  VALIDATE_BETSLIP_ODDS,
  FETCH_BET_STATUS_IN_PROGRESS,
  FETCH_BET_STATUS_SUCCESS,
  FETCH_BET_STATUS_FAIL,
  CLEAR_BET_STATUS_RESPONSE,
  SET_ONE_CLICK_BETTING_LOADING,
  ENABLE_ONE_CLICK_BETTING,
  SET_ONE_CLICK_BETTING_STAKE,
  SET_CASHOUT_IN_PROGRESS,
} from "./exchBetslipActionTypes";
import { SuspendedMarketDTO } from "../../models/common/SuspendedMarketDTO";
import store from "../store";
import { updateSuspendedMarkets } from "../exchangeSports/exchangeSportsActions";
import { updateMultiSuspendedMarkets } from "../multimarket/multimarketAction";
import { useSelector } from "react-redux";
import { RootState } from "../../models/RootState";
import { PROVIDER_ID } from "../../constants/Branding";
import { EventDTO } from "../../models/common/EventDTO";
import { ValidateOdds } from "../../util/stringUtil";

export const addExchangeBet = (data: PlaceBetRequest) => {
  return async (dispatch: Function) => {
    dispatch(clearExchcngeBets());
    dispatch(addBetHandler(data));
  };
};

export const enableOnclickBet = (isOneClickEnable) => {
  return {
    type: ENABLE_ONE_CLICK_BETS,
    payload: isOneClickEnable,
  };
};
export const addOnclickBetAmount = (amount: number) => {
  return {
    type: ADD_ONE_CLICK_AMOUNT,
    payload: amount,
  };
};

const addBetHandler = (data: PlaceBetRequest) => {
  return {
    type: ADD_EXCH_BET,
    payload: data,
  };
};

export const removeExchangeBet = (index: number) => {
  return {
    type: REMOVE_EXCH_BET,
    payload: index,
  };
};

export const setExchangeBetStake = (
  index: number,
  amount: number,
  type: "ADD" | "SET"
) => {
  return {
    type: SET_EXCH_BET_STAKE,
    payload: {
      index,
      amount,
      type,
    },
  };
};

export const exchangeBetOddsChange = (index: number, odds: number) => {
  return {
    type: EXCH_BET_ODDS_CHANGE,
    payload: { index, odds },
  };
};

export const clearExchcngeBets = () => {
  return {
    type: CLEAR_EXCHANGE_BETS,
    payload: [],
  };
};

export const fetchOpenBetsSuccess = (result, totalOrders?: number) => {
  return {
    type: FETCH_OPEN_BETS_SUCCESS,
    payload: {
      result: result,
      totalOrders: totalOrders ?? 0,
    },
  };
};

export const addOpenBets = (openBets) => {
  return {
    type: ADD_OPEN_BETS,
    payload: openBets,
  };
};

export const fetchBetStatusInProgress = (response: any) => {
  return {
    type: FETCH_BET_STATUS_IN_PROGRESS,
    payload: response,
  };
};

export const fetchBetStatusSuccess = (response: any) => {
  return {
    type: FETCH_BET_STATUS_SUCCESS,
    payload: response,
  };
};

export const fetchBetStatusFail = (response: any) => {
  return {
    type: FETCH_BET_STATUS_FAIL,
    payload: response,
  };
};

export const clearBetStatusResponse = () => {
  return {
    type: CLEAR_BET_STATUS_RESPONSE,
  };
};

const updateSuspendedMarket = (data: any) => {
  let suspendedMarket: SuspendedMarketDTO = {
    // TODO: pass provider Id later
    providerId: "",
    sportId: data?.sportId,
    competitionId: data?.seriesId,
    eventId: data?.eventId,
    // TODO
    marketType:
      data?.marketType === "MO"
        ? "MATCH_ODDS"
        : data?.marketType === "BM"
        ? "BOOKMAKER"
        : data?.marketType,
    marketId: data?.marketId,
    suspend: true,
  };

  window.location.pathname === "/exchange_sports/multi-markets"
    ? store.dispatch(updateSuspendedMarkets(suspendedMarket))
    : store.dispatch(updateMultiSuspendedMarkets(suspendedMarket));
};

export const betStatus = async () => {
  let response: AxiosResponse<any>;
  response = await API.get("/bs/bet-status", {
    headers: {
      Authorization: sessionStorage.getItem("jwt_token"),
    },
  });

  if (response) {
    if (response.data.message === "Market suspended") {
      updateSuspendedMarket(response);
    }

    if (response.data.success) {
      if (
        response.data?.message &&
        response.data.message === "BETTING_IN_PROGRESS"
      ) {
        store.dispatch(
          fetchBetStatusInProgress({
            status: "IN_PROGRESS",
            message: "Bet is in progress.",
          })
        );
      } else {
        if (
          response.data.message?.toLowerCase().includes("odds out of range") ||
          response.data.message?.toLowerCase().includes("odds change")
        ) {
          store.dispatch(
            fetchBetStatusFail({
              status: "FAIL",
              message: response.data.message,
            })
          );
        } else {
          store.dispatch(
            fetchBetStatusSuccess({
              status: "SUCCESS",
              message: response.data.message,
            })
          );
        }
      }
    } else {
      store.dispatch(
        fetchBetStatusFail({
          status: "FAIL",
          message: `Bet failed - ${response.data.message}`,
        })
      );
    }
  }
};

export const fetchOpenBets = (eventId: string[] | string, sportId?: string) => {
  return async (dispatch: Function) => {
    if (eventId) {
      try {
        // Dummy data instead of API call
        const dummyResponse = {
          data: {
            orders: [
              {
                id: "open-bet-001",
                eventId: Array.isArray(eventId) ? eventId[0] : eventId,
                eventName: "Team A vs Team B",
                stakeAmount: 100,
                oddValue: 1.5,
                outcomeDesc: "Team A",
                betType: "BACK",
                marketType: "MATCH_ODDS",
                marketName: "Match Odds",
                sportId: sportId || "4",
                betPlacedTime: new Date().toISOString(),
              },
              {
                id: "open-bet-002",
                eventId: Array.isArray(eventId) ? eventId[0] : eventId,
                eventName: "Team C vs Team D",
                stakeAmount: 200,
                oddValue: 0.9,
                outcomeDesc: "Team D",
                betType: "LAY",
                marketType: "BOOKMAKER",
                marketName: "Bookmaker",
                sportId: sportId || "1",
                betPlacedTime: new Date(Date.now() - 3600000).toISOString(),
              },
            ],
            totalOrders: 2,
          },
        };
        // const opBets = openBetsList.concat(dummyResponse.data);
        dispatch(
          fetchOpenBetsSuccess(
            dummyResponse.data.orders,
            dummyResponse.data.totalOrders
          )
        );
      } catch (err) {
        dispatch(fetchOpenBetsSuccess([]));
      }
    }
  };
};

export const fetchCasinoOpenBets = (gameType: string, mId: string) => {
  return async (dispatch: Function) => {
    try {
      API.post(
        "/indian-casino/open-bets",
        {},
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
          params: {
            gameType: gameType,
            mId: mId,
          },
        }
      )
        .then((response) => {
          let payload = [];
          for (const rec of response.data) {
            payload.push({
              betPlacedTime: rec.betPlacedTime,
              stakeAmount: rec.stakeAmount,
              oddValue: rec.odds,
              outcomeDesc: rec.nation,
              betType: 0,
              outcomeId: rec.sId,
            });
          }
          dispatch(fetchOpenBetsSuccess(payload));
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      dispatch(fetchOpenBetsSuccess([]));
    }
  };
};

export const clearSuccessBets = (successIndices?: number[]) => {
  return {
    type: CLEAR_SUCCESS_BETS,
    payload: successIndices,
  };
};

export const cancelBetSuccess = (betID: string) => {
  return {
    type: BET_CANCEL_SUCCESS,
    payload: betID,
  };
};

export const fetchButtonVariables = () => {
  return async (dispatch: Function) => {
    try {
      // Dummy data instead of API call
      const dummyButtonVariables: ButtonVariable[] = [
        { label: "100", stake: 100 },
        { label: "200", stake: 200 },
        { label: "500", stake: 500 },
        { label: "1,000", stake: 1000 },
        { label: "2,000", stake: 2000 },
        { label: "5,000", stake: 5000 },
        { label: "10,000", stake: 10000 },
        { label: "25,000", stake: 25000 },
      ];
      dispatch(setButtonVariables(dummyButtonVariables));
    } catch (err) {
      console.log(err);
    }
  };
};

export const setButtonVariables = (buttonVariables: ButtonVariable[]) => {
  return {
    type: SET_BUTTON_VARIABLES,
    payload: buttonVariables,
  };
};

export const setBettingInprogress = (val: boolean) => {
  return {
    type: SET_BETTING_INPROGRESS,
    payload: val,
  };
};

export const updateBetslipfromWS = (payload) => {
  return {
    type: UPDATE_BET_SLIP,
    payload: payload,
  };
};

export const resetOddsChangeMsg = (payload) => {
  return {
    type: RESET_BETSLIP_ODDS_CHANGE_MSG,
    payload: payload,
  };
};

export const validateOdds = (payload) => {
  return {
    type: VALIDATE_BETSLIP_ODDS,
    payload: payload,
  };
};

export const setOneClickBettingLoading = (payload: boolean) => {
  return {
    type: SET_ONE_CLICK_BETTING_LOADING,
    payload: payload,
  };
};

export const enableOneClickBetting = (oneClickBettingEnabled: boolean) => {
  return {
    type: ENABLE_ONE_CLICK_BETTING,
    payload: oneClickBettingEnabled,
  };
};

export const setOneClickBettingStake = (oneClickBettingStake: number) => {
  return {
    type: SET_ONE_CLICK_BETTING_STAKE,
    payload: oneClickBettingStake,
  };
};

export const oneClickBetPlaceHandler = async (
  bets: PlaceBetRequest[],
  langData: any,
  setAlertMsg: Function,
  eventData: EventDTO
) => {
  const dispatch = store.dispatch;
  const { oneClickBettingStake } = store.getState().exchBetslip;

  if (!sessionStorage.getItem("jwt_token")) {
    dispatch(
      setAlertMsg({
        type: "error",
        message: langData?.["login_to_place_bet_txt"],
      })
    );
    return false;
  }

  if (oneClickBettingStake < 1) {
    dispatch(
      setAlertMsg({
        type: "error",
        message: langData?.["minimum_stake_required_txt"],
      })
    );
    return false;
  }

  if (ValidateOdds(eventData, bets)) {
    setAlertMsg({
      type: "error",
      message: langData?.["wrong_odds_txt"],
    });
    return false;
  }

  if (+bets[0].oddLimt) {
    switch (bets[0].marketType) {
      case "MO":
        if (bets[0].oddValue > +bets[0].oddLimt) {
          dispatch(
            setAlertMsg({
              type: "error",
              message:
                langData?.["bet_rate_not_accepted_txt"] + " " + bets[0].oddLimt,
            })
          );
          return false;
        }
        break;

      case "BM":
        if ((bets[0].oddValue + 100) / 100 > +bets[0].oddLimt) {
          dispatch(
            setAlertMsg({
              type: "error",
              message:
                langData?.["bet_rate_not_accepted_txt"] + " " + bets[0].oddLimt,
            })
          );
          return false;
        }
        break;

      case "FANCY":
        if (bets[0].oddValue / 100 + 1 > +bets[0].oddLimt) {
          dispatch(
            setAlertMsg({
              type: "error",
              message:
                langData?.["bet_rate_not_accepted_txt"] + " " + bets[0].oddLimt,
            })
          );
          return false;
        }
        break;
    }
  }

  if (
    (bets[0]?.minStake !== 0 && bets[0]?.minStake > oneClickBettingStake) ||
    (bets[0]?.maxStake !== 0 && bets[0]?.maxStake < oneClickBettingStake)
  ) {
    dispatch(
      setAlertMsg({
        type: "error",
        message:
          langData?.["minimum_stake_txt"] +
          " " +
          bets[0]?.minStake +
          " " +
          langData?.["maximum_stake_txt"] +
          " " +
          bets[0]?.maxStake,
      })
    );
    return false;
  }

  if (!bets[0].oddValue) {
    dispatch(
      setAlertMsg({
        type: "error",
        message: langData?.["invalid_odds_txt"],
      })
    );
    return false;
  }

  let binaryPayload: BinaryBetrequest = null;
  let url = "";
  try {
    for (const data of bets) {
      // Cancel Bet for edit unMatched bet
      if (data.betId) {
        // setAddNewBet(false);
        // await cancelBetHandler(data);

        const postBody = {
          cancelBets: [{ betId: data.betId, cancelSize: 0 }],
          marketId: data.marketId,
          eventId: data.eventId,
          sportId: data.sportId,
          seriesId: data.seriesId,
          // operatorId: OPERATORID,
          providerId: PROVIDER_ID,
        };

        try {
          const cancelResponse = await API.post(
            `/bs/cancel-sap-bet`,
            postBody,
            {
              headers: {
                Authorization: sessionStorage.getItem("jwt_token"),
              },
            }
          );

          // setShowSpinner(true);
          if (cancelResponse?.data?.status !== "RS_OK") {
            dispatch(
              setAlertMsg({
                type: "error",
                message: langData?.["cancel_old_bet_failed_txt"],
              })
            );
            return false;
          } else if (cancelResponse?.data?.status === "RS_OK") {
            cancelBetSuccess(data.betId);
          }
        } catch (err) {
          // setShowSpinner(false);
          dispatch(
            setAlertMsg({
              type: "error",
              message: langData?.["cancel_bet_failed_txt"],
            })
          );
          return false;
        }
      }

      dispatch(setOneClickBettingLoading(true));

      switch (data.marketType) {
        case "MO": {
          url = "/place-matchodds-bet";
          break;
        }
        case "BM": {
          url = "/place-bookmaker-bet";
          break;
        }
        case "FANCY": {
          url = "/place-fancy-bet";
          break;
        }
        case "PREMIUM": {
          url = "/place-premium-bet";
          break;
        }
      }
    }

    // setAddNewBet(true);
    let response: AxiosResponse<BsResponse>;
    try {
      response = await API.post(
        "/bs" + url,
        { ...bets[0], amount: oneClickBettingStake },
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
          timeout: 1000 * 20,
        }
      );

      if (binaryPayload !== null) {
        response = await API.post("/binary/single-bet", binaryPayload, {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        });
      }
    } catch (e) {
      // setShowSpinner(false);
      dispatch(setOneClickBettingLoading(false));

      dispatch(
        setAlertMsg({
          type: "error",
          message: e.response?.data?.message
            ? e.response?.data?.message
            : langData?.["general_err_txt"],
        })
      );
      return false;
    }

    if (response && response?.status === 200) {
      // setTimeout(() => {
      //   dispatch(setOneClickBettingLoading(false));
      //   dispatch(clearExchcngeBets());
      // }, bets[0]?.delay * 1000);
    } else {
      dispatch(
        setAlertMsg({
          type: "error",
          message: response?.data?.message
            ? response.data.message
            : langData?.["bet_placed_txt"],
        })
      );
    }
  } catch (ex) {
    dispatch(setOneClickBettingLoading(false));

    if (ex.response) {
      dispatch(
        setAlertMsg({
          type: "error",
          message: langData?.["previous_bet_in_progress_txt"],
        })
      );
    } else {
      dispatch(
        setAlertMsg({
          type: "error",
          message: langData?.["general_err_txt"],
        })
      );
      return false;
    }
  }
};

export const setCashoutInProgress = (payload: CashoutProgressDTO) => {
  return {
    type: SET_CASHOUT_IN_PROGRESS,
    payload: payload,
  };
};
