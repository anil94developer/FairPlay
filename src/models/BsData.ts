export interface PlaceBetRequest {
  providerId: string;
  sportId: string;
  seriesId: string;
  seriesName: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  marketId: string;
  marketName: string;
  marketType: "FANCY" | "MO" | "BM" | "PREMIUM";
  outcomeId: string;
  outcomeDesc: string;
  betType: "BACK" | "LAY";
  amount: number;
  oddValue: number;
  oddSize?: number;
  sessionPrice?: number;
  oddLimt?: string;
  minStake?: number;
  maxStake?: number;
  mcategory?: string;
  displayOddValue?: number;
  delay?: number;
  betId?: string;
  [key: string]: any;
}

export interface CashoutProgressDTO {
  status?: string;
  message?: string;
  [key: string]: any;
}

export interface BinaryBetrequest {
  [key: string]: any;
}

export interface BsResponse {
  success?: boolean;
  message?: string;
  status?: string;
  data?: any;
  [key: string]: any;
}
