import { DomainConfig } from "../DomainConfig";
import { Currency } from "../Currency";

export interface CommonState {
  isAdminReportsUrl: boolean;
  isAdminRiskMgmtUrl: boolean;
  isHouseUrl: boolean;
  prefersDark: string;
  bettingCurrency: Currency | null;
  currenciesAllowed: any;
  selectedCasinoGame: any;
  tvGamesEnabled: boolean;
  dcGameUrl: string;
  streamUrl: string;
  playStream: boolean;
  allowedConfig: number;
  commissionEnabled: boolean;
  balanceChanged: any;
  notificationUpdated: any;
  domainConfig: DomainConfig;
  contentConfig: any;
  trendingGames: any;
  campaignInfo: any;
  casinoGames: any[];
  alert: {
    type: string;
    message: string;
  };
  whatsappDetails: string;
  demoUserWhatsappDetails: string;
  languages: any[];
  langSelected: any;
  langData: any;
  maintenanceTimer: string;
}
