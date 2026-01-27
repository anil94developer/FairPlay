import { capitalizeWord } from "../../util/stringUtil";
import { ExchangePriceDTO } from "./ExchangePriceDTO";

export interface FavoriteEventDTO {
  openDate: string;
  sportId: string;
  sportName: string;
  competitionId: string;
  competitionName: string;
  eventId: string;
  eventName: string;
  marketId: string;
  status: string;
  providerName: string;
  markets: FavoriteEventMarketsDTO;
  enabled: boolean;
  premiumEnabled: boolean;
  winnerMarketEnabled: boolean;
  forcedInplay: boolean;
  virtualEvent: boolean;
  favorite: boolean;

  // Additional fields that might be used by the component
  homeTeam?: string;
  awayTeam?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  eventSlug?: string;
  customOpenDate?: string;
  catId?: string;
}

export interface FavoriteEventMarketsDTO {
  matchOddsProvider: string;
  matchOddsBaseUrl: string;
  matchOddsTopic: string;
  matchOdds: FavoriteMatchOddsDTO[];
  enableMatchOdds: boolean;
  enableBookmaker: boolean;
  enableFancy: boolean;
  enablePremium: boolean;
  fancySuspended: boolean;
  fancyDisabled: boolean;
}

export interface FavoriteMatchOddsDTO {
  marketId: string;
  marketName: string;
  marketTime: number;
  marketType: string;
  status: string;
  runners: FavoriteMatchOddsRunnerDTO[];
  commissionEnabled: boolean;
  suspended: boolean;
  disabled: boolean;
  limits: FavoriteMarketLimitsDTO;
}

export interface FavoriteMatchOddsRunnerDTO {
  runnerId: string;
  runnerName: string;
  status: string;
  backPrices: ExchangePriceDTO[];
  layPrices: ExchangePriceDTO[];
}

export interface FavoriteMarketLimitsDTO {
  minBetValue: number;
  maxBetValue: number;
  oddsLimit: number;
}

// Adapter function to convert FavoriteEventDTO to EventDTO format used by components
export const adaptFavoriteEventToEventDTO = (
  favoriteEvent: FavoriteEventDTO
): any => {
  const firstMatchOdds = favoriteEvent?.markets?.matchOdds?.[0];
  let homeTeam = "";
  let awayTeam = "";
  if (favoriteEvent?.eventName?.includes(" vs. ")) {
    homeTeam = favoriteEvent?.eventName?.split(" vs. ")?.[0];
    awayTeam = favoriteEvent?.eventName?.split(" vs. ")?.[1];
  } else {
    homeTeam = favoriteEvent?.eventName?.includes(" v ")
      ? favoriteEvent?.eventName?.split(" v ")?.[0]?.trim()
      : favoriteEvent?.eventName?.split(" vs ")?.[0]?.trim();
    awayTeam = favoriteEvent?.eventName?.includes(" v ")
      ? favoriteEvent?.eventName?.split(" v ")?.[1]?.trim()?.split(" - ")?.[0]
      : favoriteEvent?.eventName?.split(" vs ")?.[1]?.trim()?.split(" - ")?.[0];
    homeTeam = capitalizeWord(homeTeam);
    awayTeam = capitalizeWord(awayTeam);
  }
  return {
    openDate: favoriteEvent?.openDate,
    customOpenDate: favoriteEvent?.customOpenDate,
    sportId: favoriteEvent?.sportId,
    sportName: favoriteEvent?.sportName,
    competitionId: favoriteEvent?.competitionId,
    competitionName: favoriteEvent?.competitionName,
    eventId: favoriteEvent?.eventId,
    eventName: favoriteEvent?.eventName,
    homeTeam: homeTeam,
    awayTeam: awayTeam,
    homeTeamId: favoriteEvent?.homeTeamId,
    awayTeamId: favoriteEvent?.awayTeamId,
    eventSlug: favoriteEvent?.eventSlug,
    marketId: favoriteEvent?.marketId,
    status: favoriteEvent?.status,
    providerName: favoriteEvent?.providerName,
    enabled: favoriteEvent?.enabled,
    forcedInplay: favoriteEvent?.forcedInplay,
    virtualEvent: favoriteEvent?.virtualEvent,
    catId: favoriteEvent?.catId,

    // Map market information
    enableMatchOdds: favoriteEvent?.markets?.enableMatchOdds,
    enableBookmaker: favoriteEvent?.markets?.enableBookmaker,
    enableFancy: favoriteEvent?.markets?.enableFancy,
    enablePremium: favoriteEvent?.markets?.enablePremium,

    // Map first match odds (most components expect a single matchOdds object)
    matchOdds: firstMatchOdds
      ? {
          marketId: firstMatchOdds.marketId,
          marketName: firstMatchOdds.marketName,
          marketTime: new Date(firstMatchOdds.marketTime),
          status: firstMatchOdds.status,
          runners: firstMatchOdds.runners.map((runner) => ({
            runnerId: runner.runnerId,
            runnerName: runner.runnerName,
            status: runner.status,
            backPrices: runner.backPrices,
            layPrices: runner.layPrices,
          })),
          limits: firstMatchOdds.limits,
          suspend: firstMatchOdds.suspended,
          disable: firstMatchOdds.disabled,
        }
      : undefined,
  };
};
