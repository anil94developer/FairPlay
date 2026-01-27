import { BACKEND_DOMAIN, BRAND_DOMAIN } from "../../constants/Branding";

export const StageUrlsMap = {
  REACT_APP_REST_API_URL: `https://stage-api.uvwin2024.co/api/v1`,
  REACT_APP_REST_API_V2_URL: `https://stage-api.uvwin2024.co`,
  REACT_APP_REST_API_V2_AUTH_URL: `https://accounts-stage.${BRAND_DOMAIN}`,
  REACT_APP_REST_REPORTING_API_URL: `https://stage-reporting.uvwin2024.co`,
  REACT_APP_REST_CATALOG_API_URL: `https://stage-catalog.uvwin2024.co`,
  REACT_APP_WEBSOCKET_URL_PUSH_NOTIFICATIONS: `https://stage-notification.uvwin2024.co/push-notifications`,
  BINARY_WEBSOCKET_URL: `https://stage-user-api.hypexexch.com/hypex-ws`,
  REACT_APP_REST_AGPAY_URL: `https://stage-agpay.uvwin2024.co`,
  REACT_APP_SPORT_FEED_URL: `https://stage-api.mysportsfeed.io/api/v1`,
  REACT_APP_REST_GENIE_URL: `https://scorewebapp.mysportsfeed.io/api/scorecard`,
  REACT_APP_LANG_URL: `https://stage-cdn.uvwin2024.co`,
  WIDGET_BASE_URL: `https://stage-battleground.uvwin2024.co`,
};

export const ProdUrls = {
  REACT_APP_REST_API_URL: `https://api.${BACKEND_DOMAIN}/api/v1`,
  REACT_APP_REST_API_V2_URL: `https://api.${BACKEND_DOMAIN}`,
  REACT_APP_REST_API_V2_AUTH_URL: `https://accounts.${BRAND_DOMAIN}`,
  REACT_APP_REST_REPORTING_API_URL: `https://reporting.${BACKEND_DOMAIN}`,
  REACT_APP_REST_CATALOG_API_URL: `https://catalog.${BACKEND_DOMAIN}`,
  REACT_APP_WEBSOCKET_URL_PUSH_NOTIFICATIONS: `https://notification.${BACKEND_DOMAIN}/push-notifications`,
  BINARY_WEBSOCKET_URL: `https://feed.mysportsfeed.io/hypex-ws`,
  REACT_APP_REST_AGPAY_URL: `https://agpay.${BACKEND_DOMAIN}`,
  REACT_APP_SPORT_FEED_URL: `https://api.mysportsfeed.io/api/v1`,
  REACT_APP_REST_GENIE_URL: `https://api-genie.mysportsfeed.io/api/scorecard`,
  REACT_APP_LANG_URL: `https://cdn.uvwin2024.co`,
  WIDGET_BASE_URL: `https://battleground.uvwin2024.co`,
};

export const EnvUrlsMap = {
  development: StageUrlsMap,
  stage: StageUrlsMap,
  production: ProdUrls,
};

type Environment = keyof typeof EnvUrlsMap;

// Auto-detect environment - NO process.env
function detectEnvironment(): Environment {
  if (typeof window === "undefined") {
    return "production";
  }

  const hostname = window.location.hostname;

  // Development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development";
  }

  // Stage
  if (hostname.includes("stage")) {
    return "stage";
  }

  // Production (default)
  return "production";
}

export function getBaseUrl(env: string, url: string) {
  const validEnv = env in EnvUrlsMap ? (env as Environment) : "production";
  return EnvUrlsMap[validEnv][url];
}

// Export the detected environment
export const CURRENT_ENVIRONMENT = detectEnvironment();
