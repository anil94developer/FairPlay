export interface AffiliateDailyReportRecord {
  date?: string | number;
  firstDeposits?: number;
  firstDepositAmount?: number;
  commissionEligibleFirstDeposits?: number;
  commissionEligibleFirstDepositsAmount?: number;
  ftdCommission?: number;
  commissionTransferred?: boolean;
  [key: string]: any;
}

export default AffiliateDailyReportRecord;
