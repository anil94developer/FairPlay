import { AuthState } from "./auth/AuthState";
import { CommonState } from "./common/CommonState";
import { ExBetslip } from "./ExBetslip";
import { ExchangeSportsState } from "./ExchangeSportsState";

/**
 * RootState
 * ----------
 * Represents the complete Redux store state
 * Used by mapStateToProps and selectors
 */
export interface RootState {
  auth: AuthState;
  common: CommonState;
  exchBetslip: ExBetslip;
  exchangeSports: ExchangeSportsState;
}
