import axios from "axios";
import store from "../store/store";
import { logout } from "../store";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { RootState } from "../models/RootState";
import { getBaseUrl } from "../api-services/environment-url/environment-url";
import { getAccessTokenWithRefreshToken } from "../store/auth/authActions";

const CATALOG_API = axios.create({
  baseURL: getBaseUrl(
    import.meta.env.REACT_APP_NODE_ENV,
    "REACT_APP_REST_CATALOG_API_URL"
  ),
  responseType: "json",
  withCredentials: false,
  timeout: 10000, // 10 seconds
});

//Add a request interceptor to block verify-domain API calls
CATALOG_API.interceptors.request.use(
  (config) => {
    // Block verify-domain API calls
    if (config.url && config.url.includes("verify-domain")) {
      return Promise.reject(new Error("verify-domain API call blocked"));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Add a response interceptor
CATALOG_API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("***********Unauthorized Error**********");
      const token = sessionStorage.getItem("jwt_token");
      if (token) {
        if (error.config.url == "/account/v2/access-token") {
          (store.dispatch as ThunkDispatch<RootState, void, AnyAction>)(
            logout()
          );
        } else {
          (store.dispatch as ThunkDispatch<RootState, void, AnyAction>)(
            getAccessTokenWithRefreshToken()
          );
        }
      }
    }
    return Promise.reject(error);
  }
);

export default CATALOG_API;
