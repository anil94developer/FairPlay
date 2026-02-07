import axios from "axios";
import { createBrowserHistory } from "history";

// Dedicated client for USA Bet v1 endpoints.
// Configure via env: REACT_APP_USABET_API_BASE_URL=https://usabet9.com/api/v1/
//
// DEV mode: use Vite proxy to avoid CORS (baseURL "/api" -> proxied to https://usabet9.com/api/v1/)
const USABET_API = axios.create({
  baseURL:  
   import.meta.env.DEV
    ? "/api"
    : import.meta.env.REACT_APP_USABET_API_BASE_URL ||
      "https://usabet9.com/api/v1/",
  // Match your working implementation (some deployments rely on cookies / cf_clearance)
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

const BASIC_AUTH ='Basic YXBwbGljYXRpb246c2VjcmV0' || import.meta.env.REACT_APP_USABET_BASIC_AUTH;

// Auth behavior:
// - /user/userLogin: send Basic auth (if provided), and NEVER send Bearer
// - everything else: send Bearer from sessionStorage.jwt_token (if present)
USABET_API.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const isLogin =
    url.includes("/user/userLogin") || url.includes("/user/autoDemoUserLogin");

  // Axios typings can be strict here; ensure we always operate on a mutable object
  const headers: any = (config.headers ?? {}) as any;
  config.headers = headers;

  // Always remove any existing auth header first (prevents leaking stale values)
  try {
    delete headers.Authorization;
    delete headers.authorization;
  } catch {
    // ignore
  }

  if (isLogin) {
    if (BASIC_AUTH) {
      headers.Authorization = BASIC_AUTH; // e.g. "Basic YXBwbGljYXRpb246c2VjcmV0"
    }
  } else {
    const token = sessionStorage.getItem("jwt_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  // Debug (won't print secrets; only prints scheme)
  const authHeader = headers?.Authorization || headers?.authorization;
  const scheme =
    typeof authHeader === "string" ? authHeader.split(" ")[0] : "none";
  console.log("USABET_API request:", { url, isLogin, auth: scheme });

  return config;
});

// Add response interceptor to handle invalid token responses
USABET_API.interceptors.response.use(
  (response) => {
    // Check for invalid token response in successful responses
    if (response?.data) {
      const data = response.data;
      // Check for invalid token response: {"msg":"Invalid token: access token is invalid","logout":true,"status":false}
      if (
        data.status === false &&
        data.logout === true &&
        (data.msg?.includes("Invalid token") ||
         data.msg?.includes("access token is invalid") ||
         data.message?.includes("Invalid token") ||
         data.message?.includes("access token is invalid"))
      ) {
        console.warn("[USABET_API] Invalid token detected, redirecting to login");
        // Clear session storage
        sessionStorage.clear();
        // Redirect to login
        const history = createBrowserHistory({ forceRefresh: true });
        history.replace("/login");
        // Return a rejected promise to stop further processing
        return Promise.reject(new Error("Invalid token: redirecting to login"));
      }
    }
    return response;
  },
  (error) => {
    // Handle error responses
    if (error?.response?.data) {
      const data = error.response.data;
      // Check for invalid token in error response
      if (
        data.status === false &&
        data.logout === true &&
        (data.msg?.includes("Invalid token") ||
         data.msg?.includes("access token is invalid") ||
         data.message?.includes("Invalid token") ||
         data.message?.includes("access token is invalid"))
      ) {
        console.warn("[USABET_API] Invalid token in error response, redirecting to login");
        // Clear session storage
        sessionStorage.clear();
        // Redirect to login
        const history = createBrowserHistory({ forceRefresh: true });
        history.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

// Helpful debug to verify baseURL at runtime in DevTools
console.log("USABET_API Base URL:", USABET_API.defaults.baseURL);

export default USABET_API;


