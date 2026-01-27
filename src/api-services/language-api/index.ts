import axios from "axios";
import { getBaseUrl } from "../environment-url/environment-url";

const LANG_API = axios.create({
  baseURL: getBaseUrl(import.meta.env.REACT_APP_NODE_ENV, "REACT_APP_LANG_URL"),
  timeout: 10000, // 10 seconds
});

//Add a request interceptor to block verify-domain API calls
LANG_API.interceptors.request.use(
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

export default LANG_API;
