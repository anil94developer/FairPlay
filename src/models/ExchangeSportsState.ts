export interface SelectedObj {
  id: string;
  name: string;
  slug?: string;
  [key: string]: any;
}

export interface CompetitionEventTypeMap {
  [key: string]: any[];
}

export interface SecondaryMarkets {
  [key: string]: any;
}

export interface SecondaryMarketsMap {
  [key: string]: SecondaryMarkets;
}

export interface ExchangeSportsState {
  selectedEventType: SelectedObj | null;
  selectedCompetition: SelectedObj | null;
  selectedEvent: SelectedObj | null;
  competitions: CompetitionEventTypeMap;
  events: any[];
  [key: string]: any;
}

export default ExchangeSportsState;
