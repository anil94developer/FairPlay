import { createBrowserHistory } from "history";

import {
  FETCH_BALANCE_SUCCESS,
  // FETCH_BALANCE_FAILED,
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
import API from "../../api";
import SVLS_API from "../../svls-api";
import AUTH_API from "../../api-services/auth-api";
import USABET_API from "../../api-services/usabet-api";
import { depositEvent } from "../../util/facebookPixelEvent";
import { demoUser } from "../../util/stringUtil";

declare const sessionStorage: any;

export const requestStart = () => {
  return {
    type: AUTH_REQUEST_START,
  };
};

export const requestEnd = () => {
  return {
    type: AUTH_REQUEST_END,
  };
};

export const loginSuccess = (response: any) => {
  return {
    type: LOGIN_SUCCESS,
    payload: response,
  };
};

export const setOpenDepositModal = (val: boolean) => {
  return {
    type: OPEN_DEPOSIT_MODAL,
    payload: val,
  };
};

export const setOpenWithdrawModal = (val: boolean) => {
  return {
    type: OPEN_WITHDRAW_MODAL,
    payload: val,
  };
};

export const loginFailed = (err: string) => {
  return {
    type: LOGIN_FAILED,
    payload: err,
  };
};

const logoutSuccess = () => {
  return {
    type: LOG_OUT_SUCCESS,
  };
};

const logoutFailed = (err: string) => {
  return {
    type: LOG_OUT,
    payload: err,
  };
};

export const handleSideBar = () => {
  return {
    type: HANDLE_SIDE_BAR,
  };
};

export const getRoleFromToken = (): string => {
  if (sessionStorage.getItem("jwt_token")) {
    const token = sessionStorage.getItem("jwt_token");
    if (token && token.includes(".")) {
      const claim = token.split(".")[1];
      return JSON.parse(window.atob(claim)).role;
    }
  }
  return "";
};

export const getPermissionFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const token = sessionStorage.getItem("jwt_token");
    if (token && token.includes(".")) {
      const claim = token.split(".")[1];
      return JSON.parse(window.atob(claim)).perm;
    }
  }
  return null;
};

export const getCurrencyTypeFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const token = sessionStorage.getItem("jwt_token");
    if (token && token.includes(".")) {
      const claim = token.split(".")[1];
      return JSON.parse(window.atob(claim)).cur;
    }
  }
  return 0;
};

export const getSapTokenFromToken = () => {
  var sapToken = sessionStorage.getItem("sap_token");
  if (sapToken) {
    return sapToken;
  }
  return null;
};

export const getHouseIdFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const token = sessionStorage.getItem("jwt_token");
    if (token && token.includes(".")) {
      const claim = token.split(".")[1];
      return JSON.parse(window.atob(claim)).hid;
    }
  }
  return null;
};

export const getSportsBookFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const token = sessionStorage.getItem("jwt_token");
    if (token && token.includes(".")) {
      const claim = token.split(".")[1];
      return JSON.parse(window.atob(claim)).org;
    }
  }
  return null;
};

export const getStatusFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const token = sessionStorage.getItem("jwt_token");
    if (token && token.includes(".")) {
      const claim = token.split(".")[1];
      return JSON.parse(window.atob(claim)).status;
    }
  }
  return null;
};

export const getParentIdFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const token = sessionStorage.getItem("jwt_token");
    if (token && token.includes(".")) {
      const claim = token.split(".")[1];
      return JSON.parse(window.atob(claim)).pid;
    }
  }
  return null;
};

export const getUserCreationTime = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const token = sessionStorage.getItem("jwt_token");
    if (token && token.includes(".")) {
      const claim = token.split(".")[1];
      return JSON.parse(window.atob(claim)).ctime;
    }
  }
  return null;
};

export const getAccountPathFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const token = sessionStorage.getItem("jwt_token");
    if (token && token.includes(".")) {
      const claim = token.split(".")[1];
      return JSON.parse(window.atob(claim)).path;
    }
  }
  return null;
};

export const fetchMailVerifiedSuccess = (mailVerified: boolean) => {
  return {
    type: MAIL_VERIFIED_REQUEST_SUCCESS,
    payload: mailVerified,
  };
};

export const fetchMailVerifiedFailed = () => {
  return {
    type: MAIL_VERIFIED_REQUEST_FAILED,
    payload: null,
  };
};

export const fetchMailVerifiedStatus = () => {
  return async (dispatch: any) => {
    try {
      const response = await API.get("/mail-verified", {
        headers: {
          Authorization: sessionStorage.getItem("jwt_token"),
        },
      });
      if (response.status === 200) {
        dispatch(fetchMailVerifiedSuccess(response.data.mailVerified));
      } else {
        dispatch(fetchMailVerifiedFailed());
      }
    } catch (ex) {
      dispatch(fetchMailVerifiedFailed());
    }
  };
};

export const login = (username: string, password: string, code: string) => {
  return async (dispatch: Function) => {
    const uuid = uniqueGuid();
    dispatch(requestStart());
    try {
      let response;
      if (code) {
        response = await API.post("/mfa/validate/key", {
          username,
          code,
          uuid,
        });
      } else {
        // USA Bet v1 login
        const form = new URLSearchParams();
        form.set("user_name", username);
        form.set("password", password);
        form.set("grant_type", "password");

        console.log("Login base URL (USABET_API):", USABET_API.defaults.baseURL);
        response = await USABET_API.post("/user/userLogin", form, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        // Check if API returned status: false (error in response body)
        if (response?.data?.status === false) {
          const errorMsg =
            response?.data?.msg ||
            response?.data?.message ||
            "Invalid credentials! Please try again.";
          dispatch(loginFailed(errorMsg));
          return;
        }
      }
      sessionStorage.setItem("username", username);

      // USA Bet returns `token: { accessToken, refreshToken, ... }`
      const accessToken =
        response?.data?.token?.accessToken ||
        response?.data?.accessToken ||
        response?.data?.access_token ||
        response?.data?.jwtToken;

      const refreshToken =
        response?.data?.token?.refreshToken || response?.data?.refreshToken;

      if (accessToken) {
        sessionStorage.setItem("jwt_token", accessToken);
      }
      if (refreshToken) {
        sessionStorage.setItem("refresh_token", refreshToken);
      }
      // sessionStorage.setItem('bg_token', response.data.bgToken);
      // sessionStorage.setItem('bc_token', response.data.bcToken);
      // sessionStorage.setItem('wacs_token', response.wacsToken);
      // sessionStorage.setItem('dc_token', response.dcToken);
      // Reducer expects the token string (LoginForm used to dispatch token string too)
      dispatch(loginSuccess(accessToken || response.data));
      const history = createBrowserHistory({ forceRefresh: true });

      // If token is a JWT, apply existing redirect logic; otherwise go home
      if (typeof accessToken === "string" && accessToken.includes(".")) {
        try {
          const claim = accessToken.split(".")[1];
          const decoded = JSON.parse(window.atob(claim));
          const permission = decoded.perm;
          const role = decoded.role;
          const status = decoded.sts ?? decoded.status;

          if (status === 2) {
            history.replace("/terms-and-conditions");
          } else if (status === 4) {
            history.replace("/reset-password");
          } else if (permission && (permission & 2) !== 0) {
            history.replace("/platform_admin/house");
          } else if (role && role !== "User") {
            history.replace("/admin");
          } else {
            history.replace("/home");
          }
        } catch {
          history.replace("/home");
        }
      } else {
        history.replace("/home");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed";
      dispatch(loginFailed(msg));
    } finally {
      dispatch(requestEnd());
    }
  };
};

export const signup = (username: string, password: string) => {
  return async (dispatch: Function) => {
    dispatch(requestStart());
    try {
      const response = await API.post("/user", {
        username,
        password,
      });
      dispatch(loginSuccess(response.data));
      sessionStorage.setItem("username", username);
      // sessionStorage.setItem('bg_token', response.data.bgToken);
      sessionStorage.setItem("jwt_token", response.data.jwtToken);
      // sessionStorage.setItem('wacs_token', response.data.wacsToken);
      // sessionStorage.setItem('dc_token', response.data.dcToken);
    } catch (err: any) {
      dispatch(loginFailed(err.message));
    }
  };
};

export const logout = () => {
  const token = sessionStorage.getItem("jwt_token");
  return async (dispatch: Function) => {
    try {
      await AUTH_API.post("/account/v2/logout", null, {
        headers: {
          Authorization: token,
        },
        withCredentials: true,
      });
      const username = sessionStorage.getItem("username") ?? "";
      localStorage.removeItem(`multiMarket_${username}`);
      sessionStorage.clear();
      sessionStorage.setItem("apk_popup_shown", "true");
      dispatch(logoutSuccess());
    } catch (err: any) {
      sessionStorage.clear();
      sessionStorage.setItem("apk_popup_shown", "true");
      dispatch(logoutFailed(err.message));
    }
    const history = createBrowserHistory({ forceRefresh: true });
    history.replace("/login");
  };
};

export const getAccessTokenWithRefreshToken = () => {
  return async (dispatch: Function) => {
    try {
      let response = await AUTH_API.get("/account/v2/access-token", {
        withCredentials: true,
      });
      getSapToken(response.data);
      const claims = response.data.split(".")[1];
      const userName = JSON.parse(window.atob(claims))?.sub;
      const userId = JSON.parse(window.atob(claims))?.uid;
      sessionStorage.setItem("jwt_token", response.data);
      sessionStorage.setItem("username", userName);
      sessionStorage.setItem("aid", userId);

      dispatch(loginSuccess(response.data));
    } catch (err) {
      console.log("Error in refreshing token", err);
    }
  };
};

export const getSapToken = async (token: string) => {
  try {
    const response = await SVLS_API.get(
      `/account/v2/accounts/${
        JSON.parse(window.atob(token.split(".")[1])).aid
      }/sap-token`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    if (response.status == 200) {
      sessionStorage.setItem("sap_token", response.data);
    }
  } catch (err) {
    console.log(err);
  }
};

const fetchBalanceSuccess = (balanceSummary: any) => {
  return {
    type: FETCH_BALANCE_SUCCESS,
    payload: balanceSummary,
  };
};

// const fetchBalanceFailed = () => {
//   return {
//     type: FETCH_BALANCE_FAILED,
//   };
// };

const uniqueGuid = (): string => {
  const id = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    id() +
    id() +
    "-" +
    id() +
    "-" +
    id() +
    "-" +
    id() +
    "-" +
    id() +
    id() +
    id()
  );
};

export const fetchBalance = () => {
  return async (dispatch: Function) => {
    if (demoUser()) {
      return;
    }
    try {
      // Use /user/getBalanceCRef API endpoint
      // Note: baseURL already includes /api/v1/ in production or /api in dev
      // Full path: api/v1/user/getBalanceCRef
      // Response structure:
      // {
      //   "data": {
      //     "liability": 0,
      //     "balance": 1500
      //   },
      //   "status": true
      // }
      const response = await USABET_API.post("/user/getBalanceCRef");
      
      console.log("[fetchBalance] getBalanceCRef API response:", response?.data);

      if (response?.data?.status === true && response?.data?.data) {
        const balanceData = response.data.data;
        const balance = balanceData.balance || 0;
        const liability = balanceData.liability || 0;

        // Map to balanceSummary structure
        const balanceSummary = {
          balance: balance,
          balanceId: 0,
          currenciesAllowed: 0,
          currency: "",
          exposure: liability, // Use liability as exposure
          exposureLimit: 0,
          maxStakeSB: 0,
          minStakeSB: 0,
          preferredCurrency: "",
          username: sessionStorage.getItem("username") || "",
          bonus: null,
          bonusRedeemed: null,
          nonCashableAmount: null,
          cashableAmount: balance, // Use balance as cashable amount
        };

        if (
          localStorage.getItem("campaignId") &&
          localStorage.getItem("balance") &&
          balance &&
          localStorage.getItem("balance") != balance.toString()
        ) {
          depositEvent();
          localStorage.removeItem("balance");
          localStorage.removeItem("campaignId");
        }
        
        dispatch(fetchBalanceSuccess(balanceSummary));
      } else {
        console.warn("[fetchBalance] Invalid API response, using fallback");
        // Fallback to dummy data if API response is invalid
        const dummyBalance = 10000;
        dispatch(fetchBalanceSuccess({
          balance: dummyBalance,
          balanceId: 0,
          currenciesAllowed: 0,
          currency: "",
          exposure: 0,
          exposureLimit: 0,
          maxStakeSB: 0,
          minStakeSB: 0,
          preferredCurrency: "",
          username: sessionStorage.getItem("username") || "",
          bonus: null,
          bonusRedeemed: null,
          nonCashableAmount: null,
          cashableAmount: dummyBalance,
        }));
      }
    } catch (err: any) {
      console.error("[fetchBalance] Error fetching balance:", err);
      // dispatch(fetchBalanceFailed());
      if (err.response && err.response.status === 401) {
        const token = sessionStorage.getItem("jwt_token");
        if (token) {
          dispatch(logout());
        }
      } else {
        // Fallback to dummy data on error
        const dummyBalance = 10000;
        dispatch(fetchBalanceSuccess({
          balance: dummyBalance,
          balanceId: 0,
          currenciesAllowed: 0,
          currency: "",
          exposure: 0,
          exposureLimit: 0,
          maxStakeSB: 0,
          minStakeSB: 0,
          preferredCurrency: "",
          username: sessionStorage.getItem("username") || "",
          bonus: null,
          bonusRedeemed: null,
          nonCashableAmount: null,
          cashableAmount: dummyBalance,
        }));
      }
    }
  };
};

export const enableMlobby = (isMolobby: boolean) => {
  return {
    type: MLOBBY_SHOW,
    payload: isMolobby,
  };
};

export const showIplStream = () => {
  const creationTime = getUserCreationTime(); // in seconds
  const inputDate = new Date(creationTime * 1000); // convert to milliseconds

  const targetDate = new Date("2025-02-10T23:59:59"); // end of 10th Feb 2025

  return inputDate <= targetDate;
};
