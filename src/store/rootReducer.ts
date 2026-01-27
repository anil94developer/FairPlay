import { combineReducers } from "redux";

import authReducer from "./auth/authReducer";
import commonReducer from "./common/commonReducer";
import exchangeSportsReducer from "./exchangeSports/exchangeSportsReducer";
import exchBetslipReducer from "./exchBetslip/exchBetslipReducer";
import multiMarketReducer from "./multimarket/multimarketReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  common: commonReducer,
  exchangeSports: exchangeSportsReducer,
  exchBetslip: exchBetslipReducer,
  multiMarket: multiMarketReducer,
});

export default rootReducer;
