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
    const claim = sessionStorage.getItem("jwt_token").split(".")[1];
    return JSON.parse(window.atob(claim)).role;
  }
  return "";
};

export const getPermissionFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const claim = sessionStorage.getItem("jwt_token").split(".")[1];
    return JSON.parse(window.atob(claim)).perm;
  }
  return null;
};

export const getCurrencyTypeFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const claim = sessionStorage.getItem("jwt_token").split(".")[1];
    return JSON.parse(window.atob(claim)).cur;
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
    const claim = sessionStorage.getItem("jwt_token").split(".")[1];
    return JSON.parse(window.atob(claim)).hid;
  }
  return null;
};

export const getSportsBookFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const claim = sessionStorage.getItem("jwt_token").split(".")[1];
    return JSON.parse(window.atob(claim)).org;
  }
  return null;
};

export const getStatusFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const claim = sessionStorage.getItem("jwt_token").split(".")[1];
    return JSON.parse(window.atob(claim)).status;
  }
  return null;
};

export const getParentIdFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const claim = sessionStorage.getItem("jwt_token").split(".")[1];
    return JSON.parse(window.atob(claim)).pid;
  }
  return null;
};

export const getUserCreationTime = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const claim = sessionStorage.getItem("jwt_token").split(".")[1];
    return JSON.parse(window.atob(claim)).ctime;
  }
  return null;
};

export const getAccountPathFromToken = () => {
  if (sessionStorage.getItem("jwt_token")) {
    const claim = sessionStorage.getItem("jwt_token").split(".")[1];
    return JSON.parse(window.atob(claim)).path;
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
        const loginRequest = {
          username,
          password,
          uuid,
        };
        response = await AUTH_API.post("/login", loginRequest);
      }
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("jwt_token", response.data.jwtToken);
      // sessionStorage.setItem('bg_token', response.data.bgToken);
      // sessionStorage.setItem('bc_token', response.data.bcToken);
      // sessionStorage.setItem('wacs_token', response.wacsToken);
      // sessionStorage.setItem('dc_token', response.dcToken);
      dispatch(loginSuccess(response.data));
      const history = createBrowserHistory({ forceRefresh: true });
      let claim = response.data.jwtToken.split(".")[1];
      let permission = JSON.parse(window.atob(claim)).perm;
      let role = JSON.parse(window.atob(claim)).role;
      let status = JSON.parse(window.atob(claim)).sts;
      if (status === 2) {
        history.replace("/terms-and-conditions");
      } else if (status === 4) {
        history.replace("/reset-password");
      } else if ((permission & 2) !== 0) {
        history.replace("/platform_admin/house");
      } else if (role !== "User") {
        history.replace("/admin");
      }
    } catch (err: any) {
      dispatch(loginFailed(err.response.data.message));
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
    history.replace("/home");
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

const fetchBalanceSuccess = (balance: number) => {
  return {
    type: FETCH_BALANCE_SUCCESS,
    payload: balance,
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
      // Replaced API call with dummy data
      const dummyBalance = 10000;

      if (
        localStorage.getItem("campaignId") &&
        localStorage.getItem("balance") &&
        dummyBalance &&
        localStorage.getItem("balance") != dummyBalance.toString()
      ) {
        depositEvent();
        localStorage.removeItem("balance");
        localStorage.removeItem("campaignId");
      }
      dispatch(fetchBalanceSuccess(dummyBalance));
    } catch (err: any) {
      // dispatch(fetchBalanceFailed());
      if (err.response && err.response.status === 401) {
        const token = sessionStorage.getItem("jwt_token");
        if (token) {
          dispatch(logout());
        }
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
