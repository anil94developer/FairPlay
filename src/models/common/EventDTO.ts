export interface EventDTO {
  eventId?: string;
  eventName?: string;
  eventSlug?: string;
  sportId?: string;
  sportName?: string;
  competitionId?: string;
  competitionName?: string;
  openDate?: string | number;
  customOpenDate?: string;
  status?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  markets?: any;
  [key: string]: any;
}

export default EventDTO;
