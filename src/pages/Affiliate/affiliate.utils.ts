export enum AffiliatePageTabTypes {
  OVERVIEW = 'Overview',
  COMMISSION = 'Commission',
  FUNDS = 'Funds',
  CAMPAIGNS = 'Campaigns',
  REFERRED_USERS = 'Referred Users',
  DAILY_REPORT = 'FTD Report',
}

export const referralBaseUrl = `${window.location.hostname}/register?campaignId=`;

export const affiliatePageTabs = [
  // AffiliatePageTabTypes.OVERVIEW,
  { type: AffiliatePageTabTypes.CAMPAIGNS, langKey: 'campaigns' },
  { type: AffiliatePageTabTypes.COMMISSION, langKey: 'commission' },
  { type: AffiliatePageTabTypes.FUNDS, langKey: 'funds' },
  { type: AffiliatePageTabTypes.DAILY_REPORT, langKey: 'daily_report' },
  // AffiliatePageTabTypes.REFERRED_USERS,
];

export interface CampaignInfoType {
  affiliateId: string;
  houseId: string;
  commissionPercentage: string;
  affiliatePath: string;
  accountPath: string;
  accountId: string;
  userName: string;
  lifeTimeFTDAmount: string;
  lifeTimeFirstDeposits: string;
  lifeTimeSignUps: string;
  totalCommission: string;
  availableCommission: string;
  campaignCode: string;
  campaignName: string;
}

export interface CampaignInfoDataType {
  userName: string | null;
  lifeTimeFTDAmount: number;
  lifeTimeFirstDeposits: number;
  lifeTimeSignUps: number;
  totalCommission: number;
  availableCommission: number;
  isCampaignCreated: boolean;
  campaignDetailsHashMap: { [key: string]: CampaignInfoType };
  lastTxnTime: number;
}

export const initialCampaignDetails = {
  userName: '',
  lifeTimeFTDAmount: 0,
  lifeTimeFirstDeposits: 0,
  lifeTimeSignUps: 0,
  totalCommission: 0,
  availableCommission: 0,
  isCampaignCreated: false,
  campaignDetailsHashMap: {},
  lastTxnTime: 0,
};

export enum FieldTypes {
  AFFILIATE_NAME = 'affiliateName',
  AFFILIATE_ID = 'affiliateId',
  REFERRAL_LINK = 'referralLink',
}
