import axios from "axios";

// Dedicated client for USA Bet v1 endpoints.
// Configure via env: REACT_APP_USABET_API_BASE_URL=https://usabet9.com/api/v1
//
// DEV mode: use Vite proxy to avoid CORS (baseURL "/api" -> proxied to https://usabet9.com/api/v1)
const USABET_API = axios.create({
  baseURL: import.meta.env.DEV
    ? "/api"
    : import.meta.env.REACT_APP_USABET_API_BASE_URL ||
      "https://usabet9.com/api/v1",
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

// Helpful debug to verify baseURL at runtime in DevTools
console.log("USABET_API Base URL:", USABET_API.defaults.baseURL);

export default USABET_API;


