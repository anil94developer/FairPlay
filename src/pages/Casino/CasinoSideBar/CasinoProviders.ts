export interface CasinoProvider {
  subProviderName: string;
  titleKey: string;
  filterParams: string[];
  supportedCategories?: any[];
  includedGames?: string[];
  excludedGames?: string[];
}

export const CasinoProviders: CasinoProvider[] = [];
