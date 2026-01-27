export interface UserBet {
  id?: string;
  betType: "BACK" | "LAY";
  marketType: "FANCY" | "BINARY" | "BOOKMAKER" | "MATCH_ODDS" | "MO" | "BM" | "PREMIUM";
  marketName: string;
  outcomeDesc: string;
  oddValue: number;
  stakeAmount?: number;
  eventId?: string;
  eventName?: string;
  marketId?: string;
  outcomeId?: string;
  betPlacedTime?: string;
  outcomeResult?: string;
  [key: string]: any;
}
