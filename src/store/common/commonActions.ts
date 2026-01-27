import { Currency } from "../../models/Currency";
import {
  getAccountPathFromToken,
  getSportsBookFromToken,
} from "../auth/authActions";

import {
  CASINO_GAME_SELECTED,
  ENABLE_COMMISSION,
  FETCH_CONTENT_CONFIG_SUCCESS,
  IS_ADMIN_REPORTS_URL,
  IS_ADMIN_RISKMGMT_URL,
  IS_HOUSE_URL,
  LANG_SELECTED,
  LANGUAGES,
  SET_ALERT_MSG,
  SET_ALLOWED_CONFIG,
  SET_CAMPAIGN_INFO,
  SET_CASINO_GAME,
  SET_DC_GAME_URL,
  SET_DOMAIN_CONFIG,
  SET_LANG_DATA,
  SET_LIVESTREAM_URL,
  SET_PLAY_STREAM,
  SET_TRENDING_GAMES,
  SET_WHATSAPP_DETAILS,
  SET_DEMO_USER_WHATSAPP_DETAILS,
  TOGGLE_DARK_MODE,
  TRIGGER_FETCH_BALANCE,
  TRIGGER_FETCH_NOTIFICATIONS,
  SET_MAINTENANCE_TIMER,
} from "./commonActionTypes";

import moment from "moment";
import { BRAND_DOMAIN } from "../../constants/Branding";
import { AlertDTO } from "../../models/Alert";
import { DcGameNew } from "../../models/dc/DcGame";
import { DomainConfig } from "../../models/DomainConfig";
import { CampaignInfoDataType } from "../../pages/Affiliate/affiliate.utils";
import SVLS_API from "../../svls-api";
import CATALOG_API from "../../catalog-api";

export const activateReportsTab = (value: boolean) => {
  return {
    type: IS_ADMIN_REPORTS_URL,
    payload: value,
  };
};

export const activateRiskMgmtTab = (value: boolean) => {
  return {
    type: IS_ADMIN_RISKMGMT_URL,
    payload: value,
  };
};

export const activateHouseTab = (value: boolean) => {
  return {
    type: IS_HOUSE_URL,
    payload: value,
  };
};

export const toggleDarkMode = (value: string) => {
  return {
    type: TOGGLE_DARK_MODE,
    payload: value,
  };
};

export const setPlayStream = (value: boolean) => {
  return {
    type: SET_PLAY_STREAM,
    payload: value,
  };
};

export const setCampaignInfo = (campaignInfo: CampaignInfoDataType) => {
  return {
    type: SET_CAMPAIGN_INFO,
    payload: campaignInfo,
  };
};

export const setAlertMsg = (alert: AlertDTO) => {
  return {
    type: SET_ALERT_MSG,
    payload: alert,
  };
};

export const fetchBettingCurrency = () => {
  return async (dispatch: Function) => {
    /*
    try {
      const response = await API.get('/user/betting-currency', {
        headers: {
          Authorization: sessionStorage.getItem('jwt_token'),
        },
      });
      dispatch(fetchBettingCurrencySuccess(response.data));
    } catch (err) {
      dispatch(fetchBettingCurrencyFailed());
      if (err.response && err.response.status === 401) {
        const token = sessionStorage.getItem('jwt_token');
        if (token) {
          dispatch(logout());
        }
      }
    }
  */
  };
  return Currency.Pts;
};

export const setCasinoGames = (games: DcGameNew) => {
  return {
    type: SET_CASINO_GAME,
    payload: games,
  };
};

export const casinoGameSelected = (casinoGame: {
  id: string;
  name: string;
}) => {
  return {
    type: CASINO_GAME_SELECTED,
    payload: casinoGame,
  };
};

export const setDcGameUrl = (url: string) => {
  return {
    type: SET_DC_GAME_URL,
    payload: url,
  };
};

export const setLivestreamUrl = (url: string) => {
  return {
    type: SET_LIVESTREAM_URL,
    payload: url,
  };
};

export const setAllowedConfig = (allowedConfig: number) => {
  return {
    type: SET_ALLOWED_CONFIG,
    payload: allowedConfig,
  };
};

export const setDomainConfig = (config: DomainConfig) => {
  return {
    type: SET_DOMAIN_CONFIG,
    payload: config,
  };
};

export const enableCommission = (commission: boolean) => {
  return {
    type: ENABLE_COMMISSION,
    payload: commission,
  };
};

export const triggerFetchBalance = (eventTime: number) => {
  return {
    type: TRIGGER_FETCH_BALANCE,
    payload: eventTime,
  };
};

export const triggerFetchNotifications = (data) => {
  var adminAccountPath = data.adminAccountPath.concat("/");
  if (
    getAccountPathFromToken().includes(adminAccountPath) &&
    (data.sportsBooks.includes("all") ||
      data.sportsBooks.includes(getSportsBookFromToken()))
  ) {
    return {
      type: TRIGGER_FETCH_NOTIFICATIONS,
      payload: moment.now(),
    };
  }
};

export const isAccountPath = (limitKey: string) => {
  return !limitKey.includes("/CT/SPORTS");
};

export const fetchContentConfig = () => {
  return async (dispatch: Function) => {
    try {
      const response = await SVLS_API.get(
        `/account/v2/books/cache/${BRAND_DOMAIN}/content-config`
      );
      if (!response?.data?.default_template) {
        dispatch(fetchContentConfigSuccess(response?.data));
      }
    } catch (err) {
      console.log(err);
    }
  };
};

const fetchContentConfigSuccess = (result) => {
  return {
    type: FETCH_CONTENT_CONFIG_SUCCESS,
    payload: result,
  };
};

export const setTrendingGames = (result) => {
  return {
    type: SET_TRENDING_GAMES,
    payload: result,
  };
};

export const setWhatsappDetails = (details: string) => {
  return {
    type: SET_WHATSAPP_DETAILS,
    payload: details,
  };
};

export const setDemoUserWhatsappDetails = (details: string) => {
  return {
    type: SET_DEMO_USER_WHATSAPP_DETAILS,
    payload: details,
  };
};

export const setLanguages = (languages: string[]) => {
  return {
    type: LANGUAGES,
    payload: languages,
  };
};

export const setLangSelected = (lang: string) => {
  return {
    type: LANG_SELECTED,
    payload: lang,
  };
};

export const setLangData = (jsonData: any) => {
  return {
    type: SET_LANG_DATA,
    payload: jsonData,
  };
};

export const setMaintenanceTimer = (timer: string) => {
  return {
    type: SET_MAINTENANCE_TIMER,
    payload: timer,
  };
};

export const isSiteUnderMaintenance = async () => {
  try {
    const response = await CATALOG_API.get(`/catalog/site-under-maintenance`);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
