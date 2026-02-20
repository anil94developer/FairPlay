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
  /** Social media from content/get or getSocialMediaContent: Whatsapp, Telegram, Gmail, Facebook with is_active, url, etc. */
  socialMediaContent: Record<
    string,
    { title: string; url: string; is_active: boolean; image_url: string }
  > | null;
  languages: any[];
  langSelected: any;
  langData: any;
  maintenanceTimer: string;
}
