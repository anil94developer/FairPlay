export interface AuthState {
  balanceSummary: {
    balance: number | null;
    balanceId: number;
    currenciesAllowed: number;
    currency: string;
    exposure: number | null;
    exposureLimit: number;
    maxStakeSB: number;
    minStakeSB: number;
    preferredCurrency: string;
    username: string;
    bonus: number | null;
    bonusRedeemed: number | null;
    nonCashableAmount: number | null;
    cashableAmount: number | null;
  };
  bcToken: string | null;
  bgToken: string | null;
  jwtToken: string | null;
  loading: boolean;
  loginError: string;
  loggedIn: boolean;
  mailVerified: boolean | null;
  openDepositModal: boolean;
  openWithdrawModal: boolean;
  isMolobby: boolean;
}
