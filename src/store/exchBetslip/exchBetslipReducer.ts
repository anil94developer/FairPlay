import { ExBetslip } from "../../models/ExBetslip";
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
  FETCH_BET_STATUS_IN_PROGRESS,
  FETCH_BET_STATUS_SUCCESS,
  FETCH_BET_STATUS_FAIL,
  CLEAR_BET_STATUS_RESPONSE,
  SET_ONE_CLICK_BETTING_LOADING,
  ENABLE_ONE_CLICK_BETTING,
  SET_ONE_CLICK_BETTING_STAKE,
  SET_CASHOUT_IN_PROGRESS,
} from "./exchBetslipActionTypes";
import { BUTTON_VARIABLES } from "../../constants/ButtonVariables";
import { _findIndexByArray } from "../../util/stringUtil";
import store from "../store";

type Action = {
  type: string;
  payload: any;
};

const initialState: ExBetslip = {
  bets: [],
  openBets: [],
  totalOrders: 0,
  buttonVariables: BUTTON_VARIABLES,
  bettingInprogress: false,
  isOneClickEnable: false,
  oneClickAmount: 0,
  betStatusResponse: null,
  oneClickBettingLoading: false,
  oneClickBettingEnabled: false,
  oneClickBettingStake: 100,
  cashoutInProgress: null,
};

const ExchBetslipReducer = (
  state = initialState,
  action: Action
): ExBetslip => {
  switch (action.type) {
    case ADD_EXCH_BET: {
      const bettingInprogress = state.bettingInprogress;
      if (!bettingInprogress) {
        const bets = [...state.bets];
        bets.push(action.payload);
        return {
          ...state,
          bets,
        };
      }
      return {
        ...state,
      };
    }
    case EXCH_BET_ODDS_CHANGE: {
      const bets = [...state.bets];
      if (bets[action?.payload?.index]) {
        bets[action?.payload?.index].oddValue = action.payload.odds
          ? action.payload.odds
          : null;
      }
      // bets[action?.payload?.index].oddsPrice = action.payload.odds
      //   ? action.payload.odds
      //   : null;

      return {
        ...state,
        bets,
      };
    }
    case REMOVE_EXCH_BET: {
      const bets = [...state.bets];
      bets.splice(action.payload.index, 1);

      return {
        ...state,
        bets,
      };
    }
    case SET_EXCH_BET_STAKE: {
      const bets = [...state.bets];
      if (action.payload.type === "ADD") {
        bets[action.payload.index].amount += Math.floor(action.payload.amount);
      } else if (action.payload.type === "SET") {
        bets[action.payload.index].amount = Math.floor(action.payload.amount);
      }

      if (isNaN(bets[action.payload.index].amount)) {
        bets[action.payload.index].amount = 0;
      }

      return {
        ...state,
        bets,
      };
    }
    case CLEAR_EXCHANGE_BETS: {
      const bettingInprogress = state.bettingInprogress;
      if (!bettingInprogress) {
        return {
          ...state,
          bets: [],
        };
      }
      return {
        ...state,
      };
    }
    case SET_BUTTON_VARIABLES: {
      const btnVars = action.payload;
      return {
        ...state,
        buttonVariables: btnVars.length > 0 ? btnVars : BUTTON_VARIABLES,
      };
    }

    case FETCH_OPEN_BETS_SUCCESS: {
      const openBets = action.payload ? action.payload.result : [];
      const totalOrders = action.payload ? action.payload.totalOrders : 0;

      return {
        ...state,
        openBets: openBets,
        totalOrders: totalOrders,
      };
    }

    case BET_CANCEL_SUCCESS: {
      let openBets = [...state.openBets];
      if (openBets && openBets?.length > 0) {
        for (let bet of openBets) {
          if (bet.betId === action.payload.betId && bet.unmatched) {
            const index = _findIndexByArray(openBets, action.payload.betId);
            if (index > -1) {
              openBets.splice(index, 1);
            }
          }
        }
      }

      return {
        ...state,
        openBets: openBets,
      };
    }

    case ADD_OPEN_BETS: {
      const openBets = action.payload ? action.payload : [];
      const opBets = [...state.openBets];
      const allOpenBets = opBets.concat(openBets);
      return {
        ...state,
        openBets: allOpenBets,
      };
    }

    case SET_BETTING_INPROGRESS: {
      return {
        ...state,
        bettingInprogress: action.payload,
      };
    }
    case ENABLE_ONE_CLICK_BETS: {
      return {
        ...state,
        isOneClickEnable: action.payload,
      };
    }
    case ADD_ONE_CLICK_AMOUNT: {
      return {
        ...state,
        oneClickAmount: action.payload,
      };
    }

    case UPDATE_BET_SLIP: {
      const eventId: string = action.payload.eventId;
      const bets = state?.bets;
      const matchOdds = action.payload.matchOdds;
      let isOddsChanged = false;

      if (action?.payload?.matchOdds) {
        for (let bet of bets) {
          if (
            bet?.marketType === "MO" &&
            bet?.eventId === eventId &&
            bet?.marketId === matchOdds.marketId
          ) {
            for (let mo of matchOdds.runners) {
              if (mo.runnerId === bet.outcomeId) {
                if (bet.betType === "BACK") {
                  if (mo?.backPrices) {
                    console.log(mo.backPrices);
                    console.log(
                      mo.backPrices[mo.backPrices.length - 1].price,
                      "<=",
                      mo.backPrices[1].price,
                      "<=",
                      mo.backPrices[0].price,
                      ":",
                      bet.oddValue
                    );
                    console.log(
                      mo.backPrices[mo.backPrices.lenght - 1]?.price <=
                        bet.oddValue && bet.oddValue <= mo.backPrices[0]?.price
                    );

                    if (
                      mo.backPrices[mo.backPrices.lenght - 1]?.price <=
                        bet.oddValue ||
                      bet.oddValue <= mo.backPrices[0]?.price
                    ) {
                      isOddsChanged = false;
                    } else {
                      isOddsChanged = true;
                    }
                  }
                } else {
                  if (mo?.layPrices) {
                    if (
                      mo.layPrices[0]?.price <= bet.oddValue &&
                      bet.oddValue <=
                        mo.layPrices[mo.layPrices.lenght - 1]?.price
                    ) {
                      console.log(
                        mo.layPrices[mo.layPrices.lenght - 1].price,
                        mo.layPrices[1].price,
                        mo.layPrices[0].price,
                        ":",
                        bet.oddValue
                      );

                      isOddsChanged = false;
                    } else {
                      isOddsChanged = true;
                    }
                  }
                }
              }
            }
          }
        }
      }

      return {
        ...state,
        // oddsChanged: isOddsChanged,
      };
    }

    case CLEAR_SUCCESS_BETS: {
      // const currentBets = [...state.bets];
      // const successIndices: number[] = action.payload;

      // const filteredBets = currentBets.filter(
      //   (_, i) => !successIndices.includes(i)
      // );

      return {
        ...state,
        bets: [],
      };
    }

    case RESET_BETSLIP_ODDS_CHANGE_MSG: {
      return {
        ...state,
        // oddsChanged: false,
      };
    }

    case FETCH_BET_STATUS_IN_PROGRESS:
    case FETCH_BET_STATUS_SUCCESS:
    case FETCH_BET_STATUS_FAIL: {
      return {
        ...state,
        betStatusResponse: action.payload,
      };
    }

    case CLEAR_BET_STATUS_RESPONSE: {
      return {
        ...state,
        betStatusResponse: null,
      };
    }

    case SET_ONE_CLICK_BETTING_LOADING: {
      return {
        ...state,
        oneClickBettingLoading: action.payload,
      };
    }

    case ENABLE_ONE_CLICK_BETTING:
      return {
        ...state,
        oneClickBettingEnabled: action.payload,
      };
    case SET_ONE_CLICK_BETTING_STAKE:
      return {
        ...state,
        oneClickBettingStake: action.payload,
      };

    case SET_CASHOUT_IN_PROGRESS:
      return {
        ...state,
        cashoutInProgress: action.payload,
      };

    default: {
      return state;
    }
  }
};

export default ExchBetslipReducer;
