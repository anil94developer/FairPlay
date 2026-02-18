export interface MatchOddsRunnerDTO {
  runnerId: string;
  runnerName?: string;
  selectionId?: string | number;
  selection_name?: string;
  status?: string;
  backPrices?: Array<{ price?: number | null; size?: number | null }>;
  layPrices?: Array<{ price?: number | null; size?: number | null }>;
  ex?: any;
  [key: string]: any;
}

export interface MatchOddsDTO {
  eventId?: string;
  sportId?: string | number;
  competitionId?: string;
  marketId?: string;
  marketName?: string;
  marketType?: string;
  status?: string;
  suspend?: boolean;
  disable?: boolean;
  marketTime?: any;
  marketLimits?: any;
  runners?: MatchOddsRunnerDTO[];
  fullMarketData?: any;
  [key: string]: any;
}

export default MatchOddsDTO;
