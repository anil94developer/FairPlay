import { AxiosResponse } from "axios";
import API from "../../api";
import USABET_API from "../../api-services/usabet-api";
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
  try {
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
  } catch (error: any) {
    // Handle CORS errors and network errors gracefully
    if (error?.code === "ERR_NETWORK" || error?.message?.includes("CORS") || error?.message?.includes("Network Error")) {
      console.warn("[betStatus] CORS or network error, skipping bet status check:", error.message);
      // Don't dispatch error for CORS issues as they're expected in dev environment
      return;
    }
    
    // Log other errors but don't crash the app
    console.error("[betStatus] Error fetching bet status:", error);
    
    // Optionally dispatch a fail status for non-CORS errors
    if (error?.response?.data) {
      store.dispatch(
        fetchBetStatusFail({
          status: "FAIL",
          message: error.response.data.message || "Failed to check bet status",
        })
      );
    }
  }
};

export const fetchOpenBets = (eventId: string[] | string, sportId?: string, page: number = 1, limit: number = 100) => {
  return async (dispatch: Function) => {
    if (eventId) {
      try {
        // Normalize eventId - if array, use first one for single match_id search
        // For multiple matches, we could extend this later
        const matchId = Array.isArray(eventId) ? eventId[0] : eventId;
        
        // Prepare request payload matching the API structure
        const requestPayload = {
          page: page,
          limit: limit,
          search: {
            match_id: matchId,
            delete_status: [0] // Only fetch non-deleted bets (0 = active)
          }
        };

        console.log("[fetchOpenBets] Request payload:", requestPayload);

        // Call the API
        const response = await USABET_API.post("/bet/openBets", requestPayload);
        
        console.log("[fetchOpenBets] API response:", response?.data);

        // Transform API response to UserBet format
        // API response structure:
        // {
        //   "data": [
        //     {
        //       "metadata": [{ "total": 2, "total_profit": 200, "page": 1 }],
        //       "data": [{ bet objects }]
        //     }
        //   ],
        //   "status": true
        // }
        let orders: any[] = [];
        let totalOrders = 0;

        if (response?.data?.status === true && Array.isArray(response.data.data)) {
          const eventIdArray = Array.isArray(eventId) ? eventId : [eventId];
          
          // Handle nested structure: response.data.data is an array of objects with metadata and data
          response.data.data.forEach((group: any) => {
            // Extract metadata for total count
            if (Array.isArray(group.metadata) && group.metadata.length > 0) {
              totalOrders = group.metadata[0].total || totalOrders;
            }
            
            // Extract bets from data array
            if (Array.isArray(group.data)) {
              const mappedBets = group.data.map((bet: any) => {
                // Map API response fields to UserBet format
                return {
                  id: bet.bet_id || bet.id || `bet-${bet.match_id}-${Date.now()}`,
                  betId: bet.bet_id || bet.id,
                  eventId: bet.match_id || bet.event_id || eventIdArray[0],
                  eventName: bet.match_name || bet.event_name || "",
                  marketId: bet.market_id || "",
                  marketName: bet.market_name || bet.name || "Match Odds",
                  marketType: (bet.event_type || bet.market_type || bet.marketType || "MATCH_ODDS") as any,
                  outcomeId: bet.selection_id || bet.outcome_id || bet.runner_id || "",
                  outcomeDesc: bet.selection_name || bet.outcome_desc || bet.outcome_name || bet.runner_name || "",
                  betType: (bet.is_back === 1 || bet.is_back === "1" || bet.is_back === true) ? "BACK" : "LAY" as "BACK" | "LAY",
                  oddValue: bet.odds || bet.odd_value || bet.oddValue || 0,
                  stakeAmount: bet.stack || bet.stake_amount || bet.stakeAmount || bet.amount || 0,
                  betPlacedTime: bet.createdAt || bet.created_at || bet.bet_placed_time || bet.betPlacedTime || new Date().toISOString(),
                  unmatched: bet.is_matched === 0 || bet.is_matched === "0" || bet.is_matched === false,
                  sessionRuns: bet.session_runs || bet.sessionRuns || null,
                  // Additional fields from API
                  profit: bet.profit || 0,
                  p_l: bet.p_l || 0,
                  liability: bet.liability || 0,
                  size: bet.size || 0,
                  is_matched: bet.is_matched || 0,
                  is_fancy: bet.is_fancy || 0,
                  sportId: bet.sport_id || bet.sportId || sportId,
                  sportName: bet.sport_name || bet.sportName || "",
                  seriesId: bet.series_id || bet.seriesId || "",
                  seriesName: bet.series_name || bet.seriesName || "",
                  // Preserve all original fields
                  ...bet
                };
              });
              
              orders = orders.concat(mappedBets);
            }
          });
          
          // If no metadata found, use orders length
          if (totalOrders === 0) {
            totalOrders = orders.length;
          }
        }

        console.log("[fetchOpenBets] Transformed orders:", orders);
        console.log("[fetchOpenBets] Total orders:", totalOrders);

        dispatch(
          fetchOpenBetsSuccess(
            orders,
            totalOrders
          )
        );
      } catch (err) {
        console.error("[fetchOpenBets] Error fetching open bets:", err);
        dispatch(fetchOpenBetsSuccess([], 0));
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
    }

    // setAddNewBet(true);
    let response: AxiosResponse<BsResponse>;
    try {
      const betData = { ...bets[0], amount: oneClickBettingStake };
      
      // Check if this is a FANCY bet - use different API endpoint
      if (betData.marketType === "FANCY") {
        // Use /bet/saveFancyBet API for fancy bets
        // Request body structure:
        // {
        //   "is_back": 1,
        //   "fancy_id": "35196653_4991637",
        //   "run": 160,
        //   "size": 100,
        //   "stack": 100
        // }
        const fancyId = betData.eventId && betData.marketId 
          ? `${betData.marketId}`
          : betData.marketId || "";
        
        const saveFancyBetPayload = {
          is_back: betData.betType === "BACK" ? 1 : 0,
          fancy_id: fancyId,
          run: Number(parseFloat(String(betData.sessionPrice || betData.displayOddValue || 0))),
          size: Number(parseFloat(String(betData.amount || 0))), // Stake amount
          stack: Number(parseFloat(String(betData.amount || 0))) // Stake amount
        };

        console.log("[oneClickBetPlaceHandler] Placing fancy bet with payload:", JSON.stringify(saveFancyBetPayload, null, 2));
        
        response = await USABET_API.post("/bet/saveFancyBet", saveFancyBetPayload);
        
        console.log("[oneClickBetPlaceHandler] saveFancyBet API response:", response?.data);
      } else {
        // Use /bet/saveBet API for other bet types (MO, BM, etc.)
        // Request body structure:
        // {
        //   "is_back": 1,
        //   "market_id": "1.253318288",
        //   "odds": 1.17,
        //   "selection_id": 235,
        //   "stack": 100
        // }
        const saveBetPayload = {
          is_back: betData.betType === "BACK" ? 1 : 0,
          market_id: String(betData.marketId || ""),
          odds: Number(parseFloat(String(betData.oddValue || 0))),
          selection_id: Number(parseInt(String(betData.outcomeId || "0"), 10)),
          stack: Number(parseFloat(String(betData.amount || 0)))
        };

        console.log("[oneClickBetPlaceHandler] Placing bet with payload:", JSON.stringify(saveBetPayload, null, 2));
        
        response = await USABET_API.post("/bet/saveBet", saveBetPayload);
        
        console.log("[oneClickBetPlaceHandler] saveBet API response:", response?.data);
      }

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

    // Check if API response is successful
    const responseData = response?.data as any;
    const isSuccess = response?.status === 200 || 
                     responseData?.status === true || 
                     responseData?.status === "true" ||
                     (responseData?.msg && responseData?.msg?.toLowerCase().includes("success"));
    
    if (response && isSuccess) {
      console.log("[oneClickBetPlaceHandler] Bet placed successfully, calling openBets API...");
      
      // Hide loader immediately after success
      dispatch(setOneClickBettingLoading(false));
      
      // Show processing message - use API message if available, otherwise default
      const successMessage = responseData?.msg || 
                            langData?.["bet_being_processed_txt"] || 
                            "Your bet is being processed...";
      dispatch(
        setAlertMsg({
          type: "success",
          message: successMessage,
        })
      );
      
      // Call bet/openBets API after successful bet placement
      if (bets[0]?.eventId) {
        console.log("[oneClickBetPlaceHandler] Fetching open bets for eventId:", bets[0].eventId);
        dispatch(fetchOpenBets(bets[0].eventId, bets[0].sportId));
      }
      
      // Clear bets from betslip after successful placement
      dispatch(clearExchcngeBets());
    } else {
      // Hide loader on error
      dispatch(setOneClickBettingLoading(false));
      dispatch(
        setAlertMsg({
          type: "error",
          message: response?.data?.message || response?.data?.msg
            ? response.data.message || response.data.msg
            : langData?.["bet_placed_txt"] || "Failed to place bet",
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
