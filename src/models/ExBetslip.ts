import { ButtonVariable } from "./ButtonVariables";

export interface ExBetslip {
  bets: any[];
  openBets: any[];
  totalOrders: number;
  buttonVariables: ButtonVariable[];
  bettingInprogress: boolean;
  isOneClickEnable: boolean;
  oneClickAmount: number;
  betStatusResponse: any;
  oneClickBettingLoading: boolean;
  oneClickBettingEnabled: boolean;
  oneClickBettingStake: number;
  cashoutInProgress: any;
  [key: string]: any;
}

export default ExBetslip;
