export interface Banner {
  publicUrl?: string;
  redirectionUrl?: string;
  title?: string;
  deviceType?: string;
  [key: string]: any;
}

const CasinoView = {
  CASINO_MOBILE_BANNERS: [] as Banner[],
  IND_CASINO_WEB_BANNERS: [] as Banner[],
  IND_CASINO_MOBILE_BANNERS: [] as Banner[],
};

export default CasinoView;
