import { CONFIG_PERMISSIONS } from "../../constants/ConfigPermission";
import { CommonState } from "../../models/common/CommonState";
import { Currency } from "../../models/Currency";
import { initialCampaignDetails } from "../../pages/Affiliate/affiliate.utils";
import {
  CASINO_GAME_SELECTED,
  ENABLE_COMMISSION,
  FETCH_BETTING_CURRENCY_FAILED,
  FETCH_BETTING_CURRENCY_SUCCESS,
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

type Action = {
  type: string;
  payload: any;
};

const initialState: CommonState = {
  isAdminReportsUrl: false,
  isAdminRiskMgmtUrl: false,
  isHouseUrl: false,
  prefersDark: localStorage.getItem("userTheme")
    ? localStorage.getItem("userTheme")
    : "darkgreen",
  bettingCurrency: Currency.Pts,
  currenciesAllowed: null,
  selectedCasinoGame: null,
  tvGamesEnabled: false,
  dcGameUrl: "",
  streamUrl: "",
  playStream: false,
  allowedConfig: CONFIG_PERMISSIONS.sports + CONFIG_PERMISSIONS.casino,
  commissionEnabled: false,
  balanceChanged: null,
  notificationUpdated: null,
  domainConfig: {
    demoUser: false,
    signup: false,
    whatsapp: true,
    payments: false,
    bonus: true,
    affiliate: false,
    depositWagering: false,
    suppportContacts: null,
    apkUrl: null,
    b2cEnabled: true,
    ruleScope: "HOUSE",
  },
  contentConfig: null,
  trendingGames: null,
  campaignInfo: initialCampaignDetails,
  casinoGames: [],
  alert: {
    type: "",
    message: "",
  },
  whatsappDetails: "",
  demoUserWhatsappDetails: "",
  languages: [],
  langSelected: null,
  langData: null,
  maintenanceTimer: "",
};

const commonReducer = (state = initialState, action: Action): CommonState => {
  switch (action.type) {
    case IS_ADMIN_REPORTS_URL:
      return {
        ...state,
        isAdminReportsUrl: action.payload,
      };
    case IS_ADMIN_RISKMGMT_URL:
      return {
        ...state,
        isAdminRiskMgmtUrl: action.payload,
      };
    case IS_HOUSE_URL:
      return {
        ...state,
        isHouseUrl: action.payload,
      };
    case TOGGLE_DARK_MODE:
      return {
        ...state,
        prefersDark: action.payload,
      };

    case SET_PLAY_STREAM:
      return {
        ...state,
        playStream: action.payload,
      };

    case SET_CASINO_GAME:
      return {
        ...state,
        casinoGames: action.payload,
      };

    case FETCH_BETTING_CURRENCY_SUCCESS:
      return {
        ...state,
        bettingCurrency: action.payload.bettingCurrency,
        currenciesAllowed: action.payload.currenciesAllowed,
      };

    case FETCH_BETTING_CURRENCY_FAILED:
      return {
        ...state,
        bettingCurrency: null,
      };
    case CASINO_GAME_SELECTED:
      return {
        ...state,
        selectedCasinoGame: action.payload,
      };
    case SET_DC_GAME_URL:
      return {
        ...state,
        dcGameUrl: action.payload,
      };
    case SET_LIVESTREAM_URL:
      return {
        ...state,
        streamUrl: action.payload,
      };
    case SET_ALLOWED_CONFIG:
      return {
        ...state,
        allowedConfig: action.payload,
      };
    case ENABLE_COMMISSION:
      return {
        ...state,
        commissionEnabled: action.payload,
      };
    case TRIGGER_FETCH_BALANCE:
      return {
        ...state,
        balanceChanged: action.payload,
      };
    case TRIGGER_FETCH_NOTIFICATIONS:
      return {
        ...state,
        notificationUpdated: action.payload,
      };
    case FETCH_CONTENT_CONFIG_SUCCESS:
      if (action.payload) {
        return {
          ...state,
          contentConfig: action.payload,
        };
      }
    case SET_DOMAIN_CONFIG:
      return {
        ...state,
        domainConfig: action.payload,
      };
    case SET_TRENDING_GAMES:
      return {
        ...state,
        trendingGames: action.payload,
      };

    case SET_CAMPAIGN_INFO:
      return {
        ...state,
        campaignInfo: action.payload,
      };

    case SET_ALERT_MSG: {
      let alertObj = {
        type: action.payload.type,
        message: action.payload.message,
      };

      return {
        ...state,
        alert: alertObj,
      };
    }

    case SET_WHATSAPP_DETAILS: {
      return {
        ...state,
        whatsappDetails: action.payload,
      };
    }

    case SET_DEMO_USER_WHATSAPP_DETAILS: {
      return {
        ...state,
        demoUserWhatsappDetails: action.payload,
      };
    }

    case LANGUAGES: {
      return {
        ...state,
        languages: action.payload,
      };
    }

    case LANG_SELECTED: {
      return {
        ...state,
        langSelected: action.payload,
      };
    }

    case SET_LANG_DATA: {
      return {
        ...state,
        langData: action.payload,
      };
    }

    case SET_MAINTENANCE_TIMER: {
      return {
        ...state,
        maintenanceTimer: action.payload,
      };
    }

    default:
      return state;
  }
};

export default commonReducer;
