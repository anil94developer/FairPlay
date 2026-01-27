import { AuthState } from "../../models/auth/AuthState";
import {
  FETCH_BALANCE_SUCCESS,
  FETCH_BALANCE_FAILED,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  AUTH_REQUEST_START,
  AUTH_REQUEST_END,
  LOG_OUT,
  LOG_OUT_SUCCESS,
  MAIL_VERIFIED_REQUEST_SUCCESS,
  MAIL_VERIFIED_REQUEST_FAILED,
  HANDLE_SIDE_BAR,
  OPEN_DEPOSIT_MODAL,
  OPEN_WITHDRAW_MODAL,
  MLOBBY_SHOW,
} from "./authActionTypes";

type Action = {
  type: string;
  payload: any;
};

const initialState: AuthState = {
  balanceSummary: {
    balance: null,
    balanceId: 0,
    currenciesAllowed: 0,
    currency: "",
    exposure: null,
    exposureLimit: 0,
    maxStakeSB: 0,
    minStakeSB: 0,
    preferredCurrency: "",
    username: "",
    bonus: null,
    bonusRedeemed: null,
    nonCashableAmount: null,
    cashableAmount: null,
  },
  bcToken: sessionStorage.getItem("bc_token") || null,
  bgToken: sessionStorage.getItem("bg_token") || "-",
  jwtToken: sessionStorage.getItem("jwt_token") || "",
  loading: false,
  loginError: "",
  loggedIn: sessionStorage.getItem("jwt_token") ? true : false,
  mailVerified: null,
  openDepositModal: false,
  openWithdrawModal: false,
  isMolobby: sessionStorage.getItem("mlobby") ? true : false,
  // sideBarOpen: false,
};

const authReducer = (state = initialState, action: Action): AuthState => {
  switch (action.type) {
    case AUTH_REQUEST_START:
      return {
        ...state,
        loading: true,
        loginError: "",
      };
    case AUTH_REQUEST_END:
      return {
        ...state,
        loading: false,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        bcToken: action.payload.bcToken ? action.payload.bcToken : "-",
        bgToken: action.payload.bgToken ? action.payload.bgToken : "-",
        jwtToken: action.payload,
        loading: false,
        loginError: "",
        loggedIn: true,
        mailVerified: action.payload.mailVerified
          ? action.payload.mailVerified
          : false,
      };
    case LOGIN_FAILED:
      return {
        ...state,
        bgToken: "-",
        jwtToken: "",
        loading: false,
        loginError: action.payload,
        loggedIn: false,
      };
    case LOG_OUT:
      return {
        ...state,
        loggedIn: false,
        bcToken: null,
        bgToken: "-",
        jwtToken: "",
        loading: false,
        mailVerified: null,
      };
    case LOG_OUT_SUCCESS:
      return {
        ...state,
        loggedIn: false,
        bcToken: null,
        bgToken: null,
        jwtToken: null,
        loading: false,
        mailVerified: null,
      };

    case FETCH_BALANCE_SUCCESS:
      return {
        ...state,
        balanceSummary: action.payload,
      };

    case FETCH_BALANCE_FAILED:
      return {
        ...state,
        balanceSummary: {
          balance: null,
          balanceId: 0,
          currenciesAllowed: 0,
          currency: "",
          exposure: null,
          exposureLimit: 0,
          maxStakeSB: 0,
          minStakeSB: 0,
          preferredCurrency: "",
          username: "",
          bonus: 0,
          bonusRedeemed: 0,
          nonCashableAmount: 0,
          cashableAmount: 0,
        },
      };

    case MAIL_VERIFIED_REQUEST_SUCCESS:
      return {
        ...state,
        mailVerified: action.payload,
      };

    case MAIL_VERIFIED_REQUEST_FAILED:
      return {
        ...state,
        mailVerified: null,
      };
    case HANDLE_SIDE_BAR:
      return {
        ...state,
        // sideBarOpen: !state.sideBarOpen,
      };
    case OPEN_DEPOSIT_MODAL:
      return {
        ...state,
        openDepositModal: action.payload,
      };
    case OPEN_WITHDRAW_MODAL:
      return {
        ...state,
        openWithdrawModal: action.payload,
      };
    case MLOBBY_SHOW:
      return {
        ...state,
        isMolobby: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;
